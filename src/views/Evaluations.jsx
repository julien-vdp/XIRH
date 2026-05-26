import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Star, X, Search, Trash2, ArrowLeft, UserPlus } from 'lucide-react';
import { 
  getCampaigns, 
  saveCampaign, 
  getEvaluationsForEmployee, 
  getEvaluationsForManager, 
  getEvaluations, 
  addEmployeeToCampaign, 
  removeEmployeeFromCampaign,
  getEmployees,
  getForms,
  updateEvaluationFormTemplate,
  delegateEvaluation
} from '../db/database';
import FormBuilder from '../components/evaluations/FormBuilder';
import FormRenderer from '../components/evaluations/FormRenderer';

const Evaluations = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('my-evals');
  
  const [myEvals, setMyEvals] = useState([]);
  const [teamEvals, setTeamEvals] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [allEvals, setAllEvals] = useState([]);
  const [forms, setForms] = useState([]);
  const [activeEvaluation, setActiveEvaluation] = useState(null);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEmployeesModal, setShowAddEmployeesModal] = useState(false);

  const [newCampName, setNewCampName] = useState('');
  const [newCampStart, setNewCampStart] = useState('');
  const [newCampEnd, setNewCampEnd] = useState('');
  const [newCampFormId, setNewCampFormId] = useState('');

  const [searchEmp, setSearchEmp] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  
  const [selectedEnrolledEvalIds, setSelectedEnrolledEvalIds] = useState([]);
  const [bulkTemplateId, setBulkTemplateId] = useState('');

  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateEvalId, setDelegateEvalId] = useState(null);
  const [newEvaluatorId, setNewEvaluatorId] = useState('');

  const isAdminOrHR = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR';
  const isManager = currentUser?.role === 'MANAGER';

  const loadData = () => {
    setMyEvals(getEvaluationsForEmployee(currentUser.id));
    if (isManager || isAdminOrHR) {
      setTeamEvals(getEvaluationsForManager(currentUser.id));
    }
    if (isAdminOrHR) {
      setCampaigns(getCampaigns());
      setAllEmployees(getEmployees());
      setAllEvals(getEvaluations());
      setForms(getForms());
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCreateCampaign = () => {
    if (newCampName && newCampStart && newCampEnd && newCampFormId) {
      saveCampaign({
        name: newCampName,
        startDate: newCampStart,
        endDate: newCampEnd,
        formTemplateId: newCampFormId
      });
      setShowCreateModal(false);
      setNewCampName('');
      setNewCampStart('');
      setNewCampEnd('');
      setNewCampFormId('');
      loadData();
    }
  };

  const handleAddSelectedEmployees = () => {
    if (selectedCampaign) {
      selectedEmpIds.forEach(id => {
        addEmployeeToCampaign(selectedCampaign.id, id);
      });
      setShowAddEmployeesModal(false);
      setSelectedEmpIds([]);
      loadData();
    }
  };

  const handleRemoveEmployee = (empId) => {
    if (selectedCampaign) {
      removeEmployeeFromCampaign(selectedCampaign.id, empId);
      loadData();
    }
  };

  const handleChangeTemplate = (evalId, newTemplateId) => {
    updateEvaluationFormTemplate(evalId, newTemplateId);
    loadData();
  };

  const toggleEnrolledSelection = (evalId) => {
    if (selectedEnrolledEvalIds.includes(evalId)) {
      setSelectedEnrolledEvalIds(selectedEnrolledEvalIds.filter(id => id !== evalId));
    } else {
      setSelectedEnrolledEvalIds([...selectedEnrolledEvalIds, evalId]);
    }
  };

  const handleBulkAssignTemplate = () => {
    if (bulkTemplateId && selectedEnrolledEvalIds.length > 0) {
      selectedEnrolledEvalIds.forEach(evalId => {
        updateEvaluationFormTemplate(evalId, bulkTemplateId);
      });
      loadData();
      setSelectedEnrolledEvalIds([]);
      setBulkTemplateId('');
    }
  };

  const handleDelegateSubmit = () => {
    if (delegateEvalId && newEvaluatorId) {
      delegateEvaluation(delegateEvalId, newEvaluatorId);
      loadData();
      setShowDelegateModal(false);
      setDelegateEvalId(null);
      setNewEvaluatorId('');
    }
  };

  const handleCancelDelegation = (evalId) => {
    delegateEvaluation(evalId, null);
    loadData();
  };

  const campaignEvals = selectedCampaign ? allEvals.filter(e => e.campaignId === selectedCampaign.id) : [];
  const enrolledIds = campaignEvals.map(e => e.employeeId);
  const enrolledEmployees = allEmployees.filter(emp => enrolledIds.includes(emp.id)).map(emp => {
    const ev = campaignEvals.find(e => e.employeeId === emp.id);
    return { ...emp, evaluationStatus: ev.status, evaluationId: ev.id, formTemplateId: ev.formTemplateId };
  });

  const addableEmployees = allEmployees.filter(emp => !enrolledIds.includes(emp.id)).filter(emp => {
     if (searchEmp && !`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchEmp.toLowerCase())) return false;
     if (deptFilter && emp.department !== deptFilter) return false;
     if (roleFilter && emp.role !== roleFilter) return false;
     if (statusFilter && emp.status !== statusFilter) return false;
     return true;
  });

  const toggleEmpSelection = (id) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds(selectedEmpIds.filter(i => i !== id));
    } else {
      setSelectedEmpIds([...selectedEmpIds, id]);
    }
  };

  const departments = [...new Set(allEmployees.map(e => e.department))].filter(Boolean);
  const roles = [...new Set(allEmployees.map(e => e.role))].filter(Boolean);
  const statuses = [...new Set(allEmployees.map(e => e.status))].filter(Boolean);

  return (
    <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
         <div>
           <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Évaluations & Performances</h1>
           <p style={{ color: 'var(--text-muted)' }}>Gérez les campagnes et les entretiens individuels</p>
         </div>
         {isAdminOrHR && activeTab === 'campaigns' && !selectedCampaign && !activeEvaluation && (
           <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
             <Plus size={18} /> Nouvelle Campagne
           </button>
         )}
      </div>

      {!selectedCampaign && !activeEvaluation && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'my-evals' ? 'btn-primary' : ''}`} 
            onClick={() => setActiveTab('my-evals')}
            style={activeTab !== 'my-evals' ? { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--panel-border)' } : {}}
          >
            <Star size={18} /> Mes évaluations
          </button>
          {(isManager || isAdminOrHR) && (
            <button 
              className={`btn ${activeTab === 'team-evals' ? 'btn-primary' : ''}`} 
              onClick={() => setActiveTab('team-evals')}
              style={activeTab !== 'team-evals' ? { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--panel-border)' } : {}}
            >
              <UsersIcon size={18} /> Mon Équipe
            </button>
          )}
          {isAdminOrHR && (
            <>
              <button 
                className={`btn ${activeTab === 'campaigns' ? 'btn-primary' : ''}`} 
                onClick={() => setActiveTab('campaigns')}
                style={activeTab !== 'campaigns' ? { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--panel-border)' } : {}}
              >
                <ClipboardList size={18} /> Campagnes (Admin)
              </button>
              <button 
                className={`btn ${activeTab === 'templates' ? 'btn-primary' : ''}`} 
                onClick={() => setActiveTab('templates')}
                style={activeTab !== 'templates' ? { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--panel-border)' } : {}}
              >
                <ClipboardList size={18} /> Modèles (Admin)
              </button>
            </>
          )}
        </div>
      )}

      <div>
        {activeEvaluation ? (
          <FormRenderer 
            evaluation={activeEvaluation} 
            onBack={() => { setActiveEvaluation(null); loadData(); }} 
            currentUser={currentUser}
            isReadOnly={activeTab === 'my-evals' || (activeEvaluation.employeeId === currentUser.id && activeEvaluation.status === 'Terminé')}
          />
        ) : (
          <>
            {/* --- FORM TEMPLATES --- */}
            {activeTab === 'templates' && !selectedCampaign && isAdminOrHR && (
              <FormBuilder />
            )}

            {/* --- MY EVALS --- */}
            {activeTab === 'my-evals' && !selectedCampaign && (
              <div className="panel animate-fade-in">
                 <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Mon historique d'évaluations</h2>
                 {myEvals.length === 0 ? <p>Aucune évaluation trouvée.</p> : (
                   <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                     <thead>
                       <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                         <th style={{ padding: '1rem 0.5rem' }}>Date limite</th>
                         <th style={{ padding: '1rem 0.5rem' }}>Type</th>
                         <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                         <th style={{ padding: '1rem 0.5rem' }}>Résultat</th>
                         <th></th>
                       </tr>
                     </thead>
                     <tbody>
                       {myEvals.map(ev => (
                         <tr key={ev.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                           <td style={{ padding: '1rem 0.5rem' }}>{ev.date}</td>
                           <td style={{ padding: '1rem 0.5rem' }}>{ev.type}</td>
                           <td style={{ padding: '1rem 0.5rem' }}>
                             <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', background: ev.status === 'Terminé' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: ev.status === 'Terminé' ? '#10b981' : '#f59e0b' }}>
                               {ev.status}
                             </span>
                           </td>
                           <td style={{ padding: '1rem 0.5rem' }}>{ev.score || '-'}</td>
                           <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                             {ev.status === 'En attente salarié' || ev.status === 'Terminé' ? (
                               <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveEvaluation(ev)}>Consulter</button>
                             ) : (
                               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>En préparation</span>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 )}
              </div>
            )}

            {/* --- TEAM EVALS --- */}
            {activeTab === 'team-evals' && !selectedCampaign && (isManager || isAdminOrHR) && (
              <div className="panel animate-fade-in">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Évaluations à réaliser - Mon équipe</h2>
                 {teamEvals.length === 0 ? <p>Aucune évaluation à réaliser pour votre équipe.</p> : (
                   <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                     <thead>
                       <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                         <th style={{ padding: '1rem 0.5rem' }}>Employé</th>
                         <th style={{ padding: '1rem 0.5rem' }}>Date Limite</th>
                         <th style={{ padding: '1rem 0.5rem' }}>Type</th>
                         <th style={{ padding: '1rem 0.5rem' }}>Statut</th>
                         <th></th>
                       </tr>
                     </thead>
                     <tbody>
                       {teamEvals.map(ev => (
                         <tr key={ev.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                           <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{ev.employee?.firstName} {ev.employee?.lastName}</td>
                           <td style={{ padding: '1rem 0.5rem' }}>{ev.date}</td>
                           <td style={{ padding: '1rem 0.5rem' }}>{ev.type}</td>
                           <td style={{ padding: '1rem 0.5rem' }}>{ev.status}</td>
                           <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                             {ev.evaluatorId && ev.evaluatorId !== currentUser.id ? (
                               <>
                                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginRight: '0.5rem' }}>
                                   Délégué à {ev.evaluator?.firstName} {ev.evaluator?.lastName}
                                 </span>
                                 <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleCancelDelegation(ev.id)}>Annuler</button>
                               </>
                             ) : (
                               <>
                                 {ev.evaluatorId === currentUser.id && (
                                   <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontStyle: 'italic', marginRight: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                     Délégation
                                   </span>
                                 )}
                                 <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setDelegateEvalId(ev.id); setShowDelegateModal(true); }} disabled={ev.status === 'Terminé' || ev.status === 'En attente salarié'}>
                                   Déléguer
                                 </button>
                                 <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveEvaluation(ev)}>Démarrer</button>
                               </>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 )}
              </div>
            )}

            {/* --- CAMPAIGNS OVERVIEW --- */}
            {activeTab === 'campaigns' && !selectedCampaign && isAdminOrHR && (
              <div className="panel animate-fade-in">
                 <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Vue d'ensemble des campagnes</h2>
                 <div style={{ display: 'grid', gap: '1rem' }}>
                    {campaigns.map(camp => {
                      const evs = allEvals.filter(e => e.campaignId === camp.id);
                      const nbEmps = evs.length;
                      return (
                        <div key={camp.id} style={{ border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--panel-bg)' }} onClick={() => setSelectedCampaign(camp)} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}>
                          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ margin: 0 }}>{camp.name}</h3>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{nbEmps} salarié(s) inscrit(s)</p>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '0.4rem 0.8rem', borderRadius: '15px' }}>{camp.startDate} au {camp.endDate}</span>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                              <span>Progression globale</span>
                              <span>{camp.progress}%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--bg-dark)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${camp.progress}%`, background: 'var(--primary)', height: '100%' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}

            {/* --- CAMPAIGN DETAILS --- */}
            {selectedCampaign && (
              <div className="animate-fade-in">
                <button className="btn btn-outline" style={{ marginBottom: '1rem', border: 'none' }} onClick={() => setSelectedCampaign(null)}>
                  <ArrowLeft size={18} /> Retour aux campagnes
                </button>
                <div className="panel" style={{ marginBottom: '1.5rem' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{selectedCampaign.name}</h2>
                    <button className="btn btn-primary" onClick={() => setShowAddEmployeesModal(true)}>
                      <Plus size={18} /> Ajouter des salariés
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Période : {selectedCampaign.startDate} / {selectedCampaign.endDate}</p>
                </div>

                <div className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Salariés inscrits ({enrolledEmployees.length})</h3>
                    {selectedEnrolledEvalIds.length > 0 && (
                      <div className="flex gap-2 animate-fade-in" style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedEnrolledEvalIds.length} sélectionné(s)</span>
                        <select className="input-field" value={bulkTemplateId} onChange={e => setBulkTemplateId(e.target.value)} style={{ padding: '0.3rem', fontSize: '0.85rem' }}>
                          <option value="">-- Modèle pour la sélection --</option>
                          {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={handleBulkAssignTemplate} disabled={!bulkTemplateId}>
                          Appliquer
                        </button>
                      </div>
                    )}
                  </div>
                  {enrolledEmployees.length === 0 ? <p>Aucun salarié inscrit pour le moment.</p> : (
                    <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                       <thead>
                         <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                           <th style={{ padding: '1rem 0.5rem', width: '40px' }}>
                             <input 
                               type="checkbox" 
                               checked={enrolledEmployees.length > 0 && enrolledEmployees.filter(e => e.evaluationStatus === 'Planifié').length > 0 && selectedEnrolledEvalIds.length === enrolledEmployees.filter(e => e.evaluationStatus === 'Planifié').length}
                               onChange={(e) => {
                                 if (e.target.checked) setSelectedEnrolledEvalIds(enrolledEmployees.filter(e => e.evaluationStatus === 'Planifié').map(e => e.evaluationId));
                                 else setSelectedEnrolledEvalIds([]);
                               }}
                             />
                           </th>
                           <th style={{ padding: '1rem 0.5rem' }}>Nom</th>
                           <th style={{ padding: '1rem 0.5rem' }}>Département</th>
                           <th style={{ padding: '1rem 0.5rem' }}>Poste</th>
                           <th style={{ padding: '1rem 0.5rem' }}>Statut</th>
                           <th style={{ padding: '1rem 0.5rem' }}>Modèle de Formulaire</th>
                           <th></th>
                         </tr>
                       </thead>
                       <tbody>
                         {enrolledEmployees.map(emp => (
                           <tr key={emp.id} style={{ borderBottom: '1px solid var(--panel-border)', background: selectedEnrolledEvalIds.includes(emp.evaluationId) ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                             <td style={{ padding: '1rem 0.5rem' }}>
                               {emp.evaluationStatus === 'Planifié' && (
                                 <input 
                                   type="checkbox" 
                                   checked={selectedEnrolledEvalIds.includes(emp.evaluationId)} 
                                   onChange={() => toggleEnrolledSelection(emp.evaluationId)} 
                                 />
                               )}
                             </td>
                             <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{emp.firstName} {emp.lastName}</td>
                             <td style={{ padding: '1rem 0.5rem' }}>{emp.department}</td>
                             <td style={{ padding: '1rem 0.5rem' }}>{emp.position}</td>
                             <td style={{ padding: '1rem 0.5rem' }}>{emp.evaluationStatus}</td>
                             <td style={{ padding: '1rem 0.5rem' }}>
                               {emp.evaluationStatus === 'Planifié' ? (
                                 <select 
                                   className="input-field" 
                                   style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem', width: '200px' }}
                                   value={emp.formTemplateId || ''} 
                                   onChange={e => handleChangeTemplate(emp.evaluationId, e.target.value)}
                                 >
                                   <option value="">-- Assignez un modèle --</option>
                                   {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                 </select>
                               ) : (
                                 forms.find(f => f.id === emp.formTemplateId)?.name || 'N/A'
                               )}
                             </td>
                             <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                               <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#ef4444' }} onClick={() => handleRemoveEmployee(emp.id)} title="Retirer">
                                 <Trash2 size={16} />
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- CREATE CAMPAIGN MODAL --- */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', margin: '2rem', backgroundColor: 'var(--bg-dark)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Nouvelle Campagne</h2>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nom de la compagne</label>
                <input type="text" className="input-field" value={newCampName} onChange={e => setNewCampName(e.target.value)} placeholder="Ex: Bilan Annuel 2026" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Date de début</label>
                  <input type="date" className="input-field" value={newCampStart} onChange={e => setNewCampStart(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Date de fin</label>
                  <input type="date" className="input-field" value={newCampEnd} onChange={e => setNewCampEnd(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Modèle de formulaire</label>
                <select className="input-field" value={newCampFormId} onChange={e => setNewCampFormId(e.target.value)}>
                  <option value="">Sélectionnez un modèle...</option>
                  {forms.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: '2rem' }}>
              <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleCreateCampaign} disabled={!newCampName || !newCampStart || !newCampEnd || !newCampFormId}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD EMPLOYEES MODAL --- */}
      {showAddEmployeesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', margin: '2rem', display: 'flex', flexDirection: 'column', maxHeight: '90vh', backgroundColor: 'var(--bg-dark)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Ajouter des salariés</h2>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddEmployeesModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '32px', width: '100%' }} 
                  placeholder="Rechercher par nom..." 
                  value={searchEmp}
                  onChange={e => setSearchEmp(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select className="input-field" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                  <option value="">Tous les départements</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="input-field" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                  <option value="">Tous les rôles</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                  <option value="">Tous les statuts</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)' }}>
               {addableEmployees.length === 0 ? (
                 <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun salarié trouvé non inscrit.</div>
               ) : (
                 <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 1, borderBottom: '1px solid var(--panel-border)' }}>
                      <tr>
                        <th style={{ padding: '0.8rem 1rem', width: '40px' }}>
                          <input 
                             type="checkbox" 
                             checked={selectedEmpIds.length > 0 && selectedEmpIds.length === addableEmployees.length}
                             onChange={(e) => {
                               if (e.target.checked) setSelectedEmpIds(addableEmployees.map(emp => emp.id));
                               else setSelectedEmpIds([]);
                             }}
                          />
                        </th>
                        <th style={{ padding: '0.8rem 0.5rem' }}>Employé</th>
                        <th style={{ padding: '0.8rem 0.5rem' }}>Département</th>
                        <th style={{ padding: '0.8rem 0.5rem' }}>Poste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addableEmployees.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid var(--panel-border)', cursor: 'pointer', background: selectedEmpIds.includes(emp.id) ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }} onClick={() => toggleEmpSelection(emp.id)}>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <input type="checkbox" checked={selectedEmpIds.includes(emp.id)} readOnly />
                          </td>
                          <td style={{ padding: '0.8rem 0.5rem', fontWeight: 500 }}>{emp.firstName} {emp.lastName}</td>
                          <td style={{ padding: '0.8rem 0.5rem' }}>{emp.department}</td>
                          <td style={{ padding: '0.8rem 0.5rem' }}>{emp.position}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               )}
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedEmpIds.length} salarié(s) sélectionné(s)</span>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={() => setShowAddEmployeesModal(false)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleAddSelectedEmployees} disabled={selectedEmpIds.length === 0}>
                  Ajouter à la campagne
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DELEGATE EVALUATION MODAL --- */}
      {showDelegateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', margin: '2rem', backgroundColor: 'var(--bg-dark)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={20} style={{ color: 'var(--primary)' }} /> Déléguer l'évaluation</h2>
              <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }} onClick={() => { setShowDelegateModal(false); setDelegateEvalId(null); setNewEvaluatorId(''); }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Sélectionnez le collaborateur à qui vous souhaitez transférer la responsabilité de cet entretien. Vous pourrez annuler cette délégation à tout moment.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>Nouvel Évaluateur</label>
              <select className="input-field" value={newEvaluatorId} onChange={e => setNewEvaluatorId(e.target.value)}>
                <option value="">Sélectionnez un évaluateur...</option>
                {allEmployees.filter(e => e.id !== currentUser.id).sort((a,b) => a.lastName.localeCompare(b.lastName)).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.position})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => { setShowDelegateModal(false); setDelegateEvalId(null); setNewEvaluatorId(''); }}>Annuler</button>
              <button className="btn btn-primary" onClick={handleDelegateSubmit} disabled={!newEvaluatorId}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default Evaluations;
