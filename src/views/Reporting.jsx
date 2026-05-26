import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { 
  getEmployees, getCampaigns, getEvaluations, getForms, 
  getCompCampaigns, getCompEnrolledEmployees, getCompSuggestions 
} from '../db/database';
import { Download, Filter, FileText, CheckSquare, Settings2, BarChart2, Database } from 'lucide-react';

const BaseColumns = [
  { id: 'emp_id', label: 'Matricule' },
  { id: 'firstName', label: 'Prénom' },
  { id: 'lastName', label: 'Nom' },
  { id: 'department', label: 'Département' },
  { id: 'position', label: 'Poste' },
  { id: 'salary', label: 'Salaire Base' },
  { id: 'manager', label: 'Manager Direct' }
];

const Reporting = () => {
  const [domain, setDomain] = useState('evaluations'); // 'evaluations' | 'compensation'
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState('');
  
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [forms, setForms] = useState([]);
  
  const [availableCols, setAvailableCols] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);

  const [filterDept, setFilterDept] = useState('');
  const [filterManagerId, setFilterManagerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial load
  useEffect(() => {
    setEmployees(getEmployees());
    setForms(getForms());
    setEvaluations(getEvaluations());
  }, []);

  // Update campaigns on domain change
  useEffect(() => {
    if (domain === 'evaluations') {
      const camps = getCampaigns();
      setCampaigns(camps);
      if (camps.length) setSelectedCampId(camps[0].id);
      else setSelectedCampId('');
    } else {
      const camps = getCompCampaigns();
      setCampaigns(camps);
      if (camps.length) setSelectedCampId(camps[0].id);
      else setSelectedCampId('');
    }
  }, [domain]);

  // Re-build columns schema whenever domain or active campaign changes
  useEffect(() => {
    if (!selectedCampId) {
      setAvailableCols([]);
      setSelectedCols([]);
      return;
    }

    let cols = [...BaseColumns];

    if (domain === 'evaluations') {
      cols.push({ id: 'eval_status', label: 'Statut Entretien' });
      
      // Trouver tous les formulaires utilisés par les évaluations de cette campagne
      const evalsForCamp = evaluations.filter(e => e.campaignId === selectedCampId);
      const usedFormIds = [...new Set(evalsForCamp.map(e => e.formTemplateId).filter(Boolean))];
      const usedForms = forms.filter(f => usedFormIds.includes(f.id));
      
      usedForms.forEach(form => {
        if (form.fields) {
           form.fields.forEach(f => {
              // Ignore static text blocks
              if (f.type !== 'section_title' && f.type !== 'rich_text') {
                 // Eviter les doublons de colonnes temporelles
                 if (!cols.find(c => c.id === `q_${f.id}`)) {
                    cols.push({ id: `q_${f.id}`, label: f.label });
                 }
              }
           });
        }
      });
    } else {
      cols.push({ id: 'raiseAmount', label: 'Prop. Augmentation (€)' });
      cols.push({ id: 'bonusAmount', label: 'Prop. Prime (€)' });
      cols.push({ id: 'newSalary', label: 'Salaire Fina. Projeté (€)' });
    }

    setAvailableCols(cols);
    // By default, select everything
    setSelectedCols(cols.map(c => c.id));
  }, [domain, selectedCampId, campaigns, forms]);

  // Generate Table Data
  const tableData = useMemo(() => {
    if (!selectedCampId) return [];
    
    // Step 1: Base population
    let population = [];
    if (domain === 'evaluations') {
       // Only employees in this evaluation campaign
       const evalsForCamp = evaluations.filter(e => e.campaignId === selectedCampId);
       evalsForCamp.forEach(ev => {
         const emp = employees.find(e => e.id === ev.employeeId);
         if (emp) {
            let row = { 
              emp_id: emp.id, firstName: emp.firstName, lastName: emp.lastName, 
              department: emp.department, position: emp.position, salary: emp.salary, 
              managerId: emp.managerId, eval_status: ev.status 
            };
            if (ev.answers) {
              Object.entries(ev.answers).forEach(([qId, ans]) => {
                 let displayVal = ans;
                 if (typeof ans === 'object' && ans !== null) {
                    displayVal = JSON.stringify(ans);
                 }
                 row[`q_${qId}`] = displayVal;
              });
            }
            population.push(row);
         }
       });
    } else {
       // Compensation campaign
       const enrolled = getCompEnrolledEmployees(selectedCampId);
       const suggestions = getCompSuggestions(selectedCampId);
       
       enrolled.forEach(emp => {
         const sug = suggestions[emp.id] || { raiseAmount: 0, bonusAmount: 0 };
         population.push({
           emp_id: emp.id, firstName: emp.firstName, lastName: emp.lastName,
           department: emp.department, position: emp.position, salary: emp.salary,
           managerId: emp.managerId,
           raiseAmount: sug.raiseAmount,
           bonusAmount: sug.bonusAmount,
           newSalary: emp.salary + sug.raiseAmount
         });
       });
    }

    // Step 2: Apply Filters
    let filtered = population;
    if (filterDept) {
      filtered = filtered.filter(r => r.department === filterDept);
    }
    if (filterManagerId) {
      filtered = filtered.filter(r => r.managerId === filterManagerId);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.firstName || '').toLowerCase().includes(term) || 
        (r.lastName || '').toLowerCase().includes(term) ||
        (r.emp_id || '').toLowerCase().includes(term)
      );
    }

    // Step 3: Map Manager ID to Name
    filtered = filtered.map(row => {
       const mgr = employees.find(e => e.id === row.managerId);
       return {
         ...row,
         manager: mgr ? `${mgr.firstName} ${mgr.lastName}` : 'Aucun'
       };
    });

    // Step 4: Drop unselected & unneeded columns to make a clean object
    return filtered.map(row => {
       let cleanRow = {};
       availableCols.forEach(col => {
          if (selectedCols.includes(col.id)) {
             cleanRow[col.label] = row[col.id] !== undefined ? row[col.id] : '';
          }
       });
       return cleanRow;
    });

  }, [selectedCampId, domain, employees, evaluations, availableCols, selectedCols, filterDept, filterManagerId, searchTerm]);

  // Distinct Lists for Filters
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  const allManagers = employees.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN');

  const handleExportCSV = () => {
    if (tableData.length === 0) return alert('Aucune donnée à exporter.');
    const csv = Papa.unparse(tableData);
    const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' }); // includes BOM for UTF-8 Excel support
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // File name logic
    const campName = campaigns.find(c => c.id === selectedCampId)?.name || 'Campaign';
    const cleanName = campName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    link.setAttribute('download', `Extraction_${domain}_${cleanName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (colId) => {
    if (selectedCols.includes(colId)) {
      setSelectedCols(selectedCols.filter(c => c !== colId));
    } else {
      setSelectedCols([...selectedCols, colId]);
    }
  };

  return (
    <div className="flex-col gap-6" style={{ height: '100%', display: 'flex' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <h1>Reporting & Exports</h1>
            <p>Concevez des rapports sur mesure à partir de campagnes et exportez-les au format Excel (CSV).</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV} disabled={tableData.length === 0}>
          <Download size={18} /> Télécharger CSV
        </button>
      </div>

      <div className="flex gap-6" style={{ flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Build Settings */}
        <div className="glass-panel flex-col" style={{ width: '320px', padding: '1.5rem', gap: '1.5rem', overflowY: 'auto' }}>
           
           <div>
             <h3 className="flex items-center gap-2" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem' }}><Settings2 size={18} /> Domaine de Données</h3>
             <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type d'extraction</label>
             <select className="input-field" value={domain} onChange={e => setDomain(e.target.value)} style={{ marginBottom: '1rem' }}>
               <option value="evaluations">Évaluations & Performances</option>
               <option value="compensation">Campagnes de Rémunération</option>
             </select>

             <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Campagne source</label>
             <select className="input-field" value={selectedCampId} onChange={e => setSelectedCampId(e.target.value)}>
               {campaigns.length === 0 && <option value="">-- Aucune campagne --</option>}
               {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>

           <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
             <h3 className="flex items-center gap-2" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem' }}><Filter size={18} /> Filtrage Population</h3>
             <div className="flex-col gap-3">
               <div>
                  <input type="text" className="input-field" placeholder="Rechercher nom, matr..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
               </div>
               <div>
                  <select className="input-field" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="">Tous les départements</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
               <div>
                  <select className="input-field" value={filterManagerId} onChange={e => setFilterManagerId(e.target.value)}>
                    <option value="">Tous les managers</option>
                    {allManagers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                  </select>
               </div>
             </div>
           </div>

           <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem', flex: 1, overflowY: 'auto' }}>
             <h3 className="flex items-center gap-2" style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem' }}><CheckSquare size={18} /> Colonnes à Exporter</h3>
             {availableCols.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sélectionnez une campagne valide.</p>
             ) : (
               <div className="flex-col gap-2">
                 <button className="btn btn-sm btn-outline" style={{ padding: '0.4rem', fontSize: '0.8rem', marginBottom: '0.5rem' }} onClick={() => setSelectedCols(availableCols.length === selectedCols.length ? [] : availableCols.map(c => c.id))}>
                   Tout cocher / décocher
                 </button>
                 {availableCols.map(col => (
                   <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                     <input type="checkbox" checked={selectedCols.includes(col.id)} onChange={() => toggleColumn(col.id)} />
                     <span style={{ color: selectedCols.includes(col.id) ? 'var(--text-main)' : 'var(--text-muted)' }}>{col.label}</span>
                   </label>
                 ))}
               </div>
             )}
           </div>

        </div>

        {/* Right Panel: Data Preview */}
        <div className="glass-panel flex-col" style={{ flex: 1, padding: '1.5rem', overflow: 'hidden' }}>
           <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Aperçu des Données <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({tableData.length} ligne(s) retenue(s))</span></h2>
           <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Ce tableau s'adapte en direct à vos sélections de colonnes ci-contre. Ce que vous voyez est exactement ce qui sera exporté en Excel.</p>
           
           <div className="table-container" style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)' }}>
             {tableData.length === 0 ? (
               <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                 Aucune donnée ne correspond à cette configuration.
               </div>
             ) : (
               <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                 <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 1, backdropFilter: 'blur(10px)' }}>
                   <tr>
                     {Object.keys(tableData[0]).map((headerKey, idx) => (
                       <th key={idx}>{headerKey}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {tableData.map((row, rIdx) => (
                     <tr key={rIdx}>
                       {Object.keys(row).map((key, cIdx) => (
                         <td key={cIdx}>{row[key]}</td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Reporting;
