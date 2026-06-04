'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import './landing.css';

export default function Home() {
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
    // Particles Canvas Animation (same as main landing page)
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

    const N = 50;
    const pts: any[] = [];
    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
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

      <div className="gateway-container">
        {/* Theme Toggle */}
        <div className="gateway-theme-toggle">
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle theme" 
            className="theme-btn"
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="gateway-content">
          {/* Main Logo & Header */}
          <div className="gateway-header">
            <div className="logo-main-wrap">
              <img src="/logo.png" alt="XIRH Logo" className="logo-main" />
            </div>
            <h1 className="gateway-title">Bienvenue chez XIRH</h1>
            <p className="gateway-subtitle">Sélectionnez l'espace de votre choix pour continuer</p>
          </div>

          {/* Cards Grid */}
          <div className="gateway-grid">
            
            {/* Card 1: XIRH Consulting */}
            <a href="/consulting" className="gateway-card">
              <div className="gateway-card-inner">
                <div className="gateway-logo-container">
                  <div className="consulting-logo-box">
                    <img src="/logo.png" alt="XIRH Logo" className="consulting-logo" />
                  </div>
                </div>
                <div className="gateway-text-container">
                  <h3>XIRH Consulting</h3>
                  <p>Découvrez mon profil de consultant SIRH indépendant. Expertises SuccessFactors/Talentsoft, pilotage AMOA, projets d'ingénierie pédagogique et d'automatisation de données RH.</p>
                </div>
                <div className="gateway-card-action">
                  <span>Accéder au site <ArrowRight size={16} /></span>
                </div>
              </div>
            </a>

            {/* Card 2: XIRH Academy */}
            <a href="/learning" className="gateway-card">
              <div className="gateway-card-inner">
                <div className="gateway-logo-container">
                  <div className="academy-logo-box">
                    {/* Composition with Mascot and Tag */}
                    <div className="academy-logo-composition">
                      <img src="/c_avatar.png" alt="Golden Retriever Mascot" className="academy-mascot" />
                      <div className="academy-logo-tag">
                        <img src="/logo.png" alt="XIRH Logo" className="academy-logo-tag-img" />
                        <span className="academy-logo-text">Academy</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="gateway-text-container">
                  <h3>XIRH Academy</h3>
                  <p>Rejoignez la plateforme d'apprentissage. Accédez à des formations interactives, des travaux pratiques et des ressources exclusives de formation continue aux outils SIRH.</p>
                </div>
                <div className="gateway-card-action">
                  <span>Rejoindre l'Academy <ArrowRight size={16} /></span>
                </div>
              </div>
            </a>

          </div>
        </div>
      </div>
    </>
  );
}
