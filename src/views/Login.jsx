import React, { useEffect, useState } from 'react';
import { Briefcase, Shield, User, Users } from 'lucide-react';
import { getEmployees } from '../db/database';

const Login = ({ onLogin }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [quickLogins, setQuickLogins] = useState({
    admin: null,
    hr: null,
    manager: null,
    employee: null,
  });

  useEffect(() => {
    const emps = getEmployees();
    setEmployees(emps);
    setQuickLogins({
      admin: emps.find(e => e.role === 'ADMIN'),
      hr: emps.find(e => e.role === 'HR'),
      manager: emps.find(e => e.role === 'MANAGER'),
      employee: emps.find(e => e.role === 'EMPLOYEE'),
    });
  }, []);

  const handleLogin = (id) => {
    const emp = employees.find(e => e.id === id);
    if (emp) onLogin(emp);
  };

  const cards = [
    { key: 'admin', title: 'Direction', subtitle: 'Admin', icon: Shield, className: 'login-role-admin' },
    { key: 'hr', title: 'Ressources Humaines', subtitle: 'RH', icon: Users, className: 'login-role-hr' },
    { key: 'manager', title: 'Manager', subtitle: 'Equipe', icon: Briefcase, className: 'login-role-manager' },
    { key: 'employee', title: 'Collaborateur', subtitle: 'Employe', icon: User, className: 'login-role-employee' },
  ];

  return (
    <div className="login-container animate-fade-in">
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1"></div>
        <div className="mesh-orb mesh-orb-2"></div>
        <div className="mesh-orb mesh-orb-3"></div>
      </div>

      <header className="login-header">
        <div className="login-mark">X</div>
        <h1>XIRH</h1>
        <p>Plateforme RH pedagogique</p>
        <span className="demo-pill">Mode demo local</span>
      </header>

      <main className="login-panel glass-panel">
        <div className="login-panel-title">
          <h2>Connexion rapide</h2>
          <p>Choisissez un role pour explorer les parcours de cours.</p>
        </div>

        <div className="login-grid">
          {cards.map(card => {
            const employee = quickLogins[card.key];
            if (!employee) return null;
            const Icon = card.icon;

            return (
              <button
                className={`login-role-card ${card.className}`}
                key={card.key}
                onClick={() => handleLogin(employee.id)}
              >
                <Icon size={26} />
                <span>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle} - {employee.firstName} {employee.lastName}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="login-picker">
          <label htmlFor="employee-login">Ou choisir un collaborateur specifique</label>
          <div className="login-picker-row">
            <select
              id="employee-login"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              <option value="">Selectionnez un employe...</option>
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
      </main>
    </div>
  );
};

export default Login;
