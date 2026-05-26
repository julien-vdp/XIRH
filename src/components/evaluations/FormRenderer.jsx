import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2, Star, Download, Send, XCircle } from 'lucide-react';
import { getForms, saveEvaluationAnswers, updateEvaluationStatus } from '../../db/database';

const FormRenderer = ({ evaluation, onBack, currentUser, isReadOnly }) => {
  const [formTemplate, setFormTemplate] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (evaluation && evaluation.formTemplateId) {
      const forms = getForms();
      const template = forms.find(f => f.id === evaluation.formTemplateId);
      setFormTemplate(template);
      if (evaluation.answers) {
        setAnswers(evaluation.answers);
      }
    }
  }, [evaluation]);

  const handleAnswerChange = (fieldId, value) => {
    if (isReadOnly || evaluation.status === 'Terminé') return;
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveDraft = () => {
    saveEvaluationAnswers(evaluation.id, answers);
    updateEvaluationStatus(evaluation.id, 'En cours');
    onBack();
  };

  const validateRequired = () => {
    let missing = [];
    formTemplate.fields.forEach(field => {
      if (field.required && field.type !== 'employee_info') {
        const val = answers[field.id];
        if (field.type === 'objectives_grid') {
          if (!val || val.length === 0) missing.push(field.label);
        } else if (field.type === 'slider' || field.type === 'rating') {
          if (val === undefined || val === null) missing.push(field.label);
        } else {
          if (!val || (Array.isArray(val) && val.length === 0)) missing.push(field.label);
        }
      }
    });
    if (missing.length > 0) {
      alert(`Veuillez remplir les champs obligatoires suivants :\n- ${missing.join('\n- ')}`);
      return false;
    }
    return true;
  };

  const handleSubmitToEmployee = () => {
    if (!validateRequired()) return;
    saveEvaluationAnswers(evaluation.id, answers);
    updateEvaluationStatus(evaluation.id, 'En attente salarié');
    onBack();
  };

  const handleValidByEmployee = () => {
    updateEvaluationStatus(evaluation.id, 'Terminé');
    onBack();
  };

  const handleRefuseByEmployee = () => {
    updateEvaluationStatus(evaluation.id, 'En révision');
    onBack();
  };

  const addObjective = (fieldId) => {
    if (isReadOnly || evaluation.status === 'Terminé') return;
    const current = answers[fieldId] || [];
    handleAnswerChange(fieldId, [...current, { id: Date.now(), title: '', status: 'Défini', comment: '' }]);
  };

  const updateObjective = (fieldId, objIndex, key, value) => {
    if (isReadOnly || evaluation.status === 'Terminé') return;
    const current = [...(answers[fieldId] || [])];
    current[objIndex][key] = value;
    handleAnswerChange(fieldId, current);
  };

  const removeObjective = (fieldId, objIndex) => {
    if (isReadOnly || evaluation.status === 'Terminé') return;
    const current = (answers[fieldId] || []).filter((_, i) => i !== objIndex);
    handleAnswerChange(fieldId, current);
  };

  if (!evaluation || !formTemplate) {
    return (
      <div className="animate-fade-in">
        <button className="btn btn-outline" style={{ marginBottom: '1rem', border: 'none' }} onClick={onBack}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div className="panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Modèle de formulaire introuvable ou non défini pour cette évaluation.</p>
        </div>
      </div>
    );
  }

  const emp = evaluation.employee || {};

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center no-print" style={{ marginBottom: '1rem' }}>
        <button className="btn btn-outline" style={{ border: 'none' }} onClick={onBack}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {(!isReadOnly || (isReadOnly && evaluation.status === 'En révision')) && evaluation.status !== 'Terminé' && evaluation.status !== 'En attente salarié' && (
            <>
              <button className="btn btn-outline" onClick={handleSaveDraft}>
                <Save size={18} /> Brouillon
              </button>
              <button className="btn btn-primary" onClick={handleSubmitToEmployee}>
                <Send size={18} /> Soumettre au salarié
              </button>
            </>
          )}

          {isReadOnly && evaluation.status === 'En attente salarié' && currentUser?.id === evaluation.employeeId && (
            <>
              <button className="btn btn-danger" onClick={handleRefuseByEmployee}>
                <XCircle size={18} /> Refuser
              </button>
              <button className="btn btn-primary" onClick={handleValidByEmployee} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
                <CheckCircle size={18} /> Valider l'entretien
              </button>
            </>
          )}

          {evaluation.status === 'Terminé' && (
             <button className="btn btn-outline" onClick={() => window.print()}>
               <Download size={18} /> Télécharger PDF
             </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--bg-dark)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary)' }}>{formTemplate.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
             Évaluation de {emp.firstName} {emp.lastName}
             {evaluation.status === 'Terminé' && (
               <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', marginLeft: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '15px', fontSize: '0.8rem' }}>
                 <CheckCircle size={14} /> Terminée
               </span>
             )}
          </p>
        </div>

        <div className="flex-col gap-6">
          {formTemplate.fields.map((field, index) => {
            
            const disabled = isReadOnly || evaluation.status === 'Terminé' || evaluation.status === 'En attente salarié';
            const val = answers[field.id];

            if (field.type === 'employee_info') {
              return (
                <div key={field.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{field.label}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom Complet</span><strong style={{ fontSize: '1.1rem' }}>{emp.firstName} {emp.lastName}</strong></div>
                    <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</span><span>{emp.email}</span></div>
                    <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Département</span><span>{emp.department}</span></div>
                    <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Poste</span><span>{emp.position}</span></div>
                    <div><span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date d'embauche</span><span>{emp.hireDate}</span></div>
                  </div>
                </div>
              );
            }

            return (
              <div key={field.id} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-main)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                  {index}. {field.label}
                  {field.required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input type="text" className="input-field" value={val || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} disabled={disabled} style={{ opacity: disabled ? 0.7 : 1, width: '100%', background: 'var(--bg-dark)' }} />
                )}

                {field.type === 'long_text' && (
                  <textarea className="input-field" style={{ minHeight: '120px', resize: 'vertical', width: '100%', opacity: disabled ? 0.7 : 1, background: 'var(--bg-dark)' }} value={val || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} disabled={disabled} />
                )}

                {/* MULTIPLE CHECKBOXES */}
                {field.type === 'checkbox' && (
                  <div className="flex-col gap-2">
                    {(field.options || ['Oui']).map((opt, i) => {
                      const isChecked = Array.isArray(val) ? val.includes(opt) : !!val;
                      return (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1 }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={e => {
                              if (field.options) {
                                let currentArray = Array.isArray(val) ? [...val] : [];
                                if (e.target.checked) currentArray.push(opt);
                                else currentArray = currentArray.filter(o => o !== opt);
                                handleAnswerChange(field.id, currentArray);
                              } else {
                                // Fallback pour les vieux modèles sans 'options'
                                handleAnswerChange(field.id, e.target.checked);
                              }
                            }} 
                            disabled={disabled} 
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* RADIO / SELECT avec options configurables */}
                {(field.type === 'radio' || field.type === 'select') && (
                  <div className="flex-col gap-2">
                    {field.options?.map((opt, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1, background: val === opt ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        <input type="radio" name={`radio-${field.id}`} value={opt} checked={val === opt} onChange={e => handleAnswerChange(field.id, e.target.value)} disabled={disabled} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'date' && (
                  <input type="date" className="input-field" style={{ maxWidth: '200px', opacity: disabled ? 0.7 : 1, background: 'var(--bg-dark)' }} value={val || ''} onChange={e => handleAnswerChange(field.id, e.target.value)} disabled={disabled} />
                )}

                {/* SLIDER / POURCENTAGE */}
                {field.type === 'slider' && (
                  <div style={{ opacity: disabled ? 0.7 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Progression</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{val || 0}%</strong>
                    </div>
                    <input type="range" min="0" max="100" value={val || 0} onChange={e => handleAnswerChange(field.id, e.target.value)} disabled={disabled} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  </div>
                )}

                {/* OBJECTIVES GRID */}
                {field.type === 'objectives_grid' && (
                  <div>
                    <table className="table" style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse', opacity: disabled ? 0.8 : 1 }}>
                       <thead>
                         <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                           <th style={{ padding: '0.5rem' }}>Intitulé de l'objectif</th>
                           <th style={{ padding: '0.5rem', width: '25%' }}>Indicateur / Commentaire</th>
                           <th style={{ padding: '0.5rem', width: '150px' }}>Statut</th>
                           {!disabled && <th style={{ width: '50px' }}></th>}
                         </tr>
                       </thead>
                       <tbody>
                         {(val || []).map((obj, i) => (
                           <tr key={i} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                             <td style={{ padding: '0.5rem' }}>
                               <input type="text" className="input-field" style={{ width: '100%', background: 'transparent' }} value={obj.title} onChange={e => updateObjective(field.id, i, 'title', e.target.value)} disabled={disabled} placeholder="Titre de l'objectif..." />
                             </td>
                             <td style={{ padding: '0.5rem' }}>
                               <input type="text" className="input-field" style={{ width: '100%', background: 'transparent' }} value={obj.comment} onChange={e => updateObjective(field.id, i, 'comment', e.target.value)} disabled={disabled} placeholder="Mesure..." />
                             </td>
                             <td style={{ padding: '0.5rem' }}>
                               <select className="input-field" style={{ width: '100%', background: 'transparent' }} value={obj.status} onChange={e => updateObjective(field.id, i, 'status', e.target.value)} disabled={disabled}>
                                 <option value="Défini">Défini</option>
                                 <option value="En cours">En cours</option>
                                 <option value="Atteint">Atteint</option>
                                 <option value="Partiellement atteint">Partiellement atteint</option>
                                 <option value="Non atteint">Non atteint</option>
                               </select>
                             </td>
                             {!disabled && (
                               <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                 <button className="btn btn-outline" style={{ padding: '0.3rem', color: 'var(--danger)', border: 'none' }} onClick={() => removeObjective(field.id, i)}><Trash2 size={16} /></button>
                               </td>
                             )}
                           </tr>
                         ))}
                         {(!val || val.length === 0) && (
                           <tr><td colSpan={disabled ? 3 : 4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun objectif défini.</td></tr>
                         )}
                       </tbody>
                    </table>
                    {!disabled && (
                      <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }} onClick={() => addObjective(field.id)}>
                        <Plus size={14} /> Ajouter un objectif
                      </button>
                    )}
                  </div>
                )}

                {/* RATING */}
                {field.type === 'rating' && (
                  <div className="flex gap-2" style={{ opacity: disabled ? 0.7 : 1 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        style={{ 
                          background: 'transparent', border: 'none', cursor: disabled ? 'default' : 'pointer', 
                          color: (val || 0) >= star ? '#fbbf24' : 'var(--panel-border)',
                          transition: 'color 0.2s', padding: 0
                        }}
                        onClick={() => handleAnswerChange(field.id, star)}
                        disabled={disabled}
                      >
                        <Star size={32} fill={(val || 0) >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormRenderer;
