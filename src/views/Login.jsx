import React, { useState, useEffect } from 'react';
import { getEmployees } from '../db/database';
import { Shield, Users, Briefcase, User } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  
  const [quickLogins, setQuickLogins] = useState({
    admin: null,
    hr: null,
    manager: null,
    employee: null
  });

  useEffect(() => {
    const emps = getEmployees();
    setEmployees(emps);
    
    // Find one of each role for quick login
    setQuickLogins({
      admin: emps.find(e => e.role === 'ADMIN'),
      hr: emps.find(e => e.role === 'HR'),
      manager: emps.find(e => e.role === 'MANAGER'),
      employee: emps.find(e => e.role === 'EMPLOYEE')
    });
  }, []);

  const handleLogin = (id) => {
    const emp = employees.find(e => e.id === id);
    if (emp) onLogin(emp);
  };

  return (
    <div className="login-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem', color: 'white', margin: '0 auto 1rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
          X
        </div>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>XIRH</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>Plateforme RH Pédagogique</p>
      </div>

      <div style={{ background: 'var(--panel-bg)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>Connexion Rapide (En tant que...)</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
          {quickLogins.admin && (
            <button className="btn btn-primary" onClick={() => handleLogin(quickLogins.admin.id)} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', height: 'auto', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <Shield size={28} />
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Direction (Admin)</strong>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{quickLogins.admin.firstName} {quickLogins.admin.lastName}</span>
              </div>
            </button>
          )}
          {quickLogins.hr && (
            <button className="btn" onClick={() => handleLogin(quickLogins.hr.id)} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', height: 'auto', background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)', transition: 'transform 0.2s, background 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)' }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)' }}>
              <Users size={28} />
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Ressources Humaines</strong>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{quickLogins.hr.firstName} {quickLogins.hr.lastName}</span>
              </div>
            </button>
          )}
          {quickLogins.manager && (
            <button className="btn" onClick={() => handleLogin(quickLogins.manager.id)} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', height: 'auto', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', transition: 'transform 0.2s, background 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)' }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)' }}>
              <Briefcase size={28} />
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Manager</strong>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{quickLogins.manager.firstName} {quickLogins.manager.lastName}</span>
              </div>
            </button>
          )}
          {quickLogins.employee && (
            <button className="btn" onClick={() => handleLogin(quickLogins.employee.id)} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', height: 'auto', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s, background 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)' }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)' }}>
              <User size={28} />
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Employé</strong>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{quickLogins.employee.firstName} {quickLogins.employee.lastName}</span>
              </div>
            </button>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Ou choisir un collaborateur spécifique :</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="input-field" 
              value={selectedId} 
              onChange={e => setSelectedId(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Sélectionnez un employé...</option>
              {employees.map(emp => (
                 <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.position} ({emp.role})
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => handleLogin(selectedId)} disabled={!selectedId}>
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
