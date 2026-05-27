'use client';

import React, { useState } from 'react';
import { 
  Trash2, MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, 
  ChevronRight, Plus, Minus, Upload, Compass, Check, ArrowRight, 
  BarChart3, ShieldCheck, Mail, Send, Award, FileText, User, Truck, Info, Bell, Search
} from 'lucide-react';

// Interfaces
interface RequestData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  items: { [key: string]: number };
  photoName?: string;
  preferredDate: string;
  status: 'Pending' | 'Approved' | 'Scheduled' | 'In progress' | 'Collected' | 'Refused';
  refusalReason?: string;
  adminComment?: string;
  createdAt: string;
  assignedRound?: string;
  coordinates: { x: number; y: number };
}

// Initial Data
const INITIAL_REQUESTS: RequestData[] = [
  {
    id: "CP-94300-1042",
    name: "Thomas Dubois",
    phone: "06 12 34 56 78",
    email: "t.dubois@email.fr",
    address: "12 Avenue de la République, Choisy-le-Roi",
    district: "Centre-Ville",
    items: { "sofa": 1, "chair": 4 },
    photoName: "salon_encombrants.jpg",
    preferredDate: "2026-06-02",
    status: "Pending",
    createdAt: "2026-05-27",
    coordinates: { x: 120, y: 150 }
  },
  {
    id: "CP-94300-0987",
    name: "Sarah Martin",
    phone: "07 98 76 54 32",
    email: "sarah.m@gmail.com",
    address: "45 Rue des Gondoles, Choisy-le-Roi",
    district: "Gondoles Nord",
    items: { "mattress": 2, "wardrobe": 1 },
    photoName: "matelas_trottoir.jpg",
    preferredDate: "2026-06-03",
    status: "Approved",
    createdAt: "2026-05-26",
    assignedRound: "Tournée Nord",
    coordinates: { x: 260, y: 80 }
  },
  {
    id: "CP-94300-0812",
    name: "Marc Lemaire",
    phone: "06 45 89 12 00",
    email: "m.lemaire@yahoo.fr",
    address: "8 Square des Hautes-Formes, Choisy-le-Roi",
    district: "Hautes-Formes",
    items: { "washing_machine": 1, "refrigerator": 1 },
    preferredDate: "2026-06-02",
    status: "Scheduled",
    createdAt: "2026-05-25",
    assignedRound: "Tournée Sud",
    coordinates: { x: 80, y: 280 }
  }
];

const COLLECTIBLE_ITEMS = [
  { id: 'sofa', name: 'Canapé', category: 'furniture', icon: '🛋️' },
  { id: 'mattress', name: 'Matelas', category: 'furniture', icon: '🛏️' },
  { id: 'refrigerator', name: 'Réfrigérateur', category: 'appliances', icon: '❄️' },
  { id: 'washing_machine', name: 'Lave-linge', category: 'appliances', icon: '🧺' },
  { id: 'table', name: 'Table', category: 'furniture', icon: '🪵' },
  { id: 'chair', name: 'Chaise', category: 'furniture', icon: '🪑' }
];

const FORBIDDEN_EXAMPLES = [
  { name: 'Déchets de chantier / Gravats', desc: 'Briques, plâtre, ciment. À déposer en déchèterie.', icon: '🧱' },
  { name: 'Produits toxiques / Chimiques', desc: 'Acides, solvants, bouteilles de gaz, batteries.', icon: '☣️' },
  { name: 'Pots de peinture / Solvants', desc: 'Peintures ménagères ou industrielles.', icon: '🎨' },
  { name: 'Pneus usagés', desc: 'Filière de recyclage automobile obligatoire.', icon: '🛞' }
];

const DISTRICTS = [
  "Centre-Ville",
  "Gondoles Nord",
  "Gondoles Sud",
  "Hautes-Formes",
  "Le Port",
  "Les Flores"
];

export default function ChoisyPropreRedesign() {
  // Navigation active: 'landing' | 'citizen-form' | 'citizen-track' | 'admin' | 'collector' | 'rules'
  const [role, setRole] = useState<'citizen' | 'admin' | 'collector'>('citizen');
  const [view, setView] = useState<'landing' | 'citizen-form' | 'citizen-track' | 'admin' | 'collector' | 'rules'>('landing');
  const [requests, setRequests] = useState<RequestData[]>(INITIAL_REQUESTS);
  
  // États d'alertes
  const [alerts, setAlerts] = useState<Array<{ id: string; text: string; type: 'sms' | 'email'; to: string }>>([
    { id: '1', text: 'Votre demande CP-94300-0987 a été approuvée par la mairie. Passage programmé le 03 Juin.', type: 'sms', to: '07 98 76 54 32' }
  ]);

  // --- CITOYEN STEPPER FORM ---
  const [formStep, setFormStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [preferredDate, setPreferredDate] = useState('');
  const [photo, setPhoto] = useState<{ name: string; size: string } | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lastGeneratedRef, setLastGeneratedRef] = useState('');

  // --- RECHERCHE ET SUIVI CITOYEN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<RequestData | null>(null);

  // --- ADMIN PANEL ---
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('All');
  const [adminFilterDistrict, setAdminFilterDistrict] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'list' | 'map' | 'heatmap'>('list');

  // --- COLLECTEUR MOBILE PANEL ---
  const [activeRound, setActiveRound] = useState('Tournée Nord');
  const [collectorStopIndex, setCollectorStopIndex] = useState(0);
  const [collectorProofAttached, setCollectorProofAttached] = useState(false);

  // --- MODALE SIGNALEMENT SAUVAGE ---
  const [isWildDumpingOpen, setIsWildDumpingOpen] = useState(false);
  const [wildAddress, setWildAddress] = useState('');
  const [wildDesc, setWildDesc] = useState('');

  // --- CALCULATED KPIs & PROPERTIES ---
  const kpiPending = requests.filter(r => r.status === 'Pending').length;
  const kpiToday = requests.filter(r => r.createdAt === new Date().toISOString().split('T')[0]).length;
  const kpiCollected = requests.filter(r => r.status === 'Collected').length;

  const districtDistribution = DISTRICTS.map(dist => ({
    name: dist,
    count: requests.filter(r => r.district === dist).length
  }));

  const roundRequestsTotal = requests.filter(r => r.assignedRound === activeRound).length;
  const roundRequestsCollected = requests.filter(r => r.assignedRound === activeRound && r.status === 'Collected').length;
  const progressPercent = roundRequestsTotal > 0 ? Math.round((roundRequestsCollected / roundRequestsTotal) * 100) : 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' Mo'
      });
    }
  };

  // Helper alertes
  const triggerAlert = (text: string, type: 'sms' | 'email', to: string) => {
    setAlerts(prev => [{ id: Date.now().toString(), text, type, to }, ...prev]);
  };

  // Soumission demande citoyen
  const handleItemQty = (id: string, increment: boolean) => {
    setSelectedItems(prev => {
      const current = prev[id] || 0;
      const next = increment ? current + 1 : Math.max(0, current - 1);
      const updated = { ...prev };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedItems).length === 0) {
      alert("Veuillez sélectionner au moins un encombrant.");
      return;
    }
    const ref = "CP-94300-" + Math.floor(1000 + Math.random() * 9000);
    setLastGeneratedRef(ref);

    const newReq: RequestData = {
      id: ref,
      name: name || "Citoyen",
      phone: phone || "06 00 00 00 00",
      email: email || "email@choisy.fr",
      address: address || "Rue de la République",
      district: district,
      items: selectedItems,
      photoName: photo ? photo.name : undefined,
      preferredDate: preferredDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      coordinates: {
        x: 80 + Math.floor(Math.random() * 200),
        y: 60 + Math.floor(Math.random() * 150)
      }
    };

    setRequests(prev => [newReq, ...prev]);
    triggerAlert(`Votre dossier ${ref} a bien été enregistré. Un agent municipal va l'analyser sous 24h.`, 'sms', newReq.phone);
    triggerAlert(`Nouvel encombrant déclaré à Choisy par ${newReq.name}. Réf : ${ref}.`, 'email', 'proprete@choisyleroi.fr');

    // Reset
    setSelectedItems({});
    setAddress('');
    setPhoto(null);
    setName('');
    setPhone('');
    setEmail('');
    
    setFormStep(5); // Écran de confirmation
  };

  // Action Admin
  const handleAdminApprove = (id: string) => {
    const updated = requests.map(r => {
      if (r.id === id) {
        const round = r.district.includes("Nord") || r.district === "Centre-Ville" ? "Tournée Nord" : "Tournée Sud";
        triggerAlert(`Votre demande ${r.id} est validée ! Collecte prévue le ${r.preferredDate} lors de la ${round}.`, 'sms', r.phone);
        return { ...r, status: 'Scheduled' as const, assignedRound: round, adminComment: adminComment || undefined };
      }
      return r;
    });
    setRequests(updated);
    const updatedReq = updated.find(r => r.id === id);
    if (updatedReq) setSelectedRequest(updatedReq);
    setAdminComment('');
  };

  const handleAdminRefuse = (id: string, reason: string) => {
    if (!reason) return;
    const updated = requests.map(r => {
      if (r.id === id) {
        triggerAlert(`Votre demande de collecte ${r.id} a été refusée. Motif : ${reason}.`, 'email', r.email);
        return { ...r, status: 'Refused' as const, refusalReason: reason, adminComment: adminComment || undefined };
      }
      return r;
    });
    setRequests(updated);
    const updatedReq = updated.find(r => r.id === id);
    if (updatedReq) setSelectedRequest(updatedReq);
    setAdminComment('');
  };

  // Filtrage Admin
  const filteredRequests = requests.filter(r => {
    const matchesStatus = adminFilterStatus === 'All' || r.status === adminFilterStatus;
    const matchesDistrict = adminFilterDistrict === 'All' || r.district === adminFilterDistrict;
    const matchesSearch = r.id.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          r.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          r.address.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesStatus && matchesDistrict && matchesSearch;
  });

  // Tournée collecteur
  const roundRequests = requests.filter(r => r.assignedRound === activeRound && (r.status === 'Scheduled' || r.status === 'In progress'));
  const currentStop = roundRequests[collectorStopIndex];

  const handleCollectorStatus = (status: 'Collected' | 'Absent' | 'Impossible') => {
    if (!currentStop) return;
    const nextStatus: RequestData['status'] = status === 'Collected' ? 'Collected' : 'Refused';
    const comment = status === 'Collected' ? 'Collecté par les agents.' : `Non collecté : ${status === 'Absent' ? 'Résident absent' : 'Dépôt non conforme'}`;

    setRequests(prev => prev.map(r => {
      if (r.id === currentStop.id) {
        triggerAlert(`Votre dépôt ${r.id} a été traité par notre équipe : ${status === 'Collected' ? 'Collecté' : 'Non collecté (' + comment + ')'}.`, 'sms', r.phone);
        return { ...r, status: nextStatus, adminComment: comment };
      }
      return r;
    }));

    setCollectorProofAttached(false);
    if (collectorStopIndex < roundRequests.length - 1) {
      setCollectorStopIndex(prev => prev + 1);
    } else {
      alert("Tournée terminée ! Tous les encombrants ont été traités.");
      setCollectorStopIndex(0);
    }
  };

  return (
    <div 
      className="choisy-redesign-root min-h-screen flex flex-col font-sans relative antialiased" 
      style={{ backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      
      {/* ═══ BARRE DE SIMULATION SMS/MAIL INTÉGRÉE (Très discrète) ═══ */}
      <div className="w-full bg-slate-900 text-slate-350 text-[11px] py-1.5 px-6 flex justify-between items-center z-50 border-b border-slate-950 font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Simulation d'alertes en temps réel</span>
        </div>
        <div className="flex-1 px-8 truncate text-slate-200">
          {alerts.length > 0 ? (
            <span><strong>[{alerts[0].type.toUpperCase()} ➔ {alerts[0].to}] :</strong> {alerts[0].text}</span>
          ) : (
            <span className="text-slate-500">Aucun message envoyé pour le moment.</span>
          )}
        </div>
        <button 
          onClick={() => alert(alerts.map(a => `[${a.type.toUpperCase()}] ${a.to} : ${a.text}`).join('\n\n'))}
          className="text-emerald-400 hover:text-emerald-350 font-bold underline cursor-pointer"
        >
          Alertes ({alerts.length})
        </button>
      </div>

      {/* ═══ HEADER PREMIUM ET AÉRÉ (Style Apple / Vercel) ═══ */}
      <div className="w-full bg-white/80 border-b border-slate-100 py-4 px-8 sticky top-0 z-40 backdrop-blur-md flex justify-between items-center shadow-sm">
        <div 
          onClick={() => setView('landing')} 
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/10 shrink-0 text-white font-bold">
            <Trash2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900 tracking-tight">Mon Choisy Propre</span>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded">CIVIC TECH</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Mairie de Choisy-le-Roi</p>
          </div>
        </div>

        {/* Liens de navigation du Portfolio */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button 
            onClick={() => { setRole('citizen'); setView('landing'); }} 
            className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${(role === 'citizen' && view === 'landing') ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Accueil
          </button>
          <button 
            onClick={() => { setRole('citizen'); setView('rules'); }} 
            className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${(role === 'citizen' && view === 'rules') ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Réglementation
          </button>
          <button 
            onClick={() => { setRole('citizen'); setFormStep(1); setView('citizen-form'); }} 
            className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${(role === 'citizen' && view === 'citizen-form') ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Faire une demande
          </button>
          <button 
            onClick={() => { setRole('citizen'); setTrackedRequest(null); setView('citizen-track'); }} 
            className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${(role === 'citizen' && view === 'citizen-track') ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Suivi
          </button>
          <div className="h-5 w-px bg-slate-200 mx-1"></div>
          <button 
            onClick={() => { setRole('admin'); setAdminActiveSubTab('list'); setSelectedRequest(null); setView('admin'); }} 
            className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${role === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-emerald-700'}`}
          >
            Espace Admin
          </button>
          <button 
            onClick={() => { setRole('collector'); setView('collector'); }} 
            className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${role === 'collector' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-blue-750'}`}
          >
            Chauffeur
          </button>
        </div>
      </div>

      {/* ═══ ZONE DE NOTIFICATION PRINCIPALE (Aérée) ═══ */}
      <div className="flex-1 w-full max-w-6xl mx-auto py-12 px-6 flex flex-col justify-center">

        {/* ──────── 1. LANDING PAGE (Style Apple/Linear) ──────── */}
        {view === 'landing' && (
          <div className="space-y-24 animate-[fadeIn_0.4s_ease-out]">
            {/* HERO SECTION */}
            <div className="flex flex-col lg:flex-row items-center gap-16 py-8">
              <div className="flex-1 text-left space-y-6">
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">
                  🌱 Transition écologique urbaine
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  La propreté de Choisy,<br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-fill-transparent text-emerald-600">à votre portée.</span>
                </h1>
                <p className="text-slate-550 leading-relaxed text-base max-w-xl">
                  Déclarez et planifiez le retrait gratuit de vos encombrants ménagers en moins de deux minutes. Nos services municipaux s'occupent du tri, du réemploi et du recyclage local.
                </p>
                <div className="flex flex-wrap gap-4 pt-3">
                  <button 
                    onClick={() => { setFormStep(1); setView('citizen-form'); }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-md shadow-emerald-600/10 flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
                  >
                    <span>Faire une demande de retrait</span>
                    <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={() => setView('citizen-track')}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-6 py-4 rounded-xl border border-slate-200/80 shadow-sm transition-all cursor-pointer"
                  >
                    Suivre ma demande
                  </button>
                </div>
              </div>

              {/* Illustration minimaliste haut de gamme */}
              <div className="flex-1 w-full max-w-md shrink-0 select-none">
                <div className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-lg relative flex flex-col items-center justify-center">
                  {/* Cadre Logo d'époque municipale soigné */}
                  <div className="w-40 h-40 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center shadow-inner">
                    <img 
                      src="/encombrant-logo.png" 
                      alt="Choisy le Roi" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="text-center mt-6 space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">Mon Choisy Propre</h3>
                    <p className="text-xs text-slate-400">Plateforme Citoyenne Officielle</p>
                  </div>

                  {/* Dessin SVG épuré style Apple */}
                  <div className="w-full h-24 mt-6">
                    <svg className="w-full h-full" viewBox="0 0 200 80">
                      <path d="M 10 70 Q 100 66 190 70" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                      <circle cx="50" cy="50" r="14" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
                      <path d="M 46 50 L 49 53 L 55 47" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                      
                      <circle cx="100" cy="45" r="16" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
                      <path d="M 94 45 L 106 45" stroke="#3b82f6" strokeWidth="2" />
                      
                      <circle cx="150" cy="50" r="14" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5" />
                      <path d="M 148 44 L 148 52 L 154 52" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 ÉTAPES CLAIRES */}
            <div className="space-y-12">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Comment ça marche ?</h2>
                <p className="text-xs text-slate-500">Un service public repensé pour être fluide et respectueux de notre cadre de vie.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: '01', title: 'Déclarer vos objets', desc: 'Indiquez les objets à enlever (maximum 5) et téléchargez des photos en quelques clics.', color: 'border-emerald-100 bg-emerald-50/20 text-emerald-700' },
                  { step: '02', title: 'Valider le rendez-vous', desc: 'La mairie valide votre dossier et programme une tournée de passage devant votre domicile.', color: 'border-blue-100 bg-blue-50/20 text-blue-700' },
                  { step: '03', title: 'Sortie des encombrants', desc: 'Déposez vos encombrants la veille au soir. Nos équipes de collecte les ramassent le lendemain matin.', color: 'border-amber-100 bg-amber-50/20 text-amber-700' }
                ].map(item => (
                  <div key={item.step} className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm text-left relative overflow-hidden space-y-4">
                    <span className="text-4xl font-black text-slate-100 absolute top-4 right-6">{item.step}</span>
                    <h3 className="font-extrabold text-slate-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-550 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION ÉCOLOGIQUE LÉGÈRE */}
            <div className="bg-emerald-50/40 border border-emerald-150 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 text-left">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Award size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-emerald-900 text-sm">Engagement réemploi & économie circulaire</h4>
                <p className="text-xs text-emerald-800/80 leading-relaxed max-w-3xl">
                  Tous les encombrants récoltés à Choisy-le-Roi en bon état sont directement légués à la ressourcerie locale pour être réhabilités. Les métaux et plastiques sont orientés vers les bonnes filières de recyclage matière.
                </p>
              </div>
            </div>

            {/* FOOTER ÉPURÉ */}
            <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
              <p>© 2026 Mairie de Choisy-le-Roi. Plateforme de propreté.</p>
              <div className="flex gap-6 font-bold text-slate-500">
                <button onClick={() => setView('rules')} className="hover:text-emerald-600 transition-colors">Consignes de tri</button>
                <button onClick={() => setIsWildDumpingOpen(true)} className="hover:text-red-500 text-red-500/80 transition-colors font-black">Signaler dépôt sauvage</button>
              </div>
            </div>
          </div>
        )}

        {/* ──────── 2. RULES PAGE (Réglementation) ──────── */}
        {view === 'rules' && (
          <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center max-w-xl mx-auto space-y-4 flex flex-col items-center">
              {/* Illustration de tri SVG minimaliste */}
              <svg className="w-48 h-20" viewBox="0 0 200 80">
                <path d="M 10 70 Q 100 68 190 70" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                <path d="M 20 65 L 50 65 L 50 55 L 45 55 L 45 45 Q 35 45 35 55 L 25 55 L 25 65 Z" fill="#e2fbf0" stroke="#10b981" strokeWidth="2" />
                <circle cx="35" cy="30" r="7" fill="#10b981" />
                <path d="M 32 30 L 34 32 L 38 28" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                
                <polygon points="120,68 140,68 130,50" fill="#fecdd3" stroke="#ef4444" strokeWidth="2" />
                <circle cx="130" cy="30" r="7" fill="#ef4444" />
                <line x1="127" y1="27" x2="133" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="133" y1="27" x2="127" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Règles de collecte municipale</h2>
                <p className="text-xs text-slate-500 mt-1">Seuls les déchets d'origine ménagère non dangereux sont autorisés sur la voie publique.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Objets Autorisés */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6 text-left">
                <h3 className="font-extrabold text-emerald-700 text-sm flex items-center gap-2 border-b border-slate-100 pb-4">
                  <CheckCircle2 size={18} />
                  <span>Objets autorisés (avec déclaration obligatoire)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COLLECTIBLE_ITEMS.map(item => (
                    <div key={item.id} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex gap-3.5 items-center">
                      <span className="text-2xl bg-white p-1 rounded-lg shadow-sm">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-700">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objets Interdits */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6 text-left">
                <h3 className="font-extrabold text-red-650 text-sm flex items-center gap-2 border-b border-slate-100 pb-4">
                  <XCircle size={18} />
                  <span>Déchets interdits (déchèterie obligatoire)</span>
                </h3>
                <div className="space-y-4.5">
                  {FORBIDDEN_EXAMPLES.map(ex => (
                    <div key={ex.name} className="bg-red-50/10 border border-slate-150 p-4 rounded-xl flex gap-4 items-start">
                      <span className="text-2xl">{ex.icon}</span>
                      <div>
                        <span className="text-xs font-extrabold text-red-650 block">{ex.name}</span>
                        <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{ex.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button 
                onClick={() => { setFormStep(1); setView('citizen-form'); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-md cursor-pointer"
              >
                Commencer ma déclaration
              </button>
            </div>
          </div>
        )}

        {/* ──────── 3. CITIZEN STEPPER FORM (Formulaire citoyen par étape) ──────── */}
        {view === 'citizen-form' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Indicateur d'étape minimaliste */}
            {formStep < 5 && (
              <div className="space-y-4 select-none">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-400">
                  <span className={formStep >= 1 ? "text-emerald-600" : ""}>1. Adresse</span>
                  <span className={formStep >= 2 ? "text-emerald-600" : ""}>2. Objets</span>
                  <span className={formStep >= 3 ? "text-emerald-600" : ""}>3. Justificatif</span>
                  <span className={formStep >= 4 ? "text-emerald-600" : ""}>4. Date</span>
                </div>
                <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-350"
                    style={{ width: `${(formStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-3xl shadow-md text-left">
              
              {/* ÉTAPE 1 : ADRESSE */}
              {formStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800">Où se situe le dépôt d'encombrants ?</h2>
                    <p className="text-xs text-slate-400">Saisissez l'adresse de votre foyer à Choisy-le-Roi.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="ex : 12 Avenue de la République" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-slate-50 border border-slate-200 pl-10 text-xs py-3.5 rounded-xl font-medium focus:bg-white"
                      />
                      <MapPin size={16} className="absolute left-3.5 top-4 text-slate-450" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Quartier</label>
                        <select 
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-3 px-3.5 rounded-xl font-bold"
                        >
                          {DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase">Ville</label>
                        <input 
                          type="text" 
                          disabled 
                          value="Choisy-le-Roi (94)" 
                          className="bg-slate-100 border border-slate-200 text-xs py-3 px-3.5 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Carte SVG minimaliste de Choisy */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl h-36 relative overflow-hidden flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 300 150">
                        <path d="M 0 50 Q 80 40 120 70 T 300 60" fill="none" stroke="#2563eb" strokeWidth="8" />
                        <path d="M 60 0 L 80 150" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                        <path d="M 120 0 L 150 150" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                        <circle cx="160" cy="80" r="8" fill="#10b981" />
                      </svg>
                      <div className="relative text-center z-10 space-y-1">
                        <MapPin className="text-emerald-600 mx-auto animate-bounce" size={18} />
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Géolocalisation vérifiée</span>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px] block">{address || "Entrez une adresse..."}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="button" 
                      onClick={() => { if (address) setFormStep(2); else alert("Veuillez saisir votre adresse."); }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Continuer</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : OBJETS */}
              {formStep === 2 && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800">Quels objets souhaitez-vous faire enlever ?</h2>
                    <p className="text-xs text-slate-400">Sélectionnez les quantités (limité à 5 objets au total par demande).</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLLECTIBLE_ITEMS.map(item => {
                      const qty = selectedItems[item.id] || 0;
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-4 rounded-xl hover:bg-white hover:border-emerald-300 transition-all shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-white p-2 rounded-lg border border-slate-200 shadow-sm">{item.icon}</span>
                            <div>
                              <span className="font-extrabold text-slate-700 text-xs block">{item.name}</span>
                              <span className="text-[9px] text-slate-400 capitalize">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <button 
                              type="button"
                              onClick={() => handleItemQty(item.id, false)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-650 flex items-center justify-center cursor-pointer"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="font-bold text-xs text-slate-800 w-5 text-center">{qty}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const total = Object.values(selectedItems).reduce((a, b) => a + b, 0);
                                if (total >= 5) {
                                  alert("La limite municipale est de 5 encombrants par demande.");
                                  return;
                                }
                                handleItemQty(item.id, true);
                              }}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-650 flex items-center justify-center cursor-pointer"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-6 py-3.5 rounded-xl cursor-pointer"
                    >
                      Retour
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const total = Object.values(selectedItems).reduce((a, b) => a + b, 0);
                        if (total > 0) setFormStep(3);
                        else alert("Veuillez sélectionner au moins un encombrant.");
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Continuer</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : PHOTO */}
              {formStep === 3 && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800">Ajouter une photo justificative</h2>
                    <p className="text-xs text-slate-400">Cette photo permet aux équipes techniques de Choisy de calibrer la taille du camion de collecte.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 text-center hover:bg-slate-100/50 transition-colors">
                    <input 
                      type="file" 
                      id="file-photo" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <label htmlFor="file-photo" className="cursor-pointer flex flex-col items-center gap-3">
                      <Upload className="text-slate-400" size={28} />
                      <span className="text-xs font-bold text-slate-700">Parcourir ou déposer votre fichier ici</span>
                      <span className="text-[10px] text-slate-400">Formats acceptés : JPG, PNG (Max 5 Mo)</span>
                    </label>
                    {photo && (
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2 rounded-xl text-xs inline-flex items-center gap-2 font-bold shadow-sm">
                        <Check size={14} />
                        <span>{photo.name} ({photo.size})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-6 py-3.5 rounded-xl cursor-pointer"
                    >
                      Retour
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(4)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Passer à la date</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : DATE & CONTACT */}
              {formStep === 4 && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800">Date et coordonnées de contact</h2>
                    <p className="text-xs text-slate-400">Sélectionnez la date de passage souhaitée et vos informations de contact.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">DATE DE RETRAIT SOUHAITÉE</label>
                        <input 
                          type="date" 
                          required
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-3 px-3.5 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">NOM COMPLET</label>
                        <input 
                          type="text" 
                          required
                          placeholder="ex : Thomas Dubois" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-3 px-3.5 rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">NUMÉRO MOBILE (POUR NOTIFICATIONS)</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="ex : 06 12 34 56 78" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-3 px-3.5 rounded-xl font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">ADRESSE E-MAIL</label>
                        <input 
                          type="email" 
                          required
                          placeholder="ex : t.dubois@email.fr" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-3 px-3.5 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(3)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-6 py-3.5 rounded-xl cursor-pointer"
                    >
                      Retour
                    </button>
                    <button 
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Send size={14} />
                      <span>Envoyer la demande</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 5 : CONFIRMATION */}
              {formStep === 5 && (
                <div className="text-center py-8 space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800">Demande enregistrée avec succès !</h2>
                    <p className="text-xs text-slate-400">Le dossier est en attente d'instruction par les services municipaux.</p>
                  </div>

                  <div className="bg-slate-55 border border-slate-200/80 p-5 rounded-2xl max-w-sm mx-auto">
                    <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">VOTRE RÉFÉRENCE DE SUIVI</span>
                    <strong className="text-2xl font-black text-emerald-600 tracking-wider block mt-1.5">{lastGeneratedRef}</strong>
                    <span className="text-[9px] text-slate-500 block mt-2">Conservez précieusement ce code pour suivre la collecte.</span>
                  </div>

                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Un SMS de confirmation a été envoyé à votre mobile. Les agents municipaux vont instruire votre demande sous 24 heures.
                  </p>

                  <div className="flex gap-4 max-w-xs mx-auto pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setSearchQuery(lastGeneratedRef); setTrackedRequest(requests.find(r => r.id === lastGeneratedRef) || null); setView('citizen-track'); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-sm cursor-pointer"
                    >
                      Suivre en direct
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setView('landing')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-3 rounded-xl text-xs border border-slate-200 cursor-pointer"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}

        {/* ──────── 4. CITIZEN TRACK (Suivi citoyen dashboard) ──────── */}
        {view === 'citizen-track' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out] text-left">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Suivi de votre collecte</h2>
              <p className="text-xs text-slate-500">Visualisez en temps réel l'avancée et la validation de votre dossier.</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="ex : CP-94300-1042" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 pl-10 text-xs py-3 rounded-xl font-bold tracking-widest uppercase focus:bg-white"
                />
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
              <button 
                onClick={() => {
                  const found = requests.find(r => r.id.toLowerCase() === searchQuery.trim().toLowerCase());
                  setTrackedRequest(found || null);
                  if (!found) alert("Dossier introuvable. Essayez avec CP-94300-1042");
                }}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer shrink-0"
              >
                Rechercher la demande
              </button>
            </div>

            {trackedRequest ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Timeline de statut */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-8">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded">RÉFÉRENCE DOSSIER</span>
                      <h3 className="text-lg font-black text-slate-800 mt-2">{trackedRequest.id}</h3>
                    </div>
                    <span className={`badge ${
                      trackedRequest.status === 'Pending' ? 'badge-warning' :
                      trackedRequest.status === 'Refused' ? 'badge-danger' : 'badge-success'
                    }`}>
                      {trackedRequest.status}
                    </span>
                  </div>

                  {/* Ligne d'avancement Linear-style */}
                  <div className="space-y-6">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Avancée logistique</span>
                    
                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-3">
                      {[
                        { name: 'Dossier créé', desc: 'Vos encombrants ont été enregistrés dans la base municipale.', step: 'Pending' },
                        { name: 'Approuvé par la Mairie', desc: 'La mairie a validé la liste des encombrants.', step: 'Approved' },
                        { name: 'Planifié dans la tournée', desc: 'Un camion benne a été affecté pour le ramassage.', step: 'Scheduled' },
                        { name: 'Collecte effectuée', desc: 'Les objets ont été enlevés par l\'équipe de propreté.', step: 'Collected' }
                      ].map((st, idx) => {
                        const isDone = trackedRequest.status !== 'Refused' && (
                          trackedRequest.status === st.step ||
                          (idx === 0) ||
                          (idx === 1 && ['Approved', 'Scheduled', 'In progress', 'Collected'].includes(trackedRequest.status)) ||
                          (idx === 2 && ['Scheduled', 'In progress', 'Collected'].includes(trackedRequest.status)) ||
                          (idx === 3 && trackedRequest.status === 'Collected')
                        );

                        return (
                          <div key={st.name} className="relative">
                            <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 bg-white ${isDone ? 'border-emerald-500' : 'border-slate-200'}`}></span>
                            <div className="space-y-1 pl-3">
                              <h4 className={`text-xs font-extrabold ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>{st.name}</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{st.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Résumé de la demande à droite */}
                <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6 text-xs font-medium">
                  <h4 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Détails de collecte</h4>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase mb-1">Adresse de retrait</span>
                      <p className="text-slate-700 font-bold">{trackedRequest.address}</p>
                      <p className="text-slate-450">{trackedRequest.district}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase mb-1.5">Objets à enlever</span>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 space-y-1.5">
                        {Object.entries(trackedRequest.items).map(([itemId, qty]) => {
                          const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center font-bold text-slate-650 text-[11px]">
                              <span>{itemDef ? itemDef.name : itemId}</span>
                              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">x{qty}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {trackedRequest.assignedRound && (
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase mb-1">Équipe logistique</span>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full font-bold text-[10px] inline-block">{trackedRequest.assignedRound}</span>
                      </div>
                    )}

                    {trackedRequest.refusalReason && (
                      <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl font-bold">
                        <strong>Motif de refus :</strong> {trackedRequest.refusalReason}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
                <svg className="w-24 h-24 text-slate-200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="50" cy="50" r="30" />
                  <line x1="71" y1="71" x2="88" y2="88" strokeWidth="3" />
                </svg>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-800 text-sm">Prêt pour la recherche</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">Veuillez saisir votre référence municipale en haut pour afficher l'avancée de votre retrait.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────── 5. ESPACE ADMINISTRATEUR (Stripe/Linear-like Dashboard) ──────── */}
        {view === 'admin' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">Console logistique de Choisy</span>
                <h2 className="text-2xl font-black text-slate-850 mt-2.5">Dashboard d'Instruction</h2>
              </div>

              {/* Sub tabs */}
              <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl shadow-inner select-none">
                <button 
                  onClick={() => setAdminActiveSubTab('list')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminActiveSubTab === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Dossiers reçus
                </button>
                <button 
                  onClick={() => setAdminActiveSubTab('map')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminActiveSubTab === 'map' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Carte des points
                </button>
                <button 
                  onClick={() => setAdminActiveSubTab('heatmap')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminActiveSubTab === 'heatmap' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Heatmap
                </button>
              </div>
            </div>

            {/* KPIs Large */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Demandes à valider', value: kpiPending, color: 'text-amber-600', note: 'Objectif de traitement : < 24h' },
                { label: 'Nouvelles demandes (24h)', value: kpiToday, color: 'text-blue-600', note: 'Volume stable' },
                { label: 'Camions en tournée', value: '2', color: 'text-emerald-600', note: 'Nord et Sud de Choisy' },
                { label: 'Collectes terminées (mois)', value: kpiCollected + 140, color: 'text-slate-800', note: '98% de réussite' }
              ].map(k => (
                <div key={k.label} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">{k.label}</span>
                  <div className={`text-3xl font-black ${k.color}`}>{k.value}</div>
                  <span className="text-[10px] text-slate-500 font-medium block pt-1.5">{k.note}</span>
                </div>
              ))}
            </div>

            {/* Sub view: List */}
            {adminActiveSubTab === 'list' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Liste des demandes */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Filtres Stripe-like */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Rechercher nom, réf, adresse..." 
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="bg-slate-50 border border-slate-200 pl-8 text-xs py-2 w-48 rounded-lg"
                        />
                        <Search size={12} className="absolute left-2.5 top-3 text-slate-400" />
                      </div>

                      <select 
                        value={adminFilterStatus}
                        onChange={(e) => setAdminFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs py-2 px-2.5 rounded-lg w-auto font-bold"
                      >
                        <option value="All">Tous statuts</option>
                        <option value="Pending">À valider</option>
                        <option value="Approved">Approuvé</option>
                        <option value="Scheduled">Planifié</option>
                        <option value="Collected">Collecté</option>
                        <option value="Refused">Refusé</option>
                      </select>

                      <select 
                        value={adminFilterDistrict}
                        onChange={(e) => setAdminFilterDistrict(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs py-2 px-2.5 rounded-lg w-auto font-bold"
                      >
                        <option value="All">Tous quartiers</option>
                        {DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs text-slate-400 font-bold">{filteredRequests.length} requêtes</span>
                  </div>

                  {/* Tableau Linear-like */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="table-container">
                      <table className="text-xs">
                        <thead>
                          <tr className="bg-slate-50/40">
                            <th>Dossier</th>
                            <th>Citoyen / Adresse</th>
                            <th>Quartier</th>
                            <th>Date souhaitée</th>
                            <th>Objets</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequests.map(r => {
                            const totalQty = Object.values(r.items).reduce((a, b) => a + b, 0);
                            return (
                              <tr 
                                key={r.id} 
                                onClick={() => setSelectedRequest(r)}
                                className={`cursor-pointer transition-colors hover:bg-slate-50/40 ${selectedRequest?.id === r.id ? 'bg-emerald-50/30' : ''}`}
                              >
                                <td className="font-extrabold text-slate-800 tracking-wider">{r.id}</td>
                                <td>
                                  <span className="font-bold text-slate-700 block">{r.name}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">{r.address}</span>
                                </td>
                                <td className="font-semibold text-slate-650">{r.district}</td>
                                <td className="font-bold text-slate-700">{r.preferredDate}</td>
                                <td>
                                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-600">
                                    {totalQty} objets
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    r.status === 'Pending' ? 'badge-warning' :
                                    r.status === 'Refused' ? 'badge-danger' : 'badge-success'
                                  }`}>
                                    {r.status === 'Pending' ? 'En attente' :
                                     r.status === 'Approved' ? 'Validé' :
                                     r.status === 'Scheduled' ? 'Planifié' :
                                     r.status === 'In progress' ? 'En cours' :
                                     r.status === 'Collected' ? 'Collecté' : 'Refusé'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Tiroir d'instruction à droite */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-fit space-y-6">
                  {selectedRequest ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block">INSTRUCTION MUNICIPALE</span>
                          <h4 className="text-base font-black text-slate-800 mt-1">{selectedRequest.id}</h4>
                        </div>
                        <span className={`badge ${
                          selectedRequest.status === 'Pending' ? 'badge-warning' :
                          selectedRequest.status === 'Refused' ? 'badge-danger' : 'badge-success'
                        }`}>
                          {selectedRequest.status}
                        </span>
                      </div>

                      {/* Liste objets */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">Encombrants déclarés</span>
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1.5">
                          {Object.entries(selectedRequest.items).map(([itemId, qty]) => {
                            const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                            return (
                              <div key={itemId} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                <span>{itemDef ? itemDef.name : itemId}</span>
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800">x{qty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Infos citoyen */}
                      <div className="space-y-2 text-xs font-semibold text-slate-650">
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Coordonnées</span>
                        <p><span className="text-slate-450">Nom :</span> {selectedRequest.name}</p>
                        <p><span className="text-slate-450">Tél :</span> {selectedRequest.phone}</p>
                        <p><span className="text-slate-450">Adresse :</span> {selectedRequest.address}</p>
                        <p><span className="text-slate-450">Quartier :</span> {selectedRequest.district}</p>
                      </div>

                      {/* Action buttons */}
                      {selectedRequest.status === 'Pending' ? (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-extrabold block uppercase">Consignes pour l'équipe (facultatif)</label>
                            <textarea 
                              placeholder="ex : Déposer sous le porche..."
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-xs h-16 py-2 px-3 rounded-lg font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => handleAdminApprove(selectedRequest.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-sm cursor-pointer"
                            >
                              Valider le retrait
                            </button>
                            <button 
                              onClick={() => {
                                const reason = prompt("Indiquez la raison du refus (ex: Déchets de chantiers interdits) :");
                                if (reason) handleAdminRefuse(selectedRequest.id, reason);
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs font-semibold text-slate-700">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Résumé de décision</span>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date d'action :</span>
                            <span>{selectedRequest.createdAt}</span>
                          </div>
                          {selectedRequest.assignedRound && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tournée affectée :</span>
                              <span className="text-emerald-700">{selectedRequest.assignedRound}</span>
                            </div>
                          )}
                          {selectedRequest.refusalReason && (
                            <div className="text-red-600 mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
                              <strong>Motif de refus :</strong> {selectedRequest.refusalReason}
                            </div>
                          )}
                          {selectedRequest.adminComment && (
                            <div className="text-slate-600 mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
                              <strong>Note interne :</strong> {selectedRequest.adminComment}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs space-y-4 flex flex-col items-center">
                      <svg className="w-20 h-20 text-slate-200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10,20 L40,20 L50,30 L90,30 L90,85 L10,85 Z" fill="#f8fafc" />
                        <path d="M15,40 L85,40 L85,80 L15,80 Z" fill="#ffffff" />
                        <line x1="25" y1="50" x2="75" y2="50" />
                        <circle cx="75" cy="70" r="8" fill="#eefdf4" stroke="#10b981" />
                      </svg>
                      <span>Sélectionnez un dossier à gauche pour l'instruire.</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Sub view: Map */}
            {adminActiveSubTab === 'map' && (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Plan de situation de Choisy-le-Roi</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Visualisation géographique en temps réel des demandes.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Carte SVG Blanche et propre */}
                  <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl h-96 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      {/* Seine */}
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#dbeafe" strokeWidth="24" strokeLinecap="round" />
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
                      
                      {/* Rues */}
                      <path d="M 50 0 Q 120 150 80 300" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      <path d="M 250 0 L 290 300" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      
                      {/* Marqueurs */}
                      {requests.map(req => {
                        const x = req.coordinates.x * 1.5;
                        const y = req.coordinates.y * 0.9;
                        const isSelected = selectedRequest?.id === req.id;
                        return (
                          <g key={req.id} onClick={() => setSelectedRequest(req)} className="cursor-pointer">
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 9 : 6} 
                              fill={req.status === 'Pending' ? '#f59e0b' : req.status === 'Refused' ? '#ef4444' : '#10b981'}
                              className="transition-all"
                            />
                            {isSelected && <circle cx={x} cy={y} r={14} fill="none" stroke="#475569" strokeWidth="1.5" />}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                    {selectedRequest ? (
                      <div className="space-y-4 text-xs">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Dossier sélectionné</span>
                        <p className="font-extrabold text-slate-800 text-sm">{selectedRequest.id}</p>
                        <p className="text-slate-650"><span className="text-slate-450 font-bold">Citoyen :</span> {selectedRequest.name}</p>
                        <p className="text-slate-650"><span className="text-slate-450 font-bold">Adresse :</span> {selectedRequest.address}</p>
                        <p className="text-slate-650"><span className="text-slate-450 font-bold">Quartier :</span> {selectedRequest.district}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400 font-bold text-center py-12 text-xs">Cliquez sur un marqueur.</p>
                    )}

                    <button 
                      onClick={() => setAdminActiveSubTab('list')}
                      className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-extrabold text-xs shadow-sm hover:bg-slate-100 cursor-pointer"
                    >
                      Retour à la liste
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub view: Heatmap */}
            {adminActiveSubTab === 'heatmap' && (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Analyse de charge géographique</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Visualisez les zones générant le plus grand volume d'encombrants.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Heatmap interactive SVG */}
                  <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl h-96 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#dbeafe" strokeWidth="24" opacity="0.4" />
                      
                      <circle cx="160" cy="140" r="50" fill="url(#heat-red)" />
                      <circle cx="280" cy="90" r="40" fill="url(#heat-yellow)" />
                      <circle cx="90" cy="240" r="60" fill="url(#heat-green)" />
                      
                      <defs>
                        <radialGradient id="heat-red">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heat-yellow">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heat-green">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 text-xs font-medium">
                    <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Volume par quartier</h5>
                    <div className="space-y-3">
                      {districtDistribution.map(item => {
                        const maxVal = Math.max(...districtDistribution.map(d => d.count), 1);
                        const pct = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span>{item.name}</span>
                              <span>{item.count} demandes</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────── 6. ESPACE COLLECTEUR (Uber-Style Mobile Interface) ──────── */}
        {role === 'collector' && (
          <div className="max-w-md mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Simulation de mobile claire et moderne */}
            <div className="bg-white border-8 border-slate-850 rounded-[40px] overflow-hidden shadow-xl relative">
              <div className="bg-slate-850 h-5 w-32 mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 block"></span>
              </div>

              {/* Écran */}
              <div className="p-4 pt-8 bg-slate-50 min-h-[580px] flex flex-col justify-between text-xs space-y-4">
                
                {/* Top header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-55 border border-emerald-100 flex items-center justify-center text-emerald-700">
                      <Truck size={14} />
                    </div>
                    <div className="text-left font-semibold">
                      <h4 className="text-slate-800 text-[11px]">Équipe Propreté 94</h4>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Benne #12</p>
                    </div>
                  </div>

                  <select 
                    value={activeRound}
                    onChange={(e) => { setActiveRound(e.target.value); setCollectorStopIndex(0); }}
                    className="bg-white border border-slate-200 text-[10px] py-1 px-1.5 w-32 rounded-lg font-extrabold cursor-pointer"
                  >
                    <option value="Tournée Nord">Tournée Nord</option>
                    <option value="Tournée Sud">Tournée Sud</option>
                  </select>
                </div>

                {/* Camion filling rate */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-700">
                    <span>REMPLISSAGE DU CAMION BENNE</span>
                    <span className="text-amber-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-350"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Stop details */}
                {currentStop ? (
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-left relative overflow-hidden">
                    <span className="absolute top-0 right-0 bg-amber-500 text-white font-black px-3 py-1 rounded-bl-xl text-[9px] uppercase tracking-wider">
                      Arrêt en cours
                    </span>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Adresse du retrait</span>
                      <h5 className="font-black text-slate-850 text-sm leading-snug">{currentStop.address}</h5>
                      <span className="text-[10px] text-emerald-600 font-bold block">{currentStop.district}</span>
                    </div>

                    {/* Liste objets */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Objets à enlever</span>
                      <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-1.5">
                        {Object.entries(currentStop.items).map(([itemId, qty]) => {
                          const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center text-[10px] font-bold text-slate-750">
                              <span>{itemDef ? itemDef.name : itemId}</span>
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-black">x{qty}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Guidage GPS dessiné */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start">
                      <Compass className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                      <p className="text-[10px] text-emerald-800 leading-normal font-medium">
                        Prendre **Avenue de la République** à droite, puis rouler sur 300m. Le dépôt est situé face au numéro 12 sur le trottoir.
                      </p>
                    </div>

                    {/* Preuve photo */}
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Preuve d'arrêt (Recommandé)</label>
                      <button 
                        type="button"
                        onClick={() => {
                          setCollectorProofAttached(true);
                          alert("Photo de preuve enregistrée.");
                        }}
                        className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-700 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-bold"
                      >
                        <Upload size={12} className="text-slate-400" />
                        <span>{collectorProofAttached ? "Photo enregistrée (1 file)" : "Prendre une photo"}</span>
                      </button>
                    </div>

                    {/* Actions de validation */}
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3.5">
                      <button 
                        onClick={() => handleCollectorStatus('Collected')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl text-[10px] transition-colors cursor-pointer shadow-sm"
                      >
                        Collecté
                      </button>
                      <button 
                        onClick={() => handleCollectorStatus('Absent')}
                        className="bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 font-extrabold py-3.5 rounded-xl text-[10px] transition-colors cursor-pointer"
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => {
                          if (!collectorProofAttached) {
                            alert("Veuillez joindre une photo pour justifier le refus.");
                            return;
                          }
                          handleCollectorStatus('Impossible');
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-250 font-extrabold py-3.5 rounded-xl text-[9px] transition-colors cursor-pointer"
                      >
                        Impossible
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-4 my-auto flex flex-col items-center">
                    <svg className="w-24 h-24" viewBox="0 0 100 100">
                      <rect x="15" y="15" width="70" height="70" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                      <path d="M 25 70 L 45 40 L 75 30" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 2" />
                      <circle cx="25" cy="70" r="5" fill="#10b981" />
                      <circle cx="45" cy="40" r="5" fill="#10b981" />
                      <circle cx="75" cy="30" r="6" fill="#10b981" />
                      <circle cx="75" cy="75" r="16" fill="#10b981" />
                      <path d="M 69 75 L 73 79 L 81 71" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">Tournée terminée !</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Tous les points de collecte de votre feuille de route ont été visités avec succès.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Home iPhone button */}
              <div className="bg-slate-200 h-1.5 w-28 mx-auto rounded-full my-2.5"></div>
            </div>
          </div>
        )}

      </div>

      {/* ═══ MODALE DE SIGNALEMENT DE DÉPÔT SAUVAGE CITOYEN ═══ */}
      {isWildDumpingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (wildAddress) {
                triggerAlert(`Dépôt sauvage signalé au ${wildAddress}. Brigade verte alertée.`, 'email', 'brigade-verte@choisy.fr');
                alert("Signalement envoyé avec succès ! Merci de participer à la propreté de Choisy-le-Roi.");
                setIsWildDumpingOpen(false);
                setWildAddress('');
                setWildDesc('');
              }
            }}
            className="bg-white border border-slate-250 rounded-3xl p-8 max-w-md w-full space-y-6 animate-[fadeIn_0.2s_ease-out] text-left text-xs font-semibold"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-850 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />
                <span>Signaler un dépôt sauvage</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setIsWildDumpingOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-extrabold cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <p className="text-slate-550 leading-relaxed">
              Un dépôt sauvage pollue l'espace public de Choisy-le-Roi ? Indiquez l'emplacement précis. La brigade verte interviendra d'ici 2h pour l'enlever.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold block mb-1">LOCALISATION DU DÉPÔT</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex : Face au 18 Rue d'Orves, Choisy-le-Roi" 
                  value={wildAddress}
                  onChange={(e) => setWildAddress(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold block mb-1">DESCRIPTION DU SIGNALEMENT (OPTIONNEL)</label>
                <textarea 
                  placeholder="ex : Gravats de briques, matelas déchirés..." 
                  value={wildDesc}
                  onChange={(e) => setWildDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs h-20 py-2 px-3 rounded-lg font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-650 hover:bg-red-600 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
            >
              Envoyer le signalement à la brigade
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
