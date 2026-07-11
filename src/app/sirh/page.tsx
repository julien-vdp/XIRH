'use client';

import React, { useEffect, useState } from 'react';
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
import {
  initCampaignsDB,
  initCompCampaignsDB,
  initDB,
  initExpensesDB,
  initFormsDB,
} from '../../db/database';
import ParticleBackground from '../../components/ParticleBackground';

export default function SIRHPage() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    initDB();
    initCampaignsDB();
    initFormsDB();
    initCompCampaignsDB();
    initExpensesDB();
  }, []);

  const renderView = () => {
    switch (currentView) {
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

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="layout">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1"></div>
        <div className="mesh-orb mesh-orb-2"></div>
        <div className="mesh-orb mesh-orb-3"></div>
        <div className="mesh-orb mesh-orb-4"></div>
        <div className="mesh-orb mesh-orb-5"></div>
      </div>
      <ParticleBackground theme={theme} />

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
      <div className="main-content">
        <Topbar
          currentView={currentView}
          currentUser={currentUser}
          theme={theme}
          setTheme={setTheme}
        />
        <div className="page-content animate-fade-in" key={currentView}>
          {renderView()}
        </div>
      </div>
    </div>
  );
}
