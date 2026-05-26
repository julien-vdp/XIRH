'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Dashboard from '../../views/Dashboard';
import Employees from '../../views/Employees';
import Organization from '../../views/Organization';
import Import from '../../views/Import';
import Settings from '../../views/Settings';
import Login from '../../views/Login';
import Evaluations from '../../views/Evaluations';
import Compensation from '../../views/Compensation';
import SQLConsole from '../../views/SQLConsole';
import Reporting from '../../views/Reporting';
import Expenses from '../../views/Expenses';
import { initDB, syncFromPostgres } from '../../db/database';
import ParticleBackground from '../../components/ParticleBackground';

export default function SIRHPage() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState('dark');
  const [isSyncing, setIsSyncing] = useState(true);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Synchronize local storage cache with PostgreSQL database on startup
    const doSync = async () => {
      setIsSyncing(true);
      await syncFromPostgres();
      initDB();
      setIsSyncing(false);
    };
    doSync();
  }, []);

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
      case 'employees': return <Employees />;
      case 'organization': return <Organization />;
      case 'import': return <Import />;
      case 'evaluations': return <Evaluations currentUser={currentUser} />;
      case 'compensation': return <Compensation currentUser={currentUser} />;
      case 'reporting': return <Reporting />;
      case 'sql-console': return <SQLConsole />;
      case 'expenses': return <Expenses currentUser={currentUser} />;
      case 'settings': return <Settings />;
      default: return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  if (isSyncing) {
    return (
      <div className="layout flex items-center justify-center min-h-screen relative" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'screen' }}>
        <div className="mesh-bg">
          <div className="mesh-orb mesh-orb-1"></div>
          <div className="mesh-orb mesh-orb-2"></div>
          <div className="mesh-orb mesh-orb-3"></div>
          <div className="mesh-orb mesh-orb-4"></div>
          <div className="mesh-orb mesh-orb-5"></div>
        </div>
        <ParticleBackground theme={theme} />
        
        <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.06)] text-center relative z-10 max-w-sm w-full mx-4 shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] backdrop-blur-[20px]" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(6, 16, 36, 0.6)', border: '1px solid rgba(255,255,255,0.06)', zIndex: 10 }}>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ width: '3rem', height: '3rem', border: '4px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem auto' }}></div>
          <h2 className="text-xl font-semibold mb-2">Synchronisation</h2>
          <p className="text-gray-400 text-sm">Chargement des données depuis PostgreSQL...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="layout">
      {/* Fond animé futuriste avec Canvas natif & Mesh Gradient */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1"></div>
        <div className="mesh-orb mesh-orb-2"></div>
        <div className="mesh-orb mesh-orb-3"></div>
        <div className="mesh-orb mesh-orb-4"></div>
        <div className="mesh-orb mesh-orb-5"></div>
      </div>
      <ParticleBackground theme={theme} />

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <div className="main-content">
        <Topbar currentView={currentView} currentUser={currentUser} theme={theme} setTheme={setTheme} />
        <div className="page-content animate-fade-in" key={currentView}>
          {renderView()}
        </div>
      </div>
    </div>
  );
}
