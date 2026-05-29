'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Truck, MapPin, Navigation, Clock, Info } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  desc: string;
  qty: number;
}

interface ItemFamily {
  [key: string]: Item[];
}

interface Request {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  items: ItemFamily;
  totalQty: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COLLECTED' | 'INCIDENT';
  createdAt: string;
}

interface DriverMapProps {
  requests: Request[];
}

// Client-side cache to avoid redundant geocoding requests
const geocodeCache: { [key: string]: [number, number] } = {
  "12 Rue de l'Église, 94600 Choisy-le-Roi": [2.409386, 48.763422],
  "45 Avenue de la République, 94600 Choisy-le-Roi": [2.411628, 48.761005],
  "8 Rue Jean Jaurès, 94600 Choisy-le-Roi": [2.403567, 48.769212],
  "27 Rue de la Marne, 94600 Choisy-le-Roi": [2.418423, 48.764501]
};

// Choisy-le-Roi Depot (Mairie)
const DEPOT_COORDS: [number, number] = [2.4078, 48.7656]; // [lon, lat]
const DEPOT_LAT_LNG: [number, number] = [48.7656, 2.4078]; // [lat, lon]

// Leaflet dynamic loader promise
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('Server-side rendering');
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add Leaflet JS script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      resolve((window as any).L);
    };
    script.onerror = (err) => {
      reject(err);
    };
    document.body.appendChild(script);
  });

  return leafletPromise;
}

// Distance helper (straight-line in degrees for fast TSP calculation)
function getDistance(p1: [number, number], p2: [number, number]) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

// Haversine distance in km for distance estimations fallback
function haversineDistance(coords1: [number, number], coords2: [number, number]) {
  const lon1 = coords1[0], lat1 = coords1[1];
  const lon2 = coords2[0], lat2 = coords2[1];
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Local Nearest Neighbor Traveling Salesperson algorithm
function solveTSP(start: [number, number], points: { id: string; coords: [number, number]; request: Request }[]) {
  const tour: typeof points = [];
  const unvisited = [...points];
  let currentCoords = start;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minD = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = getDistance(currentCoords, unvisited[i].coords);
      if (d < minD) {
        minD = d;
        nearestIdx = i;
      }
    }

    const nextPoint = unvisited.splice(nearestIdx, 1)[0];
    tour.push(nextPoint);
    currentCoords = nextPoint.coords;
  }

  return tour;
}

export default function DriverMap({ requests }: DriverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const polylineLayer = useRef<any>(null);
  const markersGroup = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [geocodedPoints, setGeocodedPoints] = useState<{ id: string; coords: [number, number]; request: Request }[]>([]);
  const [sortedTour, setSortedTour] = useState<{ id: string; coords: [number, number]; request: Request }[]>([]);

  // 1. Geocode all active addresses
  useEffect(() => {
    let active = true;

    async function geocodeAll() {
      setIsLoading(true);
      const points: typeof geocodedPoints = [];

      for (const req of requests) {
        const address = req.address;
        
        // Check cache first
        if (geocodeCache[address]) {
          points.push({ id: req.id, coords: geocodeCache[address], request: req });
          continue;
        }

        // Fetch from API Adresse
        try {
          const res = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&postcode=94600&limit=1`
          );
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates; // [lon, lat]
            geocodeCache[address] = [coords[0], coords[1]];
            points.push({ id: req.id, coords: [coords[0], coords[1]], request: req });
          } else {
            console.warn(`Could not geocode address: ${address}`);
          }
        } catch (err) {
          console.error(`Geocoding error for address: ${address}`, err);
        }
      }

      if (active) {
        setGeocodedPoints(points);
      }
    }

    if (requests.length > 0) {
      geocodeAll();
    } else {
      setGeocodedPoints([]);
      setSortedTour([]);
      setRouteInfo(null);
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, [requests]);

  // 2. Solve TSP and compute routing path
  useEffect(() => {
    if (geocodedPoints.length === 0) {
      setIsLoading(false);
      return;
    }

    async function computeRoute() {
      const tour = solveTSP(DEPOT_COORDS, geocodedPoints);
      setSortedTour(tour);

      // Connect Mairie and then all sorted points in order
      const coordsString = [DEPOT_COORDS, ...tour.map(t => t.coords)]
        .map(c => `${c[0]},${c[1]}`)
        .join(';');

      try {
        // Query Open Source Routing Machine
        const routingRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
        );
        
        if (!routingRes.ok) throw new Error('OSRM request failed');

        const routingData = await routingRes.json();
        
        if (routingData && routingData.routes && routingData.routes[0]) {
          const streetCoords = routingData.routes[0].geometry.coordinates; // Array of [lon, lat]
          const pathLatLngs = streetCoords.map((c: any) => [c[1], c[0]]); // Leaflet wants [lat, lon]
          
          const distanceKm = routingData.routes[0].distance / 1000;
          const durationMin = routingData.routes[0].duration / 60;

          setRouteInfo({ distance: distanceKm, duration: durationMin });
          drawRoute(pathLatLngs, tour);
        } else {
          throw new Error('No route returned from OSRM');
        }
      } catch (err) {
        console.warn('Failed to fetch OSRM route, falling back to straight lines:', err);
        // Fallback to straight lines connecting coordinates
        const straightLatLngs = [DEPOT_COORDS, ...tour.map(t => t.coords)].map(c => [c[1], c[0]]);
        
        // Calculate rough haversine distance
        let totalDist = 0;
        const allPoints = [DEPOT_COORDS, ...tour.map(t => t.coords)];
        for (let i = 1; i < allPoints.length; i++) {
          totalDist += haversineDistance(allPoints[i-1], allPoints[i]);
        }
        
        setRouteInfo({
          distance: totalDist,
          duration: totalDist * 4 // Estimate 4 minutes per km in dense city area
        });

        drawRoute(straightLatLngs, tour);
      } finally {
        setIsLoading(false);
      }
    }

    computeRoute();
  }, [geocodedPoints]);

  // 3. Initialize Leaflet Map on Mount
  useEffect(() => {
    let isMounted = true;
    let map: any = null;

    async function initMap() {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapRef.current) return;

        // If map already exists, don't recreate it
        if (!mapInstance.current) {
          map = L.map(mapRef.current, {
            center: [48.7656, 2.4078],
            zoom: 14,
            zoomControl: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          mapInstance.current = map;
          markersGroup.current = L.layerGroup().addTo(map);
        } else {
          map = mapInstance.current;
        }

        // Trigger size adjustment
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 100);

        // If no points, show depot only
        if (geocodedPoints.length === 0) {
          markersGroup.current.clearLayers();
          if (polylineLayer.current) {
            map.removeLayer(polylineLayer.current);
            polylineLayer.current = null;
          }

          // Custom html icon for depot
          const depotIcon = L.divIcon({
            className: 'leaflet-depot-marker',
            html: '<div class="map-depot-pin">🏠</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          L.marker(DEPOT_LAT_LNG, { icon: depotIcon })
            .bindPopup('<strong>Dépôt Municipal</strong><br/>Mairie de Choisy-le-Roi<br/>Point de départ de la tournée.')
            .addTo(markersGroup.current);

          map.setView(DEPOT_LAT_LNG, 14);
        }
      } catch (err) {
        console.error('Error loading Leaflet map', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [geocodedPoints]);

  // 4. Helper function to draw polyline and render markers on map
  async function drawRoute(latLngs: [number, number][], tour: typeof sortedTour) {
    try {
      const L = await loadLeaflet();
      const map = mapInstance.current;
      if (!map) return;

      // Clear old layers
      markersGroup.current.clearLayers();
      if (polylineLayer.current) {
        map.removeLayer(polylineLayer.current);
      }

      // Draw active route polyline
      polylineLayer.current = L.polyline(latLngs, {
        color: '#f2994a', // Driver brand orange color
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '2, 8' // Dotted line style
      }).addTo(map);

      // Add Depot Marker
      const depotIcon = L.divIcon({
        className: 'leaflet-depot-marker',
        html: '<div class="map-depot-pin">🏠</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(DEPOT_LAT_LNG, { icon: depotIcon })
        .bindPopup('<strong>Départ de la tournée</strong><br/>Mairie de Choisy-le-Roi')
        .addTo(markersGroup.current);

      // Add Stop Markers with dynamic numbers and status color styles
      tour.forEach((point, index) => {
        const orderNum = index + 1;
        const status = point.request.status;
        const label = status === 'COLLECTED' ? '✓' : status === 'INCIDENT' ? '⚠️' : orderNum.toString();
        const statusClass = status === 'COLLECTED' ? 'collected' : status === 'INCIDENT' ? 'incident' : 'approved';

        const stopIcon = L.divIcon({
          className: `leaflet-stop-marker ${statusClass}`,
          html: `<div class="map-stop-pin">${label}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        // Detail list formatted in HTML for the Leaflet popup
        const itemsList: string[] = [];
        Object.values(point.request.items).forEach((familyItems: any) => {
          familyItems.forEach((item: any) => {
            if (item.qty > 0) {
              itemsList.push(`• ${item.name} <strong>x${item.qty}</strong>`);
            }
          });
        });

        const popupContent = `
          <div class="map-popup-container">
            <span class="popup-order-badge ${statusClass}">Arrêt #${orderNum}</span>
            <h4 class="popup-address">${point.request.address}</h4>
            <div class="popup-divider"></div>
            <p class="popup-citizen"><strong>Citoyen :</strong> ${point.request.fullName}</p>
            <p class="popup-status"><strong>Statut :</strong> ${
              status === 'APPROVED' ? 'À collecter' : 
              status === 'COLLECTED' ? 'Collecté' : 'Incident'
            }</p>
            <div class="popup-items">
              <strong>Objets à charger :</strong><br/>
              ${itemsList.join('<br/>')}
            </div>
          </div>
        `;

        L.marker([point.coords[1], point.coords[0]], { icon: stopIcon })
          .bindPopup(popupContent, { maxWidth: 260 })
          .addTo(markersGroup.current);
      });

      // Fit map boundary to include all points
      const bounds = L.latLngBounds([DEPOT_LAT_LNG, ...tour.map(t => [t.coords[1], t.coords[0]])]);
      map.fitBounds(bounds, { padding: [40, 40] });

    } catch (err) {
      console.error('Error drawing routing layers', err);
    }
  }

  return (
    <div className="driver-map-card">
      <div className="driver-map-header">
        <div className="driver-map-title-block">
          <div className="driver-map-icon-tag">
            <Truck size={16} />
            <span>Itinéraire optimal de collecte</span>
          </div>
          <h4>Plan de Route Interactif</h4>
        </div>
        
        {routeInfo && !isLoading && (
          <div className="driver-route-telemetry">
            <div className="telemetry-badge">
              <Navigation size={13} />
              <span>Distance : {routeInfo.distance.toFixed(1)} km</span>
            </div>
            <div className="telemetry-badge">
              <Clock size={13} />
              <span>Temps estimé : {Math.round(routeInfo.duration)} min</span>
            </div>
          </div>
        )}
      </div>

      <div className="driver-map-body-wrapper">
        <div className="map-view-container">
          <div ref={mapRef} className="map-element"></div>
          
          {isLoading && (
            <div className="map-loading-overlay">
              <div className="map-loading-spinner"></div>
              <span>Optimisation du trajet en cours...</span>
            </div>
          )}
        </div>

        {/* Route step layout */}
        {sortedTour.length > 0 && !isLoading && (
          <div className="map-route-list">
            <h5>Ordre de passage recommandé :</h5>
            <div className="route-timeline">
              
              {/* Start Depot Node */}
              <div className="timeline-node start">
                <div className="timeline-node-dot">🏠</div>
                <div className="timeline-node-info">
                  <strong>Départ : Mairie</strong>
                  <span>Place Gabriel Péri</span>
                </div>
              </div>

              {/* Waypoints */}
              {sortedTour.map((point, index) => {
                const status = point.request.status;
                const statusLabel = status === 'COLLECTED' ? '✓' : status === 'INCIDENT' ? '⚠️' : index + 1;
                return (
                  <div key={point.id} className={`timeline-node stop ${status.toLowerCase()}`}>
                    <div className="timeline-node-dot">{statusLabel}</div>
                    <div className="timeline-node-info">
                      <strong>{point.request.address.split(',')[0]}</strong>
                      <span>{point.request.fullName} · {point.request.totalQty} objet(s)</span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>

      <div className="driver-map-info-banner">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>
          Le trajet est calculé en temps réel en utilisant l'algorithme du plus proche voisin. Il relie la Mairie à l'ensemble des adresses validées de la journée en minimisant les distances.
        </span>
      </div>
    </div>
  );
}
