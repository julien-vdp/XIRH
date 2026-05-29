'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Shield, Leaf, Clock, MapPin, 
  CheckCircle2, AlertTriangle, Phone, FileText, Info,
  Truck, User, ArrowDown, Check
} from 'lucide-react';
import './encombrants.css';

export default function EncombrantsPage() {
  const router = useRouter();

  const handleProfileClick = (profile: string) => {
    if (profile === 'Citoyen') {
      router.push('/encombrants/citoyen');
    } else if (profile === 'Administrateur') {
      router.push('/encombrants/admin');
    } else if (profile === 'Conducteur') {
      router.push('/encombrants/conducteur');
    }
  };

  return (
    <div className="encombrants-root">
      
      {/* ═══ DÉCORATION D'ARRIÈRE-PLAN ANIMÉE ═══ */}
      <div className="muni-bg-decor">
        <div className="muni-blob muni-blob-1"></div>
        <div className="muni-blob muni-blob-2"></div>
      </div>
      
      {/* ═══ HEADER MUNICIPAL ═══ */}
      <header className="muni-header">
        <div className="muni-header-inner">
          <a href="#" className="logo-block">
            <img src="/encombrant-logo.png" alt="Choisy le Roi Logo" className="muni-logo-img" />
            <div className="muni-title">
              <h1>Choisy-le-Roi</h1>
              <span>Logistique Urbaine</span>
            </div>
          </a>
          
          <nav className="muni-nav">
            <a href="#fonctionnement" className="muni-nav-link">Comment ça marche ?</a>
            <a href="tel:3927" className="btn-emergency">
              <Phone size={14} />
              Allô Propreté : 3927
            </a>
          </nav>
        </div>
      </header>

      {/* ═══ HERO SECTION COMPACTE ═══ */}
      <section className="muni-hero">
        <div className="muni-hero-grid">
          
          {/* Colonne Gauche : Contenu principal */}
          <div className="muni-hero-content">
            <div className="muni-hero-badge">
              <Leaf size={14} />
              <span>Plateforme logistique connectée de gestion urbaine</span>
            </div>
            <h2>
              Optimisation <br />
              des collectes d'encombrants
            </h2>
            <p className="muni-hero-desc">
              Planifiez vos collectes à domicile, signalez les incidents sur la voie publique et optimisez les feuilles de route des agents en temps réel.
            </p>
            <div className="muni-hero-actions">
              <button 
                onClick={() => router.push('/encombrants/citoyen')} 
                className="btn-hero-primary"
              >
                Prendre rendez-vous
                <ArrowRight size={18} />
              </button>
              <a href="#fonctionnement" className="btn-hero-secondary">
                En savoir plus
              </a>
            </div>
          </div>
          
          {/* Colonne Droite : Carte Logistique Agrandie */}
          <div className="muni-hero-visual">
            <div className="hero-map-card">
              
              <div className="map-card-header">
                <div className="map-card-title-block">
                  <h4>Réseau de Collecte Choisy-Est</h4>
                  <span>Secteur Centre-Est · Session Active</span>
                </div>
                <div className="live-indicator">
                  <div className="live-pulse"></div>
                  <span>LIVE</span>
                </div>
              </div>
              
              <div className="map-canvas-simulated">
                <div className="map-grid-bg"></div>
                
                {/* Overlays flottants style SaaS */}
                <div className="map-overlay-box map-overlay-top-left">
                  <MapPin size={12} />
                  <span>Tournée #402</span>
                </div>
                <div className="map-overlay-box map-overlay-top-right">
                  <Clock size={12} />
                  <span>ETA: 10h45</span>
                </div>
                <div className="map-overlay-box map-overlay-bottom-left">
                  <Truck size={12} />
                  <span>12 / 16 Arrêts</span>
                </div>
                <div className="map-overlay-box map-overlay-bottom-right">
                  <Check size={12} style={{ color: 'var(--eco-green)' }} />
                  <span>Itinéraire optimisé</span>
                </div>

                {/* Tracés de rues stylisés */}
                <svg className="map-streets-svg" viewBox="0 0 300 240" preserveAspectRatio="none">
                  <line x1="20" y1="180" x2="135" y2="96" className="street-line" />
                  <line x1="135" y1="96" x2="210" y2="132" className="street-line" />
                  <line x1="210" y1="132" x2="260" y2="52" className="street-line" />
                  
                  <line x1="10" y1="60" x2="290" y2="60" className="street-line-active" style={{ opacity: 0.08 }} />
                  <line x1="150" y1="10" x2="150" y2="230" className="street-line-active" style={{ opacity: 0.08 }} />
                  
                  {/* Tracé de la tournée active */}
                  <path 
                    d="M 20,180 L 135,96 L 210,132 L 260,52" 
                    className="route-path-highlight" 
                  />
                </svg>
                
                {/* Points de collecte (Pins avec numéros de tournée) */}
                <div className="map-marker success" style={{ left: '6.6%', top: '75%' }}>
                  <div className="map-marker-pin">1</div>
                  <div className="map-tooltip">✓ Collecté (Rue de la Paix)</div>
                </div>
                
                <div className="map-marker pending" style={{ left: '45%', top: '40%' }}>
                  <div className="map-marker-pin">2</div>
                  <div className="map-tooltip">En cours (Av. G. Péri)</div>
                </div>
                
                <div className="map-marker incident" style={{ left: '70%', top: '55%' }}>
                  <div className="map-marker-pin">3</div>
                  <div className="map-tooltip">⚠️ Incident (Volume excessif)</div>
                </div>

                <div className="map-marker pending" style={{ left: '86.6%', top: '21.6%' }}>
                  <div className="map-marker-pin">4</div>
                  <div className="map-tooltip">Planifié (Rue du Port)</div>
                </div>

                {/* Camion poubelle animé */}
                <div className="animated-truck-marker">
                  <Truck size={16} />
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══ PROFILE SELECTOR ═══ */}
      <section className="muni-profiles-section">
        <div className="profiles-grid">
          
          {/* Carte Citoyen */}
          <div 
            onClick={() => handleProfileClick('Citoyen')}
            className="profile-card citoyen"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-card-icon-wrapper">
              <img src="/btn-citoyen-saas.png" alt="Espace Citoyen" className="profile-card-img" />
            </div>
            <h3>Espace Citoyen</h3>
            <p>
              Prenez rendez-vous, déclarez vos encombrants, signalez un dépôt sauvage et suivez l'avancement de votre demande.
            </p>
            <button className="profile-card-btn">
              Prendre rendez-vous
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Carte Administrateur */}
          <div 
            onClick={() => handleProfileClick('Administrateur')}
            className="profile-card admin"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-card-icon-wrapper">
              <img src="/btn-admin-saas.png" alt="Espace Administration" className="profile-card-img" />
            </div>
            <h3>Console d'Administration</h3>
            <p>
              Supervisez les demandes d'enlèvement, planifiez et optimisez les tournées et gérez les rapports d'intervention.
            </p>
            <button className="profile-card-btn">
              Ouvrir la console
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Carte Conducteur */}
          <div 
            onClick={() => handleProfileClick('Conducteur')}
            className="profile-card conducteur"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-card-icon-wrapper">
              <img src="/btn-conducteur-saas.png" alt="Espace Conducteur" className="profile-card-img" />
            </div>
            <h3>Espace Conducteur</h3>
            <p>
              Consultez votre feuille de route optimisée, déclarez vos passages et signalez les incidents sur le terrain.
            </p>
            <button className="profile-card-btn">
              Démarrer la tournée
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* ═══ COMMENT ÇA MARCHE ═══ */}
      <section id="fonctionnement" className="muni-explain" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <h2>Comment ça fonctionne ?</h2>
          <p>La gestion intelligente des collectes résumée en 3 étapes clés.</p>
        </div>
        
        <div className="steps-flow">
          <div className="step-card">
            <span className="step-badge">1</span>
            <h4>Signalement</h4>
            <p>Le citoyen effectue sa demande de retrait en ligne avec la liste des objets et sa géolocalisation précise.</p>
          </div>
          <div className="step-card">
            <span className="step-badge">2</span>
            <h4>Optimisation</h4>
            <p>L'administration valide la demande et l'insère automatiquement dans l'itinéraire le plus optimal.</p>
          </div>
          <div className="step-card green">
            <span className="step-badge">3</span>
            <h4>Collecte</h4>
            <p>Le conducteur suit sa feuille de route en direct et déclare le ramassage pour recyclage.</p>
          </div>
        </div>
      </section>

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
