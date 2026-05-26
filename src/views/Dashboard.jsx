import React, { useEffect, useState, useMemo } from 'react';
import { getEmployees, getEvaluations, getCampaigns } from '../db/database';
import { Users, UserPlus, TrendingUp, AlertCircle, Info, Database } from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = ({ setCurrentView }) => {
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0, depts: 0, activeRate: 0, totalSalary: 0 });
  const [demoData, setDemoData] = useState([]);
  const [evalData, setEvalData] = useState([]);
  const [activeCampName, setActiveCampName] = useState('');

  useEffect(() => {
    const employees = getEmployees();
    const activeData = employees.filter(e => e.status === 'Actif');
    
    const departments = new Set(employees.map(e => e.department));
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const newHires = employees.filter(e => e.hireDate && e.hireDate.startsWith(currentMonthStr)).length;
    const salaryMass = activeData.reduce((acc, curr) => acc + curr.salary, 0);

    setStats({
      total: employees.length,
      active: activeData.length,
      newThisMonth: newHires,
      depts: departments.size,
      activeRate: Math.round((activeData.length / employees.length) * 100) || 0,
      totalSalary: salaryMass
    });

    // --- Build Demographic Data (Yearly accumulation) ---
    // Extract timeline from 2015 to 2026 roughly
    let yearMap = {};
    for (let y = 2018; y <= 2026; y++) {
      yearMap[y] = { name: y.toString(), effectifs: 0, masseSalariale: 0 };
    }

    employees.forEach(emp => {
      const year = emp.hireDate ? parseInt(emp.hireDate.split('-')[0]) : 2020;
      if (year >= 2018 && year <= 2026) {
        // Simple mock timeline projection
        for(let y = year; y <= 2026; y++) {
           if (yearMap[y]) {
             yearMap[y].effectifs += 1;
             yearMap[y].masseSalariale += emp.salary;
           }
        }
      }
    });
    setDemoData(Object.values(yearMap));

    // --- Build Evaluations Data ---
    const evals = getEvaluations();
    const camps = getCampaigns();
    if (evals.length > 0 && camps.length > 0) {
       // Find the most recent or active campaign
       const activeCamp = camps[0]; 
       setActiveCampName(activeCamp.name);
       
       const campEvals = evals.filter(e => e.campaignId === activeCamp.id);
       let statuses = { 'Terminé': 0, 'En cours': 0, 'Planifié': 0 };
       campEvals.forEach(ev => {
         statuses[ev.status] = (statuses[ev.status] || 0) + 1;
       });

       const pie = [
         { name: 'Terminé', value: statuses['Terminé'] || 0, color: '#10b981' }, // Success
         { name: 'En cours', value: statuses['En cours'] || 0, color: '#f59e0b' }, // Warning
         { name: 'Planifié', value: statuses['Planifié'] || 0, color: '#6366f1' }  // Primary
       ];
       setEvalData(pie.filter(item => item.value > 0)); // keep only non-zero
    }

  }, []);

  const formatCurrency = (value) => `${(value / 1000).toFixed(0)}k €`;

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: '2rem' }}>
      
      {/* HEADER PEDAGOGIQUE */}
      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.05))', borderLeft: '4px solid var(--primary)' }}>
         <h2 className="flex items-center gap-2" style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.3rem' }}><Database size={22} /> Single Source of Truth (Donnée Unique)</h2>
         <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>Cette plateforme est un démonstrateur de Système d'Information de Ressources Humaines (SIRH) conçu dans un cadre <b>pédagogique</b>. L'entièreté des données manipulées dans les modules de performance et de rémunération proviennent d'une base consolidée unique en mémoire (In-Memory). Chaque action simulée par un étudiant met directement à jour les statistiques de pilotage ci-dessous en temps réel, évitant ainsi le silotage des informations.</p>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div>
          <h1>Tableau de Pilotage</h1>
          <p>Supervisez en un coup d'œil l'ensemble de votre dispositif RH.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCurrentView('employees')}>
          <UserPlus size={18} /> Gérer les salariés
        </button>
      </div>

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.active}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Collaborateurs actifs</p>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={14} /> +{stats.newThisMonth} ce mois-ci
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--success)' }}>
               <TrendingUp size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>{(stats.totalSalary / 1000000).toFixed(2)} M€</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Masse Salariale Base</p>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total cumulé en temps réel
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--secondary)' }}>
               <AlertCircle size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.depts}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Départements actifs</p>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Fonctionnement transverse
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="flex gap-6" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
         
         {/* CHART 1: DEMOGRAPHICS EVOLUTION */}
         <div className="glass-panel flex-col" style={{ flex: 2, padding: '1.5rem', minWidth: '400px' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Croissance Démographique & Masse Salariale</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Evolution simulée basée sur les historiques de recrutements injectés dans le système.</p>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={demoData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 120, 120, 0.2)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tickFormatter={formatCurrency} tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="effectifs" name="Nombre de Salariés" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Line yAxisId="right" type="monotone" dataKey="masseSalariale" name="Masse Salariale (€)" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--secondary)' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* CHART 2: CAMPAIGN STATUS */}
         <div className="glass-panel flex-col" style={{ flex: 1, padding: '1.5rem', minWidth: '300px' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Aperçu Campagne Active</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>État d'avancement des objectifs. <br/><b>{activeCampName || 'Aucune campagne'}</b></p>
            
            {evalData.length > 0 ? (
              <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={evalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {evalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}
                       itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text of the donut */}
                <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                   <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{evalData.reduce((sum, item) => sum + item.value, 0)}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Missions</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ flex: 1, color: 'var(--text-muted)', border: '1px dashed var(--panel-border)', borderRadius: 'var(--radius-sm)' }}>
                Aucune donnée dynamique captée.
              </div>
            )}
         </div>

      </div>

    </div>
  );
};

export default Dashboard;
