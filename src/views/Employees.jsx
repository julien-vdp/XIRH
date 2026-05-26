import React, { useState, useEffect } from 'react';
import { getEmployees, updateEmployee, addEmployee } from '../db/database';
import { Search, Filter, Mail, Calendar, Briefcase, IndianRupee, Edit2, Check, X, User, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  useEffect(() => {
    setIsEditing(false);
  }, [selectedEmp?.id]);

  const filtered = employees.filter(e => {
    const term = searchTerm.toLowerCase();
    return (e.firstName || '').toLowerCase().includes(term) || 
           (e.lastName || '').toLowerCase().includes(term) || 
           (e.position || '').toLowerCase().includes(term) ||
           (e.department || '').toLowerCase().includes(term);
  });

  const handleAddNew = () => {
    const newEmp = {
      id: `EMP${Math.floor(Math.random() * 10000)}`,
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
      status: 'Actif',
      hireDate: new Date().toISOString().split('T')[0],
      salary: 0,
      history: []
    };
    setSelectedEmp(newEmp);
    setEditForm({ ...newEmp, effectDate: new Date().toISOString().split('T')[0] });
    setIsEditing(true);
  };

  const startEdit = () => {
    setEditForm({ ...selectedEmp, effectDate: new Date().toISOString().split('T')[0] });
    setIsEditing(true);
  };

  const handleSave = () => {
    const posChanged = editForm.position !== selectedEmp.position;
    const salChanged = Number(editForm.salary) !== Number(selectedEmp.salary);
    const statChanged = editForm.status !== selectedEmp.status;
    const deptChanged = editForm.department !== selectedEmp.department;
    const managerChanged = editForm.managerId !== selectedEmp.managerId;

    const updatedEmp = { ...selectedEmp, ...editForm, salary: Number(editForm.salary) };
    
    if (posChanged || salChanged || statChanged || deptChanged || managerChanged) {
       let desc = [];
       if (posChanged) desc.push(`Nouveau poste : ${editForm.position}`);
       if (salChanged) desc.push(`Nouveau salaire : ${editForm.salary}€`);
       if (deptChanged) desc.push(`Nouveau Dpt : ${editForm.department}`);
       if (statChanged) desc.push(`Nouveau statut : ${editForm.status}`);
       if (managerChanged) {
         const newM = employees.find(e => e.id === editForm.managerId);
         desc.push(`Nouveau manager : ${newM ? newM.firstName + ' ' + newM.lastName : 'Aucun'}`);
       }

       updatedEmp.history = [{
         id: `evt-${Date.now()}`,
         date: editForm.effectDate || new Date().toISOString().split('T')[0],
         type: 'UPDATE',
         label: 'Mise à jour Manuelle',
         description: desc.join(' | '),
         newValue: editForm.position
       }, ...selectedEmp.history];
    }
    const isNew = !employees.find(e => e.id === selectedEmp.id);
    
    if (isNew) {
       addEmployee(updatedEmp);
    } else {
       updateEmployee(selectedEmp.id, updatedEmp);
    }
    
    setEmployees(getEmployees());
    setSelectedEmp(updatedEmp);
    setIsEditing(false);
  };

  const managerObj = selectedEmp && selectedEmp.managerId 
    ? employees.find(e => e.id === selectedEmp.managerId) 
    : null;

  return (
    <div className="flex-col gap-6" style={{ height: '100%', display: 'flex' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1>Annuaire des Salariés</h1>
          <p>Gérez les collaborateurs et consultez leur historique (postes, salaires, etc.).</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <UserPlus size={18} /> Ajouter un Salarié
        </button>
      </div>

      <div className="flex gap-6" style={{ flex: 1, overflow: 'hidden' }}>
        
        {/* Table/List panel */}
        <div className="glass-panel flex-col" style={{ flex: selectedEmp ? 2 : 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Toolbar */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Rechercher par nom, poste, département..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '35px' }}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', backdropFilter: 'blur(10px)', zIndex: 1 }}>
                <tr>
                  <th>Nom & Prénom</th>
                  <th>Poste & Dpt</th>
                  <th>Statut</th>
                  <th>Date d'entrée</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} style={{ cursor: 'pointer', background: selectedEmp?.id === emp.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }} onClick={() => setSelectedEmp(emp)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                          {emp.avatar ? <img src={emp.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${(emp.firstName||' ')[0]}${(emp.lastName||' ')[0]}`}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-main)' }}>{emp.position}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.department}</div>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'Actif' ? 'badge-success' : 'badge-danger'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{format(new Date(emp.hireDate), 'dd MMM yyyy', { locale: fr })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedEmp(emp); }}>Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        {selectedEmp && (
          <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
             <div className="flex justify-between items-start">
               <div className="flex gap-4 items-center">
                 <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-dark), var(--primary-hover))', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', overflow: 'hidden', flexShrink: 0 }}>
                    {selectedEmp.avatar ? <img src={selectedEmp.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${(selectedEmp.firstName||' ')[0]}${(selectedEmp.lastName||' ')[0]}`}
                 </div>
                 <div>
                   <h2 style={{ margin: 0 }}>{selectedEmp.firstName} {selectedEmp.lastName}</h2>
                   <div className={`badge ${selectedEmp.status === 'Actif' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '0.5rem' }}>
                     {selectedEmp.status}
                   </div>
                 </div>
               </div>
               <div className="flex gap-2">
                 {!isEditing ? (
                   <>
                     <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={startEdit} title="Modifier la fiche"><Edit2 size={18} /></button>
                     <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setSelectedEmp(null)}><X size={18} /></button>
                   </>
                 ) : (
                   <>
                     <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleSave} title="Enregistrer"><Check size={18} /></button>
                     <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setIsEditing(false)}><X size={18} /></button>
                   </>
                 )}
               </div>
             </div>

             <div className="flex-col gap-4">
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Informations Professionnelles</h4>
                  
                  {!isEditing ? (
                    <div className="flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Briefcase size={16} color="var(--primary)" />
                        <span>{selectedEmp.position} - {selectedEmp.department}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={16} color="var(--primary)" />
                        <span>{selectedEmp.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User size={16} color="var(--primary)" />
                        <span>Manager : {managerObj ? `${managerObj.firstName} ${managerObj.lastName}` : 'Aucun (Direction)'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} color="var(--primary)" />
                        <span>Embauché le {format(new Date(selectedEmp.hireDate), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <IndianRupee size={16} color="var(--primary)" />
                        <span>{selectedEmp.salary.toLocaleString('fr-FR')} € / an</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-col gap-3" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                       <div>
                         <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Département</label>
                         <input type="text" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                       </div>
                       <div>
                         <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Poste</label>
                         <input type="text" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} />
                       </div>
                       <div>
                         <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Salaire Annuel (€)</label>
                         <input type="number" value={editForm.salary} onChange={e => setEditForm({...editForm, salary: e.target.value})} />
                       </div>
                       <div>
                         <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Statut</label>
                         <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                           <option value="Actif">Actif</option>
                           <option value="Inactif">Inactif</option>
                         </select>
                       </div>
                       <div>
                         <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager</label>
                         <select value={editForm.managerId || ''} onChange={e => setEditForm({...editForm, managerId: e.target.value || null})}>
                           <option value="">Aucun manager (Direction)</option>
                           {employees.filter(e => e.id !== selectedEmp.id).map(emp => (
                             <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.position})</option>
                           ))}
                         </select>
                       </div>
                       <hr style={{ borderColor: 'var(--panel-border)', margin: '0.5rem 0' }} />
                       <div>
                         <label style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Date d'effet du changement</label>
                         <input type="date" value={editForm.effectDate} onChange={e => setEditForm({...editForm, effectDate: e.target.value})} />
                         <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Un évènement d'historique sera créé avec cette date.</p>
                       </div>
                    </div>
                  )}
               </div>

               <div>
                 <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', marginTop: '1rem', textTransform: 'uppercase' }}>Historique & Dates d'effet</h4>
                  <div className="flex-col gap-0" style={{ borderLeft: '2px solid var(--panel-border)', marginLeft: '8px' }}>
                    {(selectedEmp.history || []).map((evt, idx) => (
                      <div key={evt.id} style={{ position: 'relative', paddingLeft: '1.5rem', paddingBottom: '1.5rem' }}>
                        {/* Dot */}
                        <div style={{ position: 'absolute', left: '-7px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: idx === 0 ? 'var(--primary)' : 'var(--text-muted)', border: '2px solid var(--bg-dark)' }} />
                        
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: idx === 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {evt.date ? format(new Date(evt.date), 'dd MMM yyyy', { locale: fr }) : '-'} - {evt.label}
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>{evt.description}</p>
                      </div>
                    ))}
                    {(!selectedEmp.history || selectedEmp.history.length === 0) && (
                      <div style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aucun historique disponible.</div>
                    )}
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
