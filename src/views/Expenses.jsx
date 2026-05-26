import React, { useState, useEffect } from 'react';
import { 
  Receipt, PlusCircle, CheckCircle, XCircle, Clock, Search, 
  Filter, ChevronDown, List, Settings, Save, AlertCircle, Euro
} from 'lucide-react';
import {
  getExpensesForEmployee, getExpensesPendingForManager,
  getExpensesPendingN2, getExpensesPendingAdmin, getExpenses,
  saveExpense, updateExpenseStatus, getExpenseTypes,
  getExpenseWorkflowConfig, saveExpenseWorkflowConfig, getEmployees
} from '../db/database';

export default function Expenses({ currentUser }) {
  const [activeTab, setActiveTab] = useState('my_expenses');
  const [myExpenses, setMyExpenses] = useState([]);
  const [pendingN1, setPendingN1] = useState([]);
  const [pendingN2, setPendingN2] = useState([]);
  const [pendingAdmin, setPendingAdmin] = useState([]);
  
  const [workflowConfig, setWorkflowConfig] = useState({ circuit: 1 });
  const expenseTypes = getExpenseTypes();

  // Modal logic for creating an expense
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    type: expenseTypes[0],
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const isAdminOrHR = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR';
  const isManager = currentUser?.role === 'MANAGER' || isAdminOrHR;

  const loadData = () => {
    if (!currentUser) return;
    setMyExpenses(getExpensesForEmployee(currentUser.id));
    if (isManager) {
      setPendingN1(getExpensesPendingForManager(currentUser.id));
      setPendingN2(getExpensesPendingN2(currentUser.id));
    }
    if (isAdminOrHR) {
      setPendingAdmin(getExpensesPendingAdmin());
    }
    setWorkflowConfig(getExpenseWorkflowConfig());
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;
    
    saveExpense({
      employeeId: currentUser.id,
      type: newExpense.type,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
    });
    
    setShowCreateModal(false);
    setNewExpense({
      type: expenseTypes[0],
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    loadData();
  };

  const handleStatusUpdate = (expenseId, currentStatus, action, role) => {
    // action is 'APPROVE' or 'REJECT'
    let newStatus = '';
    let actionLabel = '';

    if (action === 'REJECT') {
      newStatus = 'REJECTED';
      actionLabel = `Refusée par ${role}`;
    } else if (action === 'APPROVE') {
      if (currentStatus === 'PENDING_N1') {
        if (workflowConfig.circuit === 1) {
          newStatus = 'APPROVED';
          actionLabel = `Approuvée (N+1)`;
        } else if (workflowConfig.circuit === 2) {
          newStatus = 'PENDING_N2';
          actionLabel = `Validée N+1, en attente N+2`;
        } else if (workflowConfig.circuit === 3) {
          newStatus = 'PENDING_ADMIN';
          actionLabel = `Validée N+1, en attente Service RH`;
        }
      } else if (currentStatus === 'PENDING_N2') {
        newStatus = 'APPROVED';
        actionLabel = `Approuvée (N+2)`;
      } else if (currentStatus === 'PENDING_ADMIN') {
        newStatus = 'APPROVED';
        actionLabel = `Approuvée (RH/Admin)`;
      }
    }
    
    if (newStatus) {
      updateExpenseStatus(expenseId, newStatus, actionLabel);
      loadData();
    }
  };

  const handleConfigSave = (circuit) => {
    const config = { circuit: parseInt(circuit) };
    saveExpenseWorkflowConfig(config);
    setWorkflowConfig(config);
    loadData();
  };

  const getStatusBadgeOptions = (status) => {
    switch (status) {
      case 'APPROVED': return { color: 'var(--success)', icon: <CheckCircle size={16} />, label: 'Approuvée' };
      case 'REJECTED': return { color: 'var(--danger)', icon: <XCircle size={16} />, label: 'Refusée' };
      case 'PENDING_N1': return { color: 'var(--warning)', icon: <Clock size={16} />, label: 'En attente N+1' };
      case 'PENDING_N2': return { color: 'var(--warning)', icon: <Clock size={16} />, label: 'En attente N+2' };
      case 'PENDING_ADMIN': return { color: 'var(--primary)', icon: <Clock size={16} />, label: 'En attente Admin' };
      default: return { color: 'gray', icon: <AlertCircle size={16} />, label: status };
    }
  };

  const StatusBadge = ({ status }) => {
    const options = getStatusBadgeOptions(status);
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem',
        border: `1px solid ${options.color}30`,
        color: options.color,
        background: `${options.color}15`,
        fontWeight: 500
      }}>
        {options.icon} {options.label}
      </span>
    );
  };

  const employeesMap = getEmployees().reduce((acc, emp) => {
    acc[emp.id] = `${emp.firstName} ${emp.lastName}`;
    return acc;
  }, {});

  const renderExpenseTable = (expenses, showEmployee = false, viewContext = 'MY_EXPENSES') => {
    if (!expenses.length) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Receipt size={40} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
          <p>Aucune note de frais à afficher.</p>
        </div>
      );
    }
    return (
      <div className="table-responsive">
        <table className="table" style={{ width: '100%', minWidth: '800px' }}>
          <thead>
            <tr>
              {showEmployee && <th>Salarié</th>}
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Statut</th>
              {(viewContext !== 'MY_EXPENSES') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                {showEmployee && (
                  <td style={{ fontWeight: 500 }}>{employeesMap[exp.employeeId] || exp.employeeId}</td>
                )}
                <td>{new Date(exp.date).toLocaleDateString('fr-FR')}</td>
                <td>
                  <span style={{ fontSize: '0.85rem', background: 'var(--panel-border)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {exp.type}
                  </span>
                </td>
                <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {exp.description}
                </td>
                <td style={{ fontWeight: 600 }}>{exp.amount.toFixed(2)} €</td>
                <td><StatusBadge status={exp.status} /></td>
                {(viewContext !== 'MY_EXPENSES') && (
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleStatusUpdate(exp.id, exp.status, 'APPROVE', viewContext)}
                      >
                        <CheckCircle size={14} /> Valider
                      </button>
                      <button 
                        className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => handleStatusUpdate(exp.id, exp.status, 'REJECT', viewContext)}
                      >
                        <XCircle size={14} /> Refuser
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Receipt style={{ color: 'var(--primary)' }} />
            Notes de Frais
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Déclarez et supervisez les frais professionnels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={18} /> Nouvelle Déclaration
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
        <button className={`btn ${activeTab === 'my_expenses' ? 'btn-primary' : ''}`} style={activeTab !== 'my_expenses' ? { background: 'transparent', border: 'none', color: 'var(--text-muted)' } : {}}
          onClick={() => setActiveTab('my_expenses')}>
          <List size={18} /> Mes Déclarations
        </button>
        {isManager && (
          <button className={`btn ${activeTab === 'approvals' ? 'btn-primary' : ''}`} style={activeTab !== 'approvals' ? { background: 'transparent', border: 'none', color: 'var(--text-muted)' } : {}}
            onClick={() => setActiveTab('approvals')}>
            <CheckCircle size={18} /> À Valider {(pendingN1.length + pendingN2.length) > 0 && <span style={{ background: 'var(--danger)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem' }}>{pendingN1.length + pendingN2.length}</span>}
          </button>
        )}
        {isAdminOrHR && (
          <button className={`btn ${activeTab === 'admin' ? 'btn-primary' : ''}`} style={activeTab !== 'admin' ? { background: 'transparent', border: 'none', color: 'var(--text-muted)' } : {}}
            onClick={() => setActiveTab('admin')}>
            <Settings size={18} /> Administration {(pendingAdmin.length) > 0 && <span style={{ background: 'var(--danger)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem' }}>{pendingAdmin.length}</span>}
          </button>
        )}
      </div>

      <div className="panel animate-fade-in">
        {activeTab === 'my_expenses' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }}/> Historique de mes fiches de frais
            </h3>
            {renderExpenseTable(myExpenses, false, 'MY_EXPENSES')}
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} style={{ color: 'var(--warning)' }}/> Approbations en attente
            </h3>
            
            {pendingN1.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Validation N+1 (Mes subordonnés)</h4>
                {renderExpenseTable(pendingN1, true, 'Manager')}
              </div>
            )}

            {pendingN2.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Validation N+2</h4>
                {renderExpenseTable(pendingN2, true, 'Manager N+2')}
              </div>
            )}
            
            {(pendingN1.length === 0 && pendingN2.length === 0) && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={40} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                <p>Aucune note de frais en attente de votre validation.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'revert', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} style={{ color: 'var(--primary)' }}/> Validation RH / Comptabilité
                </h3>
                {pendingAdmin.length > 0 ? renderExpenseTable(pendingAdmin, true, 'Admin') : (
                  <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: '8px' }}>Aucune note en attente de traitement RH.</p>
                )}
              </div>
              
              <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)', marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={18} style={{ color: 'var(--primary)' }}/> Configuration du Workflow
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Définissez le circuit d'approbation requis pour les notes de frais.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', border: '1px solid var(--panel-border)', borderRadius: '8px', background: workflowConfig.circuit === 1 ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                    <input type="radio" name="circuit" value="1" checked={workflowConfig.circuit === 1} onChange={(e) => handleConfigSave(1)} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Simple (N+1)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborateur <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Manager N+1 <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Payé</div>
                    </div>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', border: '1px solid var(--panel-border)', borderRadius: '8px', background: workflowConfig.circuit === 2 ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                    <input type="radio" name="circuit" value="2" checked={workflowConfig.circuit === 2} onChange={(e) => handleConfigSave(2)} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Double Validation (N+1, N+2)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborateur <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Manager N+1 <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Manager N+2 <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Payé</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', border: '1px solid var(--panel-border)', borderRadius: '8px', background: workflowConfig.circuit === 3 ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                    <input type="radio" name="circuit" value="3" checked={workflowConfig.circuit === 3} onChange={(e) => handleConfigSave(3)} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Validation RH / Compta (N+1, RH)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborateur <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Manager N+1 <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Service RH <span style={{ fontFamily: 'monospace' }}>&rarr;</span> Payé</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} style={{ color: 'var(--primary)' }} />
              Nouvelle note de frais
            </h3>
            
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label>Date de la dépense</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Catégorie</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-control" 
                    value={newExpense.type}
                    onChange={e => setNewExpense({...newExpense, type: e.target.value})}
                  >
                    {expenseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                </div>
              </div>

              <div className="form-group">
                <label>Description du motif</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Déjeuner client Dupont"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Montant (TTC)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="form-control" 
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    style={{ paddingRight: '2rem' }}
                    required
                  />
                  <Euro size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                </div>
              </div>
              
              {/* Optional: we could add a fake file input here for realism */}
              <div className="form-group">
                <label>Justificatif</label>
                <input type="file" className="form-control" style={{ padding: '0.5rem' }} />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>Format PDF, JPG, ou PNG (Max 5Mo)</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Soumettre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
