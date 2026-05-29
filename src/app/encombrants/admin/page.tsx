'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, User, MapPin, 
  Check, X, RefreshCw, Mail, AlertTriangle, 
  Trash2, FileText, CheckCircle2, ShieldCheck, Inbox
} from 'lucide-react';
import './admin.css';
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

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [wednesdays, setWednesdays] = useState<string[]>([]);
  const [activeModalRequest, setActiveModalRequest] = useState<Request | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Status updates
  const updateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const updated = requests.map(req => {
      if (req.id === id) {
        const uReq = { ...req, status: newStatus };
        if (newStatus === 'APPROVED') {
          // Open Simulated email modal
          setActiveModalRequest(uReq);
        }
        return uReq;
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
    } catch (err) {
      console.error("Erreur de sauvegarde de l'état", err);
    }
  };

  // Calculate truck load for the selected date
  const calculateTruckLoad = (date: string) => {
    let loadPercent = 0;
    const dateRequests = requests.filter(req => req.date === date && (req.status === 'APPROVED' || req.status === 'COLLECTED' || req.status === 'INCIDENT'));
    
    dateRequests.forEach(req => {
      // Add weight per item family
      if (req.items) {
        Object.keys(req.items).forEach(family => {
          const qtyMultiplier = family === 'mobilier' ? 15 
                              : family === 'electro' ? 20 
                              : family === 'loisirs' ? 10 
                              : 5; // divers
          const familyItems = req.items[family] || [];
          familyItems.forEach(item => {
            loadPercent += item.qty * qtyMultiplier;
          });
        });
      }
    });

    return loadPercent;
  };

  // Get color class for the gauge
  const getGaugeColorClass = (percent: number) => {
    if (percent < 70) return 'green';
    if (percent <= 100) return 'orange';
    return 'red';
  };

  // Reset demo
  const resetDemo = async () => {
    try {
      await fetch('/api/encombrants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reset',
          data: {}
        })
      });
      window.location.reload();
    } catch (err) {
      console.error("Erreur de réinitialisation", err);
    }
  };

  // Filter requests for display
  const filteredRequests = requests.filter(req => req.date === selectedDate);
  const currentLoad = calculateTruckLoad(selectedDate);

  return (
    <div className="encombrants-root">
      
      {/* ═══ DÉCORATION D'ARRIÈRE-PLAN ANIMÉE ═══ */}
      <div className="muni-bg-decor">
        <div className="muni-blob muni-blob-1"></div>
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
              <span>Console d'Administration</span>
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
            <button 
              onClick={resetDemo}
              className="btn-emergency"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(15, 76, 129, 0.1)' }}
            >
              <RefreshCw size={14} />
              Réinitialiser la démo
            </button>
          </nav>
        </div>
      </header>

      {/* ═══ MAIN ADMIN LAYOUT ═══ */}
      <main className="admin-container">
        <div className="admin-layout">
          
          {/* SIDEBAR : DATE SELECTION & GAUGE */}
          <section className="admin-sidebar">
            
            {/* Date Filters Card */}
            <div className="sidebar-card">
              <h3>Sessions de collecte</h3>
              <div className="date-selector-list">
                {wednesdays.map(wDate => (
                  <button
                    key={wDate}
                    onClick={() => setSelectedDate(wDate)}
                    className={`btn-date-filter ${selectedDate === wDate ? 'active' : ''}`}
                  >
                    <Calendar size={16} />
                    <span>{formatDateFrench(wDate)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Truck Gauge Card */}
            <div className="sidebar-card">
              <h3>Volume du Camion</h3>
              <div className="gauge-wrapper">
                <span className="gauge-percent">{currentLoad}%</span>
                <span className="gauge-label">Taux de remplissage</span>
                
                <div className="gauge-track">
                  <div 
                    className={`gauge-fill ${getGaugeColorClass(currentLoad)}`}
                    style={{ width: `${Math.min(100, currentLoad)}%` }}
                  ></div>
                </div>
                
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Capacité calculée pour le mercredi {formatDateShort(selectedDate)} (basé sur les demandes validées).
                </span>

                {currentLoad > 100 && (
                  <div className="gauge-warning-box">
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>
                      Surcharge ! Camion complet. Pensez à planifier un second camion ou à refuser/décaler les prochaines demandes.
                    </span>
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* MAIN DOSSIERS LIST */}
          <section className="admin-main">
            <div className="admin-main-header">
              <h2>Demandes de ramassage</h2>
              <span className="dossier-count-badge">
                {filteredRequests.length} dossier(s) trouvé(s)
              </span>
            </div>

            <div className="dossiers-list">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => {
                  // Get selected items count
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
                    <div key={req.id} className="dossier-card">
                      
                      {/* Card Header */}
                      <div className="dossier-card-header">
                        <div className="dossier-id-block">
                          <h4>{req.id}</h4>
                          <span>Soumis le {new Date(req.createdAt).toLocaleDateString('fr-FR')} à {new Date(req.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <span className={`badge-status ${req.status.toLowerCase()}`}>
                          {req.status === 'PENDING' ? 'En attente' : 
                           req.status === 'APPROVED' ? 'Confirmé' : 
                           req.status === 'COLLECTED' ? 'Collecté' : 
                           req.status === 'INCIDENT' ? 'Incident' : 'Refusé'}
                        </span>
                      </div>

                      {/* Card Content Grid */}
                      <div className="dossier-grid">
                        
                        {/* Info details column */}
                        <div className="dossier-info-col">
                          <div className="dossier-info-item">
                            <span>Citoyen</span>
                            <span>{req.fullName}</span>
                          </div>
                          <div className="dossier-info-item">
                            <span>Adresse de collecte</span>
                            <span>{req.address}</span>
                          </div>
                          <div className="dossier-info-item">
                            <span>Coordonnées</span>
                            <span>{req.phone} · {req.email}</span>
                          </div>
                          
                          {/* Items breakdown list */}
                          <div className="dossier-items-list">
                            <h5>Détail des encombrants</h5>
                            {itemsList.map((item, idx) => (
                              <div key={idx} className="dossier-item-row">
                                <span>{item.name}</span>
                                <strong>x{item.qty}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Photo attachment column */}
                        <div className="dossier-photo-col">
                          <span>Photo illustrative</span>
                          <div className="dossier-photo-placeholder">
                            <Inbox size={28} />
                            <span>Aucune photo téléversée</span>
                          </div>
                        </div>

                      </div>

                      {req.status === 'INCIDENT' && (req.incidentReason || req.incidentNote) && (
                        <div className="incident-alert-box" style={{ marginTop: '16px', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '4px' }}>
                            <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                            <span>Incident de collecte</span>
                          </div>
                          <div><strong>Motif :</strong> {req.incidentReason || 'Non spécifié'}</div>
                          {req.incidentNote && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#7f1d1d' }}>&ldquo;{req.incidentNote}&rdquo;</div>}
                        </div>
                      )}

                      {/* Card Action footer */}
                      <div className="dossier-card-actions">
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, 'REJECTED')}
                              className="btn-card-reject"
                            >
                              Refuser la demande
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, 'APPROVED')}
                              className="btn-card-approve"
                            >
                              <Check size={16} />
                              Valider & Confirmer
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => updateStatus(req.id, 'PENDING')}
                            className="btn-card-reset"
                          >
                            Réinitialiser la décision
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <Inbox size={48} />
                  <h4>Aucune demande pour ce jour</h4>
                  <p>Les citoyens n'ont pas encore soumis de demandes d'encombrants pour le mercredi {formatDateShort(selectedDate)}.</p>
                </div>
              )}
            </div>

          </section>

        </div>
      </main>

      {/* ═══ EMAIL SIMULATION MODAL ═══ */}
      {activeModalRequest && (
        <div className="modal-overlay">
          <div className="email-modal-card">
            
            <div className="email-modal-header">
              <ShieldCheck size={20} />
              <h4>Simulation : E-mail officiel envoyé au citoyen</h4>
              <button 
                onClick={() => setActiveModalRequest(null)}
                style={{ background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <div className="email-client-box">
              <div className="email-header-field">
                <span>De :</span>
                <span>service.propreté@choisyleroi.fr (Mairie de Choisy-le-Roi)</span>
              </div>
              <div className="email-header-field">
                <span>À :</span>
                <span>{activeModalRequest.email} ({activeModalRequest.fullName})</span>
              </div>
              <div className="email-header-field">
                <span>Objet :</span>
                <span>Confirmation de votre rendez-vous d'enlèvement d'encombrants ({activeModalRequest.id})</span>
              </div>
            </div>

            <div className="email-body-content">
              <p>Bonjour {activeModalRequest.fullName},</p>
              <p>
                Votre demande de retrait d'encombrants a été **validée** par nos services municipaux pour le créneau suivant :
              </p>
              
              <div className="email-instruction-box">
                <strong>Date de passage :</strong> Mercredi {formatDateFrench(activeModalRequest.date)}<br />
                <strong>Adresse de collecte :</strong> {activeModalRequest.address}<br />
                <strong>Votre numéro de dossier :</strong> {activeModalRequest.id}
              </div>

              <p style={{ fontWeight: 'bold', color: 'var(--municipal-blue)' }}>
                ⚠️ Consignes importantes de dépôt :
              </p>
              <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Heure de dépôt :</strong> Vos objets doivent être sortis proprement sur le trottoir la veille au soir à partir de 20h00.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Identification requise :</strong> Vous devez écrire de façon lisible et visible le numéro de votre dossier <strong>({activeModalRequest.id})</strong> sur une feuille ou étiquette solidement fixée à vos objets.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Tri et conformité :</strong> Tout objet non déclaré ou figurant dans la liste des objets non autorisés (gravats, solvants, produits toxiques, pneus) ne sera pas collecté et restera sous votre responsabilité.
                </li>
              </ol>

              <p>Merci pour votre collaboration active à la propreté de notre commune.</p>
              <p>
                Cordialement,<br />
                <strong>Le Service Propreté & Déchets</strong><br />
                Mairie de Choisy-le-Roi
              </p>
            </div>

            <div className="email-modal-footer">
              <button 
                onClick={() => setActiveModalRequest(null)}
                className="btn-muni-primary"
              >
                Fermer l'aperçu
              </button>
            </div>

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
