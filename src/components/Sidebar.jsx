import React from 'react';
import { LayoutDashboard, Users, Network, HardDriveDownload, Settings, LogOut, Star, Coins, Database, BarChart2, Receipt } from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = ({ currentView, setCurrentView, currentUser, setCurrentUser }) => {
  const isAdminOrHR = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR';

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, show: true },
    { id: 'employees', label: 'Salariés', icon: <Users size={20} />, show: true },
    { id: 'organization', label: 'Organigramme', icon: <Network size={20} />, show: true },
    { id: 'evaluations', label: 'Évaluations', icon: <Star size={20} />, show: true },
    { id: 'compensation', label: 'Rémunération', icon: <Coins size={20} />, show: true },
    { id: 'expenses', label: 'Notes de Frais', icon: <Receipt size={20} />, show: true },
    { id: 'reporting', label: 'Reporting & Exports', icon: <BarChart2 size={20} />, show: isAdminOrHR },
    { id: 'sql-console', label: 'Console SQL', icon: <Database size={20} />, show: isAdminOrHR },
    { id: 'import', label: 'Import CSV', icon: <HardDriveDownload size={20} />, show: isAdminOrHR },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={20} />, show: isAdminOrHR },
  ];

  return (
    <div className="sidebar">
      <div className="flex items-center gap-3" style={{ marginBottom: '3rem' }}>
        <img src={logo} alt="XIRH Logo" style={{ width: '45px', height: 'auto', borderRadius: '8px' }} />
        <h2 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '1px', fontWeight: 700 }}>XIRH</h2>
      </div>

      <div className="flex-col gap-2" style={{ flex: 1 }}>
        {menuItems.filter(item => item.show).map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: currentView === item.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: currentView === item.id ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
              textAlign: 'left',
              fontWeight: currentView === item.id ? 600 : 400,
              fontSize: '1rem'
            }}
            onMouseOver={(e) => { if(currentView !== item.id) e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseOut={(e) => { if(currentView !== item.id) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <span style={{ color: currentView === item.id ? 'var(--primary)' : 'inherit' }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
         <button className="btn btn-outline" onClick={() => { setCurrentUser(null); setCurrentView('dashboard'); }} style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)', border: 'none' }}>
           <LogOut size={18} /> Déconnexion
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
