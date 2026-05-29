'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, User, MapPin, 
  Upload, Trash2, CheckCircle2, AlertTriangle, 
  Plus, Minus, FileText, Check, Phone,
  Sofa, Tv, Bike, Package
} from 'lucide-react';
import './citoyen.css';
import '../encombrants.css';

interface Item {
  id: string;
  name: string;
  desc: string;
  qty: number;
}

interface ItemFamily {
  [key: string]: Item[];
}

export default function CitoyenPage() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [dossierNumber, setDossierNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 1: Info & Adresse
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [wednesdays, setWednesdays] = useState<string[]>([]);

  useEffect(() => {
    const dates: string[] = [];
    const today = new Date();
    let dayOfWeek = today.getDay();
    let daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
    if (daysUntilWednesday === 0) {
      daysUntilWednesday = 7;
    }
    const nextWednesday = new Date(today);
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);

    for (let i = 0; i < 3; i++) {
      const d = new Date(nextWednesday);
      d.setDate(nextWednesday.getDate() + (i * 7));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    setWednesdays(dates);
  }, []);

  const formatDateFrench = (dateStr: string) => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Step 2: Encombrants selection
  const [items, setItems] = useState<ItemFamily>({
    mobilier: [
      { id: 'matelas', name: 'Matelas / Sommier', desc: 'Matelas 1 ou 2 places, sommier à lattes', qty: 0 },
      { id: 'armoire', name: 'Armoire / Commode', desc: 'Armoire (démontée de préférence), commode, buffet', qty: 0 },
      { id: 'canape', name: 'Canapé / Fauteuil', desc: 'Canapé convertible, canapé droit, fauteuil', qty: 0 },
      { id: 'table', name: 'Table / Bureau', desc: 'Table de cuisine, bureau en bois ou métal', qty: 0 },
      { id: 'chaise', name: 'Chaise / Tabouret', desc: 'Chaises individuelles, tabourets, bancs', qty: 0 }
    ],
    electro: [
      { id: 'frigo', name: 'Réfrigérateur / Congélateur', desc: 'Gros électroménager froid (frigo, congélateur)', qty: 0 },
      { id: 'lavelinge', name: 'Lave-linge / Sèche-linge', desc: 'Lave-linge, lave-vaisselle, sèche-linge', qty: 0 },
      { id: 'four', name: 'Four / Micro-ondes', desc: 'Four encastrable, plaques de cuisson, micro-ondes', qty: 0 },
      { id: 'tele', name: 'Téléviseur / Écran', desc: 'Téléviseurs anciens (CRT) ou écrans plats', qty: 0 }
    ],
    loisirs: [
      { id: 'velo', name: 'Vélo / Trottinette', desc: 'Vélos adultes/enfants, trottinettes non électriques', qty: 0 },
      { id: 'salonjardin', name: 'Salon de jardin', desc: 'Chaises de jardin en plastique, table d\'extérieur, parasol', qty: 0 },
      { id: 'outillage', name: 'Outillage / Équipement', desc: 'Tondeuse à main (sans essence), petits outils', qty: 0 },
      { id: 'jouets', name: 'Grands jouets / Cabanes', desc: 'Jouets encombrants d\'enfants, toboggan démonté', qty: 0 }
    ],
    divers: [
      { id: 'carton', name: 'Grands cartons', desc: 'Cartons vides pliés et ficelés (maximum 5)', qty: 0 },
      { id: 'palette', name: 'Palettes en bois', desc: 'Palettes de livraison en bois de petite taille', qty: 0 },
      { id: 'ferraille', name: 'Ferraille / Métaux', desc: 'Tubes métalliques, étagères en ferraille', qty: 0 },
      { id: 'planches', name: 'Planches / Portes', desc: 'Planches de bois, étagères démontées, portes', qty: 0 }
    ]
  });

  // Step 3: Photo
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState('');

  // Fetch address suggestions from API Adresse (filtered on Choisy-le-Roi 94600)
  useEffect(() => {
    if (address.trim().length < 4) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setAddressLoading(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&postcode=94600&limit=5`
        );
        const data = await response.json();
        if (data && data.features) {
          setSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des adresses", err);
      } finally {
        setAddressLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [address]);

  const selectAddress = (feature: any) => {
    setAddress(feature.properties.label);
    setShowSuggestions(false);
  };

  // Counters logic
  const updateQty = (family: string, itemId: string, change: number) => {
    setItems(prev => {
      const updatedList = prev[family].map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.qty + change);
          return { ...item, qty: newQty };
        }
        return item;
      });
      return { ...prev, [family]: updatedList };
    });
  };

  // Photo handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoName(file.name);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoName('');
  };

  // Get total objects count
  const getTotalQty = () => {
    let count = 0;
    Object.values(items).forEach(familyItems => {
      familyItems.forEach(item => {
        count += item.qty;
      });
    });
    return count;
  };

  // Form validation per step
  const isStepValid = () => {
    if (step === 1) {
      return fullName.trim() !== '' && email.trim() !== '' && phone.trim() !== '' && address.trim() !== '' && address.includes('94600') && selectedDate !== '';
    }
    if (step === 2) {
      return getTotalQty() > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid() && step === 3) {
      setIsSubmitting(true);
      setSubmitError('');
      const num = 'DEC-94600-' + Math.floor(10000 + Math.random() * 90000);
      setDossierNumber(num);
      
      // Save request to backend API
      const requestData = {
        id: num,
        fullName,
        email,
        phone,
        address,
        date: selectedDate,
        items,
        totalQty: getTotalQty(),
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      
      try {
        const res = await fetch('/api/encombrants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'create',
            data: requestData
          })
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Erreur serveur lors de la création.');
        }
        
        const result = await res.json();
        console.log("Demande sauvegardée sur le serveur", result);
        setSuccess(true);
      } catch (err: any) {
        console.error("Erreur de sauvegarde serveur", err);
        setSubmitError(err.message || "Erreur de connexion au serveur municipal. Veuillez réessayer.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="encombrants-root">
      
      {/* ═══ DÉCORATION D'ARRIÈRE-PLAN ANIMÉE ═══ */}
      <div className="muni-bg-decor">
        <div className="muni-blob muni-blob-1"></div>
        <div className="muni-blob muni-blob-2"></div>
        <div className="muni-blob muni-blob-3"></div>
      </div>
      
      {/* ═══ HEADER MUNICIPAL ═══ */}
      <header className="muni-header">
        <div className="muni-header-inner">
          <a href="/encombrants" className="logo-block">
            <img src="/encombrant-logo.png" alt="Choisy le Roi Logo" className="muni-logo-img" />
            <div className="muni-title">
              <h1>Choisy-le-Roi</h1>
              <span>Gestion des Encombrants</span>
            </div>
          </a>
          
          <nav className="muni-nav">
            <a href="/encombrants" className="muni-nav-link">
              <ArrowLeft size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline' }} />
              Retour Accueil
            </a>
          </nav>
        </div>
      </header>

      {/* ═══ CITOYEN FORM CONTAINER ═══ */}
      <main className="citoyen-container">
        
        {!success ? (
          <>
            {/* Steps bar */}
            <div className="steps-indicator">
              <div className="steps-indicator-line">
                <div 
                  className="steps-indicator-line-progress" 
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
              </div>
              
              <div className={`step-indicator-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-indicator-number">
                  {step > 1 ? <Check size={16} /> : 1}
                </div>
                <div className="step-indicator-label">Mes Informations</div>
              </div>
              
              <div className={`step-indicator-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-indicator-number">
                  {step > 2 ? <Check size={16} /> : 2}
                </div>
                <div className="step-indicator-label">Mes Objets</div>
              </div>
              
              <div className={`step-indicator-item ${step >= 3 ? 'active' : ''}`}>
                <div className="step-indicator-number">3</div>
                <div className="step-indicator-label">Photo & Envoi</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* ÉTAPE 1 : FORMULAIRE D'IDENTITÉ & D'ADRESSE */}
              {step === 1 && (
                <div className="muni-form-card animate-fade-in">
                  <h2>
                    <User size={24} />
                    Vos informations personnelles
                  </h2>
                  <p className="muni-form-card-subtitle">
                    Ces informations nous permettent de vous recontacter et de localiser la collecte. Le service est exclusivement réservé aux résidents de Choisy-le-Roi.
                  </p>
                  
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="fullName">Nom complet</label>
                      <input 
                        type="text" 
                        id="fullName" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Jean Dupont" 
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="phone">Numéro de téléphone</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 06 12 34 56 78" 
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-field" style={{ marginBottom: '24px' }}>
                    <label htmlFor="email">Adresse e-mail</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: jean.dupont@email.com" 
                      className="form-input" 
                      required 
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: '24px' }}>
                    <label htmlFor="address">Adresse de collecte (Choisy-le-Roi uniquement)</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        id="address" 
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if(e.target.value === '') {
                            setSuggestions([]);
                          }
                        }}
                        onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Saisissez votre rue à Choisy-le-Roi..." 
                        className="form-input" 
                        required 
                      />
                      <MapPin size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-muted)' }} />
                      
                      {addressLoading && (
                        <div style={{ position: 'absolute', right: '40px', top: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Recherche...
                        </div>
                      )}
                    </div>
                    
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="autocomplete-dropdown">
                        {suggestions.map((item, idx) => (
                          <li 
                            key={idx} 
                            onClick={() => selectAddress(item)}
                            className="autocomplete-item"
                          >
                            <MapPin size={14} style={{ color: 'var(--municipal-blue)' }} />
                            <span>{item.properties.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <span style={{ fontSize: '0.8rem', color: address.includes('94600') ? 'var(--eco-green-hover)' : 'var(--text-muted)' }}>
                      {address.includes('94600') 
                        ? '✓ Adresse valide à Choisy-le-Roi' 
                        : 'Saisissez votre adresse. Les suggestions de l\'API Adresse sont automatiquement filtrées sur Choisy-le-Roi (94600).'}
                    </span>
                  </div>

                  <div className="form-field" style={{ marginBottom: '32px' }}>
                    <label htmlFor="selectedDate">Date de ramassage (Uniquement le mercredi, 3 prochaines semaines)</label>
                    <select
                      id="selectedDate"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Sélectionnez un mercredi...</option>
                      {wednesdays.map((wDate) => (
                        <option key={wDate} value={wDate}>
                          {formatDateFrench(wDate)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-actions-row">
                    <div></div>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="btn-muni-primary"
                    >
                      Continuer
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : SÉLECTION DES ENCOMBRANTS PAR CATÉGORIE */}
              {step === 2 && (
                <div className="muni-form-card animate-fade-in">
                  <h2>
                    <FileText size={24} />
                    Sélection des objets
                  </h2>
                  <p className="muni-form-card-subtitle">
                    Sélectionnez les quantités pour chaque objet à ramasser. Vous devez déclarer au moins un objet pour continuer.
                  </p>

                  {/* Catégorie 1 : Mobilier */}
                  <div className="category-block">
                    <div className="category-header">
                      <img src="/family-mobilier-saas.png" alt="Mobilier" className="category-img" />
                      <div className="category-title-info">
                        <h3>Mobilier</h3>
                        <span>Matelas, armoires, lits, tables, fauteuils...</span>
                      </div>
                    </div>
                    <div className="items-selection-grid">
                      {items.mobilier.map(item => (
                        <div key={item.id} className={`item-counter-card ${item.qty > 0 ? 'selected' : ''}`}>
                          <div className="item-name-desc">
                            <span className="item-name">{item.name}</span>
                            <span className="item-desc">{item.desc}</span>
                          </div>
                          <div className="counter-controls">
                            <button 
                              type="button" 
                              onClick={() => updateQty('mobilier', item.id, -1)}
                              disabled={item.qty === 0}
                              className="btn-counter"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="counter-value">{item.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQty('mobilier', item.id, 1)}
                              className="btn-counter"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catégorie 2 : Électroménager */}
                  <div className="category-block">
                    <div className="category-header">
                      <img src="/family-electro-saas.png" alt="Électroménager" className="category-img" />
                      <div className="category-title-info">
                        <h3>Électroménager</h3>
                        <span>Frigos, machines à laver, fours, télévisions...</span>
                      </div>
                    </div>
                    <div className="items-selection-grid">
                      {items.electro.map(item => (
                        <div key={item.id} className={`item-counter-card ${item.qty > 0 ? 'selected' : ''}`}>
                          <div className="item-name-desc">
                            <span className="item-name">{item.name}</span>
                            <span className="item-desc">{item.desc}</span>
                          </div>
                          <div className="counter-controls">
                            <button 
                              type="button" 
                              onClick={() => updateQty('electro', item.id, -1)}
                              disabled={item.qty === 0}
                              className="btn-counter"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="counter-value">{item.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQty('electro', item.id, 1)}
                              className="btn-counter"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catégorie 3 : Jardin & Loisirs */}
                  <div className="category-block">
                    <div className="category-header">
                      <img src="/family-loisirs-saas.png" alt="Jardin & Loisirs" className="category-img" />
                      <div className="category-title-info">
                        <h3>Jardin & Loisirs</h3>
                        <span>Vélos, mobilier de jardin, outillage non motorisé...</span>
                      </div>
                    </div>
                    <div className="items-selection-grid">
                      {items.loisirs.map(item => (
                        <div key={item.id} className={`item-counter-card ${item.qty > 0 ? 'selected' : ''}`}>
                          <div className="item-name-desc">
                            <span className="item-name">{item.name}</span>
                            <span className="item-desc">{item.desc}</span>
                          </div>
                          <div className="counter-controls">
                            <button 
                              type="button" 
                              onClick={() => updateQty('loisirs', item.id, -1)}
                              disabled={item.qty === 0}
                              className="btn-counter"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="counter-value">{item.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQty('loisirs', item.id, 1)}
                              className="btn-counter"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catégorie 4 : Divers */}
                  <div className="category-block">
                    <div className="category-header">
                      <img src="/family-divers-saas.png" alt="Divers & Bois" className="category-img" />
                      <div className="category-title-info">
                        <h3>Divers & Bois</h3>
                        <span>Cartons pliés, palettes, ferrailles, planches...</span>
                      </div>
                    </div>
                    <div className="items-selection-grid">
                      {items.divers.map(item => (
                        <div key={item.id} className={`item-counter-card ${item.qty > 0 ? 'selected' : ''}`}>
                          <div className="item-name-desc">
                            <span className="item-name">{item.name}</span>
                            <span className="item-desc">{item.desc}</span>
                          </div>
                          <div className="counter-controls">
                            <button 
                              type="button" 
                              onClick={() => updateQty('divers', item.id, -1)}
                              disabled={item.qty === 0}
                              className="btn-counter"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="counter-value">{item.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQty('divers', item.id, 1)}
                              className="btn-counter"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      className="btn-muni-secondary"
                    >
                      Retour
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="btn-muni-primary"
                    >
                      Continuer
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : AJOUT D'UNE PHOTO & VALIDATION */}
              {step === 3 && (
                <div className="muni-form-card animate-fade-in">
                  <h2>
                    <Upload size={24} />
                    Téléverser une photo & validation
                  </h2>
                  <p className="muni-form-card-subtitle">
                    Ajoutez une photo des objets déposés (facultatif mais fortement recommandé si un doute persiste sur leur acceptabilité).
                  </p>

                  {/* Dropzone */}
                  <div 
                    onClick={() => document.getElementById('photo-input')?.click()}
                    className="photo-dropzone"
                  >
                    <Upload size={40} />
                    <p>Glissez-déposez une image ici ou cliquez pour parcourir</p>
                    <span>Formats acceptés : PNG, JPG, JPEG (Max. 5 Mo)</span>
                    <input 
                      type="file" 
                      id="photo-input" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }} 
                    />
                  </div>

                  {photoName && (
                    <div className="file-preview-box">
                      <div className="file-preview-info">
                        <CheckCircle2 size={16} style={{ color: 'var(--eco-green)' }} />
                        <strong>{photoName}</strong>
                      </div>
                      <button 
                        type="button" 
                        onClick={removePhoto}
                        className="btn-remove-file"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}

                  {/* Recap de la demande */}
                  <div className="summary-box" style={{ marginTop: '32px' }}>
                    <h3>Résumé de votre demande</h3>
                    <div className="summary-row">
                      <span>Demandeur :</span>
                      <strong>{fullName}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Adresse d'enlèvement :</span>
                      <strong>{address}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Téléphone :</span>
                      <strong>{phone}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Date de ramassage choisie :</span>
                      <strong style={{ color: 'var(--municipal-blue)' }}>{formatDateFrench(selectedDate)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Total d'objets déclarés :</span>
                      <strong>{getTotalQty()} objet(s)</strong>
                    </div>
                  </div>

                  {/* Liste des déchets INTERDITS */}
                  <div className="danger-panel">
                    <div className="danger-panel-header">
                      <AlertTriangle size={20} />
                      <h4>⚠️ Objets non acceptés (Interdits)</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '0', marginBottom: '12px' }}>
                      Ces déchets ne seront **jamais** ramassés par les équipes municipales d'encombrants. Vous devez les déposer en déchèterie :
                    </p>
                    <ul className="danger-list">
                      <li>Gravats, béton, carrelage, briques (déchets de chantier)</li>
                      <li>Produits toxiques (peinture, solvants, engrais, acides)</li>
                      <li>Batteries, piles, ampoules, thermomètres à mercure</li>
                      <li>Pneus, moteurs et pièces détachées de véhicules</li>
                      <li>Amiante sous toutes ses formes</li>
                      <li>Bouteilles de gaz, extincteurs et récipients sous pression</li>
                      <li>Déchets d'activité de soins (seringues, déchets médicaux)</li>
                      <li>Déchets verts et branchages volumineux</li>
                    </ul>
                  </div>

                  {submitError && (
                    <div className="danger-panel" style={{ marginTop: '16px', background: '#fef2f2', border: '1px solid #fecaca', display: 'block' }}>
                      <div className="danger-panel-header">
                        <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                        <h4 style={{ color: '#991b1b', margin: '0 0 0 8px', fontSize: '1rem' }}>Erreur de transmission</h4>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#991b1b', marginTop: '6px', marginBottom: '0', lineHeight: '1.4' }}>
                        {submitError}
                      </p>
                    </div>
                  )}

                  <div className="form-actions-row">
                    <button 
                      type="button" 
                      onClick={handlePrev}
                      disabled={isSubmitting}
                      className="btn-muni-secondary"
                    >
                      Retour
                    </button>
                    <button 
                      type="submit" 
                      disabled={!isStepValid() || isSubmitting}
                      className="btn-muni-primary success"
                    >
                      {isSubmitting ? 'Transmission en cours...' : 'Valider et envoyer'}
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              )}

            </form>
          </>
        ) : (
          
          /* VIEW RÉUSSITE APRÈS SOUMISSION */
          <div className="muni-form-card muni-success-view animate-fade-in">
            <div className="success-icon-badge">
              <CheckCircle2 size={40} />
            </div>
            <h3>Demande enregistrée !</h3>
            <p>
              Votre demande de retrait d'encombrants a bien été transmise aux services municipaux de Choisy-le-Roi. Nos équipes vont planifier la tournée.
            </p>
            
            <div className="success-details-card">
              <div className="success-detail-row">
                <span>Numéro de dossier :</span>
                <strong>{dossierNumber}</strong>
              </div>
              <div className="success-detail-row">
                <span>Statut actuel :</span>
                <strong style={{ color: 'var(--municipal-blue)' }}>En attente de planification</strong>
              </div>
              <div className="success-detail-row">
                <span>Date d'intervention :</span>
                <strong style={{ color: 'var(--eco-green-hover)' }}>{formatDateFrench(selectedDate)}</strong>
              </div>
              <div className="success-detail-row">
                <span>Adresse :</span>
                <span>{address}</span>
              </div>
              <div className="success-detail-row">
                <span>Total d'objets :</span>
                <span>{getTotalQty()} objet(s)</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '24px' }}>
              Un e-mail de confirmation détaillant la date exacte du passage de la benne de collecte vous a été envoyé à l'adresse <strong>{email}</strong>.
            </p>

            <a href="/encombrants" className="btn-muni-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
              Retour à l'accueil
            </a>
          </div>
        )}

      </main>

      {/* ═══ MUNICIPAL FOOTER ═══ */}
      <footer className="muni-footer">
        <div className="muni-footer-inner">
          <div className="footer-logo">
            <img src="/logo.png" alt="XIRH" className="footer-logo-img" />
            <div className="footer-info">
              <strong>Mairie de Choisy-le-Roi</strong><br />
              Place Gabriel Péri, 94600 Choisy-le-Roi<br />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fait avec ❤️ à Choisy-le-Roi
              </span>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="#" className="footer-link">Mentions Légales</a>
            <a href="#" className="footer-link">Données Personnelles</a>
            <a href="#" className="footer-link">Contactez-nous</a>
            <a href="#" className="footer-link">Choisy.fr</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
