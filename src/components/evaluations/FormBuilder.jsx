import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Type, AlignLeft, CheckSquare, Calendar, User, ClipboardList, Target, SlidersHorizontal, Star, GripVertical, Settings, X } from 'lucide-react';
import { getForms, saveForm, deleteForm } from '../../db/database';

const FormBuilder = () => {
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    loadForms();
  }, []);

  // Auto-save form changes
  useEffect(() => {
    if (activeForm) {
      const timer = setTimeout(() => {
        saveForm(activeForm);
        setForms(prev => prev.map(f => f.id === activeForm.id ? activeForm : f));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeForm]);

  const loadForms = () => {
    const loaded = getForms();
    setForms(loaded);
  };

  const createNewForm = () => {
    const newForm = {
      name: 'Nouveau Modèle',
      fields: []
    };
    const saved = saveForm(newForm);
    loadForms();
    setActiveForm(saved);
  };

  const handleDeleteForm = (id) => {
    deleteForm(id);
    if (activeForm && activeForm.id === id) {
      setActiveForm(null);
      setSelectedFieldId(null);
    }
    loadForms();
  };

  const handleSaveForm = () => {
    if (activeForm) {
      saveForm(activeForm);
      loadForms();
      setForms(forms.map(f => f.id === activeForm.id ? activeForm : f));
    }
  };

  const createFieldObject = (type) => {
    const newField = {
      id: `f-${Date.now()}-${Math.random()}`,
      type: type,
      label: type === 'employee_info' ? 'Informations Collaborateur' : 'Nouvelle question',
      required: false
    };
    if (type === 'radio' || type === 'select' || type === 'checkbox') {
      newField.options = ['Option 1', 'Option 2', 'Option 3'];
    }
    return newField;
  };

  // --- DND Handlers ---
  const handleDragStartToolbox = (e, type) => {
    e.dataTransfer.setData('source', 'toolbox');
    e.dataTransfer.setData('type', type);
    setDraggedItem({ source: 'toolbox', type });
  };

  const handleDragStartCanvas = (e, index) => {
    e.dataTransfer.setData('source', 'canvas');
    e.dataTransfer.setData('index', index);
    setDraggedItem({ source: 'canvas', index });
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDropCanvas = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeForm) return;

    const source = e.dataTransfer.getData('source');
    let newFields = [...activeForm.fields];

    if (source === 'toolbox') {
      const type = e.dataTransfer.getData('type');
      const newField = createFieldObject(type);
      if (dropIndex === -1) {
        newFields.push(newField);
      } else {
        newFields.splice(dropIndex, 0, newField);
      }
      setSelectedFieldId(newField.id);
    } else if (source === 'canvas') {
      const dragIndex = parseInt(e.dataTransfer.getData('index'), 10);
      if (dragIndex === dropIndex || dragIndex === dropIndex - 1 && dropIndex !== -1) {
        setDraggedItem(null);
        return; // dropped on itself
      }
      const itemToMove = newFields[dragIndex];
      newFields.splice(dragIndex, 1);
      
      // Calculate real drop index after removal
      let targetIndex = dropIndex === -1 ? newFields.length : dropIndex;
      if (dragIndex < targetIndex && dropIndex !== -1) {
         targetIndex--;
      }
      newFields.splice(targetIndex, 0, itemToMove);
    }

    setActiveForm({ ...activeForm, fields: newFields });
    setDraggedItem(null);
  };

  // --- Field Edits ---
  const updateActiveField = (updates) => {
    setActiveForm({
      ...activeForm,
      fields: activeForm.fields.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f)
    });
  };

  const updateOption = (optIndex, val) => {
    const field = activeForm.fields.find(f => f.id === selectedFieldId);
    if (!field || !field.options) return;
    const newOpts = [...field.options];
    newOpts[optIndex] = val;
    updateActiveField({ options: newOpts });
  };

  const addOption = () => {
    const field = activeForm.fields.find(f => f.id === selectedFieldId);
    if (!field) return;
    const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    updateActiveField({ options: newOpts });
  };

  const removeOption = (optIndex) => {
    const field = activeForm.fields.find(f => f.id === selectedFieldId);
    if (!field || !field.options) return;
    const newOpts = field.options.filter((_, i) => i !== optIndex);
    updateActiveField({ options: newOpts });
  };

  const duplicateField = (fieldId) => {
    const idx = activeForm.fields.findIndex(f => f.id === fieldId);
    if (idx === -1) return;
    const clone = JSON.parse(JSON.stringify(activeForm.fields[idx]));
    clone.id = `f-${Date.now()}`;
    const newFields = [...activeForm.fields];
    newFields.splice(idx + 1, 0, clone);
    setActiveForm({ ...activeForm, fields: newFields });
    setSelectedFieldId(clone.id);
  };

  const removeField = (fieldId) => {
    setActiveForm({ ...activeForm, fields: activeForm.fields.filter(f => f.id !== fieldId) });
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const fieldTypes = [
    { type: 'employee_info', icon: <User size={16} />, label: 'Infos Collaborateur' },
    { type: 'text', icon: <Type size={16} />, label: 'Texte court' },
    { type: 'long_text', icon: <AlignLeft size={16} />, label: 'Texte multiligne' },
    { type: 'radio', icon: <CheckSquare size={16} />, label: 'Choix unique (Radio)' },
    { type: 'checkbox', icon: <CheckSquare size={16} />, label: 'Case à cocher' },
    { type: 'date', icon: <Calendar size={16} />, label: 'Date' },
    { type: 'slider', icon: <SlidersHorizontal size={16} />, label: 'Jauge (Slider)' },
    { type: 'objectives_grid', icon: <Target size={16} />, label: 'Grille d\'objectifs' },
    { type: 'rating', icon: <Star size={16} />, label: 'Note sur 5 (Étoiles)' },
  ];

  const selectedField = activeForm && selectedFieldId ? activeForm.fields.find(f => f.id === selectedFieldId) : null;

  return (
    <div className="flex gap-4 animate-fade-in" style={{ height: 'calc(100vh - 200px)' }}>
      {/* 1. Sidebar: List of Forms & Toolbox */}
      <div className="panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
        {/* Forms drop-down or list */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--panel-border)', background: 'var(--bg-dark)' }}>
           <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
             <h2 style={{ margin: 0, fontSize: '1rem' }}>Modèles actifs</h2>
             <button className="btn btn-primary" style={{ padding: '0.3rem 0.5rem' }} onClick={createNewForm} title="Nouveau modèle">
               <Plus size={16} />
             </button>
           </div>
           <select 
             className="input-field" 
             value={activeForm?.id || ''} 
             onChange={e => {
                const f = forms.find(fr => fr.id === e.target.value);
                setActiveForm(f || null);
                setSelectedFieldId(null);
             }}
           >
             <option value="">-- Choisir un modèle --</option>
             {forms.map(form => (
               <option key={form.id} value={form.id}>{form.name}</option>
             ))}
           </select>
        </div>

        {/* Toolbox */}
        {activeForm && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Glissez les briques</h3>
            <div className="flex-col gap-2">
              {fieldTypes.map(ft => (
                <div 
                  key={ft.type} 
                  draggable
                  onDragStart={(e) => handleDragStartToolbox(e, ft.type)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
                    background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', 
                    borderRadius: 'var(--radius-sm)', cursor: 'grab', fontSize: '0.85rem',
                    transition: 'border 0.2s',
                    userSelect: 'none'
                  }}
                  onDragEnd={(e) => setDraggedItem(null)}
                >
                  <span style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={14} /></span>
                  <span style={{ color: 'var(--primary)' }}>{ft.icon}</span> 
                  {ft.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Area: Form Canvas */}
      <div className="panel flex-col" style={{ flex: 1, padding: '0', overflow: 'hidden', position: 'relative' }}>
        {activeForm ? (
          <>
            {/* Header Canvas */}
            <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--panel-border)', background: 'var(--bg-dark)', zIndex: 10, flexWrap: 'wrap', gap: '1rem' }}>
              <div className="flex items-center gap-4" style={{ flex: 1, minWidth: '200px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ fontSize: '1.2rem', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--text-muted)', borderRadius: 0, padding: '0.2rem 0', width: '100%' }}
                  value={activeForm.name}
                  onChange={e => setActiveForm({ ...activeForm, name: e.target.value })}
                  placeholder="Nom du formulaire"
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-danger" onClick={() => handleDeleteForm(activeForm.id)} title="Supprimer ce modèle">
                  <Trash2 size={16} />
                </button>
                <button className="btn btn-primary" onClick={handleSaveForm}>
                  <Save size={16} /> <span style={{ whiteSpace: 'nowrap' }}>Enregistrer</span>
                </button>
              </div>
            </div>

            {/* Droppable Canvas */}
            <div 
              style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#0a0a0f', position: 'relative' }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropCanvas(e, -1)} // Drop at the end
            >
              <div style={{ maxWidth: '800px', margin: '0 auto', minHeight: '100%', paddingBottom: '4rem' }}>
                {activeForm.fields.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem', padding: '3rem', border: '2px dashed var(--panel-border)', borderRadius: 'var(--radius-md)' }}>
                    <ClipboardList size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>Glissez-déposez des éléments depuis la palette ici.</p>
                  </div>
                ) : (
                  <div className="flex-col gap-2">
                    {activeForm.fields.map((field, idx) => (
                      <React.Fragment key={field.id}>
                        {/* Drop Zone above item */}
                        <div 
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropCanvas(e, idx)}
                          style={{ height: '10px', margin: '-5px 0', zIndex: 5, position: 'relative' }}
                        ></div>

                        <div 
                          draggable
                          onDragStart={(e) => handleDragStartCanvas(e, idx)}
                          onDragEnd={(e) => setDraggedItem(null)}
                          onClick={() => setSelectedFieldId(field.id)}
                          style={{ 
                            background: selectedFieldId === field.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-main)', 
                            padding: '1.2rem', 
                            borderRadius: 'var(--radius-sm)', 
                            border: selectedFieldId === field.id ? '1px solid var(--primary)' : '1px solid var(--panel-border)', 
                            borderLeft: selectedFieldId === field.id ? '4px solid var(--primary)' : '4px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '1rem',
                            opacity: draggedItem?.source === 'canvas' && draggedItem?.index === idx ? 0.5 : 1,
                            transition: 'border 0.2s, background 0.2s'
                          }}
                        >
                          <div style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <GripVertical size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 600 }}>
                                {fieldTypes.find(ft => ft.type === field.type)?.label || field.type}
                              </span>
                            </div>

                            <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                              {field.label}
                              {field.required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
                            </div>

                            {/* Visual Preview based on field type */}
                            {field.type === 'employee_info' && (
                              <div style={{ opacity: 0.5, border: '1px dashed var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                                (Bloc auto-généré : Nom, Poste, Email...)
                              </div>
                            )}
                            {field.type === 'text' && (
                              <input type="text" className="input-field" disabled placeholder="Saisie utilisateur..." />
                            )}
                            {field.type === 'long_text' && (
                              <textarea className="input-field" disabled placeholder="Saisie utilisateur longue..." style={{ minHeight: '60px' }} />
                            )}
                            {(field.type === 'radio' || field.type === 'select') && (
                              <div className="flex gap-4">
                                {field.options?.map((opt, i) => (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', opacity: 0.7 }}>
                                    <input type="radio" disabled /> {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                            {field.type === 'checkbox' && (
                              <div className="flex-col gap-2">
                                {(field.options || ['Oui']).map((opt, i) => (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', opacity: 0.7 }}>
                                    <input type="checkbox" disabled /> {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                            {field.type === 'date' && (
                              <input type="date" className="input-field" disabled style={{ maxWidth: '150px' }} />
                            )}
                            {field.type === 'slider' && (
                              <div style={{ width: '100%', height: '8px', background: 'var(--panel-border)', borderRadius: '4px', marginTop: '1rem' }}>
                                <div style={{ width: '50%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                              </div>
                            )}
                            {field.type === 'objectives_grid' && (
                              <table style={{ width: '100%', opacity: 0.5, fontSize: '0.85rem', marginTop: '0.5rem', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ borderBottom: '1px solid var(--panel-border)' }}><th>Objectif</th><th>Statut</th></tr></thead>
                                <tbody><tr><td>...</td><td>...</td></tr></tbody>
                              </table>
                            )}
                            {field.type === 'rating' && (
                              <div className="flex gap-1" style={{ color: '#fbbf24', opacity: 0.7 }}>
                                <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} /><Star size={20} />
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                    
                    {/* Final Drop Zone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropCanvas(e, -1)}
                      style={{ height: '40px', background: 'transparent' }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <ClipboardList size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <h2>Aucun modèle sélectionné</h2>
            <p>Sélectionnez un modèle à gauche ou créez-en un nouveau.</p>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar: Properties Panel */}
      {activeForm && (
        <div className="panel" style={{ width: '320px', padding: '1.5rem', overflowY: 'auto', background: 'var(--bg-dark)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
            <Settings size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Propriétés</h3>
          </div>

          {!selectedField ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
              Cliquez sur un élément du canvas pour configurer ses propriétés.
            </div>
          ) : (
            <div className="flex-col gap-4 animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{selectedField.type}</span>
                <div className="flex gap-2">
                  <button className="btn btn-outline" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => duplicateField(selectedField.id)} title="Dupliquer">Dupliquer</button>
                  <button className="btn btn-danger" style={{ padding: '0.3rem', fontSize: '0.75rem' }} onClick={() => removeField(selectedField.id)} title="Supprimer"><Trash2 size={14} /></button>
                </div>
              </div>

              {selectedField.type !== 'employee_info' && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!selectedField.required} onChange={e => updateActiveField({ required: e.target.checked })} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Champ obligatoire <span style={{ color: 'var(--danger)' }}>*</span></span>
                  </label>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Intitulé / Question</label>
                  <textarea 
                    className="input-field" 
                    value={selectedField.label} 
                    onChange={e => updateActiveField({ label: e.target.value })} 
                    style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
              )}

              {(selectedField.type === 'radio' || selectedField.type === 'select' || selectedField.type === 'checkbox') && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 500 }}>Options de réponse</label>
                  <div className="flex-col gap-2">
                    {selectedField.options?.map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          className="input-field" 
                          style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                          value={opt} 
                          onChange={e => updateOption(i, e.target.value)} 
                        />
                        <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger)' }} onClick={() => removeOption(i)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-outline" style={{ padding: '0.4rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }} onClick={addOption}>
                      <Plus size={14} /> Ajouter une option
                    </button>
                  </div>
                </div>
              )}

              {selectedField.type === 'employee_info' && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ce composant est en lecture seule. Il remplira automatiquement les données du collaborateur audité.
                </p>
              )}

              {selectedField.type === 'slider' && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Génère une jauge de 0 à 100%. Le manager ou l'employé clissera le curseur pour évaluer l'atteinte.
                </p>
              )}

              {selectedField.type === 'objectives_grid' && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Permet l'ajout dynamique de lignes (Objectif, Statut, Indicateurs) lors du remplissage du formulaire.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
