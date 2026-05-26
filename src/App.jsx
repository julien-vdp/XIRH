import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Organization from './pages/Organization';
import Import from './pages/Import';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Evaluations from './pages/Evaluations';
import Compensation from './pages/Compensation';
import SQLConsole from './pages/SQLConsole';
import Reporting from './pages/Reporting';
import Expenses from './pages/Expenses';
import { initDB } from './db/database';
import ParticleBackground from './components/ParticleBackground';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Initialize the DB mock data on first load
    initDB();
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

export default App;
