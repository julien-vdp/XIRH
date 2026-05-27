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
      <div className="w-full bg-white/70 border-b border-slate-100 py-5 px-10 sticky top-0 z-40 backdrop-blur-xl flex justify-between items-center">
        {/* Dynamic Logo */}
        <div 
          onClick={() => { setView('landing'); setRole('citizen'); }} 
          className="flex items-center gap-4 cursor-pointer select-none group"
        >
          {/* Logo Minimaliste Seine + Loop */}
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-inner transition-transform group-hover:scale-105">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path d="M12 24C12 14 20 12 32 12C44 12 52 14 52 24C52 34 44 36 32 36C20 36 12 34 12 24Z" fill="url(#logo-blue)" />
              <path d="M20 40C20 34 26 32 32 32C38 32 44 34 44 40C44 46 38 48 32 48C26 48 20 46 20 40Z" fill="url(#logo-green)" />
              <defs>
                <linearGradient id="logo-blue" x1="12" y1="12" x2="52" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0F2C59"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
                <linearGradient id="logo-green" x1="20" y1="32" x2="44" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D182"/>
                  <stop offset="1" stopColor="#34D399"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-extrabold text-[#0F2C59] tracking-tight">Mon Choisy Propre</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">CIVIC TECH</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Ville de Choisy-le-Roi</p>
          </div>
        </div>

        {/* Premium Navigation menu */}
        <div className="flex items-center gap-1 md:gap-3 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/40">
          <button 
            onClick={() => { setRole('citizen'); setView('landing'); }} 
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'landing') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Accueil
          </button>
          <button 
            onClick={() => { setRole('citizen'); setView('rules'); }} 
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'rules') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Consignes
          </button>
          <button 
            onClick={() => { setRole('citizen'); setFormStep(1); setView('citizen-form'); }} 
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'citizen-form') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Faire une demande
          </button>
          <button 
            onClick={() => { setRole('citizen'); setTrackedRequest(null); setView('citizen-track'); }} 
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${(role === 'citizen' && view === 'citizen-track') ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Suivi
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <button 
            onClick={() => { setRole('admin'); setAdminActiveSubTab('list'); setSelectedRequest(null); setView('admin'); }} 
            className={`px-4 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${role === 'admin' ? 'bg-[#0F2C59] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Admin Panel
          </button>
          <button 
            onClick={() => { setRole('collector'); setView('collector'); }} 
            className={`px-4 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${role === 'collector' ? 'bg-[#00D182] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Chauffeur
          </button>
        </div>
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      <div className="flex-1 w-full flex flex-col justify-center">

        {/* ──────── 1. LANDING PAGE PREMIUM ──────── */}
        {view === 'landing' && (
          <div className="w-full space-y-36 pb-24">
            
            {/* HERO SECTION */}
            <div className="w-full max-w-7xl mx-auto px-8 md:px-12 pt-16 md:pt-24 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
              {/* Halos lumineux d'ambiance */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D182]/5 rounded-full filter blur-[100px] pointer-events-none"></div>
              <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

              {/* Colonne Gauche : Slogans & Titres */}
              <div className="flex-1 text-left space-y-8 z-10">
                <span className="text-[10px] text-emerald-800 bg-[#E8FFF5] border border-emerald-200/60 font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block">
                  🌱 Transition écologique urbaine
                </span>
                <h1 className="text-5xl md:text-7xl font-black text-[#0F2C59] leading-[1.02] tracking-tighter">
                  La propreté urbaine, <br />
                  <span className="bg-gradient-to-r from-[#2563EB] via-teal-500 to-[#00D182] bg-clip-text text-transparent">réinventée.</span>
                </h1>
                <p className="text-slate-550 leading-relaxed text-base md:text-lg max-w-xl font-medium">
                  Déclarez et planifiez le retrait gratuit de vos encombrants à Choisy-le-Roi en quelques secondes. Nos services municipaux s'occupent du tri, du réemploi et du recyclage local.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => { setFormStep(1); setView('citizen-form'); }}
                    className="bg-[#00D182] hover:bg-[#00B871] text-white font-extrabold text-xs px-8 py-5 rounded-2xl shadow-xl shadow-emerald-500/10 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Faire une demande de retrait</span>
                    <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={() => setView('citizen-track')}
                    className="bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs px-8 py-5 rounded-2xl border border-slate-200/80 shadow-sm transition-all cursor-pointer"
                  >
                    Suivre ma demande
                  </button>
                </div>

                {/* Sub statistics strip */}
                <div className="flex items-center gap-8 pt-8 border-t border-slate-100">
                  <div>
                    <span className="text-3xl font-black text-[#0F2C59]">84%</span>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Taux de recyclage</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <span className="text-3xl font-black text-[#0F2C59]">&lt; 24h</span>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Délai d'approbation</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <span className="text-3xl font-black text-[#0F2C59]">100%</span>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Service public gratuit</span>
                  </div>
                </div>
              </div>

              {/* Colonne Droite : iPhone Mockup Premium */}
              <div className="flex-1 w-full max-w-md shrink-0 select-none z-10 flex justify-center">
                <div className="relative">
                  {/* Glowing background halo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-[50px] filter blur-xl opacity-80 -z-10"></div>
                  
                  {/* Phone container */}
                  <div className="w-[310px] h-[630px] bg-[#0b2146] p-3 rounded-[50px] shadow-[0_25px_60px_rgba(15,23,42,0.18)] border-[6px] border-slate-900 relative">
                    {/* Notch dynamic island */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-30 flex items-center justify-between px-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                      <span className="w-4 h-1 bg-slate-800 rounded"></span>
                    </div>

                    {/* Inside Screen */}
                    <div className="w-full h-full bg-[#f8fafc] rounded-[40px] overflow-hidden flex flex-col justify-between p-4 pt-8">
                      {/* Inner header */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Suivi en direct</span>
                          <h4 className="text-xs font-black text-[#0F2C59]">Dossier CP-94300</h4>
                        </div>
                        <span className="bg-[#E8FFF5] text-emerald-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-emerald-100">Planifié</span>
                      </div>

                      {/* Map mockup */}
                      <div className="flex-1 my-3 bg-white rounded-2xl border border-slate-200/50 shadow-sm relative overflow-hidden flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 200">
                          {/* River */}
                          <path d="M 0 120 Q 80 110 120 140 T 200 130" fill="none" stroke="#60a5fa" strokeWidth="12" />
                          {/* Streets */}
                          <path d="M 50 0 L 50 200" stroke="#cbd5e1" strokeWidth="2" />
                          <path d="M 120 0 L 120 200" stroke="#cbd5e1" strokeWidth="2" />
                          <path d="M 0 70 L 200 70" stroke="#cbd5e1" strokeWidth="2" />
                        </svg>
                        
                        {/* Live route line */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                          <path d="M 50 160 L 50 70 L 120 70" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 2"/>
                          <circle cx="50" cy="160" r="5" fill="#2563EB"/>
                          {/* Pulse collector icon */}
                          <g className="animate-pulse">
                            <circle cx="120" cy="70" r="10" fill="#00D182" fillOpacity="0.2"/>
                            <circle cx="120" cy="70" r="4" fill="#00D182"/>
                          </g>
                        </svg>

                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl text-left border border-slate-800">
                          <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-wider block">Camion de collecte</span>
                          <span className="text-[10px] text-white font-extrabold block mt-0.5">Arrivée estimée : 08 min</span>
                          <p className="text-[8px] text-slate-450 mt-0.5">En cours de déplacement sur Avenue de la République</p>
                        </div>
                      </div>

                      {/* Detail card */}
                      <div className="bg-white border border-slate-200/60 p-3 rounded-2xl shadow-sm text-left">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-[#F0F9FF] border border-blue-150 flex items-center justify-center">
                            <Truck size={12} className="text-[#2563EB]" />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-700 font-bold block">1 Canapé, 4 Chaises</span>
                            <span className="text-[8px] text-slate-400 block">Adresse : 12 Avenue de la République</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION COMMENT CA MARCHE - HORIZONTALE ET RESPIRENTE */}
            <div className="w-full max-w-7xl mx-auto px-8 md:px-12">
              <div className="text-center max-w-xl mx-auto space-y-3 mb-24">
                <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-100 font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                  Simplicité d'usage
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Le parcours citoyen moderne</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Une démarche en trois étapes simples pour planifier votre enlèvement.</p>
              </div>

              {/* 3 Grandes étapes horizontales */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                {[
                  {
                    step: "01",
                    title: "Déclarez vos objets",
                    desc: "Indiquez les meubles ou appareils à retirer et ajoutez une photo explicative en un clin d'œil.",
                    icon: (
                      <svg viewBox="0 0 200 120" className="w-full h-32 mx-auto">
                        <rect x="30" y="20" width="140" height="80" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" className="shadow-sm"/>
                        <circle cx="50" cy="35" r="5" fill="#EF4444"/>
                        <circle cx="62" cy="35" r="5" fill="#F59E0B"/>
                        <circle cx="74" cy="35" r="5" fill="#10B981"/>
                        <rect x="42" y="55" width="70" height="6" rx="3" fill="#F1F5F9"/>
                        <rect x="42" y="67" width="110" height="6" rx="3" fill="#F1F5F9"/>
                        <circle cx="150" cy="55" r="14" fill="#D1FAE5"/>
                        <path d="M146 55 L149 58 L154 52" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    )
                  },
                  {
                    step: "02",
                    title: "La mairie valide",
                    desc: "Nos agents examinent la conformité de vos objets et assignent le dossier à une équipe de collecte.",
                    icon: (
                      <svg viewBox="0 0 200 120" className="w-full h-32 mx-auto">
                        <circle cx="100" cy="60" r="44" fill="none" stroke="#E0F2FE" strokeWidth="1" strokeDasharray="4 4"/>
                        <circle cx="100" cy="60" r="32" fill="none" stroke="#E0F2FE" strokeWidth="1.5"/>
                        <circle cx="100" cy="60" r="20" fill="#F0F9FF"/>
                        <path d="M100 44 L114 49 L114 62 C114 71 100 76 100 76 C100 76 86 71 86 62 L86 49 Z" fill="#0284C7" stroke="#0284C7" strokeWidth="1.5"/>
                        <path d="M95 59 L98 62 L105 55" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )
                  },
                  {
                    step: "03",
                    title: "Les équipes collectent",
                    desc: "Sortez vos objets la veille. Notre camion benne passe à la date convenue et revalorise vos encombrants.",
                    icon: (
                      <svg viewBox="0 0 200 120" className="w-full h-32 mx-auto">
                        <path d="M10 90 L190 90" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4"/>
                        <rect x="50" y="52" width="75" height="28" rx="6" fill="#10B981"/>
                        <rect x="110" y="47" width="28" height="33" rx="6" fill="#34D399"/>
                        <rect x="120" y="52" width="12" height="12" rx="2" fill="#E0F2FE"/>
                        <circle cx="70" cy="85" r="9" fill="#1E293B"/>
                        <circle cx="70" cy="85" r="3" fill="#FFFFFF"/>
                        <circle cx="118" cy="85" r="9" fill="#1E293B"/>
                        <circle cx="118" cy="85" r="3" fill="#FFFFFF"/>
                        <path d="M85 36 C92 36 94 44 89 48 C84 48 81 41 85 36 Z" fill="#D1FAE5" stroke="#059669" strokeWidth="1"/>
                      </svg>
                    )
                  }
                ].map((item, idx) => (
                  <div key={item.step} className="text-left space-y-6 relative group">
                    {/* Grand chiffre arrière plan */}
                    <span className="text-[120px] font-black text-slate-100/60 absolute -top-20 -left-6 select-none -z-10 group-hover:text-emerald-50 transition-colors">
                      {item.step}
                    </span>
                    
                    {/* Illustration vectorielle propre */}
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {item.icon}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-extrabold text-[#0F2C59] text-lg">{item.title}</h3>
                      <p className="text-slate-550 text-xs leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION ECOLOGIQUE - PREMIUM BRANDING */}
            <div className="w-full bg-[#f8fafc] border-y border-slate-200/50 py-28 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-[80px] pointer-events-none"></div>
              
              <div className="w-full max-w-7xl mx-auto px-8 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Stats & Textes */}
                <div className="text-left space-y-8">
                  <span className="text-[9px] text-emerald-800 bg-[#E8FFF5] border border-emerald-200/60 font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block">
                    Valorisation locale
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] leading-tight tracking-tight">
                    Rien ne se perd,<br />tout se revalorise.
                  </h2>
                  <p className="text-slate-550 leading-relaxed text-sm font-medium">
                    À Choisy-le-Roi, les encombrants ne sont plus synonymes de décharges publiques. Notre circuit court permet de diriger chaque objet collecté vers la ressourcerie partenaire ou le centre de tri matière adapté.
                  </p>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-1">
                      <strong className="text-4xl font-black text-[#00D182]">84%</strong>
                      <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Réemployé ou recyclé</span>
                    </div>
                    <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-1">
                      <strong className="text-4xl font-black text-[#2563EB]">2,4 T</strong>
                      <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Co2 économisé par mois</span>
                    </div>
                  </div>
                </div>

                {/* SVG Infographie Circular Economy */}
                <div className="flex justify-center">
                  <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-lg relative max-w-md w-full flex items-center justify-center min-h-[300px]">
                    <svg viewBox="0 0 200 200" className="w-64 h-64">
                      {/* Outer circular economy path */}
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#00D182" strokeWidth="6" strokeDasharray="140 300" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#2563EB" strokeWidth="6" strokeDasharray="90 300" strokeDashoffset="-200" strokeLinecap="round" />
                      
                      {/* Central heart icon of sustainability */}
                      <circle cx="100" cy="100" r="28" fill="#F0FDF4" />
                      <path d="M100 90 C100 90 92 82 86 88 C80 94 80 102 86 108 L100 120 L114 108 C120 102 120 94 114 88 C108 82 100 90 100 90 Z" fill="#00D182"/>
                      
                      {/* Floating tags */}
                      <text x="100" y="16" textAnchor="middle" fill="#0F2C59" className="text-[8px] font-black uppercase tracking-wider">1. Citoyen</text>
                      <text x="178" y="104" textAnchor="start" fill="#2563EB" className="text-[8px] font-black uppercase tracking-wider">2. Logistique</text>
                      <text x="10" y="104" textAnchor="end" fill="#00D182" className="text-[8px] font-black uppercase tracking-wider">3. Revalorisation</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

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
          <div className="max-w-4xl mx-auto px-8 py-16 space-y-12 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Stepper tracker elegant */}
            {formStep < 5 && (
              <div className="space-y-4 max-w-xl mx-auto select-none">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span className={formStep >= 1 ? "text-[#2563EB]" : ""}>1. Localisation</span>
                  <span className={formStep >= 2 ? "text-[#2563EB]" : ""}>2. Encombrants</span>
                  <span className={formStep >= 3 ? "text-[#2563EB]" : ""}>3. Justificatif</span>
                  <span className={formStep >= 4 ? "text-[#2563EB]" : ""}>4. Rendez-vous</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/40">
                  <div 
                    className="bg-[#2563EB] h-full rounded-full transition-all duration-350"
                    style={{ width: `${(formStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200/80 p-8 md:p-12 rounded-[32px] shadow-sm text-left max-w-2xl mx-auto">
              
              {/* ÉTAPE 1 : ADRESSE */}
              {formStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">Étape 01</span>
                    <h2 className="text-2xl font-black text-[#0F2C59]">Où se situe le dépôt d'encombrants ?</h2>
                    <p className="text-xs text-slate-400 font-medium">Entrez l'adresse de votre foyer à Choisy-le-Roi pour vérifier la zone.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="Ex : 12 Avenue de la République" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 pl-11 text-xs py-4 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                      <MapPin size={16} className="absolute left-4 top-4.5 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Quartier</label>
                        <select 
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/80 text-xs py-3.5 px-4 rounded-2xl font-bold outline-none cursor-pointer focus:bg-white"
                        >
                          {DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Ville</label>
                        <input 
                          type="text" 
                          disabled 
                          value="Choisy-le-Roi (94)" 
                          className="w-full bg-slate-100 border border-slate-200/80 text-xs py-3.5 px-4 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Stylized vector map */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl h-44 relative overflow-hidden flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 150">
                        <path d="M 0 50 Q 80 40 120 70 T 300 60" fill="none" stroke="#2563eb" strokeWidth="6" />
                        <path d="M 40 0 L 80 150" stroke="#cbd5e1" strokeWidth="1" />
                        <path d="M 140 0 L 170 150" stroke="#cbd5e1" strokeWidth="1.5" />
                        <circle cx="160" cy="80" r="6" fill="#10b981" />
                      </svg>
                      <div className="relative text-center z-10 space-y-1.5 p-4">
                        <MapPin className="text-[#2563EB] mx-auto animate-bounce" size={20} />
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest">Localisation validée</span>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[240px] block">{address || "Veuillez saisir votre adresse..."}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="button" 
                      onClick={() => { if (address) setFormStep(2); else alert("Veuillez saisir votre adresse."); }}
                      className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-extrabold text-xs px-8 py-4.5 rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
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
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">Étape 02</span>
                    <h2 className="text-2xl font-black text-[#0F2C59]">Quels objets souhaitez-vous faire enlever ?</h2>
                    <p className="text-xs text-slate-400 font-medium">Sélectionnez la quantité pour chaque type d'encombrant (max. 5 au total).</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLLECTIBLE_ITEMS.map(item => {
                      const qty = selectedItems[item.id] || 0;
                      return (
                        <div 
                          key={item.id} 
                          className={`flex justify-between items-center bg-slate-50 border p-5 rounded-2xl transition-all shadow-sm ${qty > 0 ? 'border-[#2563EB] bg-white ring-2 ring-blue-50/50' : 'border-slate-200/60'}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">{item.icon}</span>
                            <div className="text-left">
                              <span className="font-extrabold text-slate-800 text-xs block">{item.name}</span>
                              <span className="text-[9px] text-slate-400 capitalize">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              type="button"
                              onClick={() => handleItemQty(item.id, false)}
                              className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-xs text-slate-800 w-4 text-center">{qty}</span>
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
                              className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                            >
                              <Plus size={12} />
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
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-6 py-4 rounded-xl cursor-pointer"
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
                      className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-extrabold text-xs px-8 py-4.5 rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
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
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">Étape 03</span>
                    <h2 className="text-2xl font-black text-[#0F2C59]">Ajouter une photo justificative</h2>
                    <p className="text-xs text-slate-400 font-medium">Cette photo permet aux équipes logistiques de dimensionner le camion benne.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50/50 text-center hover:bg-slate-50 hover:border-[#2563EB] transition-colors relative">
                    <input 
                      type="file" 
                      id="file-photo" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <label htmlFor="file-photo" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Upload className="text-slate-400" size={20} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 block">Glissez-déposez ou parcourez vos fichiers</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Fichiers acceptés : PNG, JPG, JPEG (Max 5 Mo)</span>
                      </div>
                    </label>
                    {photo && (
                      <div className="mt-6 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs inline-flex items-center gap-2.5 font-bold shadow-sm">
                        <Check size={14} />
                        <span>{photo.name} ({photo.size})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-6 py-4 rounded-xl cursor-pointer"
                    >
                      Retour
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(4)}
                      className="bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-extrabold text-xs px-8 py-4.5 rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
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
                  <div className="space-y-2">
                    <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">Étape 04</span>
                    <h2 className="text-2xl font-black text-[#0F2C59]">Date et coordonnées de contact</h2>
                    <p className="text-xs text-slate-400 font-medium">Sélectionnez le jour de ramassage souhaité et vos informations de contact.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-5">
                      <div>
                        <label className="text-[9px] text-slate-400 font-black block mb-2 uppercase tracking-wider">Date de collecte souhaitée</label>
                        <input 
                          type="date" 
                          required
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/85 text-xs py-3.5 px-4 rounded-2xl font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-150 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 font-black block mb-2 uppercase tracking-wider">Votre nom complet</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex : Thomas Dubois" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/85 text-xs py-3.5 px-4 rounded-2xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-150 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-[9px] text-slate-400 font-black block mb-2 uppercase tracking-wider">Téléphone portable</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="Ex : 06 12 34 56 78" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/85 text-xs py-3.5 px-4 rounded-2xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-150 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 font-black block mb-2 uppercase tracking-wider">Adresse e-mail</label>
                        <input 
                          type="email" 
                          required
                          placeholder="Ex : t.dubois@email.fr" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/85 text-xs py-3.5 px-4 rounded-2xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-150 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setFormStep(3)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-6 py-4 rounded-xl cursor-pointer"
                    >
                      Retour
                    </button>
                    <button 
                      type="submit"
                      className="bg-[#00D182] hover:bg-[#00B871] text-white font-extrabold text-xs px-8 py-4.5 rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                    >
                      <Send size={12} />
                      <span>Envoyer la demande</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 5 : CONFIRMATION */}
              {formStep === 5 && (
                <div className="text-center py-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-16 h-16 rounded-full bg-[#E8FFF5] text-[#00D182] flex items-center justify-center mx-auto ring-8 ring-[#E8FFF5]/50">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#0F2C59]">Demande enregistrée !</h2>
                    <p className="text-xs text-slate-400 font-semibold">Le dossier est en attente d'instruction par les agents municipaux.</p>
                  </div>

                  <div className="bg-[#f8fafc] border border-slate-200/60 p-6 rounded-2xl max-w-sm mx-auto shadow-sm">
                    <span className="text-[9px] text-slate-455 font-black block uppercase tracking-wider">VOTRE RÉFÉRENCE DE SUIVI</span>
                    <strong className="text-3xl font-black text-[#2563EB] tracking-wider block mt-2">{lastGeneratedRef}</strong>
                    <span className="text-[9px] text-slate-400 block mt-2.5">Conservez précieusement ce code pour suivre la collecte.</span>
                  </div>

                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Un SMS de confirmation a été envoyé à votre mobile. Les agents municipaux vont instruire votre demande sous 24 heures.
                  </p>

                  <div className="flex gap-4 max-w-xs mx-auto pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setSearchQuery(lastGeneratedRef); setTrackedRequest(requests.find(r => r.id === lastGeneratedRef) || null); setView('citizen-track'); }}
                      className="flex-1 bg-[#2563EB] hover:bg-blue-750 text-white font-bold py-4.5 rounded-2xl text-xs shadow-md cursor-pointer transition-all"
                    >
                      Suivre en direct
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setView('landing')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4.5 rounded-2xl text-xs border border-slate-200/60 cursor-pointer transition-all"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}

        {/* ──────── 4. CITIZEN TRACK (Suivi citoyen) ──────── */}
        {view === 'citizen-track' && (
          <div className="max-w-5xl mx-auto px-8 py-16 space-y-12 animate-[fadeIn_0.3s_ease-out] text-left">
            <div className="text-center space-y-3">
              <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full inline-block">
                Espace Citoyen
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-[#0F2C59] tracking-tight">Suivi de collecte</h2>
              <p className="text-slate-550 text-xs font-semibold max-w-md mx-auto leading-relaxed text-center">Consultez en temps réel l'avancement logistique de votre dossier d'encombrants.</p>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between max-w-2xl mx-auto">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Entrez votre code de suivi (ex : CP-94300-1042)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 pl-11 text-xs py-3.5 rounded-2xl font-bold tracking-wider uppercase outline-none focus:bg-white"
                />
                <Search size={14} className="absolute left-4 top-4.5 text-slate-400" />
              </div>
              <button 
                onClick={() => {
                  const found = requests.find(r => r.id.toLowerCase() === searchQuery.trim().toLowerCase());
                  setTrackedRequest(found || null);
                  if (!found) alert("Dossier introuvable. Utilisez les exemples : CP-94300-1042 ou CP-94300-0987");
                }}
                className="w-full md:w-auto bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-sm cursor-pointer shrink-0 transition-colors"
              >
                Rechercher
              </button>
            </div>

            {/* Affichage du dossier recherché */}
            {trackedRequest ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-4xl mx-auto">
                
                {/* Ligne d'avancement Stripe/Linear-style */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 p-8 md:p-10 rounded-[32px] shadow-sm space-y-10">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                    <div>
                      <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] font-black px-3 py-1 rounded-full border border-blue-100">RÉFÉRENCE</span>
                      <h3 className="text-xl font-black text-[#0F2C59] mt-3">{trackedRequest.id}</h3>
                    </div>
                    <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border ${
                      trackedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-250' :
                      trackedRequest.status === 'Refused' ? 'bg-red-50 text-red-800 border-red-250' : 'bg-emerald-50 text-emerald-800 border-emerald-250'
                    }`}>
                      {trackedRequest.status === 'Pending' ? 'À l\'instruction' :
                       trackedRequest.status === 'Approved' ? 'Approuvé' :
                       trackedRequest.status === 'Scheduled' ? 'Planifié' :
                       trackedRequest.status === 'In progress' ? 'En cours' :
                       trackedRequest.status === 'Collected' ? 'Collecté' : 'Refusé'}
                    </span>
                  </div>

                  {/* Ligne temporelle logistique */}
                  <div className="space-y-8">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Avancée logistique</span>
                    
                    <div className="relative pl-8 border-l border-slate-100 space-y-8 ml-4">
                      {[
                        { name: 'Dossier créé', desc: 'Vos encombrants ont été enregistrés dans notre base de données.', step: 'Pending' },
                        { name: 'Approuvé par la Mairie', desc: 'La mairie a validé et autorisé la liste des objets déclarés.', step: 'Approved' },
                        { name: 'Planifié dans la tournée', desc: 'Une benne municipale et un horaire de passage ont été attribués.', step: 'Scheduled' },
                        { name: 'Enlèvement effectué', desc: 'Les objets ont été enlevés de la voie publique.', step: 'Collected' }
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
                            {/* Point de la timeline */}
                            <span className={`absolute -left-[37px] top-0.5 w-4 h-4 rounded-full border-4 bg-white ${isDone ? 'border-[#00D182]' : 'border-slate-200'}`}></span>
                            <div className="space-y-1">
                              <h4 className={`text-xs font-extrabold ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>{st.name}</h4>
                              <p className="text-[11px] text-slate-500 leading-normal font-medium">{st.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Détails complémentaires de la demande */}
                <div className="bg-white border border-slate-200/80 p-8 rounded-[32px] shadow-sm space-y-8 text-xs font-medium">
                  <h4 className="font-extrabold text-[#0F2C59] text-sm border-b border-slate-100 pb-4">Récapitulatif</h4>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] text-slate-400 font-black block uppercase mb-1">Lieu du dépôt</span>
                      <p className="text-slate-800 font-bold leading-snug">{trackedRequest.address}</p>
                      <p className="text-slate-450 mt-0.5 font-bold">{trackedRequest.district}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-black block uppercase mb-2">Objets déclarés</span>
                      <div className="bg-slate-55 rounded-2xl p-4 border border-slate-200/50 space-y-2">
                        {Object.entries(trackedRequest.items).map(([itemId, qty]) => {
                          const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center font-bold text-slate-700 text-[11px]">
                              <span>{itemDef ? itemDef.name : itemId}</span>
                              <span className="bg-white px-2 py-0.5 rounded border border-slate-200/60 text-slate-800 text-[10px]">x{qty}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {trackedRequest.assignedRound && (
                      <div>
                        <span className="text-[9px] text-slate-400 font-black block uppercase mb-1">Tournée affectée</span>
                        <span className="bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-full font-black text-[9px] inline-block uppercase tracking-wider">{trackedRequest.assignedRound}</span>
                      </div>
                    )}

                    {trackedRequest.refusalReason && (
                      <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-2xl font-bold leading-normal">
                        <strong>Motif de refus :</strong> {trackedRequest.refusalReason}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 p-16 rounded-[32px] text-center space-y-4 shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto">
                <svg className="w-20 h-20 text-slate-200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50" cy="50" r="30" />
                  <line x1="71" y1="71" x2="88" y2="88" strokeWidth="2.5" />
                </svg>
                <div className="space-y-1">
                  <p className="font-extrabold text-[#0F2C59] text-sm">Prêt pour la recherche</p>
                  <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Saisissez votre code ci-dessus. Exemples pré-enregistrés : **CP-94300-1042** ou **CP-94300-0987**.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────── 5. ESPACE ADMINISTRATEUR (Stripe/Linear Dashboard) ──────── */}
        {view === 'admin' && (
          <div className="w-full bg-[#f8fafc] min-h-screen py-12 px-8 md:px-12 space-y-10 text-left">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-[9px] text-[#2563EB] bg-[#EFF6FF] border border-blue-200/60 font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full inline-block">Console logistique</span>
                <h2 className="text-3xl font-black text-[#0F2C59] mt-3 tracking-tight">Dashboard d'Instruction</h2>
              </div>

              {/* Navigation des sous-onglets Admin */}
              <div className="flex bg-slate-200/60 border border-slate-200 p-1 rounded-xl shadow-inner select-none">
                <button 
                  onClick={() => setAdminActiveSubTab('list')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${adminActiveSubTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Feuilles de demandes
                </button>
                <button 
                  onClick={() => setAdminActiveSubTab('map')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${adminActiveSubTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Carte logistique
                </button>
                <button 
                  onClick={() => setAdminActiveSubTab('heatmap')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${adminActiveSubTab === 'heatmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Analyse de charge (Heatmap)
                </button>
              </div>
            </div>

            {/* KPIs Stripe-like larges et aérés */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Demandes à instruire', value: kpiPending, color: 'text-amber-500', desc: 'Objectif de validation : < 24h' },
                { label: 'Déclarées aujourd\'hui', value: kpiToday, color: 'text-[#2563EB]', desc: 'Volume de saisie stable' },
                { label: 'Équipes en tournée', value: '2', color: 'text-[#00D182]', desc: 'Tournées Nord & Sud actives' },
                { label: 'Demandes clôturées', value: kpiCollected + 140, color: 'text-slate-800', desc: 'Taux de revalorisation : 84%' }
              ].map(k => (
                <div key={k.label} className="bg-white border border-slate-200/80 p-6.5 rounded-2xl shadow-sm text-left space-y-2">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">{k.label}</span>
                  <div className={`text-4xl font-black ${k.color}`}>{k.value}</div>
                  <span className="text-[10px] text-slate-500 font-medium block pt-1.5 border-t border-slate-100">{k.desc}</span>
                </div>
              ))}
            </div>

            {/* Sous-vue : LISTE DES DEMANDES */}
            {adminActiveSubTab === 'list' && (
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Liste */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Barre de filtrage élégante */}
                  <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Rechercher nom, réf..." 
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="bg-slate-50 border border-slate-200/80 pl-8 text-xs py-2 w-48 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-blue-100"
                        />
                        <Search size={12} className="absolute left-2.5 top-3 text-slate-400" />
                      </div>

                      <select 
                        value={adminFilterStatus}
                        onChange={(e) => setAdminFilterStatus(e.target.value)}
                        className="bg-slate-55 border border-slate-200/80 text-xs py-2 px-2.5 rounded-lg font-bold outline-none cursor-pointer"
                      >
                        <option value="All">Statuts</option>
                        <option value="Pending">À valider</option>
                        <option value="Approved">Approuvé</option>
                        <option value="Scheduled">Planifié</option>
                        <option value="Collected">Collecté</option>
                        <option value="Refused">Refusé</option>
                      </select>

                      <select 
                        value={adminFilterDistrict}
                        onChange={(e) => setAdminFilterDistrict(e.target.value)}
                        className="bg-slate-55 border border-slate-200/80 text-xs py-2 px-2.5 rounded-lg font-bold outline-none cursor-pointer"
                      >
                        <option value="All">Quartiers</option>
                        {DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs text-slate-450 font-bold">{filteredRequests.length} dossiers</span>
                  </div>

                  {/* Tableau ultra épuré */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-455 uppercase font-black tracking-wider text-[9px]">
                            <th className="p-4 pl-6">Dossier</th>
                            <th className="p-4">Demandeur / Adresse</th>
                            <th className="p-4">Quartier</th>
                            <th className="p-4">Date demandée</th>
                            <th className="p-4">Objets</th>
                            <th className="p-4 pr-6">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequests.map(r => {
                            const totalQty = Object.values(r.items).reduce((a, b) => a + b, 0);
                            return (
                              <tr 
                                key={r.id} 
                                onClick={() => setSelectedRequest(r)}
                                className={`cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50/50 ${selectedRequest?.id === r.id ? 'bg-slate-50' : ''}`}
                              >
                                <td className="p-4 pl-6 font-extrabold text-[#2563EB] tracking-wider">{r.id}</td>
                                <td className="p-4">
                                  <span className="font-bold text-slate-800 block">{r.name}</span>
                                  <span className="text-[10px] text-slate-455 block truncate max-w-[200px] mt-0.5">{r.address}</span>
                                </td>
                                <td className="p-4 font-semibold text-slate-600">{r.district}</td>
                                <td className="p-4 font-bold text-slate-700">{r.preferredDate}</td>
                                <td className="p-4">
                                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                                    {totalQty} objets
                                  </span>
                                </td>
                                <td className="p-4 pr-6">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border ${
                                    r.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    r.status === 'Refused' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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

                {/* Tiroir d'instruction Vercel-style */}
                <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm h-fit space-y-6">
                  {selectedRequest ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[9px] text-slate-455 font-black block uppercase tracking-wider">Instruction</span>
                          <h4 className="text-base font-black text-[#0F2C59] mt-1">{selectedRequest.id}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          selectedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                          selectedRequest.status === 'Refused' ? 'bg-red-50 text-red-700 border-red-250' : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                        }`}>
                          {selectedRequest.status}
                        </span>
                      </div>

                      {/* Objets list */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-455 font-black block uppercase tracking-wider">Détail du dépôt</span>
                        <div className="bg-slate-55 border border-slate-200/50 p-4 rounded-2xl space-y-2">
                          {Object.entries(selectedRequest.items).map(([itemId, qty]) => {
                            const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                            return (
                              <div key={itemId} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                <span>{itemDef ? itemDef.name : itemId}</span>
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-black text-slate-800 text-[10px]">x{qty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Coordonnées */}
                      <div className="space-y-2 text-xs font-semibold text-slate-650">
                        <span className="text-[9px] text-slate-455 font-black block uppercase tracking-wider mb-2">Demandeur</span>
                        <p><span className="text-slate-400 font-bold">Nom :</span> {selectedRequest.name}</p>
                        <p><span className="text-slate-400 font-bold">Téléphone :</span> {selectedRequest.phone}</p>
                        <p><span className="text-slate-400 font-bold">Adresse :</span> {selectedRequest.address}</p>
                        <p><span className="text-slate-400 font-bold">Quartier :</span> {selectedRequest.district}</p>
                      </div>

                      {/* Actions */}
                      {selectedRequest.status === 'Pending' ? (
                        <div className="space-y-4 border-t border-slate-100 pt-5">
                          <div className="space-y-2">
                            <label className="text-[9px] text-slate-455 font-black block uppercase tracking-wider">Notes pour l'équipe (facultatif)</label>
                            <textarea 
                              placeholder="Consignes particulières (ex : derrière le portail...)"
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              className="w-full bg-slate-55 border border-slate-200/80 text-xs h-20 py-2.5 px-3 rounded-xl font-medium outline-none focus:bg-white focus:ring-1 focus:ring-blue-100"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button 
                              onClick={() => handleAdminApprove(selectedRequest.id)}
                              className="bg-[#00D182] hover:bg-[#00B871] text-white font-extrabold py-3.5 rounded-xl text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                            >
                              Approuver
                            </button>
                            <button 
                              onClick={() => {
                                const reason = prompt("Indiquez la raison du refus (ex : Déchets de chantiers interdits) :");
                                if (reason) handleAdminRefuse(selectedRequest.id, reason);
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-extrabold py-3.5 rounded-xl text-xs cursor-pointer transition-all active:scale-95"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-55 border border-slate-200/50 p-4 rounded-xl space-y-2.5 text-xs font-semibold text-slate-700">
                          <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Résumé d'instruction</span>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date d'action :</span>
                            <span>{selectedRequest.createdAt}</span>
                          </div>
                          {selectedRequest.assignedRound && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tournée affectée :</span>
                              <span className="text-[#2563EB] font-black">{selectedRequest.assignedRound}</span>
                            </div>
                          )}
                          {selectedRequest.refusalReason && (
                            <div className="text-red-600 mt-2 pt-2 border-t border-slate-200/60 leading-relaxed font-bold">
                              <strong>Motif de refus :</strong> {selectedRequest.refusalReason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 font-bold text-xs space-y-4 flex flex-col items-center">
                      <svg className="w-16 h-16 text-slate-200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="20" y="20" width="60" height="60" rx="8" fill="#FFFFFF" />
                        <line x1="35" y1="40" x2="65" y2="40" />
                        <line x1="35" y1="50" x2="65" y2="50" />
                      </svg>
                      <span>Sélectionnez un dossier à gauche pour l'instruire.</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Sous-vue : MAP LOGISTIQUE */}
            {adminActiveSubTab === 'map' && (
              <div className="max-w-7xl mx-auto bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-extrabold text-[#0F2C59] text-base">Plan de charge de Choisy-le-Roi</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Visualisation des points de collecte géolocalisés sur le territoire municipal.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Carte interactive avec la Seine */}
                  <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl h-[420px] relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      {/* River Seine */}
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#DBEAFE" strokeWidth="20" strokeLinecap="round" />
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
                      
                      {/* Streets representation */}
                      <path d="M 60 0 Q 120 150 80 300" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                      <path d="M 230 0 L 270 300" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                      <path d="M 0 180 L 500 160" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
                      
                      {/* Active points */}
                      {requests.map(req => {
                        const x = req.coordinates.x * 1.5;
                        const y = req.coordinates.y * 0.9;
                        const isSelected = selectedRequest?.id === req.id;
                        return (
                          <g key={req.id} onClick={() => setSelectedRequest(req)} className="cursor-pointer">
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 10 : 7} 
                              fill={req.status === 'Pending' ? '#f59e0b' : req.status === 'Refused' ? '#ef4444' : '#00D182'}
                              className="transition-all"
                            />
                            {isSelected && <circle cx={x} cy={y} r={16} fill="none" stroke="#0F2C59" strokeWidth="2" className="animate-pulse" />}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Panel latéral info-carte */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                    {selectedRequest ? (
                      <div className="space-y-4 text-xs">
                        <span className="text-[9px] text-slate-455 font-black uppercase tracking-wider block">Dossier sélectionné</span>
                        <p className="font-extrabold text-[#0F2C59] text-sm">{selectedRequest.id}</p>
                        <p className="text-slate-655"><span className="text-slate-400 font-bold">Citoyen :</span> {selectedRequest.name}</p>
                        <p className="text-slate-655"><span className="text-slate-400 font-bold">Adresse :</span> {selectedRequest.address}</p>
                        <p className="text-slate-655"><span className="text-slate-400 font-bold">Quartier :</span> {selectedRequest.district}</p>
                      </div>
                    ) : (
                      <p className="text-slate-455 font-bold text-center py-12 text-xs">Sélectionnez un point sur la carte.</p>
                    )}

                    <button 
                      onClick={() => setAdminActiveSubTab('list')}
                      className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-100 cursor-pointer"
                    >
                      Retour aux demandes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sous-vue : HEATMAP DE CHARGE */}
            {adminActiveSubTab === 'heatmap' && (
              <div className="max-w-7xl mx-auto bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-extrabold text-[#0F2C59] text-base">Densité géographique des dépôts</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Analyse cartographique permettant de cibler les zones à forte charge logistique.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Heatmap vectorielle avec filtres radiaux */}
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-950 rounded-2xl h-[420px] relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      {/* River */}
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#1E293B" strokeWidth="20" strokeLinecap="round" />
                      
                      {/* Heat points with glowing gradients */}
                      <circle cx="160" cy="140" r="60" fill="url(#heat-red-glow)" />
                      <circle cx="280" cy="90" r="50" fill="url(#heat-yellow-glow)" />
                      <circle cx="90" cy="220" r="70" fill="url(#heat-green-glow)" />
                      
                      <defs>
                        <radialGradient id="heat-red-glow">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heat-yellow-glow">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heat-green-glow">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                    
                    <span className="absolute top-4 left-4 bg-slate-955/80 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-full border border-slate-800">
                      Vue thermique active
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs font-semibold text-left">
                    <h5 className="font-extrabold text-[#0F2C59] uppercase tracking-wider text-[10px] mb-3">Volume par quartier</h5>
                    <div className="space-y-4">
                      {districtDistribution.map(item => {
                        const maxVal = Math.max(...districtDistribution.map(d => d.count), 1);
                        const pct = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span>{item.name}</span>
                              <span>{item.count} dépôts</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#00D182] h-full rounded-full" style={{ width: `${pct}%` }}></div>
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

        {/* ──────── 6. ESPACE COLLECTEUR (Uber-Style Mobile) ──────── */}
        {role === 'collector' && (
          <div className="max-w-md mx-auto py-12 px-6 space-y-6 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Phone Mockup Frame */}
            <div className="bg-white border-[10px] border-slate-900 rounded-[50px] overflow-hidden shadow-2xl relative">
              {/* Dynamic notch */}
              <div className="bg-slate-900 h-5 w-32 mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 block"></span>
              </div>

              {/* Mobile screen view */}
              <div className="p-4 pt-8 bg-[#f8fafc] min-h-[590px] flex flex-col justify-between text-xs space-y-4">
                
                {/* Mobile App Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-[#E8FFF5] border border-emerald-100 flex items-center justify-center text-emerald-700">
                      <Truck size={14} />
                    </div>
                    <div className="text-left font-semibold">
                      <h4 className="text-slate-800 text-[11px]">Équipe Choisy</h4>
                      <p className="text-[9px] text-[#00D182] font-black uppercase tracking-wider">Benne #04</p>
                    </div>
                  </div>

                  <select 
                    value={activeRound}
                    onChange={(e) => { setActiveRound(e.target.value); setCollectorStopIndex(0); }}
                    className="bg-white border border-slate-200 text-[9px] py-1.5 px-2 w-32 rounded-lg font-bold cursor-pointer"
                  >
                    <option value="Tournée Nord">Tournée Nord</option>
                    <option value="Tournée Sud">Tournée Sud</option>
                  </select>
                </div>

                {/* Truck Capacity Jauge */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-700">
                    <span>CAPACITÉ DU CAMION BENNE</span>
                    <span className="text-[#2563EB]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-105 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-teal-400 h-full rounded-full transition-all duration-350"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current route stop */}
                {currentStop ? (
                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4 text-left relative overflow-hidden flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="bg-blue-50 text-blue-800 border border-blue-100 font-extrabold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                          Prochain arrêt
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">{collectorStopIndex + 1} / {roundRequests.length}</span>
                      </div>

                      <div className="space-y-1 mt-3">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Adresse</span>
                        <h5 className="font-black text-slate-800 text-sm leading-snug">{currentStop.address}</h5>
                        <span className="text-[10px] text-[#2563EB] font-bold block">{currentStop.district}</span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 mt-4">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Objets à enlever</span>
                        <div className="bg-slate-55 border border-slate-200/50 p-3 rounded-xl space-y-1.5">
                          {Object.entries(currentStop.items).map(([itemId, qty]) => {
                            const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                            return (
                              <div key={itemId} className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                <span>{itemDef ? itemDef.name : itemId}</span>
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-black text-[9px]">x{qty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      {/* GPS navigation representation */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex gap-2.5 items-start">
                        <Compass className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                        <p className="text-[10px] text-emerald-800 leading-normal font-bold">
                          Roulez sur **300m** puis tournez à droite sur **Avenue de la République**. Le dépôt est situé face au numéro 12.
                        </p>
                      </div>

                      {/* Proof photo upload */}
                      <div className="space-y-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setCollectorProofAttached(true);
                            alert("Preuve photo validée.");
                          }}
                          className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-700 py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-bold"
                        >
                          <Upload size={12} className="text-slate-400" />
                          <span>{collectorProofAttached ? "Photo enregistrée" : "Prendre une photo de preuve"}</span>
                        </button>
                      </div>

                      {/* Action trigger buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => handleCollectorStatus('Collected')}
                          className="bg-[#00D182] hover:bg-[#00B871] text-white font-extrabold py-3.5 rounded-xl text-[10px] cursor-pointer shadow-sm text-center"
                        >
                          Collecté
                        </button>
                        <button 
                          onClick={() => handleCollectorStatus('Absent')}
                          className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold py-3.5 rounded-xl text-[10px] cursor-pointer text-center"
                        >
                          Absent
                        </button>
                        <button 
                          onClick={() => {
                            if (!collectorProofAttached) {
                              alert("Veuillez d'abord joindre une photo de preuve pour justifier le refus.");
                              return;
                            }
                            handleCollectorStatus('Impossible');
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-655 border border-red-200 font-extrabold py-3.5 rounded-xl text-[9px] cursor-pointer text-center"
                        >
                          Non Conforme
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-4 my-auto flex flex-col items-center">
                    <svg className="w-20 h-20 text-[#00D182]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="20" y="20" width="60" height="60" rx="8" />
                      <path d="M35 50 L45 60 L65 40" />
                    </svg>
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">Tournée clôturée !</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Tous les points de collecte de votre feuille de route ont été traités avec succès.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* iPhone screen bottom bar */}
              <div className="bg-slate-200 h-1 w-24 mx-auto rounded-full my-2"></div>
            </div>
          </div>
        )}

      </div>

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

    </div>
  );
}
