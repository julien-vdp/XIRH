import React from 'react';
import { Bell, Search, User, Sun, Moon } from 'lucide-react';

const Topbar = ({ currentView, currentUser, theme, setTheme }) => {
  const titles = {
    dashboard: 'Tableau de Bord',
    employees: 'Annuaire des Salariés',
    organization: 'Organigramme',
    evaluations: 'Évaluations & Performances',
    compensation: 'Campagne de Rémunération',
    reporting: 'Centre de Reporting et d\'Exports',
    'sql-console': 'Console Base de Données',
    import: 'Importation de Données',
    settings: 'Paramétrage'
  };

  return (
    <div className="topbar">
      <div>
        <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 500 }}>{titles[currentView] || 'XIRH'}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            style={{ paddingLeft: '35px', width: '250px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)' }}
          />
        </div>
        
        <button style={{ background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', position: 'relative', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 0,
            color: 'white',
            border: 'none',
            background: 'var(--primary)',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
            cursor: 'pointer'
          }}
          title="Basculer le thème"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="flex items-center gap-2" style={{ borderLeft: '1px solid var(--panel-border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {currentUser?.avatar ? <img src={currentUser.avatar} alt="Utilisateur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="white" />}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Utilisateur'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser ? currentUser.position : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
