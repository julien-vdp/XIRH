'use client';

import React, { useState } from 'react';
import { 
  Trash2, MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, 
  ChevronRight, Plus, Minus, Upload, Compass, Check, ArrowRight, 
  BarChart3, ShieldCheck, Mail, Send, Award, FileText, User, Truck, Info, Bell, Search,
  TrendingUp, RefreshCw, Layers, CheckSquare, X, Play, Map
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
  { 
    id: 'sofa', 
    name: 'Canapé', 
    category: 'Mobilier', 
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 stroke-[1.5]">
        <rect x="8" y="32" width="48" height="18" rx="4" fill="#F0F9FF" stroke="#2563EB"/>
        <rect x="12" y="22" width="40" height="12" rx="4" fill="#FFFFFF" stroke="#2563EB"/>
        <rect x="4" y="26" width="6" height="20" rx="3" fill="#F0F9FF" stroke="#2563EB"/>
        <rect x="54" y="26" width="6" height="20" rx="3" fill="#F0F9FF" stroke="#2563EB"/>
        <line x1="16" y1="50" x2="16" y2="56" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
        <line x1="48" y1="50" x2="48" y2="56" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ) 
  },
  { 
    id: 'mattress', 
    name: 'Matelas', 
    category: 'Mobilier', 
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 stroke-[1.5]">
        <rect x="8" y="16" width="48" height="32" rx="6" fill="#F0FDF4" stroke="#10B981"/>
        <line x1="8" y1="24" x2="56" y2="24" stroke="#10B981" strokeDasharray="3 3"/>
        <line x1="8" y1="32" x2="56" y2="32" stroke="#10B981" strokeDasharray="3 3"/>
        <line x1="8" y1="40" x2="56" y2="40" stroke="#10B981" strokeDasharray="3 3"/>
        <circle cx="20" cy="20" r="1" fill="#10B981"/>
        <circle cx="32" cy="20" r="1" fill="#10B981"/>
        <circle cx="44" cy="20" r="1" fill="#10B981"/>
        <circle cx="20" cy="28" r="1" fill="#10B981"/>
        <circle cx="32" cy="28" r="1" fill="#10B981"/>
        <circle cx="44" cy="28" r="1" fill="#10B981"/>
      </svg>
    ) 
  },
  { 
    id: 'refrigerator', 
    name: 'Réfrigérateur', 
    category: 'Électroménager', 
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 stroke-[1.5]">
        <rect x="18" y="6" width="28" height="52" rx="6" fill="#ECFDF5" stroke="#059669"/>
        <line x1="18" y1="24" x2="46" y2="24" stroke="#059669" strokeWidth="1.5"/>
        <rect x="40" y="12" width="2" height="8" rx="1" fill="#059669"/>
        <rect x="40" y="30" width="2" height="12" rx="1" fill="#059669"/>
      </svg>
    ) 
  },
  { 
    id: 'washing_machine', 
    name: 'Lave-linge', 
    category: 'Électroménager', 
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 stroke-[1.5]">
        <rect x="12" y="10" width="40" height="44" rx="6" fill="#F0F9FF" stroke="#2563EB"/>
        <circle cx="32" cy="34" r="12" fill="#FFFFFF" stroke="#2563EB"/>
        <circle cx="32" cy="34" r="7" fill="#EFF6FF" stroke="#2563EB"/>
        <circle cx="20" cy="18" r="1.5" fill="#2563EB"/>
        <circle cx="26" cy="18" r="1.5" fill="#2563EB"/>
        <line x1="36" y1="18" x2="44" y2="18" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ) 
  },
  { 
    id: 'table', 
    name: 'Table', 
    category: 'Mobilier', 
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 stroke-[1.5]">
        <path d="M6 24 L58 24 L52 28 L12 28 Z" fill="#FFFBEB" stroke="#D97706"/>
        <line x1="14" y1="28" x2="14" y2="52" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="28" x2="50" y2="52" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="28" x2="24" y2="48" stroke="#D97706" strokeLinecap="round"/>
        <line x1="44" y1="28" x2="40" y2="48" stroke="#D97706" strokeLinecap="round"/>
      </svg>
    ) 
  },
  { 
    id: 'chair', 
    name: 'Chaise', 
    category: 'Mobilier', 
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 stroke-[1.5]">
        <rect x="20" y="32" width="24" height="4" rx="1" fill="#FFFBEB" stroke="#D97706"/>
        <path d="M22 16 L42 16 L42 32 L22 32 Z" fill="#FFFFFF" stroke="#D97706"/>
        <line x1="24" y1="36" x2="24" y2="56" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="36" x2="40" y2="56" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ) 
  }
];

const FORBIDDEN_EXAMPLES = [
  { name: 'Déchets de chantier / Gravats', desc: 'Briques, plâtre, ciment. À déposer en déchèterie.', icon: '🧱' },
  { name: 'Produits toxiques / Chimiques', desc: 'Acides, solvants, bouteilles de gaz, batteries.', icon: '☣' },
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
    { id: '1', text: 'Votre demande CP-94300-0987 a été approuvée par la mairie. Passage programmé le 03 Juin.', type: 'sms', to: '07 98 76 54 32' },
    { id: '2', text: 'Dépôt sauvage signalé Rue d\'Orves. Brigade verte notifiée.', type: 'email', to: 'brigade.verte@choisy.fr' }
  ]);
  const [activeNotification, setActiveNotification] = useState<{ type: string; text: string } | null>(null);

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

  // Helper alertes avec notification "Dynamic Island"
  const triggerAlert = (text: string, type: 'sms' | 'email', to: string) => {
    const newAlert = { id: Date.now().toString(), text, type, to };
    setAlerts(prev => [newAlert, ...prev]);
    setActiveNotification({ type, text });
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
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
  const roundRequests = requests.filter(r => r.assignedRound === activeRound && (r.status === 'Scheduled' || r.status === 'In progress' || r.status === 'Approved'));
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
      style={{ backgroundColor: '#FCFCFD', color: '#0F172A', fontFamily: '"Inter", "Geist", system-ui, sans-serif' }}
    >
      
      {/* ═══ IOS DYNAMIC ISLAND / NOTIFICATION BANNER ═══ */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 ease-out">
        {activeNotification ? (
          <div className="bg-[#0b2146] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 max-w-lg animate-[fadeInDown_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <span className="h-2 w-2 rounded-full bg-[#00D182] animate-pulse"></span>
            <div className="text-xs">
              <span className="font-extrabold uppercase text-[#00D182] mr-2">[{activeNotification.type}]</span>
              <span className="font-medium text-slate-200">{activeNotification.text}</span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => alert(alerts.map(a => `[${a.type.toUpperCase()}] ${a.to} : ${a.text}`).join('\n\n'))}
            className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white text-[10px] py-1.5 px-4 rounded-full flex items-center gap-2 cursor-pointer shadow-md hover:bg-slate-900 border border-slate-800 transition-all active:scale-95"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-slate-350">Simulateur d'alertes ({alerts.length})</span>
          </div>
        )}
      </div>

      {/* ═══ HEADER PREMIUM / VERCEL STYLE ═══ */}
      <header className="w-full bg-white/80 border-b border-slate-200/50 py-5 sticky top-0 z-50 backdrop-blur-2xl">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo Minimaliste */}
          <div 
            onClick={() => { setView('landing'); setRole('citizen'); }} 
            className="flex items-center gap-4 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:shadow-md group-hover:border-slate-300">
              <svg viewBox="0 0 64 64" fill="none" className="w-6 h-6">
                <path d="M12 32 C12 20 20 12 32 12 C44 12 52 20 52 32" stroke="#0F2C59" strokeWidth="6" strokeLinecap="round"/>
                <path d="M12 32 C12 44 20 52 32 52 C44 52 52 44 52 32" stroke="#00D182" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 8"/>
                <circle cx="32" cy="32" r="6" fill="#2563EB"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#0F2C59] tracking-tight">Mon Choisy Propre</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">BETA</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">Plateforme logistique urbaine</p>
            </div>
          </div>

          {/* Premium Navigation menu */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
            <button 
              onClick={() => { setRole('citizen'); setView('landing'); }} 
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'landing') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              Accueil
            </button>
            <button 
              onClick={() => { setRole('citizen'); setView('rules'); }} 
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'rules') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              Consignes
            </button>
            <button 
              onClick={() => { setRole('citizen'); setFormStep(1); setView('citizen-form'); }} 
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'citizen-form') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              Déclarer
            </button>
            <button 
              onClick={() => { setRole('citizen'); setTrackedRequest(null); setView('citizen-track'); }} 
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'citizen-track') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              Suivi
            </button>
            <div className="h-5 w-px bg-slate-300 mx-2"></div>
            <button 
              onClick={() => { setRole('admin'); setAdminActiveSubTab('list'); setSelectedRequest(null); setView('admin'); }} 
              className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all cursor-pointer ${role === 'admin' ? 'bg-[#0F2C59] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              Console Admin
            </button>
            <button 
              onClick={() => { setRole('collector'); setView('collector'); }} 
              className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all cursor-pointer ${role === 'collector' ? 'bg-[#00D182] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              Terminal Flotte
            </button>
          </nav>
        </div>
      </header>

      {/* ═══ CONTENT AREA ═══ */}
      <main className="flex-1 w-full flex flex-col justify-start">

        {/* ──────── 1. LANDING PAGE PREMIUM (DESKTOP FIRST) ──────── */}
        {view === 'landing' && (
          <div className="w-full space-y-32 pb-32">
            
            {/* HERO SECTION */}
            <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-20 md:pt-32 flex flex-col xl:flex-row items-center gap-20 relative">
              {/* Background ambient light */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-100/40 via-blue-50/20 to-transparent rounded-full filter blur-[120px] pointer-events-none -z-10"></div>
              
              {/* Colonne Gauche : Copywriting Impactant */}
              <div className="flex-1 text-left space-y-10 z-10 max-w-3xl">
                <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Infrastructure active</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl lg:text-[84px] font-black text-[#0F2C59] leading-[1.05] tracking-tighter">
                  La propreté urbaine <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F2C59] via-[#2563EB] to-[#00D182]">intelligente.</span>
                </h1>
                
                <p className="text-slate-500 leading-relaxed text-lg md:text-xl font-medium max-w-2xl">
                  Pilotez l'enlèvement de vos encombrants via la nouvelle plateforme logistique de Choisy-le-Roi. Un service public gratuit, rapide et orienté vers l'économie circulaire.
                </p>
                
                <div className="flex flex-wrap gap-5 pt-4">
                  <button 
                    onClick={() => { setFormStep(1); setView('citizen-form'); }}
                    className="bg-[#0F2C59] hover:bg-[#1e3e78] text-white font-bold text-base px-10 py-5 rounded-2xl shadow-xl shadow-blue-900/10 flex items-center gap-3 transition-all hover:-translate-y-1"
                  >
                    <span>Planifier un retrait</span>
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => setView('citizen-track')}
                    className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-10 py-5 rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center gap-3"
                  >
                    <Search size={18} className="text-slate-400" />
                    <span>Suivre ma demande</span>
                  </button>
                </div>
              </div>

              {/* Colonne Droite : Visualisation Dashboard (PAS DE MOCKUP IPHONE) */}
              <div className="flex-1 w-full relative z-10 hidden lg:block">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-[40px] filter blur-xl transform translate-y-4"></div>
                
                {/* Main Dashboard Card */}
                <div className="relative w-full h-[540px] bg-white border border-slate-200 rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
                  {/* Fake UI Header */}
                  <div className="h-16 border-b border-slate-100 flex items-center px-8 gap-4 bg-slate-50/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 h-8 rounded-full flex items-center px-4">
                      <Search size={14} className="text-slate-300" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">MA</div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="flex-1 flex">
                    {/* Sidebar */}
                    <div className="w-48 border-r border-slate-100 p-6 flex flex-col gap-4 bg-slate-50/30">
                      <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
                      <div className="h-8 bg-slate-100 rounded-lg w-3/4"></div>
                      <div className="h-8 bg-slate-100 rounded-lg w-5/6"></div>
                      <div className="mt-auto h-24 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-slate-100 p-4">
                         <div className="text-[10px] font-bold text-slate-400 mb-1">TAUX RECYCLAGE</div>
                         <div className="text-2xl font-black text-emerald-600">84%</div>
                      </div>
                    </div>
                    {/* Main Area: Map & Real-time Tracking */}
                    <div className="flex-1 p-6 relative bg-[#FAFAFA]">
                      <div className="absolute inset-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Map SVG */}
                        <svg className="w-full h-full opacity-60" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
                          <path d="M -50 200 Q 150 150 300 250 T 650 100" fill="none" stroke="#DBEAFE" strokeWidth="40" strokeLinecap="round" />
                          <path d="M 100 0 L 150 400 M 300 0 L 250 400 M 500 0 L 500 400" stroke="#F1F5F9" strokeWidth="4" />
                          <path d="M 0 100 L 600 150 M 0 300 L 600 250" stroke="#F1F5F9" strokeWidth="4" />
                          {/* Route line */}
                          <path d="M 150 250 L 250 150 L 500 200" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
                          {/* Points */}
                          <circle cx="150" cy="250" r="8" fill="#10B981" />
                          <circle cx="250" cy="150" r="8" fill="#10B981" />
                          <circle cx="500" cy="200" r="8" fill="#F59E0B" />
                          {/* Moving truck */}
                          <g transform="translate(375, 175)">
                            <circle cx="0" cy="0" r="20" fill="#2563EB" fillOpacity="0.1" className="animate-pulse" />
                            <circle cx="0" cy="0" r="10" fill="#2563EB" />
                            <path d="M -4 -3 L 4 -3 L 4 3 L -4 3 Z" fill="white" />
                          </g>
                        </svg>
                        
                        {/* Floating Glassmorphic Stats Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                          <div className="flex-1 bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 rounded-xl shadow-lg">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tournée Active</span>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Truck size={14} />
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-800">Équipe Nord</div>
                                <div className="text-[10px] font-medium text-slate-500">Arrivée est. 14min</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 rounded-xl shadow-lg">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">État Collecte</span>
                            <div className="text-2xl font-black text-[#0F2C59]">45/60</div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                              <div className="bg-[#00D182] h-full rounded-full w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute -right-8 top-20 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{animationDuration: '4s'}}>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">Dossier Validé</div>
                    <div className="text-[10px] text-slate-500">Il y a 2 min</div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION COMMENT CA MARCHE - HORIZONTALE ET RESPIRENTE */}
            <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
              <div className="text-left md:text-center max-w-2xl mx-auto space-y-6 mb-20">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F2C59] tracking-tighter">
                  Trois étapes. <br/> <span className="text-slate-400">Zéro contrainte.</span>
                </h2>
              </div>

              {/* 3 Grandes étapes en grille BENTO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Déclaration simplifiée",
                    desc: "Sélectionnez vos objets, ajoutez une photo, et laissez notre système analyser la charge logistique requise instantanément.",
                    icon: (
                      <svg viewBox="0 0 200 120" className="w-full h-32 opacity-90 transition-transform duration-500 group-hover:scale-105">
                        <rect x="20" y="20" width="160" height="80" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2"/>
                        <circle cx="50" cy="40" r="6" fill="#EF4444"/>
                        <circle cx="70" cy="40" r="6" fill="#F59E0B"/>
                        <circle cx="90" cy="40" r="6" fill="#10B981"/>
                        <rect x="40" y="65" width="80" height="8" rx="4" fill="#CBD5E1"/>
                        <rect x="40" y="80" width="120" height="8" rx="4" fill="#E2E8F0"/>
                        <circle cx="150" cy="50" r="18" fill="#E0F2FE"/>
                        <path d="M144 50 L148 54 L156 46" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    )
                  },
                  {
                    step: "02",
                    title: "Validation automatique",
                    desc: "La mairie approuve votre dossier en quelques heures. Une tournée optimisée est assignée selon votre quartier.",
                    icon: (
                      <svg viewBox="0 0 200 120" className="w-full h-32 opacity-90 transition-transform duration-500 group-hover:scale-105">
                        <circle cx="100" cy="60" r="45" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="6 6"/>
                        <circle cx="100" cy="60" r="32" fill="#F0FDF4" stroke="#10B981" strokeWidth="1.5"/>
                        <path d="M90 60 L97 67 L112 52" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="140" cy="30" r="4" fill="#2563EB" className="animate-ping"/>
                        <circle cx="60" cy="90" r="4" fill="#F59E0B" className="animate-pulse"/>
                      </svg>
                    )
                  },
                  {
                    step: "03",
                    title: "Collecte & Revalorisation",
                    desc: "Les équipes municipales interviennent à la date prévue. Vos objets sont orientés vers les filières de recyclage adaptées.",
                    icon: (
                      <svg viewBox="0 0 200 120" className="w-full h-32 opacity-90 transition-transform duration-500 group-hover:scale-105">
                        <path d="M 10 90 Q 100 80 190 90" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round"/>
                        <rect x="50" y="45" width="80" height="36" rx="8" fill="#0F2C59"/>
                        <rect x="115" y="38" width="30" height="43" rx="8" fill="#2563EB"/>
                        <circle cx="75" cy="85" r="10" fill="#1E293B"/>
                        <circle cx="75" cy="85" r="4" fill="#F8FAFC"/>
                        <circle cx="125" cy="85" r="10" fill="#1E293B"/>
                        <circle cx="125" cy="85" r="4" fill="#F8FAFC"/>
                        <path d="M 60 55 L 80 55" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M 60 65 L 100 65" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )
                  }
                ].map((item, idx) => (
                  <div key={item.step} className="group relative bg-white border border-slate-200/60 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                    <div className="absolute -right-4 -top-6 text-[120px] font-black text-slate-50/50 select-none pointer-events-none group-hover:text-blue-50/30 transition-colors">
                      {item.step}
                    </div>
                    
                    <div className="mb-10 relative z-10 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                      {item.icon}
                    </div>

                    <div className="space-y-3 relative z-10">
                      <h3 className="font-black text-[#0F2C59] text-xl md:text-2xl">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION ECOLOGIQUE - PREMIUM BRANDING */}
            <section className="w-full bg-[#0F2C59] py-32 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2563EB]/20 rounded-full filter blur-[100px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00D182]/10 rounded-full filter blur-[100px] pointer-events-none"></div>
              
              <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                {/* Stats & Textes */}
                <div className="text-left space-y-10">
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase">Économie Circulaire</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tighter">
                    Rien ne se perd.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Tout se transforme.</span>
                  </h2>
                  <p className="text-blue-100 leading-relaxed text-lg font-medium max-w-xl">
                    À Choisy-le-Roi, notre circuit logistique court redirige chaque objet vers la ressourcerie locale ou le centre de tri approprié. Une démarche transparente et mesurable.
                  </p>

                  <div className="grid grid-cols-2 gap-8 pt-6">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[32px] space-y-2">
                      <strong className="text-5xl font-black text-emerald-400">84%</strong>
                      <span className="text-xs text-blue-200 font-bold block uppercase tracking-wider mt-2">Réemployé ou recyclé</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[32px] space-y-2">
                      <strong className="text-5xl font-black text-blue-400">2.4 T</strong>
                      <span className="text-xs text-blue-200 font-bold block uppercase tracking-wider mt-2">CO2 évité par mois</span>
                    </div>
                  </div>
                </div>

                {/* SVG Infographie Circular Economy (PREMIUM) */}
                <div className="flex justify-center relative">
                  <div className="w-full max-w-lg aspect-square relative">
                    <svg viewBox="0 0 400 400" className="w-full h-full animate-[spin_60s_linear_infinite]">
                      {/* Outer Rings */}
                      <circle cx="200" cy="200" r="160" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeDasharray="4 8" />
                      <circle cx="200" cy="200" r="160" fill="none" stroke="#34D399" strokeWidth="4" strokeDasharray="250 800" strokeLinecap="round" />
                      <circle cx="200" cy="200" r="120" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 12" />
                      <circle cx="200" cy="200" r="120" fill="none" stroke="#60A5FA" strokeWidth="4" strokeDasharray="150 500" strokeDashoffset="100" strokeLinecap="round" />
                    </svg>
                    
                    {/* Center Core */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 bg-[#0b2146]/50 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-center shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-md"></div>
                        <RefreshCw size={48} className="text-emerald-400 mb-4" />
                        <span className="text-sm font-black text-white tracking-widest uppercase">Cycle</span>
                        <span className="text-[10px] font-bold text-blue-300 tracking-wider">CONTINU</span>
                      </div>
                    </div>
                    
                    {/* Floating Nodes */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div> Collecte
                    </div>
                    <div className="absolute bottom-16 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Tri Sélectif
                    </div>
                    <div className="absolute bottom-16 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-300"></div> Réemploi
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA FOOTER */}
            <div className="w-full max-w-5xl mx-auto px-8 py-12 text-center space-y-6">
              <h3 className="text-2xl font-black text-[#0F2C59]">Prêt à participer à la transition écologique ?</h3>
              <p className="text-slate-500 text-xs font-medium max-w-md mx-auto">Déclarez vos objets encombrants dès maintenant. C'est rapide, conforme et entièrement gratuit.</p>
              <button 
                onClick={() => { setFormStep(1); setView('citizen-form'); }}
                className="bg-[#00D182] hover:bg-[#00B871] text-white font-extrabold text-xs px-8 py-5 rounded-2xl shadow-xl shadow-emerald-500/10 cursor-pointer"
              >
                Planifier un retrait gratuit
              </button>
              
              <div className="flex justify-center gap-6 text-[11px] font-bold text-slate-450 pt-8 border-t border-slate-100">
                <button onClick={() => setView('rules')} className="hover:text-[#2563EB] transition-colors">Consignes d'acceptation</button>
                <span className="text-slate-300">•</span>
                <button onClick={() => setIsWildDumpingOpen(true)} className="text-red-500 hover:text-red-650 transition-colors font-extrabold">Signaler un dépôt sauvage</button>
              </div>
            </div>

          </div>
        )}

        {/* ──────── 2. RULES PAGE (Réglementation) ──────── */}
        {view === 'rules' && (
          <div className="max-w-6xl mx-auto px-8 py-16 space-y-16 animate-[fadeIn_0.3s_ease-out] text-left">
            <div className="text-left space-y-3">
              <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full inline-block">
                Consignes Officielles
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Règles d'acceptation des déchets</h2>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-2xl">
                Afin de préserver la sécurité de nos agents et de respecter les réglementations écologiques, seuls les objets d'origine ménagère suivants sont pris en charge.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Objets Autorisés */}
              <div className="bg-white border border-slate-200/70 p-10 rounded-3xl shadow-sm space-y-8">
                <h3 className="font-extrabold text-[#00D182] text-sm flex items-center gap-3 border-b border-slate-100 pb-4">
                  <CheckCircle2 size={18} />
                  <span>Dépôts autorisés (avec déclaration)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COLLECTIBLE_ITEMS.map(item => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex gap-3.5 items-center">
                      <span className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">{item.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{item.name}</span>
                        <span className="text-[9px] text-slate-400 capitalize">{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objets Interdits */}
              <div className="bg-white border border-slate-200/70 p-10 rounded-3xl shadow-sm space-y-8">
                <h3 className="font-extrabold text-red-500 text-sm flex items-center gap-3 border-b border-slate-100 pb-4">
                  <XCircle size={18} />
                  <span>Dépôts formellement interdits (déchèterie)</span>
                </h3>
                <div className="space-y-4">
                  {FORBIDDEN_EXAMPLES.map(ex => (
                    <div key={ex.name} className="bg-slate-50/50 border border-slate-200/50 p-4.5 rounded-2xl flex gap-4 items-start">
                      <span className="text-2xl">{ex.icon}</span>
                      <div>
                        <span className="text-xs font-extrabold text-red-700 block">{ex.name}</span>
                        <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{ex.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
              <button 
                onClick={() => { setFormStep(1); setView('citizen-form'); }}
                className="bg-[#00D182] hover:bg-[#00B871] text-white font-extrabold text-xs px-8 py-5 rounded-2xl shadow-xl shadow-emerald-500/10 cursor-pointer"
              >
                Commencer ma déclaration de dépôt
              </button>
            </div>
          </div>
        )}

        {/* ──────── 3. CITIZEN STEPPER FORM (Formulaire citoyen onboarding) ──────── */}
        {view === 'citizen-form' && (
          <div className="w-full bg-[#FAFAFA] min-h-[calc(100vh-80px)] py-16">
            <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-12 animate-[fadeIn_0.3s_ease-out]">
              
              {/* Stepper tracker elegant (Linear/Stripe style) */}
              {formStep < 5 && (
                <div className="space-y-6 max-w-3xl mx-auto select-none">
                  <div className="flex justify-between items-center relative">
                    {/* Background line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10"></div>
                    {/* Active line */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#0F2C59] -z-10 transition-all duration-500 ease-out"
                      style={{ width: `${((formStep - 1) / 3) * 100}%` }}
                    ></div>
                    
                    {[
                      { step: 1, label: "Localisation" },
                      { step: 2, label: "Encombrants" },
                      { step: 3, label: "Justificatif" },
                      { step: 4, label: "Coordonnées" }
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm ${
                          formStep > s.step ? 'bg-[#00D182] text-white ring-4 ring-emerald-50' :
                          formStep === s.step ? 'bg-[#0F2C59] text-white ring-4 ring-blue-50' : 
                          'bg-white text-slate-400 border border-slate-200'
                        }`}>
                          {formStep > s.step ? <Check size={14} strokeWidth={3} /> : s.step}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${formStep >= s.step ? 'text-[#0F2C59]' : 'text-slate-400'}`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200/80 p-10 md:p-16 rounded-[40px] shadow-2xl shadow-slate-200/40 text-left max-w-4xl mx-auto relative overflow-hidden">
                {/* Decorative corner blur */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full filter blur-[80px] pointer-events-none"></div>

                {/* ÉTAPE 1 : ADRESSE */}
                {formStep === 1 && (
                  <div className="space-y-10 relative z-10">
                    <div className="space-y-3">
                      <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Où se situe le dépôt ?</h2>
                      <p className="text-sm text-slate-500 font-medium">L'adresse nous permet de déterminer le circuit logistique et l'équipe assignée.</p>
                    </div>

                    <div className="space-y-8">
                      <div className="relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Adresse précise</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex : 12 Avenue de la République" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 pl-14 text-sm py-5 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all shadow-inner"
                        />
                        <MapPin size={20} className="absolute left-5 top-[52px] text-slate-400 group-focus-within:text-[#2563EB] transition-colors" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quartier Logistique</label>
                          <div className="relative">
                            <select 
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-sm py-5 px-5 rounded-2xl font-bold text-slate-800 outline-none cursor-pointer focus:bg-white focus:ring-4 focus:ring-blue-50 appearance-none shadow-inner"
                            >
                              {DISTRICTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronRight className="rotate-90" size={16} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Code Postal & Ville</label>
                          <input 
                            type="text" 
                            disabled 
                            value="94300, Choisy-le-Roi" 
                            className="w-full bg-slate-100 border border-slate-200 text-sm py-5 px-5 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-8 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => { if (address) setFormStep(2); else alert("Veuillez saisir votre adresse."); }}
                        className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-sm px-10 py-5 rounded-2xl flex items-center gap-3 cursor-pointer shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-1"
                      >
                        <span>Continuer vers les objets</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : OBJETS */}
                {formStep === 2 && (
                  <div className="space-y-10 relative z-10">
                    <div className="space-y-3">
                      <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Sélection des objets</h2>
                      <p className="text-sm text-slate-500 font-medium">Déclarez les volumes afin que nous puissions dimensionner la benne de collecte.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {COLLECTIBLE_ITEMS.map(item => {
                        const qty = selectedItems[item.id] || 0;
                        return (
                          <div 
                            key={item.id} 
                            className={`flex flex-col bg-slate-50/50 border rounded-[24px] p-6 transition-all duration-300 ${qty > 0 ? 'border-[#00D182] bg-emerald-50/20 shadow-md ring-4 ring-emerald-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-4 mb-6">
                              <span className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-8 h-8' })}
                              </span>
                              <div>
                                <span className="font-black text-slate-800 text-sm block">{item.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2 mt-auto">
                              <button 
                                type="button"
                                onClick={() => handleItemQty(item.id, false)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${qty > 0 ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
                                disabled={qty === 0}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-black text-lg text-[#0F2C59] w-8 text-center">{qty}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  const total = Object.values(selectedItems).reduce((a, b) => a + b, 0);
                                  if (total >= 5) {
                                    alert("La limite réglementaire est de 5 encombrants par demande.");
                                    return;
                                  }
                                  handleItemQty(item.id, true);
                                }}
                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between pt-8 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setFormStep(1)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-8 py-5 rounded-2xl cursor-pointer transition-colors"
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
                        className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-sm px-10 py-5 rounded-2xl flex items-center gap-3 cursor-pointer shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-1"
                      >
                        <span>Valider le volume</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : PHOTO */}
                {formStep === 3 && (
                  <div className="space-y-10 relative z-10">
                    <div className="space-y-3">
                      <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Contrôle visuel</h2>
                      <p className="text-sm text-slate-500 font-medium">Fournissez une photographie claire du dépôt afin de valider la nature des objets.</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-16 bg-slate-50 text-center hover:bg-slate-100/50 hover:border-[#2563EB] transition-all relative group cursor-pointer">
                      <input 
                        type="file" 
                        id="file-photo" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <label htmlFor="file-photo" className="cursor-pointer flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <Upload className="text-[#2563EB]" size={28} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-lg font-black text-slate-800 block">Uploadez la photographie</span>
                          <span className="text-xs text-slate-400 block font-bold uppercase tracking-widest">PNG, JPG ou HEIC (Max 5 Mo)</span>
                        </div>
                      </label>
                    </div>

                    {photo && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl text-sm flex items-center gap-4 font-bold shadow-sm animate-[fadeIn_0.3s_ease-out]">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Check size={16} className="text-emerald-600" />
                        </div>
                        <span className="flex-1 truncate">{photo.name}</span>
                        <span className="text-emerald-600 opacity-70 text-xs">{photo.size}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-8 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setFormStep(2)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-8 py-5 rounded-2xl cursor-pointer transition-colors"
                      >
                        Retour
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormStep(4)}
                        className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold text-sm px-10 py-5 rounded-2xl flex items-center gap-3 cursor-pointer shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-1"
                      >
                        <span>Continuer</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 4 : CONTACT */}
                {formStep === 4 && (
                  <div className="space-y-10 relative z-10">
                    <div className="space-y-3">
                      <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Détails finaux</h2>
                      <p className="text-sm text-slate-500 font-medium">Indiquez la date de passage souhaitée et vos coordonnées pour le suivi.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Jour de collecte</label>
                          <input 
                            type="date" 
                            required
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-sm py-5 px-5 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-inner"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Nom Complet</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ex : Thomas Dubois" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-sm py-5 px-5 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Téléphone Mobile</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="Ex : 06 12 34 56 78" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-sm py-5 px-5 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-inner"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Adresse E-mail</label>
                          <input 
                            type="email" 
                            required
                            placeholder="Ex : t.dubois@email.fr" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-sm py-5 px-5 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => setFormStep(3)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-8 py-5 rounded-2xl cursor-pointer transition-colors"
                      >
                        Retour
                      </button>
                      <button 
                        type="submit"
                        className="bg-[#00D182] hover:bg-[#00B871] text-white font-bold text-sm px-10 py-5 rounded-2xl flex items-center gap-3 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1"
                      >
                        <Send size={16} />
                        <span>Transmettre la demande</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 5 : CONFIRMATION (Premium) */}
                {formStep === 5 && (
                  <div className="text-center py-16 space-y-10 relative z-10 animate-[fadeIn_0.5s_ease-out]">
                    <div className="w-24 h-24 rounded-full bg-[#00D182] text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                      <CheckCircle2 size={48} strokeWidth={2.5} />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Dossier Transmis</h2>
                      <p className="text-base text-slate-500 font-medium max-w-lg mx-auto">Votre demande de collecte a été envoyée avec succès. Elle sera traitée par l'administration dans les prochaines heures.</p>
                    </div>

                    <div className="bg-[#F8FAFC] border border-slate-200 p-8 rounded-[32px] max-w-md mx-auto shadow-inner">
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-widest mb-3">Référence Unique Logistique</span>
                      <strong className="text-4xl font-black text-[#2563EB] tracking-tighter block">{lastGeneratedRef}</strong>
                    </div>

                    <div className="flex justify-center gap-6 pt-8 border-t border-slate-100 max-w-xl mx-auto">
                      <button 
                        type="button" 
                        onClick={() => setView('landing')}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-5 rounded-2xl text-sm border border-slate-200 cursor-pointer transition-all"
                      >
                        Retour à l'accueil
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setSearchQuery(lastGeneratedRef); setTrackedRequest(requests.find(r => r.id === lastGeneratedRef) || null); setView('citizen-track'); }}
                        className="flex-1 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-bold py-5 rounded-2xl text-sm shadow-xl shadow-blue-900/10 cursor-pointer transition-all hover:-translate-y-1"
                      >
                        Accéder au suivi
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ──────── 4. CITIZEN TRACK (Suivi citoyen) ──────── */}
        {view === 'citizen-track' && (
          <div className="w-full bg-[#FCFCFD] min-h-[calc(100vh-80px)] py-20">
            <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-16 animate-[fadeIn_0.3s_ease-out]">
              
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-black text-[#0F2C59] tracking-tighter">Console de Suivi</h2>
                <p className="text-slate-500 text-base font-medium leading-relaxed">Suivez l'état logistique de votre demande en temps réel grâce à notre intégration avec les camions de collecte.</p>
              </div>

              {/* Barre de recherche premium */}
              <div className="bg-white border border-slate-200 p-3 rounded-[32px] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between max-w-3xl mx-auto">
                <div className="relative w-full">
                  <input 
                    type="text" 
                    placeholder="Numéro de dossier (ex: CP-94300-1042)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-16 text-lg py-5 rounded-3xl font-black text-slate-800 placeholder:text-slate-300 tracking-wide uppercase outline-none"
                  />
                  <Search size={24} className="absolute left-6 top-5 text-slate-300" />
                </div>
                <button 
                  onClick={() => {
                    const found = requests.find(r => r.id.toLowerCase() === searchQuery.trim().toLowerCase());
                    setTrackedRequest(found || null);
                    if (!found) alert("Dossier introuvable. Exemples : CP-94300-1042 ou CP-94300-0987");
                  }}
                  className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm px-10 py-5 rounded-3xl shadow-lg shadow-blue-500/20 cursor-pointer shrink-0 transition-all hover:-translate-y-1 m-1"
                >
                  Localiser
                </button>
              </div>

              {/* Tableau de bord de suivi (Stripe-like) */}
              {trackedRequest && (
                <div className="bg-white border border-slate-200 rounded-[40px] shadow-xl p-8 md:p-16 max-w-5xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 block">Dossier identifié</span>
                      <h3 className="text-4xl md:text-5xl font-black text-[#0F2C59] tracking-tight">{trackedRequest.id}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                        trackedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        trackedRequest.status === 'Refused' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {trackedRequest.status === 'Pending' ? 'À l\'instruction' :
                         trackedRequest.status === 'Approved' ? 'Validé par la mairie' :
                         trackedRequest.status === 'Scheduled' ? 'Collecte programmée' :
                         trackedRequest.status === 'In progress' ? 'Tournée en cours' :
                         trackedRequest.status === 'Collected' ? 'Collecte terminée' : 'Dossier refusé'}
                      </span>
                      {trackedRequest.preferredDate && <span className="text-[11px] font-bold text-slate-400">Date souhaitée : {trackedRequest.preferredDate}</span>}
                    </div>
                  </div>

                  {/* Horizontal Timeline */}
                  <div className="py-16 overflow-hidden">
                    <div className="relative max-w-4xl mx-auto">
                      {/* Timeline Line */}
                      <div className="absolute top-6 left-8 right-8 h-1 bg-slate-100 rounded-full -z-10"></div>
                      <div 
                        className="absolute top-6 left-8 h-1 bg-[#00D182] rounded-full -z-10 transition-all duration-1000 ease-out"
                        style={{ width: 
                          trackedRequest.status === 'Pending' ? '10%' :
                          trackedRequest.status === 'Approved' ? '40%' :
                          trackedRequest.status === 'Scheduled' ? '70%' :
                          trackedRequest.status === 'In progress' ? '85%' :
                          trackedRequest.status === 'Collected' ? '100%' : '10%'
                        }}
                      ></div>

                      <div className="flex justify-between relative">
                        {[
                          { name: 'Dépôt', step: 'Pending' },
                          { name: 'Validation', step: 'Approved' },
                          { name: 'Affectation', step: 'Scheduled' },
                          { name: 'Terminé', step: 'Collected' }
                        ].map((st, idx) => {
                          const isDone = trackedRequest.status !== 'Refused' && (
                            trackedRequest.status === st.step ||
                            (idx === 0) ||
                            (idx === 1 && ['Approved', 'Scheduled', 'In progress', 'Collected'].includes(trackedRequest.status)) ||
                            (idx === 2 && ['Scheduled', 'In progress', 'Collected'].includes(trackedRequest.status)) ||
                            (idx === 3 && trackedRequest.status === 'Collected')
                          );
                          const isActive = trackedRequest.status === st.step || (trackedRequest.status === 'In progress' && idx === 2);

                          return (
                            <div key={st.name} className="flex flex-col items-center gap-4 relative">
                              <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all bg-white ${isDone ? 'border-[#00D182] text-[#00D182]' : 'border-slate-200 text-slate-300'} ${isActive ? 'ring-8 ring-emerald-50 scale-110' : ''}`}>
                                {isDone ? <Check size={18} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full bg-slate-200"></div>}
                              </div>
                              <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#0F2C59]' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {st.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recap details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-10">
                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-[32px] space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenu du dépôt</h4>
                      <div className="space-y-4">
                        {Object.entries(trackedRequest.items).map(([itemId, qty]) => {
                          const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center text-sm font-bold text-slate-700 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <span>{itemDef ? itemDef.name : itemId}</span>
                              <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs">Quantité: {qty}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-8 p-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Adresse de récupération</span>
                        <p className="text-lg font-black text-[#0F2C59] leading-snug">{trackedRequest.address}</p>
                        <p className="text-sm font-bold text-[#2563EB] mt-1">{trackedRequest.district}</p>
                      </div>

                      {trackedRequest.assignedRound && (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assignation Logistique</span>
                          <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl text-blue-700 font-bold text-xs shadow-sm">
                            <Truck size={16} />
                            <span>{trackedRequest.assignedRound}</span>
                          </div>
                        </div>
                      )}

                      {trackedRequest.refusalReason && (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-800">
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-2">Motif du rejet</span>
                          <p className="font-bold text-sm leading-relaxed">{trackedRequest.refusalReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────── 5. ESPACE ADMINISTRATEUR (Stripe/Linear Dashboard) ──────── */}
        {view === 'admin' && (
          <div className="w-full bg-[#FAFAFA] min-h-[calc(100vh-80px)] py-12">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 space-y-10 text-left">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#00D182] animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Admin sécurisé</span>
                  </div>
                  <h2 className="text-4xl font-black text-[#0F2C59] tracking-tight">Supervision Logistique</h2>
                  <p className="text-slate-500 font-medium text-sm mt-2">Vue globale de la charge et assignation des tournées municipales.</p>
                </div>

                {/* Navigation des sous-onglets Admin (SaaS Tab style) */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner select-none">
                  <button 
                    onClick={() => setAdminActiveSubTab('list')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveSubTab === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Feuilles de demandes
                  </button>
                  <button 
                    onClick={() => setAdminActiveSubTab('map')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveSubTab === 'map' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Carte logistique
                  </button>
                  <button 
                    onClick={() => setAdminActiveSubTab('heatmap')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminActiveSubTab === 'heatmap' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Analyse thermique
                  </button>
                </div>
              </div>

              {/* KPIs Stripe-like larges et aérés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Dossiers en attente', value: kpiPending, color: 'text-amber-500', desc: 'Objectif SLA : < 24h', icon: <Clock size={20} className="text-amber-500"/> },
                  { label: 'Déclarées aujourd\'hui', value: kpiToday, color: 'text-[#2563EB]', desc: 'Volume stable', icon: <TrendingUp size={20} className="text-[#2563EB]"/> },
                  { label: 'Bennes actives', value: '2', color: 'text-[#00D182]', desc: 'Nord & Sud déployées', icon: <Truck size={20} className="text-[#00D182]"/> },
                  { label: 'Taux Revalorisation', value: '84%', color: 'text-slate-800', desc: 'En hausse (+2%)', icon: <RefreshCw size={20} className="text-slate-800"/> }
                ].map(k => (
                  <div key={k.label} className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{k.label}</span>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:scale-110 transition-transform">{k.icon}</div>
                    </div>
                    <div>
                      <div className={`text-5xl font-black ${k.color} tracking-tighter mb-2`}>{k.value}</div>
                      <span className="text-[11px] text-slate-500 font-bold">{k.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sous-vue : LISTE DES DEMANDES */}
              {adminActiveSubTab === 'list' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Liste (Linear-style table) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
                      <div className="flex flex-wrap gap-4 items-center flex-1">
                        <div className="relative flex-1 max-w-sm">
                          <input 
                            type="text" 
                            placeholder="Rechercher nom, réf..." 
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 pl-10 text-sm py-3 rounded-xl font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                          />
                          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
                        </div>

                        <select 
                          value={adminFilterStatus}
                          onChange={(e) => setAdminFilterStatus(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-sm py-3 px-4 rounded-xl font-bold text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 transition-all"
                        >
                          <option value="All">Tous les statuts</option>
                          <option value="Pending">À l'instruction</option>
                          <option value="Approved">Approuvé</option>
                          <option value="Scheduled">Planifié</option>
                          <option value="Collected">Collecté</option>
                        </select>
                      </div>

                      <span className="text-xs bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl">{filteredRequests.length} résultats</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-black tracking-widest text-[10px]">
                              <th className="p-6">Référence</th>
                              <th className="p-6">Demandeur</th>
                              <th className="p-6">Quartier</th>
                              <th className="p-6">Date</th>
                              <th className="p-6">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRequests.map(r => (
                              <tr 
                                key={r.id} 
                                onClick={() => setSelectedRequest(r)}
                                className={`cursor-pointer border-b border-slate-50 transition-colors ${selectedRequest?.id === r.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                              >
                                <td className="p-6 font-black text-[#2563EB] text-sm">{r.id}</td>
                                <td className="p-6">
                                  <span className="font-bold text-slate-800 block text-sm">{r.name}</span>
                                  <span className="text-xs text-slate-500 block truncate max-w-[200px] mt-1">{r.address}</span>
                                </td>
                                <td className="p-6 font-semibold text-slate-600 text-sm">{r.district}</td>
                                <td className="p-6 font-bold text-slate-700 text-sm">{r.preferredDate}</td>
                                <td className="p-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                    r.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    r.status === 'Refused' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Tiroir d'instruction large et premium */}
                  <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm h-fit space-y-8 sticky top-32">
                    {selectedRequest ? (
                      <div className="space-y-8">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                          <div>
                            <span className="text-[10px] text-slate-400 font-black block uppercase tracking-widest mb-1">Dossier Actif</span>
                            <h4 className="text-2xl font-black text-[#0F2C59]">{selectedRequest.id}</h4>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            selectedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            selectedRequest.status === 'Refused' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {selectedRequest.status}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <span className="text-[10px] text-slate-400 font-black block uppercase tracking-widest">Inventaire</span>
                          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                            {Object.entries(selectedRequest.items).map(([itemId, qty]) => {
                              const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                              return (
                                <div key={itemId} className="flex justify-between items-center text-sm font-bold text-slate-700">
                                  <span>{itemDef ? itemDef.name : itemId}</span>
                                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-black">x{qty}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-4 text-sm font-medium text-slate-600 bg-white border border-slate-200 p-6 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-black block uppercase tracking-widest mb-4">Contact</span>
                          <p className="flex justify-between"><span className="text-slate-400 font-bold">Nom</span> <span className="font-bold text-slate-800">{selectedRequest.name}</span></p>
                          <p className="flex justify-between"><span className="text-slate-400 font-bold">Téléphone</span> <span className="font-bold text-slate-800">{selectedRequest.phone}</span></p>
                          <p className="flex justify-between"><span className="text-slate-400 font-bold">Adresse</span> <span className="font-bold text-slate-800 text-right w-48">{selectedRequest.address}</span></p>
                        </div>

                        {selectedRequest.status === 'Pending' ? (
                          <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handleAdminApprove(selectedRequest.id)}
                                className="bg-[#00D182] hover:bg-[#00B871] text-white font-bold py-4 rounded-xl text-sm shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                              >
                                Approuver
                              </button>
                              <button 
                                onClick={() => {
                                  const reason = prompt("Indiquez la raison du refus :");
                                  if (reason) handleAdminRefuse(selectedRequest.id, reason);
                                }}
                                className="bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-4 rounded-xl text-sm cursor-pointer transition-all hover:-translate-y-0.5"
                              >
                                Rejeter
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 text-sm font-medium text-slate-700">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Historique d'instruction</span>
                            {selectedRequest.assignedRound && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Tournée :</span>
                                <span className="bg-blue-100 text-[#2563EB] px-3 py-1 rounded-lg font-black text-xs uppercase">{selectedRequest.assignedRound}</span>
                              </div>
                            )}
                            {selectedRequest.refusalReason && (
                              <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 mt-4 font-bold">
                                Motif : {selectedRequest.refusalReason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-32 text-slate-400 space-y-6 flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                          <CheckSquare size={32} className="text-slate-300" />
                        </div>
                        <span className="font-bold text-sm">Sélectionnez un dossier pour l'instruire.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sous-vue : MAP LOGISTIQUE */}
              {adminActiveSubTab === 'map' && (
                <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm space-y-8">
                  <div className="max-w-2xl">
                    <h4 className="font-black text-[#0F2C59] text-2xl">Cartographie Opérationnelle</h4>
                    <p className="text-sm text-slate-500 font-medium mt-2">Vue satellite vectorielle de la répartition des dépôts sur le secteur de Choisy-le-Roi.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-[32px] h-[500px] relative overflow-hidden flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                        <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#DBEAFE" strokeWidth="24" strokeLinecap="round" />
                        <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 60 0 Q 120 150 80 300" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                        <path d="M 230 0 L 270 300" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                        <path d="M 0 180 L 500 160" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                        
                        {requests.map(req => {
                          const x = req.coordinates.x * 1.5;
                          const y = req.coordinates.y * 0.9;
                          const isSelected = selectedRequest?.id === req.id;
                          return (
                            <g key={req.id} onClick={() => setSelectedRequest(req)} className="cursor-pointer">
                              <circle cx={x} cy={y} r={isSelected ? 12 : 8} fill={req.status === 'Pending' ? '#F59E0B' : req.status === 'Refused' ? '#EF4444' : '#00D182'} className="transition-all" />
                              {isSelected && <circle cx={x} cy={y} r={20} fill="none" stroke="#0F2C59" strokeWidth="3" className="animate-ping" />}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-[32px] flex flex-col justify-between">
                      {selectedRequest ? (
                        <div className="space-y-6">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Point ciblé</span>
                          <p className="font-black text-[#0F2C59] text-xl">{selectedRequest.id}</p>
                          <div className="space-y-3 text-sm font-medium">
                            <p className="text-slate-700"><span className="text-slate-400 font-bold block mb-1">Citoyen</span> {selectedRequest.name}</p>
                            <p className="text-slate-700"><span className="text-slate-400 font-bold block mb-1">Localisation</span> {selectedRequest.address}</p>
                            <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block text-xs font-black text-slate-600 mt-2">{selectedRequest.district}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-bold text-center py-16 text-sm">Cliquez sur un repère géographique.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sous-vue : HEATMAP DE CHARGE */}
              {adminActiveSubTab === 'heatmap' && (
                <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm space-y-8">
                  <div className="max-w-2xl">
                    <h4 className="font-black text-[#0F2C59] text-2xl">Densité Logistique</h4>
                    <p className="text-sm text-slate-500 font-medium mt-2">Identification des points chauds de la ville pour réallouer les flottes de collecte.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-3 bg-slate-900 rounded-[32px] h-[500px] relative overflow-hidden flex items-center justify-center shadow-inner">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                        <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#1E293B" strokeWidth="24" strokeLinecap="round" />
                        <circle cx="160" cy="140" r="80" fill="url(#heat-red-glow)" />
                        <circle cx="280" cy="90" r="70" fill="url(#heat-yellow-glow)" />
                        <circle cx="90" cy="220" r="90" fill="url(#heat-green-glow)" />
                        <defs>
                          <radialGradient id="heat-red-glow">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                          </radialGradient>
                          <radialGradient id="heat-yellow-glow">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                          </radialGradient>
                          <radialGradient id="heat-green-glow">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                      </svg>
                      <span className="absolute top-6 left-6 bg-slate-800/80 backdrop-blur-md text-white font-black text-[10px] px-4 py-2 rounded-full border border-slate-700 tracking-widest uppercase">
                        Capteurs Thermiques
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-[32px] space-y-8">
                      <h5 className="font-black text-[#0F2C59] uppercase tracking-widest text-[10px] mb-2">Volumes Déclarés</h5>
                      <div className="space-y-6">
                        {districtDistribution.map(item => {
                          const maxVal = Math.max(...districtDistribution.map(d => d.count), 1);
                          const pct = Math.round((item.count / maxVal) * 100);
                          return (
                            <div key={item.name} className="space-y-2">
                              <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>{item.name}</span>
                                <span>{item.count}</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
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
          </div>
        )}

        {/* ──────── 6. ESPACE COLLECTEUR (Terminal Flotte Large) ──────── */}
        {role === 'collector' && (
          <div className="w-full bg-slate-900 min-h-[calc(100vh-80px)] py-12 text-white">
            <div className="max-w-6xl mx-auto px-6 space-y-8 animate-[fadeIn_0.3s_ease-out]">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Terminal Embarqué</h2>
                  <p className="text-slate-400 text-sm mt-1">Interface conducteur connectée au réseau de la ville.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 p-2 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 pl-3">Secteur Actif :</span>
                  <select 
                    value={activeRound}
                    onChange={(e) => { setActiveRound(e.target.value); setCollectorStopIndex(0); }}
                    className="bg-slate-700 border border-slate-600 text-sm py-2 px-4 rounded-xl font-bold cursor-pointer outline-none focus:ring-2 focus:ring-[#00D182]"
                  >
                    <option value="Tournée Nord">Tournée Nord (Zone A)</option>
                    <option value="Tournée Sud">Tournée Sud (Zone B)</option>
                  </select>
                </div>
              </div>

              {/* Jauge globale */}
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-[24px] flex items-center gap-8 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <Truck size={28} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-300">
                    <span>Remplissage Benne Centrale</span>
                    <span className="text-[#00D182]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {currentStop ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Navigation and Details */}
                  <div className="bg-slate-800 border border-slate-700 p-8 rounded-[32px] space-y-8 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-slate-700 pb-6 mb-6">
                        <span className="bg-[#0F2C59] text-blue-300 border border-blue-800 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                          Objectif Actuel
                        </span>
                        <span className="text-xl font-black text-slate-400">{collectorStopIndex + 1} / {roundRequests.length}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-slate-500 font-black uppercase tracking-widest block">Adresse GPS</span>
                        <h3 className="font-black text-3xl leading-tight">{currentStop.address}</h3>
                        <span className="text-sm text-emerald-400 font-bold inline-block mt-2">{currentStop.district}</span>
                      </div>

                      <div className="mt-8 space-y-4">
                        <span className="text-xs text-slate-500 font-black uppercase tracking-widest block">Chargement à prévoir</span>
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-4">
                          {Object.entries(currentStop.items).map(([itemId, qty]) => {
                            const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                            return (
                              <div key={itemId} className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>{itemDef ? itemDef.name : itemId}</span>
                                <span className="bg-slate-800 border border-slate-600 px-4 py-1.5 rounded-xl text-white font-black">x{qty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5 mt-8 flex gap-4 items-start">
                      <Compass className="text-blue-400 shrink-0 mt-1" size={24} />
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        Naviguez via l'Avenue Principale. Accès dégagé. Stationnement benne autorisé sur zébras.
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions and Camera */}
                  <div className="space-y-8 flex flex-col justify-between">
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-[32px] shadow-2xl space-y-6 flex-1 flex flex-col justify-center items-center relative overflow-hidden group cursor-pointer" onClick={() => { setCollectorProofAttached(true); alert("Photo HD enregistrée."); }}>
                      <div className="absolute inset-0 bg-slate-900 opacity-50 z-0"></div>
                      <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${collectorProofAttached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white group-hover:scale-110'}`}>
                        {collectorProofAttached ? <CheckCircle2 size={40} /> : <Upload size={40} />}
                      </div>
                      <div className="relative z-10 text-center">
                        <h4 className="text-xl font-black">{collectorProofAttached ? "Validation Visuelle OK" : "Capturer Preuve Terrain"}</h4>
                        <p className="text-sm text-slate-400 mt-2">Tapez ici pour activer la caméra du terminal.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => handleCollectorStatus('Collected')}
                        className="bg-[#00D182] hover:bg-[#00B871] text-white font-black py-6 rounded-[24px] text-lg shadow-[0_10px_30px_rgba(0,209,130,0.3)] transition-all hover:-translate-y-1"
                      >
                        Validé
                      </button>
                      <button 
                        onClick={() => handleCollectorStatus('Absent')}
                        className="bg-slate-700 border border-slate-600 hover:bg-slate-600 text-white font-black py-6 rounded-[24px] text-lg transition-all"
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => {
                          if (!collectorProofAttached) {
                            alert("Preuve photo requise pour déclarer une non-conformité.");
                            return;
                          }
                          handleCollectorStatus('Impossible');
                        }}
                        className="bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 font-black py-6 rounded-[24px] text-lg transition-all"
                      >
                        Refusé
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 border border-slate-700 p-16 rounded-[32px] text-center space-y-6 shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Award size={64} className="text-[#00D182]" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white">Secteur Nettoyé !</h3>
                    <p className="text-lg text-slate-400 mt-3 max-w-lg mx-auto">Toutes les opérations logistiques pour cette tournée ont été exécutées avec succès. Retour à la base.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ═══ SIGNALEMENT DEPOT SAUVAGE ═══ */}
      {isWildDumpingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
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
            className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full space-y-6 animate-[fadeIn_0.2s_ease-out] text-left text-xs font-semibold"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />
                <span>Signaler un dépôt sauvage</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setIsWildDumpingOpen(false)}
                className="text-slate-455 hover:text-slate-700 font-extrabold cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <p className="text-slate-500 leading-relaxed font-medium">
              Un dépôt sauvage nuit à l'espace public de Choisy-le-Roi ? Indiquez l'adresse précise. Notre brigade verte interviendra d'ici 2h pour l'enlèvement.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-slate-400 font-black block mb-2 uppercase tracking-wider">Adresse précise</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex : Face au 18 Rue d'Orves, Choisy-le-Roi" 
                  value={wildAddress}
                  onChange={(e) => setWildAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 text-xs py-3.5 px-4 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-red-300"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-black block mb-2 uppercase tracking-wider">Description (facultatif)</label>
                <textarea 
                  placeholder="Ex : Gravats de chantier, cartons, briques..." 
                  value={wildDesc}
                  onChange={(e) => setWildDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 text-xs h-24 py-2.5 px-4 rounded-xl outline-none font-medium focus:bg-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4.5 rounded-xl transition-all shadow-md text-xs cursor-pointer active:scale-95"
            >
              Envoyer le signalement
            </button>
          </form>
        </div>
      )}
      </main>
    </div>
  );
}
