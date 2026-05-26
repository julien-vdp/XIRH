import React, { useState, useEffect } from 'react';
import { 
  getEmployees, 
  getCompCampaigns, saveCompCampaign, 
  getCompEnrolledEmployees, addEmployeeToCompCampaign, removeEmployeeFromCompCampaign,
  getCompSuggestions, saveCompSuggestion, 
  getCompStatuses, saveCompStatus 
} from '../db/database';
import { Save, TrendingUp, DollarSign, Users, CheckCircle, XCircle, Plus, Search, Trash2, ArrowLeft, X } from 'lucide-react';

const Compensation = ({ currentUser }) => {
  const [isAdminView, setIsAdminView] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEmployeesModal, setShowAddEmployeesModal] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampStart, setNewCampStart] = useState('');
  const [newCampEnd, setNewCampEnd] = useState('');

  const [employees, setEmployees] = useState([]);
  const [enrolledEmployees, setEnrolledEmployees] = useState([]);
  
  const [suggestions, setSuggestions] = useState({});
  const [statuses, setStatuses] = useState({});

  const [searchEmp, setSearchEmp] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  const loadData = () => {
    const isAdm = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR';
    setIsAdminView(isAdm);
    
    setEmployees(getEmployees());
    setCampaigns(getCompCampaigns());
    
    if (selectedCampaign) {
      setEnrolledEmployees(getCompEnrolledEmployees(selectedCampaign.id));
      setSuggestions(getCompSuggestions(selectedCampaign.id));
      setStatuses(getCompStatuses(selectedCampaign.id));
    }
  };

  useEffect(() => {
    loadData();
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'HR' && !selectedCampaign) {
      setActiveTab('my-team');
    }
  }, [currentUser, selectedCampaign?.id]);

  const handleCreateCampaign = () => {
    if (newCampName && newCampStart && newCampEnd) {
      saveCompCampaign({
        name: newCampName,
        startDate: newCampStart,
        endDate: newCampEnd,
        raisePercent: 3,
        bonusBudget: 10000,
        snapshotDate: null,
        baseGlobalSalary: 0,
        managerSalaries: {}
      });
      setShowCreateModal(false);
      setNewCampName('');
      setNewCampStart('');
      setNewCampEnd('');
      loadData();
    }
  };

  const handleSaveSettings = () => {
    if (!selectedCampaign) return;
    const currentGlobalSalary = enrolledEmployees.reduce((sum, e) => sum + e.salary, 0);
    const selectedManagersSalaries = {};
    // Trouver tous les managers ciblés pour figer leur masse
    const uniqueManagerIds = [...new Set(enrolledEmployees.map(e => e.managerId).filter(Boolean))];
    const managers = employees.filter(e => uniqueManagerIds.includes(e.id));
    
    managers.forEach(mgr => {
      const teamEnrolled = enrolledEmployees.filter(e => e.managerId === mgr.id);
      selectedManagersSalaries[mgr.id] = teamEnrolled.reduce((s, e) => s + e.salary, 0);
    });

    const updated = {
      ...selectedCampaign,
      baseGlobalSalary: currentGlobalSalary,
      managerSalaries: selectedManagersSalaries,
      snapshotDate: new Date().toISOString()
    };

    saveCompCampaign(updated);
    setSelectedCampaign(updated);
    alert('Masse salariale des employés inscrits figée !');
    loadData();
  };

  const handleUpdateSetting = (field, value) => {
    if (!selectedCampaign) return;
    const updated = { ...selectedCampaign, [field]: value };
    saveCompCampaign(updated);
    setSelectedCampaign(updated);
  };

  const handleAddSelectedEmployees = () => {
    if (selectedCampaign) {
      selectedEmpIds.forEach(id => {
        addEmployeeToCompCampaign(selectedCampaign.id, id);
      });
      setShowAddEmployeesModal(false);
      setSelectedEmpIds([]);
      loadData();
    }
  };

  const handleRemoveEmployee = (empId) => {
    if (selectedCampaign) {
      removeEmployeeFromCompCampaign(selectedCampaign.id, empId);
      loadData();
    }
  };

  const handleSuggestionChange = (empId, field, value) => {
    const val = Number(value) || 0;
    const currentSug = suggestions[empId] || { raiseAmount: 0, bonusAmount: 0 };
    const newSug = { ...currentSug, [field]: val };
    const newSuggestions = { ...suggestions, [empId]: newSug };
    setSuggestions(newSuggestions);
    saveCompSuggestion(selectedCampaign.id, empId, newSug);
  };

  const handleSubmitManager = (campId) => {
    if (window.confirm('Soumettre définitivement ? Vous ne pourrez plus modifier.')) {
      saveCompStatus(campId, currentUser.id, 'SUBMITTED');
      setStatuses({ ...statuses, [currentUser.id]: 'SUBMITTED' });
    }
  };

  const handleValidateManager = (mgrId) => {
    saveCompStatus(selectedCampaign.id, mgrId, 'VALIDATED');
    setStatuses({ ...statuses, [mgrId]: 'VALIDATED' });
  };
  const handleCancelValidateManager = (mgrId) => {
    saveCompStatus(selectedCampaign.id, mgrId, 'SUBMITTED');
    setStatuses({ ...statuses, [mgrId]: 'SUBMITTED' });
  };

  const addableEmployees = employees.filter(emp => !enrolledEmployees.find(e => e.id === emp.id)).filter(emp => {
    if (searchEmp && !`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchEmp.toLowerCase())) return false;
    if (deptFilter && emp.department !== deptFilter) return false;
    return true;
  });

  const generateAdminDashboard = () => (
    <div className="panel animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ fontSize: '1.2rem' }}>Campagnes de Rémunération</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Nouvelle Campagne
        </button>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {campaigns.map(camp => (
          <div key={camp.id} style={{ border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', cursor: 'pointer', background: 'var(--panel-bg)' }} onClick={() => { setSelectedCampaign(camp); setActiveTab('admin-camp'); }}>
            <div className="flex justify-between items-center">
              <div>
                 <h3 style={{ margin: 0 }}>{camp.name}</h3>
                 <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Période : {camp.startDate} au {camp.endDate}</p>
              </div>
              <div>
                {camp.snapshotDate ? (
                  <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>Mas. Salariale Figée</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>En préparation</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucune campagne configurée.</p>}
      </div>
    </div>
  );

  const generateAdminCampaignDetails = () => {
    // Trouver tous les collaborateurs qui apparaissent comme manager d'au moins un salarié inscrit
    const uniqueManagerIds = [...new Set(enrolledEmployees.map(e => e.managerId).filter(Boolean))];
    const managers = employees.filter(e => uniqueManagerIds.includes(e.id));
    
    const totalSalaryToUse = selectedCampaign.baseGlobalSalary || enrolledEmployees.reduce((sum, e) => sum + e.salary, 0);

    return (
      <div className="flex-col gap-6" style={{ height: '100%', display: 'flex' }}>
        <div>
           <button className="btn btn-outline" style={{ border: 'none', marginBottom: '1rem', padding: 0 }} onClick={() => { setSelectedCampaign(null); setActiveTab('campaigns'); }}>
             <ArrowLeft size={18} /> Retour aux campagnes
           </button>
           <h1>Gestion - {selectedCampaign.name}</h1>
           <p>Budget d'augmentation global et ajout des salariés éligibles.</p>
           {selectedCampaign.snapshotDate && (
             <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.4rem 0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 500 }}>
               Masse salariale figée le : {new Date(selectedCampaign.snapshotDate).toLocaleDateString('fr-FR', { hour: '2-digit', minute:'2-digit' })} ({totalSalaryToUse.toLocaleString('fr-FR')} € pour {enrolledEmployees.length} inscrits)
             </div>
           )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex gap-6 items-end">
             <div style={{ flex: 1 }}>
               <label>Budget Augmentation (%)</label>
               <div className="flex items-center gap-2 mt-2">
                 <TrendingUp size={20} color="var(--primary)" />
                 <input type="number" value={selectedCampaign.raisePercent} onChange={e => handleUpdateSetting('raisePercent', Number(e.target.value))} style={{ fontSize: '1.2rem', padding: '0.8rem', width: '100%', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-dark)', color: 'var(--text-main)' }} />
               </div>
             </div>
             <div style={{ flex: 1 }}>
               <label>Enveloppe de Primes Maximale (€)</label>
               <div className="flex items-center gap-2 mt-2">
                 <DollarSign size={20} color="var(--primary)" />
                 <input type="number" value={selectedCampaign.bonusBudget} onChange={e => handleUpdateSetting('bonusBudget', Number(e.target.value))} style={{ fontSize: '1.2rem', padding: '0.8rem', width: '100%', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-dark)', color: 'var(--text-main)' }} />
               </div>
             </div>
             <div>
               <button className="btn btn-primary" onClick={handleSaveSettings} style={{ padding: '0.8rem 1.5rem' }}>
                 <Save size={20} /> Figer Enveloppes
               </button>
             </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <h3 style={{ margin: 0 }}>Répartition & Inscriptions par manager</h3>
          <button className="btn btn-primary" onClick={() => setShowAddEmployeesModal(true)} disabled={!!selectedCampaign.snapshotDate}>
            <Plus size={18} /> Inscrire Employés
          </button>
        </div>

        <div className="table-container glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
           <table>
             <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 1 }}>
               <tr>
                 <th>Manager</th>
                 <th>Salariés Éligibles</th>
                 <th>Masse Salariale Éligible</th>
                 <th>Env. Augmentation</th>
                 <th>Env. Primes</th>
                 <th>Statut</th>
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               {managers.map(mgr => {
                 const teamEnrolled = enrolledEmployees.filter(e => e.managerId === mgr.id);
                 if (teamEnrolled.length === 0) return null;
                 
                 const teamCurrentSalary = teamEnrolled.reduce((s, e) => s + e.salary, 0);
                 const teamSalary = selectedCampaign.managerSalaries && selectedCampaign.managerSalaries[mgr.id] !== undefined ? selectedCampaign.managerSalaries[mgr.id] : teamCurrentSalary;
                 
                 const raiseEnv = teamSalary * (selectedCampaign.raisePercent / 100);
                 const bonusEnv = totalSalaryToUse > 0 ? (teamSalary / totalSalaryToUse) * selectedCampaign.bonusBudget : 0;
                 
                 const mgrStatus = statuses[mgr.id] || 'DRAFT';
                 return (
                   <tr key={mgr.id}>
                     <td><Users size={16} color="var(--text-muted)" style={{marginRight: '6px', verticalAlign: 'middle'}}/><strong style={{ color: 'var(--text-main)' }}>{mgr.firstName} {mgr.lastName}</strong></td>
                     <td><span className="badge">{teamEnrolled.length} inscrit(s)</span></td>
                     <td style={{ color: 'var(--text-muted)' }}>{teamSalary.toLocaleString('fr-FR')} €</td>
                     <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{raiseEnv.toLocaleString('fr-FR')} €</td>
                     <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{bonusEnv.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</td>
                     <td>
                       {mgrStatus === 'DRAFT' && <span className="badge">En cours</span>}
                       {mgrStatus === 'SUBMITTED' && <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>Soumis</span>}
                       {mgrStatus === 'VALIDATED' && <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>Validé</span>}
                     </td>
                     <td>
                       <div className="flex gap-2">
                         {mgrStatus === 'SUBMITTED' && <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'white' }} onClick={() => handleValidateManager(mgr.id)}>Valider</button>}
                         {mgrStatus === 'VALIDATED' && <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }} onClick={() => handleCancelValidateManager(mgr.id)}>Annuler</button>}
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>
        
        {/* Liste détaillée des inscrits */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
          <h4>Détail des salariés inscrits à la campagne ({enrolledEmployees.length})</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {enrolledEmployees.map(emp => (
              <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-dark)', padding: '0.3rem 0.6rem', borderRadius: '15px', fontSize: '0.85rem' }}>
                <span>{emp.firstName} {emp.lastName}</span>
                {!selectedCampaign.snapshotDate && (
                  <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} onClick={() => handleRemoveEmployee(emp.id)}><XCircle size={14} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const generateManagerView = () => {
    // Si isAdminView = true, ils gèrent leur propre équipe pour la campagne selectionnée `selectedCampaign`
    // Si isAdminView = false, ils ne voient pas l'admin, donc `campaigns` sert pour faire un select "Campagne en cours"
    
    // Le manager a besoin d'avancer sur une campagne
    const targetCamp = isAdminView ? selectedCampaign : (selectedCampaign || campaigns[0]);
    if (!targetCamp) return <div style={{ padding: '2rem' }}>Aucune campagne de rémunération active.</div>;

    // Charger les statuts et enrollments spécifiquement pour targetCamp si on est Manager pur
    const campStatuses = isAdminView ? statuses : getCompStatuses(targetCamp.id);
    const campSuggestions = isAdminView ? suggestions : getCompSuggestions(targetCamp.id);
    const campEnrolledEmployees = isAdminView ? enrolledEmployees : getCompEnrolledEmployees(targetCamp.id);
    
    const myTeamEnrolled = campEnrolledEmployees.filter(e => e.managerId === currentUser.id);
    
    // Calcul de mon budget
    const myTeamCurrentSalary = myTeamEnrolled.reduce((sum, e) => sum + e.salary, 0);
    const myTeamSalary = targetCamp.managerSalaries && targetCamp.managerSalaries[currentUser.id] !== undefined ? targetCamp.managerSalaries[currentUser.id] : myTeamCurrentSalary;
    const totalCompanySalaryToUse = targetCamp.baseGlobalSalary || campEnrolledEmployees.reduce((sum, e) => sum + e.salary, 0);

    const myRaiseEnvelope = myTeamSalary * (targetCamp.raisePercent / 100);
    const myBonusEnvelope = totalCompanySalaryToUse > 0 ? (myTeamSalary / totalCompanySalaryToUse) * targetCamp.bonusBudget : 0;

    const currentRaiseUsed = myTeamEnrolled.reduce((sum, e) => sum + (campSuggestions[e.id]?.raiseAmount || 0), 0);
    const currentBonusUsed = myTeamEnrolled.reduce((sum, e) => sum + (campSuggestions[e.id]?.bonusAmount || 0), 0);
    const raisePctUsed = myRaiseEnvelope > 0 ? (currentRaiseUsed / myRaiseEnvelope) * 100 : 0;
    const bonusPctUsed = myBonusEnvelope > 0 ? (currentBonusUsed / myBonusEnvelope) * 100 : 0;

    const myStatus = campStatuses[currentUser.id] || 'DRAFT';
    const isReadOnly = myStatus === 'SUBMITTED' || myStatus === 'VALIDATED';

    return (
      <div className="flex-col gap-6" style={{ height: '100%', display: 'flex' }}>
        {!isAdminView && (
           <div style={{ marginBottom: '1rem' }}>
              <select className="input-field" value={targetCamp.id} onChange={e => {
                const c = campaigns.find(x => x.id === e.target.value);
                setSelectedCampaign(c);
              }}>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
        )}

        {targetCamp.snapshotDate === null && (
           <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
             Attention : La masse salariale (et les enveloppes) pour la campagne <b>{targetCamp.name}</b> n'est pas encore fixée par l'administration. Vos budgets globaux risquent de bouger.
           </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1>Mon Équipe - {targetCamp.name}</h1>
            <p>Ventilez l'enveloppe sur les {myTeamEnrolled.length} collaborateurs éligibles.</p>
          </div>
          <div>
            {myStatus === 'DRAFT' && <button className="btn btn-primary" onClick={() => handleSubmitManager(targetCamp.id)}><Save size={20}/> Soumission Définitive</button>}
            {myStatus === 'SUBMITTED' && <div className="badge" style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem' }}>En attente de validation</div>}
            {myStatus === 'VALIDATED' && <div className="badge" style={{ background: 'var(--success)', color: 'white', padding: '0.8rem' }}>Validé</div>}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="glass-panel flex-col gap-3" style={{ flex: 1, padding: '1.5rem', justifyContent: 'center' }}>
            <div className="flex justify-between items-center">
              <strong style={{ fontSize: '1.1rem' }}>Env. Augmentation Restante</strong>
              <span style={{ color: currentRaiseUsed > myRaiseEnvelope ? 'var(--danger)' : 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {(myRaiseEnvelope - currentRaiseUsed).toLocaleString('fr-FR')} € <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {myRaiseEnvelope.toLocaleString('fr-FR')} €</span>
              </span>
            </div>
            <div style={{ height: '12px', background: 'var(--panel-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(raisePctUsed, 100)}%`, background: currentRaiseUsed > myRaiseEnvelope ? 'var(--danger)' : 'var(--success)' }} />
            </div>
          </div>
          
          <div className="glass-panel flex-col gap-3" style={{ flex: 1, padding: '1.5rem', justifyContent: 'center' }}>
            <div className="flex justify-between items-center">
              <strong style={{ fontSize: '1.1rem' }}>Env. Primes Restante</strong>
              <span style={{ color: currentBonusUsed > myBonusEnvelope ? 'var(--danger)' : 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {(myBonusEnvelope - currentBonusUsed).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {myBonusEnvelope.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
              </span>
            </div>
            <div style={{ height: '12px', background: 'var(--panel-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(bonusPctUsed, 100)}%`, background: currentBonusUsed > myBonusEnvelope ? 'var(--danger)' : 'var(--primary)' }} />
            </div>
          </div>
        </div>

        <div className="glass-panel table-container" style={{ flex: 1, overflowY: 'auto' }}>
           <table>
             <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 1 }}>
               <tr>
                 <th>Éligible</th>
                 <th>Poste</th>
                 <th>Salaire Actuel</th>
                 <th style={{ width: '220px' }}>Prop. Augmentation (€)</th>
                 <th>Nouveau Salaire</th>
                 <th style={{ width: '220px' }}>Prop. Prime (€)</th>
               </tr>
             </thead>
             <tbody>
               {myTeamEnrolled.map(emp => {
                 const sug = campSuggestions[emp.id] || { raiseAmount: 0, bonusAmount: 0 };
                 const newSalary = emp.salary + sug.raiseAmount;
                 return (
                   <tr key={emp.id}>
                     <td><div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div></td>
                     <td><div style={{ fontSize: '0.9rem' }}>{emp.position}</div></td>
                     <td style={{ fontWeight: 500 }}>{emp.salary.toLocaleString('fr-FR')} €</td>
                     <td>
                       <div className="flex items-center gap-2">
                         <input type="number" disabled={isReadOnly} value={sug.raiseAmount === 0 ? '' : sug.raiseAmount} onChange={(e) => {
                            if (isAdminView) handleSuggestionChange(emp.id, 'raiseAmount', e.target.value);
                            else {
                               const val = Number(e.target.value) || 0;
                               const currentSug = campSuggestions[emp.id] || { raiseAmount: 0, bonusAmount: 0 };
                               const newSug = { ...currentSug, raiseAmount: val };
                               saveCompSuggestion(targetCamp.id, emp.id, newSug);
                               loadData();
                            }
                         }} placeholder="0" style={{ width: '120px', textAlign: 'right', padding: '0.6rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-dark)', color: 'var(--text-main)', opacity: isReadOnly ? 0.6 : 1 }} />
                         <span style={{ color: 'var(--text-muted)' }}>€</span>
                       </div>
                     </td>
                     <td><span style={{ fontWeight: 'bold', color: sug.raiseAmount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>{newSalary.toLocaleString('fr-FR')} €</span></td>
                     <td>
                       <div className="flex items-center gap-2">
                         <input type="number" disabled={isReadOnly} value={sug.bonusAmount === 0 ? '' : sug.bonusAmount} onChange={(e) => {
                            if (isAdminView) handleSuggestionChange(emp.id, 'bonusAmount', e.target.value);
                            else {
                               const val = Number(e.target.value) || 0;
                               const currentSug = campSuggestions[emp.id] || { raiseAmount: 0, bonusAmount: 0 };
                               const newSug = { ...currentSug, bonusAmount: val };
                               saveCompSuggestion(targetCamp.id, emp.id, newSug);
                               loadData();
                            }
                         }} placeholder="0" style={{ width: '120px', textAlign: 'right', padding: '0.6rem', border: '1px solid #f59e0b', borderRadius: 'var(--radius-sm)', background: 'var(--bg-dark)', color: 'var(--text-main)', opacity: isReadOnly ? 0.6 : 1 }} />
                         <span style={{ color: 'var(--text-muted)' }}>€</span>
                       </div>
                     </td>
                   </tr>
                 );
               })}
               {myTeamEnrolled.length === 0 && (
                 <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Aucun collaborateur direct éligible trouvé pour vous dans cette campagne.</td></tr>
               )}
             </tbody>
           </table>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isAdminView && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
          <button 
            onClick={() => { setActiveTab('campaigns'); setSelectedCampaign(null); }}
            style={{ background: 'none', border: 'none', padding: '0.8rem 1rem', fontSize: '1.1rem', fontWeight: activeTab === 'campaigns' || activeTab === 'admin-camp' ? 600 : 400, color: activeTab === 'campaigns' || activeTab === 'admin-camp' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'campaigns' || activeTab === 'admin-camp' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer' }}
          >
            Campagnes (Admin)
          </button>
          {selectedCampaign && (
            <button 
              onClick={() => setActiveTab('my-team')}
              style={{ background: 'none', border: 'none', padding: '0.8rem 1rem', fontSize: '1.1rem', fontWeight: activeTab === 'my-team' ? 600 : 400, color: activeTab === 'my-team' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'my-team' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer' }}
            >
              Ma Ventilation ({selectedCampaign.name})
            </button>
          )}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isAdminView && activeTab === 'campaigns' && generateAdminDashboard()}
        {isAdminView && activeTab === 'admin-camp' && generateAdminCampaignDetails()}
        {(!isAdminView || activeTab === 'my-team') && generateManagerView()}
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-dark)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0 }}>Nouvelle Campagne Rémunération</h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '1rem', paddingBottom: '1rem' }}>
              <div><label>Nom</label><input type="text" className="input-field" value={newCampName} onChange={e => setNewCampName(e.target.value)} /></div>
              <div><label>Date Début</label><input type="date" className="input-field" value={newCampStart} onChange={e => setNewCampStart(e.target.value)} /></div>
              <div><label>Date Fin</label><input type="date" className="input-field" value={newCampEnd} onChange={e => setNewCampEnd(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleCreateCampaign} disabled={!newCampName || !newCampStart || !newCampEnd}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {showAddEmployeesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0 }}>Inscrire des salariés ({selectedCampaign?.name})</h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowAddEmployeesModal(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Chercher un nom..." value={searchEmp} onChange={e => setSearchEmp(e.target.value)} />
              <button className="btn btn-primary" onClick={handleAddSelectedEmployees} disabled={selectedEmpIds.length === 0}>Ajouter {selectedEmpIds.length} sélection(s)</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--panel-border)' }}>
               {addableEmployees.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center' }}>Tous les employés sont inscrits ou aucun résutat.</p> : (
                 <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)'}}>
                       <tr>
                         <th>
                           <input type="checkbox" checked={selectedEmpIds.length > 0 && selectedEmpIds.length === addableEmployees.length} onChange={(e) => {
                               if (e.target.checked) setSelectedEmpIds(addableEmployees.map(emp => emp?.id).filter(Boolean));
                               else setSelectedEmpIds([]);
                             }}
                           />
                         </th>
                         <th>Nom Complet</th>
                         <th>Manager</th>
                       </tr>
                    </thead>
                    <tbody>
                      {addableEmployees.map(emp => {
                         if (!emp || !emp.id) return null;
                         const manager = employees.find(e => e.id === emp.managerId);
                         return (
                           <tr key={emp.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                             <td><input type="checkbox" checked={selectedEmpIds.includes(emp.id)} onChange={() => {
                                 if (selectedEmpIds.includes(emp.id)) setSelectedEmpIds(selectedEmpIds.filter(id => id !== emp.id));
                                 else setSelectedEmpIds([...selectedEmpIds, emp.id]);
                             }} /></td>
                             <td>{emp.firstName || ''} {emp.lastName || ''}</td>
                             <td>{manager ? manager.lastName : 'N/A'}</td>
                           </tr>
                         );
                      })}
                    </tbody>
                 </table>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compensation;
