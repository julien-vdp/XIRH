import React, { useState, useEffect } from 'react';
import { getEmployees } from '../db/database';

const OrgNode = ({ employee, employees }) => {
  const [expanded, setExpanded] = useState(true);
  const directReports = employees.filter(e => e.managerId === employee.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        className="glass-panel"
        style={{ 
          padding: '1rem', 
          width: '200px', 
          textAlign: 'center', 
          cursor: directReports.length > 0 ? 'pointer' : 'default',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          background: !employee.managerId ? 'rgba(99, 102, 241, 0.15)' : 'var(--panel-bg)',
          position: 'relative',
          zIndex: 2
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {employee.avatar && (
           <img src={employee.avatar} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem', border: '2px solid var(--primary)', background: 'var(--bg-dark)' }} />
        )}
        <div style={{ fontWeight: 'bold' }}>{employee.firstName} {employee.lastName}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{employee.position}</div>
        {directReports.length > 0 && (
           <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--primary)' }}>
             {directReports.length} membre{directReports.length > 1 ? 's' : ''} {expanded ? '▲' : '▼'}
           </div>
        )}
      </div>

      {expanded && directReports.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', position: 'relative' }}>
          {/* Ligne verticale depuis le parent */}
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '1.5rem', background: 'rgba(255,255,255,0.1)', transform: 'translateX(-50%)' }}></div>
          
          {directReports.map((report, idx) => (
            <div key={report.id} style={{ position: 'relative', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Ligne horizontale */}
              {directReports.length > 1 && (
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: idx === 0 ? '50%' : idx === directReports.length - 1 ? 'auto' : '0', 
                  right: idx === directReports.length - 1 ? '50%' : 'auto',
                  width: idx === 0 || idx === directReports.length - 1 ? '50%' : '100%', 
                  height: '2px', 
                  background: 'rgba(255,255,255,0.1)' 
                }}></div>
              )}
              {/* Ligne verticale vers l'enfant */}
              <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '1.5rem', background: 'rgba(255,255,255,0.1)', transform: 'translateX(-50%)' }}></div>
              
              <OrgNode employee={report} employees={employees} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Organization = () => {
  const [employees, setEmployees] = useState([]);
  
  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const rootEmployees = employees.filter(e => !e.managerId);

  return (
    <div className="flex-col gap-6" style={{ height: '100%', display: 'flex' }}>
      <div>
        <h1>Organigramme</h1>
        <p>Visualisation de la structure hiérarchique de l'entreprise.</p>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {rootEmployees.map(root => (
          <OrgNode key={root.id} employee={root} employees={employees} />
        ))}
        {rootEmployees.length === 0 && (
          <div style={{ color: 'var(--text-muted)' }}>Aucun point d'entrée hiérarchique détecté. Attribuez un salarié sans manager pour créer le point de départ de l'arbre.</div>
        )}
      </div>
    </div>
  );
};

export default Organization;
