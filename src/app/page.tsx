'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Sun, Moon, Layers, Cpu, GraduationCap, Briefcase, 
  Laptop, CalendarDays, Award, Globe, MapPin, BookOpen, Building2, 
  Mail, Phone, Clock, Send, Check 
} from 'lucide-react';
import './landing.css';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Handle theme load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll reveal animation
    const fadeEls = document.querySelectorAll('.fade-up');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Particles Canvas Animation
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const activeCtx = ctx;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;

    function resize() {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;
      const currentCtx = currentCanvas.getContext('2d');
      if (!currentCtx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      currentCanvas.width = W * dpr;
      currentCanvas.height = H * dpr;
      currentCanvas.style.width = W + 'px';
      currentCanvas.style.height = H + 'px';
      currentCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const N = 60;
    const pts: any[] = [];
    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.35 + 0.05
      });
    }

    let animId: number;
    function frame() {
      activeCtx.clearRect(0, 0, W, H);

      // move
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });

      // lines
      const maxDist = 140;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = dx * dx + dy * dy;
          if (d < maxDist * maxDist) {
            const alpha = 0.06 * (1 - Math.sqrt(d) / maxDist);
            activeCtx.strokeStyle = 'rgba(34,211,238,' + alpha + ')';
            activeCtx.lineWidth = 0.6;
            activeCtx.beginPath();
            activeCtx.moveTo(pts[i].x, pts[i].y);
            activeCtx.lineTo(pts[j].x, pts[j].y);
            activeCtx.stroke();
          }
        }
      }

      // dots
      pts.forEach(p => {
        activeCtx.beginPath();
        activeCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        activeCtx.fillStyle = 'rgba(34,211,238,' + p.a + ')';
        activeCtx.fill();
      });

      animId = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1"></div>
        <div className="mesh-orb mesh-orb-2"></div>
        <div className="mesh-orb mesh-orb-3"></div>
        <div className="mesh-orb mesh-orb-4"></div>
        <div className="mesh-orb mesh-orb-5"></div>
      </div>
      <canvas ref={canvasRef} id="particles"></canvas>

      <div className="page-content">

    {/* ═══ HEADER ═══ */}
    <header id="header" className={scrolled ? "scrolled" : ""}>
      <div className="header-inner">
        <a href="#" className="logo-wrap">
          <img src="/logo.png" alt="XIRH" />
        </a>
        <div className="nav-links">
          <a href="#services">Expertises</a>
          <a href="#portfolio">Réalisations</a>
          <a href="#apropos">À propos</a>
          <a href="#parcours">Parcours</a>
          <a href="#contact">Contact</a>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle theme" 
            style={{background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', transition: 'background 0.2s'}}
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a href="#contact" className="cta-header">
            <ArrowRight  size={14} />
            Parlons-en
          </a>
        </div>
      </div>
    </header>

    {/* ═══ HERO ═══ */}
    <section className="hero">
      <div className="container">
        <div className="hero-overline fade-up">Conseil SIRH · Formation · Data</div>
        <h1 className="fade-up stagger-1">
          Vos projets SIRH,<br />
          <span className="gradient-text">structurés & performants.</span>
        </h1>
        <p className="hero-sub fade-up stagger-2">
          XIRH accompagne les directions RH et les DSI dans la création de leur vision, la structuration de leurs
          besoins, le déploiement de leurs solutions et la fiabilisation de leurs données.
        </p>
        <div className="hero-actions fade-up stagger-3">
          <a href="#portfolio" className="btn-primary">
            Voir mes réalisations
            <ArrowRight  size={16} />
          </a>
          <a href="#contact" className="btn-ghost">
            Discutons de votre projet
          </a>
        </div>
        <div className="trust-strip fade-up stagger-4">
          <div className="trust-item">
            <span className="trust-number">10+</span>
            <span className="trust-label">Années d'expérience</span>
          </div>
          <div className="trust-sep"></div>
          <div className="trust-item">
            <span className="trust-number">SAP</span>
            <span className="trust-label">SuccessFactors certifié</span>
          </div>
          <div className="trust-sep"></div>
          <div className="trust-item">
            <span className="trust-number">100%</span>
            <span className="trust-label">Indépendant & agile</span>
          </div>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="scroll-hint-line"></div>
        Scroll
      </div>
    </section>

    <div className="sep"></div>

    {/* ═══ SERVICES (Bento Grid) ═══ */}
    <section id="services" className="services">
      <div className="container">
        <div className="services-head fade-up">
          <div>
            <div className="section-label">Domaines d'intervention</div>
            <h2 className="section-title">Une expertise<br />complète du SIRH</h2>
          </div>
          <p className="section-desc">Du cadrage stratégique à l'automatisation, une couverture complète du cycle de vie de
            vos projets RH.</p>
        </div>

        <div className="bento">
          <div className="bento-card span-7 fade-up stagger-1">
            <div>
              <div className="bento-icon"><Layers  size={22} /></div>
              <h3>Écosystèmes RH & Déploiement</h3>
              <p>Expertise approfondie sur SAP SuccessFactors et Talentsoft. Intégration, paramétrage avancé,
                interfaçage et gestion du cycle de vie des modules Core HR, Talent et Paie.</p>
            </div>
            <div className="bento-tags">
              <span className="bento-tag">SuccessFactors</span>
              <span className="bento-tag">Talentsoft</span>
              <span className="bento-tag">Employee Central</span>
              <span className="bento-tag">Core HR</span>
            </div>
          </div>

          <div className="bento-card span-5 fade-up stagger-2">
            <div>
              <div className="bento-icon"><Cpu  size={22} /></div>
              <h3>Data & Automatisation</h3>
              <p>Exploitation des APIs, optimisation des processus et sécurisation des données RH via scripts Python
                sur-mesure.</p>
            </div>
            <div className="bento-tags">
              <span className="bento-tag">Python</span>
              <span className="bento-tag">API REST</span>
              <span className="bento-tag">ETL</span>
            </div>
          </div>

          <div className="bento-card span-5 fade-up stagger-3">
            <div>
              <div className="bento-icon"><GraduationCap  size={22} /></div>
              <h3>Formation & Transfert</h3>
              <p>Ingénierie pédagogique, animation de formations et montée en compétences des équipes d'administration
                SIRH.</p>
            </div>
            <div className="bento-tags">
              <span className="bento-tag">Formations</span>
              <span className="bento-tag">Enseignement supérieur</span>
            </div>
          </div>

          <div className="bento-card span-7 fade-up stagger-4">
            <div>
              <div className="bento-icon"><Briefcase  size={22} /></div>
              <h3>Stratégie & AMOA</h3>
              <p>Pilotage de projets SIRH, animation d'ateliers métiers, rédaction de cahiers des charges, coordination
                des phases de recette et accompagnement au changement.</p>
            </div>
            <div className="bento-tags">
              <span className="bento-tag">Cadrage</span>
              <span className="bento-tag">Ateliers métiers</span>
              <span className="bento-tag">Recette</span>
              <span className="bento-tag">Change management</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="sep"></div>

    {/* ═══ PORTFOLIO ═══ */}
    <section id="portfolio" className="portfolio">
      <div className="container">
        <div className="fade-up">
          <div className="section-label">Portfolio</div>
          <h2 className="section-title">Mes Réalisations</h2>
          <p className="section-desc">Découvrez des cas concrets de réalisations, du développement de modules complexes à
            l'organisation de mes disponibilités.</p>
        </div>

        <div className="portfolio-grid">
          {/* Carte 1 : SIRH */}
          <a href="/sirh" className="pf-card fade-up stagger-1">
            <div className="pf-img-wrap">
              <Laptop  size={80} />
            </div>
            <div className="pf-content">
              <h3>Plateforme SIRH Démo</h3>
              <p>Une implémentation concrète d'un environnement RH moderne. Un portail web complet incluant gestion des
                talents, module d'évaluation avancé, organigramme dynamique, console SQL d'export et validation de notes
                de frais multicritères.</p>
              <div className="bento-tags" style={{marginBottom: '24px'}}>
                <span className="bento-tag">React.js</span>
                <span className="bento-tag">Core HR</span>
                <span className="bento-tag">Talent Mgt</span>
              </div>
              <span className="pf-action">Expérimenter le logiciel <ArrowRight  size={16} /></span>
            </div>
          </a>

          {/* Carte 2 : Planning */}
          <a href="/planning" className="pf-card fade-up stagger-2">
            <div className="pf-img-wrap">
              <CalendarDays  size={80} />
            </div>
            <div className="pf-content">
              <h3>Agenda & Disponibilités</h3>
              <p>Une interface "Glassmorphism" construite sur-mesure pour présenter mes disponibilités professionnelles
                de consultant de manière fluide et intuitive. Calendrier interactif avec réservation contextuelle par
                e-mail intégrée.</p>
              <div className="bento-tags" style={{marginBottom: '24px'}}>
                <span className="bento-tag">Consulting</span>
                <span className="bento-tag">Planning</span>
                <span className="bento-tag">UI/UX</span>
              </div>
              <span className="pf-action">Consulter mon agenda <ArrowRight  size={16} /></span>
            </div>
          </a>

        </div>
      </div>
    </section>

    <div className="sep"></div>

    {/* ═══ À PROPOS ═══ */}
    <section id="apropos" className="about">
      <div className="container about-layout">
        <div className="about-photo fade-up">
          <img src="/julien2.png" alt="Julien Favaux — Consultant XIRH" />
        </div>
        <div className="about-text">
          <div className="section-label fade-up">À propos</div>
          <h2 className="section-title fade-up stagger-1">Une approche<br />pragmatique du SIRH</h2>
          <p className="fade-up stagger-2">Fort d'une expérience polyvalente en entreprise (Eramet, Fnac Darty),
            j'accompagne aujourd'hui les organisations avec une conviction : les systèmes d'information RH doivent être
            avant tout des facilitateurs opérationnels et de véritables leviers de création de valeur.</p>
          <p className="fade-up stagger-3">Mon approche : appréhender rapidement vos enjeux métiers, structurer
            techniquement les solutions, et fournir une documentation rigoureuse. L'objectif est de rendre vos équipes
            pleinement autonomes à l'issue de chaque intervention.</p>
          <p className="fade-up stagger-4">J'interviens également en tant qu'enseignant dans l'enseignement supérieur sur
            les thématiques de digitalisation RH et gestion de projets SI.</p>
          <div className="about-highlights fade-up stagger-5">
            <div className="highlight-card">
              <Award  size={18} />
              <div>
                <div className="h-label">Certifié SAP SF</div>
                <div className="h-desc">Employee Central</div>
              </div>
            </div>
            <div className="highlight-card">
              <Globe  size={18} />
              <div>
                <div className="h-label">Anglais courant</div>
                <div className="h-desc">Contextes internationaux</div>
              </div>
            </div>
            <div className="highlight-card">
              <MapPin  size={18} />
              <div>
                <div className="h-label">Île-de-France</div>
                <div className="h-desc">Remote & sur site</div>
              </div>
            </div>
            <div className="highlight-card">
              <BookOpen  size={18} />
              <div>
                <div className="h-label">Master RH</div>
                <div className="h-desc">Enseignant supérieur</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="sep"></div>

    {/* ═══ PARCOURS ═══ */}
    <section id="parcours" className="parcours">
      <div className="container">
        <div className="fade-up">
          <div className="section-label">Parcours</div>
          <h2 className="section-title">Qualifications & Expériences</h2>
        </div>
        <div className="timeline">
          <div className="tl-card fade-up stagger-1">
            <div className="tl-card-head">
              <div className="tl-icon"><Award  size={20} /></div>
              <h3>Qualifications professionnelles</h3>
            </div>
            <p>Titulaire d'un Master RH et de certifications SAP SuccessFactors (Employee Central). Pratique courante de
              l'anglais professionnel dans des environnements internationaux.</p>
          </div>
          <div className="tl-card fade-up stagger-2">
            <div className="tl-card-head">
              <div className="tl-icon"><Building2  size={20} /></div>
              <h3>Expériences clés</h3>
            </div>
            <p>Pilotage du run, déploiement de projets d'envergure, gestion des interfaçages paie et administration
              technico-fonctionnelle au sein de grands groupes (Eramet, Fnac Darty).</p>
          </div>
        </div>
      </div>
    </section>

    <div className="sep"></div>

    {/* ═══ CONTACT ═══ */}
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-header fade-up">
          <div className="section-label">Contact</div>
          <h2 className="section-title">Parlons de votre projet</h2>
          <p className="section-desc">Mission de conseil, renfort ponctuel ou formation — discutons de vos enjeux.</p>
        </div>

        <div className="contact-layout">
          {/* Left: Coordonnées */}
          <div className="contact-info fade-up stagger-1">
            <div>
              <h3>Échangeons directement</h3>
              <p>Vous pouvez me contacter par téléphone, e-mail ou via le formulaire ci-contre. Je m'engage à vous
                répondre sous 24h.</p>
            </div>
            <div className="contact-details">
              <div className="cd-row">
                <div className="cd-icon"><Mail  size={18} /></div>
                <div className="cd-text">
                  <strong>E-mail</strong>
                  <a href="mailto:julien@xirh.fr">julien@xirh.fr</a>
                </div>
              </div>
              <div className="cd-row">
                <div className="cd-icon"><Phone  size={18} /></div>
                <div className="cd-text">
                  <strong>Téléphone</strong>
                  <a href="tel:+33649195000">+33 6 49 19 50 00</a>
                </div>
              </div>
              <div className="cd-row">
                <div className="cd-icon"><MapPin  size={18} /></div>
                <div className="cd-text">
                  <strong>Localisation</strong>
                  <span>Île-de-France (Choisy-le-Roi)</span>
                </div>
              </div>
              <div className="cd-row">
                <div className="cd-icon"><Clock  size={18} /></div>
                <div className="cd-text">
                  <strong>Disponibilité</strong>
                  <span>Remote & sur site</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Formulaire */}
          <div className="contact-form-wrap fade-up stagger-2">
            <form id="contactForm" className="contact-form" action="https://formsubmit.co/julien@xirh.fr" method="POST">
              {/* FormSubmit config */}
              <input type="hidden" name="_subject" value="Nouveau message via xirh.fr" />
              <input type="hidden" name="_template" value="box" />
              <input type="hidden" name="_autoresponse" value="Bonjour ! J'ai bien reçu votre message via xirh.fr et je vous en remercie. Je reviens vers vous dans les plus brefs délais au sujet de votre demande. Cordialement, Julien Favaux." />
              <input type="text" name="_honey" style={{display: 'none'}} />

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom complet</label>
                  <input type="text" id="name" name="name" placeholder="Jean Dupont" required />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Entreprise</label>
                  <input type="text" id="company" name="company" placeholder="Votre entreprise" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Adresse e-mail</label>
                <input type="email" id="email" name="email" placeholder="jean@entreprise.com" required />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Type de besoin</label>
                <select id="subject" name="subject" required>
                  <option value="" disabled defaultValue="">Sélectionnez un sujet</option>
                  <option value="Conseil SIRH">Conseil SIRH</option>
                  <option value="Déploiement / AMOA">Déploiement / AMOA</option>
                  <option value="Data & Automatisation">Data & Automatisation</option>
                  <option value="Formation">Formation</option>
                  <option value="Autre">Autre demande</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Votre message</label>
                <textarea id="message" name="message" placeholder="Décrivez brièvement votre projet ou votre besoin..."
                  required></textarea>
              </div>

              <button type="submit" className="form-submit">
                <Send  size={16} />
                Envoyer le message
              </button>
            </form>

            <div className="form-success" id="formSuccess">
              <div className="form-success-icon">
                <Check  size={24} />
              </div>
              <h4>Message envoyé !</h4>
              <p>Merci pour votre message. Je reviendrai vers vous dans les plus brefs délais.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ═══ FOOTER ═══ */}
    <footer>
      <div className="container footer-inner">
        <a href="#" className="footer-brand"><img src="/logo.png" alt="XIRH" /></a>
        <p>© 2026 XIRH — Conseil SIRH & Formation. Tous droits réservés.</p>
      </div>
    </footer>

  </div>{/* .page-content */}
    </>
  );
}
