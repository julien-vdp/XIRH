import React, { useState, useEffect } from 'react';
import { initSQL, runQuery } from '../db/sqlEngine';
import { Database, Play, AlertTriangle, Info } from 'lucide-react';

const SQLConsole = () => {
  const [query, setQuery] = useState("SELECT id, firstName, lastName, department, salary \nFROM employees \nWHERE salary > 40000 \nORDER BY salary DESC \nLIMIT 5;");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initSQL();
  }, []);

  const handleRun = () => {
    if (!query.trim()) return;
    const res = runQuery(query);
    if (res.success) {
      setResult(res.data);
      setError(null);
    } else {
      setError(res.error);
      setResult(null);
    }
  };

  const renderTable = (data) => {
    if (!Array.isArray(data)) {
      return <div style={{ color: 'var(--success)', padding: '1rem' }}>Succès: La requête ne retourne pas de tableau (ex: INSERT/UPDATE validé).</div>;
    }
    if (data.length === 0) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 lignes retournées par la requête.</div>;
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', backdropFilter: 'blur(10px)', zIndex: 1 }}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rIdx) => (
              <tr key={rIdx}>
                {columns.map((col, cIdx) => (
                  <td key={cIdx}>{typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-col gap-6" style={{ height: '100%', display: 'flex' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Database size={24} />
          </div>
          <div>
            <h1>Console Base de Données (SQL)</h1>
            <p>Espace pédagogique étudiant : Interrogez les tables virtuelles en direct avec le langage SQL !</p>
          </div>
        </div>
      </div>

      <div className="flex-col gap-6" style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
        
        {/* Éditeur SQL */}
        <div className="glass-panel flex-col" style={{ flex: '0 0 auto', display: 'flex', padding: '1.5rem', gap: '1rem', minHeight: '250px' }}>
          <h3 className="flex items-center gap-2"><Database size={18} color="var(--primary)" /> Éditeur de Requête</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                padding: '1rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '1rem',
                border: '1px solid var(--panel-border)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                resize: 'none'
              }}
              spellCheck="false"
              placeholder="Ex: SELECT * FROM employees..."
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} className="flex items-center gap-2">
              <Info size={16} /> Tables dispo: employees, campaigns, evaluations, comp_campaigns, comp_enrollments
            </div>
            <button className="btn btn-primary" onClick={handleRun}>
              <Play size={18} /> Exécuter (Run)
            </button>
          </div>
        </div>

        {/* Panneau de Résultats */}
        <div className="glass-panel flex-col" style={{ flex: '0 0 auto', display: 'flex', overflow: 'hidden', padding: '1.5rem', gap: '1rem' }}>
          <h3>Résultat de la requête</h3>
          
          <div style={{ border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'rgba(0,0,0,0.1)' }}>
            {error ? (
              <div style={{ padding: '2rem', color: 'var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <AlertTriangle size={48} />
                <h3 style={{ color: 'var(--danger)', margin: 0 }}>Erreur SQL</h3>
                <code style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', wordBreak: 'break-all', maxWidth: '80%' }}>
                  {error}
                </code>
              </div>
            ) : result ? (
               renderTable(result)
            ) : (
              <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                Appuyez sur "Exécuter" pour visualiser virtuellement les lignes correspondantes.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SQLConsole;
