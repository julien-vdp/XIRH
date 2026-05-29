'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Shield, Leaf, Clock, MapPin, 
  CheckCircle2, AlertTriangle, Phone, FileText, Info,
  Truck, User, ArrowDown
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
        <div className="muni-blob muni-blob-3"></div>
      </div>
      
      {/* ═══ HEADER MUNICIPAL ═══ */}
      <header className="muni-header">
        <div className="muni-header-inner">
          <a href="#" className="logo-block">
            <img src="/encombrant-logo.png" alt="Choisy le Roi Logo" className="muni-logo-img" />
            <div className="muni-title">
              <h1>Choisy-le-Roi</h1>
              <span>Gestion des Encombrants</span>
            </div>
          </a>
          
          <nav className="muni-nav">
            <a href="#fonctionnement" className="muni-nav-link">Comment ça marche ?</a>
            <a href="#statistiques" className="muni-nav-link">Statistiques</a>
            <a href="tel:3927" className="btn-emergency">
              <Phone size={16} />
              Allô Propreté : 3927
            </a>
          </nav>
        </div>
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <section className="muni-hero">
        <div className="muni-hero-grid">
          
          {/* Colonne Gauche : Contenu principal */}
          <div className="muni-hero-content">
            <div className="muni-hero-badge">
              <Leaf size={16} />
              <span>Service public écocitoyen engagé pour la propreté</span>
            </div>
            <h2>
              Un environnement propre, <br />
              <span className="muni-hero-gradient-text">ensemble pour Choisy-le-Roi.</span>
            </h2>
            <p className="muni-hero-desc">
              Planifiez vos collectes à domicile, signalez les dépôts sauvages et facilitez le travail des agents municipaux grâce à notre plateforme connectée et intelligente.
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
                <ArrowDown size={16} />
              </a>
            </div>
          </div>
          
          {/* Colonne Droite : Carte Interactive Simulée */}
          <div className="muni-hero-visual">
            <div className="hero-map-card">
              
              <div className="map-card-header">
                <div className="map-card-title-block">
                  <h4>Suivi des tournées</h4>
                  <span>Choisy-le-Roi · Secteur Centre</span>
                </div>
                <div className="live-indicator">
                  <div className="live-pulse"></div>
                  <span>LIVE</span>
                </div>
              </div>
              
              <div className="map-canvas-simulated">
                <div className="map-grid-bg"></div>
                
                {/* Tracés de rues stylisés */}
                <svg className="map-streets-svg" viewBox="0 0 300 240">
                  <line x1="20" y1="180" x2="135" y2="96" className="street-line" />
                  <line x1="135" y1="96" x2="210" y2="132" className="street-line" />
                  <line x1="210" y1="132" x2="260" y2="52" className="street-line" />
                  
                  <line x1="10" y1="60" x2="290" y2="60" className="street-line-active" style={{ opacity: 0.15 }} />
                  <line x1="150" y1="10" x2="150" y2="230" className="street-line-active" style={{ opacity: 0.15 }} />
                  
                  {/* Tracé de la tournée active */}
                  <path 
                    d="M 20,180 L 135,96 L 210,132 L 260,52" 
                    className="route-path-highlight" 
                  />
                </svg>
                
                {/* Points de collecte (Pins) */}
                <div className="map-marker success" style={{ left: '6.6%', top: '75%' }}>
                  <div className="map-marker-pin"></div>
                  <div className="map-tooltip">✓ Collecté (Rue de la Paix)</div>
                </div>
                
                <div className="map-marker pending" style={{ left: '45%', top: '40%' }}>
                  <div className="map-marker-pin"></div>
                  <div className="map-tooltip">En cours (Av. G. Péri)</div>
                </div>
                
                <div className="map-marker incident" style={{ left: '70%', top: '55%' }}>
                  <div className="map-marker-pin"></div>
                  <div className="map-tooltip">⚠️ Incident (Vol. excessif)</div>
                </div>

                <div className="map-marker pending" style={{ left: '86.6%', top: '21.6%' }}>
                  <div className="map-marker-pin"></div>
                  <div className="map-tooltip">Planifié (Rue du Port)</div>
                </div>

                {/* Camion poubelle animé qui parcourt la ligne */}
                <div className="animated-truck-marker">
                  <Truck size={18} />
                </div>

              </div>
              
              <div className="map-card-stats">
                <div className="map-stat-subcard">
                  <strong>12 / 16</strong>
                  <span>Collectes validées</span>
                </div>
                <div className="map-stat-subcard">
                  <strong>88%</strong>
                  <span>Tri & Recyclage</span>
                </div>
                <div className="map-stat-subcard">
                  <strong>1.2 tonnes</strong>
                  <span>Poids récolté</span>
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
              <User size={40} />
            </div>
            <h3>Espace Citoyen</h3>
            <p>
              Prenez rendez-vous pour un enlèvement devant chez vous, signalez un dépôt sauvage sur la voie publique en 1 clic et suivez le statut de votre demande.
            </p>
            <button className="profile-card-btn">
              Accéder à l'espace
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Carte Administrateur */}
          <div 
            onClick={() => handleProfileClick('Administrateur')}
            className="profile-card admin"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-card-icon-wrapper">
              <Shield size={40} />
            </div>
            <h3>Espace Administration</h3>
            <p>
              Supervisez les demandes des résidents, planifiez et optimisez les tournées de collecte quotidienne, et gérez les rapports et statistiques du service.
            </p>
            <button className="profile-card-btn">
              Console d'administration
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Carte Conducteur */}
          <div 
            onClick={() => handleProfileClick('Conducteur')}
            className="profile-card conducteur"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-card-icon-wrapper">
              <Truck size={40} />
            </div>
            <h3>Espace Conducteur</h3>
            <p>
              Consultez votre feuille de route optimisée en temps réel, déclarez le passage de la benne et signalez les incidents sur le terrain.
            </p>
            <button className="profile-card-btn">
              Démarrer la tournée
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* ═══ STATS BANNER ═══ */}
      <section id="statistiques" className="muni-stats">
        <div className="muni-stats-inner">
          <div className="stat-item">
            <span className="stat-number">24h</span>
            <span className="stat-label">Délai moyen d'intervention</span>
            <span className="stat-desc">Après validation du signalement citoyen</span>
          </div>
          <div className="stat-item">
            <span className="stat-number green">88%</span>
            <span className="stat-label">Valorisation & Recyclage</span>
            <span className="stat-desc">Des objets acheminés en recyclerie</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12 400+</span>
            <span className="stat-label">Collectes par an</span>
            <span className="stat-desc">Effectuées sur l'ensemble de la commune</span>
          </div>
        </div>
      </section>

      {/* ═══ COMMENT ÇA MARCHE ═══ */}
      <section id="fonctionnement" className="muni-explain">
        <div className="section-header">
          <h2>Comment ça fonctionne ?</h2>
          <p>La gestion des encombrants à Choisy-le-Roi est simplifiée en 3 étapes clefs.</p>
        </div>
        
        <div className="steps-flow">
          <div className="step-card">
            <span className="step-badge">1</span>
            <h4>Signalement ou Demande</h4>
            <p>Le citoyen remplit un formulaire de demande d'enlèvement ou signale un dépôt sauvage en téléversant une photo et une géolocalisation.</p>
          </div>
          <div className="step-card">
            <span className="step-badge">2</span>
            <h4>Validation & Planification</h4>
            <p>Les administrateurs municipaux qualifient la demande, valident sa conformité et l'affectent à la feuille de route du conducteur approprié.</p>
          </div>
          <div className="step-card green">
            <span className="step-badge">3</span>
            <h4>Enlèvement & Tri</h4>
            <p>L'équipe de collecte se rend sur place le jour convenu pour charger les objets et les acheminer vers les filières de recyclage adaptées.</p>
          </div>
        </div>
      </section>

      {/* ═══ MUNICIPAL FOOTER ═══ */}
      <footer className="muni-footer">
        <div className="muni-footer-inner">
          <div className="footer-logo">
            <img src="/encombrant-logo.png" alt="Choisy" className="footer-logo-img" />
            <div className="footer-info">
              <strong>Mairie de Choisy-le-Roi</strong><br />
              Place Gabriel Péri, 94600 Choisy-le-Roi<br />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fait par <strong>XIRH</strong>, avec love in Choisy-le-Roi
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
