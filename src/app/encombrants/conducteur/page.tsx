'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Truck, Check, AlertTriangle, 
  RefreshCw, ClipboardList, Inbox, X, Calendar, MapPin
} from 'lucide-react';
import './conducteur.css';
import '../encombrants.css';

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
  incidentReason?: string;
  incidentNote?: string;
}

export default function ConducteurPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [wednesdays, setWednesdays] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Incident Modal State
  const [activeIncidentRequest, setActiveIncidentRequest] = useState<Request | null>(null);
  const [incidentReason, setIncidentReason] = useState('Déchets non conformes / interdits');
  const [incidentNote, setIncidentNote] = useState('');

  // Dynamic Wednesday calculation
  useEffect(() => {
    const dates: string[] = [];
    const today = new Date();
    let dayOfWeek = today.getDay();
    let daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
    if (daysUntilWednesday === 0) {
      daysUntilWednesday = 7;
    }
    const nextWednesday = new Date(today);
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);

    for (let i = 0; i < 3; i++) {
      const d = new Date(nextWednesday);
      d.setDate(nextWednesday.getDate() + (i * 7));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    setWednesdays(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0]); // Select first Wednesday by default
    }
  }, []);

  const fetchRequests = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/encombrants');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Erreur lors du chargement des demandes du serveur", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Load requests from server API on mount / date calculation
  useEffect(() => {
    if (wednesdays.length === 0) return;
    fetchRequests(false);
  }, [wednesdays]);

  // Polling every 8 seconds for real-time simulation updates
  useEffect(() => {
    if (wednesdays.length === 0) return;
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [wednesdays]);

  const formatDateFrench = (dateStr: string) => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  };

  // Update request status on the server
  const updateRequestStatus = async (id: string, newStatus: 'COLLECTED' | 'INCIDENT', details?: { reason?: string; note?: string }) => {
    // Optimistic UI update
    const updated = requests.map(req => {
      if (req.id === id) {
        return { 
          ...req, 
          status: newStatus,
          incidentReason: details?.reason,
          incidentNote: details?.note
        };
      }
      return req;
    });
    setRequests(updated);

    try {
      await fetch('/api/encombrants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'status',
          data: { id, status: newStatus }
        })
      });

      // If details are provided (incidents), we also want to send the detailed notes
      // Our generic route handler saves the request object with incidentReason if we send it
      if (details) {
        // Find updated request object to save entirely
        const updatedReq = updated.find(r => r.id === id);
        if (updatedReq) {
          // Trigger a status update but pass the whole data payload to save notes
          await fetch('/api/encombrants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'create', // Re-saves/overwrites the entry in DB
              data: updatedReq
            })
          });
        }
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la collecte", err);
    }
  };

  const handleMarkCollected = (id: string) => {
    updateRequestStatus(id, 'COLLECTED');
  };

  const handleOpenIncidentModal = (req: Request) => {
    setActiveIncidentRequest(req);
    setIncidentReason('Déchets non conformes / interdits');
    setIncidentNote('');
  };

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIncidentRequest) {
      updateRequestStatus(activeIncidentRequest.id, 'INCIDENT', {
        reason: incidentReason,
        note: incidentNote
      });
      setActiveIncidentRequest(null);
    }
  };

  // Filter requests for the selected date
  // A driver sheet includes requests that are APPROVED, COLLECTED or INCIDENT (already handled or to handle)
  // It does NOT include PENDING (not confirmed) or REJECTED.
  const activeRoadmap = requests.filter(req => 
    req.date === selectedDate && 
    (req.status === 'APPROVED' || req.status === 'COLLECTED' || req.status === 'INCIDENT')
  );

  // Compute Stats
  const totalJobs = activeRoadmap.length;
  const collectedJobs = activeRoadmap.filter(req => req.status === 'COLLECTED').length;
  const incidentJobs = activeRoadmap.filter(req => req.status === 'INCIDENT').length;
  const remainingJobs = totalJobs - collectedJobs - incidentJobs;

  return (
    <div className="encombrants-root">
      
      {/* ═══ DÉCORATION D'ARRIÈRE-PLAN ANIMÉE ═══ */}
      <div className="muni-bg-decor">
        <div className="muni-blob muni-blob-1" style={{ backgroundColor: '#f2994a', opacity: 0.1 }}></div>
        <div className="muni-blob muni-blob-2"></div>
        <div className="muni-blob muni-blob-3"></div>
      </div>

      {/* ═══ HEADER MUNICIPAL ═══ */}
      <header className="muni-header">
        <div className="muni-header-inner">
          <a href="/encombrants" className="logo-block">
            <img src="/encombrant-logo.png" alt="Choisy le Roi Logo" className="muni-logo-img" />
            <div className="muni-title">
              <h1>Choisy-le-Roi</h1>
              <span>Espace Conducteurs</span>
            </div>
          </a>
          
          <nav className="muni-nav">
            <a href="/encombrants" className="muni-nav-link">
              <ArrowLeft size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline' }} />
              Retour Accueil
            </a>
            <button 
              onClick={() => fetchRequests(false)}
              disabled={isRefreshing}
              className="btn-emergency"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(15, 76, 129, 0.1)' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
              Rafraîchir
            </button>
          </nav>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <main className="conducteur-container">
        
        {/* Date Selector Panel */}
        <div className="driver-date-card">
          <div className="driver-date-info">
            <h3>Feuille de Route Quotidienne</h3>
            <p>Sélectionnez la session de collecte pour afficher les adresses planifiées.</p>
          </div>
          
          <div className="driver-date-selector">
            {wednesdays.map(wDate => (
              <button
                key={wDate}
                onClick={() => setSelectedDate(wDate)}
                className={`btn-driver-date ${selectedDate === wDate ? 'active' : ''}`}
              >
                <Calendar size={16} />
                {formatDateShort(wDate)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Indicators */}
        <div className="driver-stats-bar">
          <div className="driver-stat-card">
            <div className="driver-stat-icon">
              <ClipboardList size={22} />
            </div>
            <div className="driver-stat-info">
              <strong>{remainingJobs}</strong>
              <span>À collecter</span>
            </div>
          </div>

          <div className="driver-stat-card">
            <div className="driver-stat-icon green">
              <Check size={22} />
            </div>
            <div className="driver-stat-info">
              <strong>{collectedJobs} / {totalJobs}</strong>
              <span>Collectés</span>
            </div>
          </div>

          <div className="driver-stat-card">
            <div className="driver-stat-icon red">
              <AlertTriangle size={22} />
            </div>
            <div className="driver-stat-info">
              <strong>{incidentJobs}</strong>
              <span>Incidents</span>
            </div>
          </div>
        </div>

        {/* Roadmap list */}
        <section className="roadmap-section">
          <h2 className="roadmap-section-title">Points de collecte ({totalJobs} adresses)</h2>

          {activeRoadmap.length > 0 ? (
            activeRoadmap.map((req, index) => {
              // Parse items to collect
              const itemsList: { name: string; qty: number }[] = [];
              if (req.items) {
                Object.values(req.items).forEach(familyItems => {
                  familyItems.forEach(item => {
                    if (item.qty > 0) {
                      itemsList.push({ name: item.name, qty: item.qty });
                    }
                  });
                });
              }

              return (
                <div key={req.id} className={`job-card ${req.status.toLowerCase()}`}>
                  
                  {/* Job Header */}
                  <div className="job-header">
                    <div className="job-address-block">
                      <h4>
                        <MapPin size={18} style={{ color: 'var(--municipal-blue)' }} />
                        {index + 1}. {req.address}
                      </h4>
                      <span>Résident : {req.fullName} · Tél : {req.phone}</span>
                    </div>
                    <span className="dossier-count-badge">
                      {req.id}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="dossier-items-list">
                    <h5>Encombrants déclarés</h5>
                    {itemsList.map((item, idx) => (
                      <div key={idx} className="dossier-item-row">
                        <span>{item.name}</span>
                        <strong>x{item.qty}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Actions or Status Banner */}
                  {req.status === 'APPROVED' ? (
                    <div className="job-actions-row">
                      <button 
                        onClick={() => handleOpenIncidentModal(req)}
                        className="btn-collect-incident"
                      >
                        <AlertTriangle size={16} />
                        Signaler Incident
                      </button>
                      <button 
                        onClick={() => handleMarkCollected(req.id)}
                        className="btn-collect-success"
                      >
                        <Check size={16} />
                        Déclarer Collecté
                      </button>
                    </div>
                  ) : req.status === 'COLLECTED' ? (
                    <div className="job-status-banner success">
                      <Check size={16} />
                      <span>✓ Collecté avec succès — Chargé dans le camion.</span>
                    </div>
                  ) : req.status === 'INCIDENT' ? (
                    <div className="job-status-banner danger" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} />
                        <strong>Incident signalé : {req.incidentReason || 'Autre motif'}</strong>
                      </div>
                      {req.incidentNote && (
                        <span style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.9 }}>
                          Note : &ldquo;{req.incidentNote}&rdquo;
                        </span>
                      )}
                    </div>
                  ) : null}

                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Inbox size={48} />
              <h4>Feuille de route vide</h4>
              <p>Aucune demande de ramassage confirmée par l'administration pour le mercredi {formatDateShort(selectedDate)}.</p>
            </div>
          )}

        </section>

      </main>

      {/* ═══ INCIDENT MODAL ═══ */}
      {activeIncidentRequest && (
        <div className="modal-overlay">
          <div className="email-modal-card" style={{ maxWidth: '500px' }}>
            
            <div className="email-modal-header" style={{ backgroundColor: '#ef4444' }}>
              <AlertTriangle size={20} />
              <h4>Signaler un Incident de Collecte</h4>
              <button 
                onClick={() => setActiveIncidentRequest(null)}
                style={{ background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIncident}>
              <div className="incident-modal-content">
                <div className="form-field">
                  <label htmlFor="incident-reason">Motif de l'incident</label>
                  <select 
                    id="incident-reason"
                    className="form-select-incident"
                    value={incidentReason}
                    onChange={(e) => setIncidentReason(e.target.value)}
                  >
                    <option value="Déchets non conformes / interdits">Déchets non conformes / interdits (gravats, solvants...)</option>
                    <option value="Accès impossible (travaux / véhicule gênant)">Accès impossible (travaux / véhicule gênant)</option>
                    <option value="Objets absents du trottoir">Objets absents du trottoir / non déposés</option>
                    <option value="Volume excessif par rapport à la demande">Volume excessif par rapport à la demande</option>
                    <option value="Autre motif">Autre motif (détailler ci-dessous)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="incident-note">Observations / Notes de terrain (facultatif)</label>
                  <textarea 
                    id="incident-note"
                    className="textarea-incident"
                    placeholder="Précisez la situation (ex: Matelas mouillé et déchiré, présence de gravats non déclarés...)"
                    value={incidentNote}
                    onChange={(e) => setIncidentNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="email-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setActiveIncidentRequest(null)}
                  className="btn-muni-secondary"
                  style={{ marginRight: '12px' }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="btn-incident-submit"
                >
                  Valider le Signalement
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ═══ MUNICIPAL FOOTER ═══ */}
      <footer className="muni-footer">
        <div className="muni-footer-inner">
          <div className="footer-logo">
            <img src="/logo.png" alt="XIRH" className="footer-logo-img" />
            <div className="footer-info">
              <strong>Mairie de Choisy-le-Roi</strong><br />
              Place Gabriel Péri, 94600 Choisy-le-Roi<br />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fait avec ❤️ à Choisy-le-Roi
              </span>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="#" className="footer-link">Mentions Légales</a>
            <a href="#" className="footer-link">Données Personnelles</a>
            <a href="#" className="footer-link">Contactez-nous</a>
            <a href="#" className="footer-link">Choisy.fr</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
