'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, 
  ChevronRight, Plus, Minus, Upload, Filter, Compass, Check, ArrowRight, 
  BarChart3, RefreshCw, Smartphone, ShieldCheck, Mail, Send, Award, FileText,
  User, Truck, Settings, Info, Users, Bell, Search, Map
} from 'lucide-react';

// Types pour l'état de l'application
interface BulkyItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliances' | 'other';
  quantity: number;
}

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

// Données initiales réalistes (Choisy-le-Roi)
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
    assignedRound: "Tournée Bleue (Nord)",
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
    assignedRound: "Tournée Verte (Sud)",
    coordinates: { x: 80, y: 280 }
  },
  {
    id: "CP-94300-0754",
    name: "Yasmine Alami",
    phone: "06 55 44 33 22",
    email: "yasmine.alami@outlook.com",
    address: "107 Avenue Victor Hugo, Choisy-le-Roi",
    district: "Gondoles Sud",
    items: { "table": 1, "chair": 2, "misc": 3 },
    status: "Collected",
    preferredDate: "2026-05-26",
    createdAt: "2026-05-24",
    assignedRound: "Tournée Bleue (Nord)",
    coordinates: { x: 280, y: 210 }
  },
  {
    id: "CP-94300-1105",
    name: "Jean Dupont",
    phone: "07 11 22 33 44",
    email: "j.dupont@orange.fr",
    address: "32 Rue de la Paix, Choisy-le-Roi",
    district: "Centre-Ville",
    items: { "paint": 5 },
    status: "Refused",
    refusalReason: "Produits dangereux (pots de peinture de chantier non autorisés)",
    preferredDate: "2026-05-28",
    createdAt: "2026-05-27",
    coordinates: { x: 140, y: 190 }
  }
];

const COLLECTIBLE_ITEMS = [
  { id: 'sofa', name: 'Canapé / Sofa', category: 'furniture', icon: '🛋️' },
  { id: 'mattress', name: 'Matelas / Sommier', category: 'furniture', icon: '🛏️' },
  { id: 'chair', name: 'Chaise / Tabouret', category: 'furniture', icon: '🪑' },
  { id: 'wardrobe', name: 'Armoire / Commode', category: 'furniture', icon: '🚪' },
  { id: 'washing_machine', name: 'Lave-linge', category: 'appliances', icon: '🧺' },
  { id: 'refrigerator', name: 'Réfrigérateur', category: 'appliances', icon: '❄️' },
  { id: 'table', name: 'Table / Bureau', category: 'furniture', icon: '🪵' },
  { id: 'misc', name: 'Objets divers', category: 'other', icon: '📦' }
];

const FORBIDDEN_EXAMPLES = [
  { name: 'Déchets de chantier / Gravats', desc: 'Briques, plâtre, ciment. Déposer en déchèterie.', icon: '🧱' },
  { name: 'Produits dangereux / Chimiques', desc: 'Bouteilles de gaz, solvants, acides.', icon: '☣️' },
  { name: 'Pots de peinture / Solvants', desc: 'Substances toxiques polluantes.', icon: '🎨' },
  { name: 'Pneus et batteries', desc: 'Filière automobile obligatoire.', icon: '🛞' }
];

const DISTRICTS = [
  "Centre-Ville",
  "Gondoles Nord",
  "Gondoles Sud",
  "Hautes-Formes",
  "Le Port",
  "Les Flores"
];

export default function ChoisyPropre() {
  const [role, setRole] = useState<'citizen' | 'admin' | 'collector'>('citizen');
  const [requests, setRequests] = useState<RequestData[]>(INITIAL_REQUESTS);
  
  // États de simulation de notifications
  const [notifications, setNotifications] = useState<Array<{id: string, text: string, type: 'email' | 'sms', to: string, time: string}>>([
    { id: '1', text: 'Votre demande CP-94300-0987 a été approuvée par l\'administrateur. Passage prévu le 03 Juin.', type: 'sms', to: '07 98 76 54 32', time: 'Il y a 10 min' },
    { id: '2', text: 'URGENT - Dépôt sauvage signalé au 14 Rue d\'Orves. Équipe d\'intervention dépêchée.', type: 'email', to: 'direction-proprete@choisyleroi.fr', time: 'Il y a 1h' }
  ]);

  // --- ÉTAT CITOYEN ---
  const [citizenTab, setCitizenTab] = useState<'home' | 'form' | 'rules' | 'track' | 'confirm'>('home');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenAddress, setCitizenAddress] = useState('');
  const [citizenDistrict, setCitizenDistrict] = useState(DISTRICTS[0]);
  const [citizenDate, setCitizenDate] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<{ name: string; size: string } | null>(null);
  const [generatedRef, setGeneratedRef] = useState('');
  const [searchRef, setSearchRef] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<RequestData | null>(null);
  
  // Signalement dépôt sauvage citoyen
  const [isDumpingModalOpen, setIsDumpingModalOpen] = useState(false);
  const [dumpingAddress, setDumpingAddress] = useState('');
  const [dumpingDesc, setDumpingDesc] = useState('');

  // --- ÉTAT ADMIN ---
  const [adminFilterStatus, setAdminFilterStatus] = useState<string>('All');
  const [adminFilterDistrict, setAdminFilterDistrict] = useState<string>('All');
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<RequestData | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [refusalReason, setRefusalReason] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState<'list' | 'map' | 'heatmap'>('list');

  // --- ÉTAT COLLECTEUR ---
  const [activeRound, setActiveRound] = useState<string>('Tournée Bleue (Nord)');
  const [collectorCurrentStop, setCollectorCurrentStop] = useState<number>(0);
  const [collectorProofPhoto, setCollectorProofPhoto] = useState<string | null>(null);
  
  const addNotification = (text: string, type: 'email' | 'sms', to: string) => {
    const newNotif = {
      id: Date.now().toString(),
      text,
      type,
      to,
      time: 'À l\'instant'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Actions Citoyen
  const handleItemCountChange = (itemId: string, increment: boolean) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      const next = increment ? current + 1 : Math.max(0, current - 1);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return updated;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedPhoto({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' Mo'
      });
    }
  };

  const submitCitizenForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedItems).length === 0) {
      alert("Veuillez sélectionner au moins un objet à collecter.");
      return;
    }

    const ref = "CP-94300-" + Math.floor(1000 + Math.random() * 9000);
    setGeneratedRef(ref);

    const randomCoords = {
      x: 50 + Math.floor(Math.random() * 250),
      y: 50 + Math.floor(Math.random() * 250)
    };

    const newRequest: RequestData = {
      id: ref,
      name: citizenName || "Citoyen Anonyme",
      phone: citizenPhone || "Non renseigné",
      email: citizenEmail || "Non renseigné",
      address: citizenAddress || "Choisy-le-Roi",
      district: citizenDistrict,
      items: selectedItems,
      photoName: uploadedPhoto ? uploadedPhoto.name : undefined,
      preferredDate: citizenDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      coordinates: randomCoords
    };

    setRequests(prev => [newRequest, ...prev]);
    
    addNotification(
      `Votre demande de collecte d'encombrants a bien été enregistrée sous la référence ${ref}. Un agent va l'étudier sous 24h.`,
      'sms',
      newRequest.phone
    );
    addNotification(
      `Nouvelle demande déposée par ${newRequest.name} à l'adresse : ${newRequest.address}. En attente de validation.`,
      'email',
      'service.proprete@choisyleroi.fr'
    );

    setSelectedItems({});
    setCitizenName('');
    setCitizenPhone('');
    setCitizenEmail('');
    setCitizenAddress('');
    setUploadedPhoto(null);
    setCitizenTab('confirm');
  };

  const handleSearchTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = requests.find(r => r.id.toLowerCase() === searchRef.trim().toLowerCase());
    setTrackedRequest(found || null);
    if (!found) {
      alert("Numéro de référence introuvable. Essayez avec CP-94300-1042 ou CP-94300-0987.");
    }
  };

  const submitDumpingReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dumpingAddress) return;
    
    addNotification(
      `ALERT Dépôt Sauvage : Signalé au ${dumpingAddress}. Description : ${dumpingDesc || "Aucune description"}.`,
      'email',
      'brigade-verte@choisyleroi.fr'
    );
    alert("Merci pour votre civisme ! La brigade verte a été notifiée et interviendra dans les plus brefs délais.");
    setIsDumpingModalOpen(false);
    setDumpingAddress('');
    setDumpingDesc('');
  };

  // Actions Admin
  const handleApproveRequest = (id: string) => {
    const updated = requests.map(r => {
      if (r.id === id) {
        const round = r.district.includes("Nord") || r.district === "Centre-Ville" ? "Tournée Bleue (Nord)" : "Tournée Verte (Sud)";
        addNotification(
          `Bonne nouvelle ! Votre demande d'encombrants ${r.id} a été validée. Elle est planifiée pour la ${round} le ${r.preferredDate}.`,
          'sms',
          r.phone
        );
        return { 
          ...r, 
          status: 'Scheduled' as const, 
          assignedRound: round,
          adminComment: adminComment || undefined 
        };
      }
      return r;
    });
    setRequests(updated);
    const updatedReq = updated.find(r => r.id === id);
    if (updatedReq) setSelectedRequestForDetail(updatedReq);
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

  // Calcul KPIs
  const kpiToday = requests.filter(r => r.createdAt === new Date().toISOString().split('T')[0]).length;
  const kpiPending = requests.filter(r => r.status === 'Pending').length;
  const kpiCollected = requests.filter(r => r.status === 'Collected').length;
  
  const districtDistribution = DISTRICTS.map(dist => {
    const count = requests.filter(r => r.district === dist).length;
    return { name: dist, count };
  });

  // --- ACTIONS COLLECTEUR ---
  const currentRoundRequests = requests.filter(r => r.assignedRound === activeRound && (r.status === 'Scheduled' || r.status === 'In progress'));
  const currentStopRequest = currentRoundRequests[collectorCurrentStop];

  const handleCollectorStatus = (status: 'Collected' | 'Absent' | 'Impossible') => {
    if (!currentStopRequest) return;
    
    let nextStatus: RequestData['status'] = 'Collected';
    let comment = "";
    
    if (status === 'Collected') {
      nextStatus = 'Collected';
      comment = "Collecté avec succès par l'équipe.";
    } else if (status === 'Absent') {
      nextStatus = 'Refused';
      comment = "Non collecté : Résident absent lors du passage requis.";
    } else if (status === 'Impossible') {
      nextStatus = 'Refused';
      comment = "Non collecté : Dépôt non conforme ou inaccessible.";
    }

    setRequests(prev => prev.map(r => {
      if (r.id === currentStopRequest.id) {
        addNotification(
          `Mise à jour : Votre collecte ${r.id} est marquée comme ${status === 'Collected' ? 'Effectuée' : 'Annulée (' + comment + ')'}.`,
          'sms',
          r.phone
        );
        return { ...r, status: nextStatus, adminComment: comment };
      }
      return r;
    }));

    setCollectorProofPhoto(null);

    if (collectorCurrentStop < currentRoundRequests.length - 1) {
      setCollectorCurrentStop(prev => prev + 1);
    } else {
      alert("Félicitations ! Vous avez terminé tous les arrêts de votre tournée actuelle !");
      setCollectorCurrentStop(0);
    }
  };

  const totalItemsInRound = currentRoundRequests.length;
  const progressPercent = totalItemsInRound > 0 
    ? Math.round((collectorCurrentStop / totalItemsInRound) * 100) 
    : 100;

  return (
    <div className="choisy-page-wrapper min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative" style={{ backgroundColor: '#f8fafc', color: '#334155' }}>
      
      {/* ═══ BARRE DE SIMULATION DU PORTFOLIO (Light Glassmorphic) ═══ */}
      <div className="w-full bg-white/95 border-b border-slate-200 py-3 px-6 sticky top-0 z-50 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Maquette de Portfolio</p>
              <h2 className="text-xs font-extrabold text-slate-800 mt-1 leading-tight">MON CHOISY PROPRE — PROPRIÉTÉ DE XIRH</h2>
            </div>
          </div>
          
          {/* Sélecteur de Rôle Style Public Service */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setRole('citizen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'citizen' ? 'bg-white text-emerald-700 shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <User size={13} className="text-emerald-500" /> Espace Citoyen
            </button>
            <button 
              onClick={() => { setRole('admin'); setAdminActiveTab('list'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'admin' ? 'bg-white text-blue-700 shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <ShieldCheck size={13} className="text-blue-500" /> Administration
            </button>
            <button 
              onClick={() => setRole('collector')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'collector' ? 'bg-white text-amber-700 shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Truck size={13} className="text-amber-500" /> Équipe de Collecte
            </button>
          </div>

          <div className="text-xs flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold text-[10px]">Choisy-le-Roi (94)</span>
          </div>
        </div>
      </div>

      {/* ═══ EN-TÊTE DE L'APPLICATION (Scoped Div) ═══ */}
      <div className="w-full bg-white border-b border-slate-150 py-5 px-6 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-tr from-emerald-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-400/10 shrink-0">
              <Trash2 className="text-white" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black text-slate-800 tracking-tight">Mon Choisy Propre</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Mairie</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold tracking-wide mt-0.5">Plateforme municipale d'enlèvement des encombrants</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Clock size={15} className="text-emerald-500" />
              <span>Cadrage et validation sous 24h</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-slate-200"></div>
            <a href="/" className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <span>Retour Portfolio XIRH</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* ═══ BANDEAU D'ALERTES / NOTIFICATIONS SIMULÉES ═══ */}
      <div className="w-full bg-slate-900 text-slate-200 py-3 px-6 z-10 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Bell size={11} /> SMS/Mail
            </span>
            <span className="text-slate-400 font-medium">Simulation citoyenne :</span>
          </div>
          <div className="flex-1 text-slate-300 font-medium leading-relaxed">
            {notifications.length > 0 ? (
              <span className="animate-[fadeIn_0.3s_ease-out]">
                <strong>[{notifications[0].type.toUpperCase()} pour {notifications[0].to}] :</strong> "{notifications[0].text}"
              </span>
            ) : (
              <span className="text-slate-500">Aucune alerte générée. Soumettez un formulaire pour voir l'alerte !</span>
            )}
          </div>
          <button 
            onClick={() => alert(`Historique des SMS et e-mails simulés :\n\n` + notifications.map(n => `[${n.time}] ${n.type.toUpperCase()} à ${n.to} :\n${n.text}\n`).join('\n'))}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline shrink-0 cursor-pointer"
          >
            Historique ({notifications.length})
          </button>
        </div>
      </div>

      {/* ═══ CONTENU PRINCIPAL DE L'APPLICATION ═══ */}
      <div className="flex-1 py-10 px-6 max-w-7xl mx-auto w-full z-10 space-y-10">

        {/* ──────── VUE CITOYEN ──────── */}
        {role === 'citizen' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* HERO BANNER CITOYEN (Modern light style, colorful vector feeling) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-12 shadow-md relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
              
              {/* Illustration de gauche ou texte */}
              <div className="flex-1 space-y-6 relative z-10 text-left">
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 font-extrabold text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full">
                  🍃 Service Public Éco-Citoyen
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                  Ensemble, préservons la propreté de Choisy-le-Roi.
                </h2>
                <p className="text-slate-650 leading-relaxed text-sm md:text-base">
                  Vous résidez à Choisy-le-Roi ? Planifiez facilement l'enlèvement gratuit de vos encombrants à votre domicile. Notre équipe municipale se charge du tri et du recyclage éco-responsable.
                </p>
                
                {/* Actions principales */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setCitizenTab('form')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-600/10 text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Faire une demande de retrait</span>
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => setCitizenTab('track')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-200 cursor-pointer"
                  >
                    <Search size={15} />
                    <span>Suivre ma demande</span>
                  </button>
                  <button 
                    onClick={() => setIsDumpingModalOpen(true)}
                    className="bg-red-50 hover:bg-red-650 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <AlertTriangle size={15} />
                    <span>Signaler un dépôt sauvage</span>
                  </button>
                </div>
              </div>

              {/* Illustration de droite (Magnifique dessin vectoriel de propreté) */}
              <div className="w-full lg:w-96 flex flex-col items-center justify-center shrink-0">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl shadow-inner w-full flex flex-col items-center">
                  {/* Image officielle du logo municipale dans un cadre soigné */}
                  <div className="w-40 h-40 bg-white border border-slate-250/60 p-3 rounded-2xl shadow-sm mb-4 flex items-center justify-center">
                    <img 
                      src="/encombrant-logo.png" 
                      alt="Choisy le Roi Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logo de référence</span>
                  
                  {/* Dessin de Ville Écologique en SVG */}
                  <div className="w-full h-24 mt-4">
                    <svg className="w-full h-full" viewBox="0 0 200 80">
                      {/* Sol */}
                      <path d="M 0 70 Q 100 65 200 70 L 200 80 L 0 80 Z" fill="#eefdf4" />
                      <line x1="0" y1="70" x2="200" y2="70" stroke="#10b981" strokeWidth="2" />
                      {/* Maisons */}
                      <rect x="20" y="35" width="25" height="35" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
                      <polygon points="15,35 32,15 50,35" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.5" />
                      
                      <rect x="150" y="30" width="30" height="40" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" rx="2" />
                      <polygon points="145,30 165,12 185,30" fill="#bbf7d0" stroke="#10b981" strokeWidth="1.5" />
                      
                      {/* Arbre */}
                      <circle cx="85" cy="35" r="18" fill="#d1fae5" opacity="0.9" />
                      <circle cx="85" cy="35" r="14" fill="#10b981" />
                      <rect x="82" y="48" width="6" height="22" fill="#78350f" />
                      
                      {/* Poubelle recyclage */}
                      <rect x="110" y="52" width="12" height="18" fill="#3b82f6" rx="2" />
                      <path d="M 110 52 L 122 52" stroke="#1e3a8a" strokeWidth="2" />
                      <circle cx="116" cy="61" r="3" fill="none" stroke="#ffffff" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* Onglets de navigation Citoyen (Clean modern style) */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              {[
                { id: 'home', label: 'Accueil & Consignes', icon: <Info size={14} /> },
                { id: 'form', label: 'Formulaire de demande', icon: <Plus size={14} /> },
                { id: 'rules', label: 'Objets Autorisés / Exclus', icon: <CheckCircle2 size={14} /> },
                { id: 'track', label: 'Suivi de ma demande', icon: <Clock size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCitizenTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${citizenTab === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Onglet : Accueil */}
            {citizenTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Compass className="text-emerald-500" size={18} />
                      <span>Les 3 étapes de votre collecte citoyenne</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl relative">
                        <span className="absolute top-3 right-3 text-2xl font-black text-slate-200">01</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs mb-4">
                          <FileText size={16} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs">Déclaration en ligne</h4>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                          Sélectionnez vos objets (table, canapé, électroménager) et choisissez une date souhaitée.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl relative">
                        <span className="absolute top-3 right-3 text-2xl font-black text-slate-200">02</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs mb-4">
                          <ShieldCheck size={16} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs">Validation municipale</h4>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                          La mairie vérifie la conformité et vous envoie votre numéro de référence par SMS/mail.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl relative">
                        <span className="absolute top-3 right-3 text-2xl font-black text-slate-200">03</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs mb-4">
                          <Truck size={16} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs">Dépôt et Collecte</h4>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                          Déposez les objets sur le trottoir la veille au soir. Nos agents passent l'esprit tranquille.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Écologique dessiné */}
                  <div className="bg-emerald-50/60 border border-emerald-100 p-6 rounded-2xl flex flex-col sm:flex-row gap-5 items-center">
                    <div className="w-20 h-20 shrink-0">
                      {/* Dessin feuille verte en SVG */}
                      <svg className="w-full h-full" viewBox="0 0 60 60">
                        <path d="M 10 50 C 30 50, 45 40, 50 10 C 20 15, 10 30, 10 50 Z" fill="#bbf7d0" stroke="#10b981" strokeWidth="2" />
                        <path d="M 10 50 C 25 35, 45 20, 50 10" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        <circle cx="25" cy="30" r="2" fill="#047857" />
                        <circle cx="35" cy="22" r="2" fill="#047857" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-emerald-800 text-sm">Favorisons le réemploi & l'économie circulaire</h4>
                      <p className="text-xs text-emerald-700 mt-1.5 leading-relaxed">
                        Chaque canapé, chaise ou table en bon état récolté est transmis à la ressourcerie partenaire de Choisy-le-Roi pour être remis en état et redistribué aux familles modestes. Réduisons notre empreinte carbone ensemble !
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Info Pratique */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6 text-xs">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <MapPin className="text-emerald-500" size={16} />
                    <span>Ressources locales</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Hôtel de Ville de Choisy</span>
                      <p className="text-slate-700 font-semibold">Place Gabriel Péri, 94300</p>
                      <p className="text-slate-500 font-medium">Tél : 01 48 92 44 44</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Déchèterie Intercommunale</span>
                      <p className="text-slate-700 font-semibold">Rue de la Paix, Choisy-le-Roi</p>
                      <p className="text-slate-500 font-medium">Ouverte du lundi au samedi</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-4.5 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                    <strong className="block mb-1 text-blue-900">💡 Conseil Prototype :</strong>
                    Allez dans l'onglet <strong>Suivi de ma demande</strong> et cherchez <code className="bg-white/80 border border-blue-200 px-1 py-0.5 rounded font-bold">CP-94300-1042</code> pour tester le suivi de commande interactif.
                  </div>
                </div>

              </div>
            )}

            {/* Onglet : Formulaire */}
            {citizenTab === 'form' && (
              <form onSubmit={submitCitizenForm} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Sélection objets */}
                <div className="lg:col-span-2 space-y-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-850">1. Quels objets souhaitez-vous faire enlever ?</h3>
                    <p className="text-xs text-slate-500 mt-1">Sélectionnez la quantité désirée. Note : maximum 5 objets par foyer.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLLECTIBLE_ITEMS.map(item => {
                      const qty = selectedItems[item.id] || 0;
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-4 rounded-xl hover:bg-white hover:border-emerald-350 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">{item.icon}</span>
                            <div>
                              <span className="font-bold text-slate-700 text-xs block">{item.name}</span>
                              <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => handleItemCountChange(item.id, false)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-150 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="font-bold text-xs text-slate-800 w-5 text-center">{qty}</span>
                            <button 
                              type="button"
                              onClick={() => handleItemCountChange(item.id, true)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-150 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Photo upload mock */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 text-center hover:bg-slate-100/50 transition-colors">
                    <input 
                      type="file" 
                      id="photo-file" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <label htmlFor="photo-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="text-slate-400" size={24} />
                      <span className="text-xs font-bold text-slate-600">Ajouter une photo (Recommandé)</span>
                      <span className="text-[10px] text-slate-400">Pour aider nos équipes à évaluer la taille et le type de camion.</span>
                    </label>
                    {uploadedPhoto && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-250 p-2 py-1.5 rounded-lg text-xs text-emerald-700 inline-flex items-center gap-2 font-bold shadow-sm">
                        <Check size={13} />
                        <span>{uploadedPhoto.name} ({uploadedPhoto.size})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2 & 3. Lieu, Date et validation */}
                <div className="space-y-6">
                  {/* Lieu & Date */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-850">2. Adresse & Rendez-vous</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">ADRESSE DE COLLECTE</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="ex: 15 Rue Albert 1er, Choisy-le-Roi"
                            value={citizenAddress}
                            onChange={(e) => setCitizenAddress(e.target.value)}
                            className="bg-slate-50 border border-slate-200 pl-8 text-xs py-2.5 rounded-lg"
                          />
                          <MapPin size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold block mb-1">QUARTIER</label>
                          <select 
                            value={citizenDistrict}
                            onChange={(e) => setCitizenDistrict(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs py-2 px-2.5 rounded-lg"
                          >
                            {DISTRICTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold block mb-1">JOUR DE COLLECTE</label>
                          <input 
                            type="date" 
                            required
                            value={citizenDate}
                            onChange={(e) => setCitizenDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs py-2 px-2.5 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Carte Choisy le Roi dessinée */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl h-24 relative overflow-hidden flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 300 150">
                        {/* La Seine */}
                        <path d="M 0 50 Q 80 40 120 70 T 300 60" fill="none" stroke="#3b82f6" strokeWidth="8" />
                        <path d="M 60 0 L 80 150" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                        <path d="M 120 0 L 150 150" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                        <circle cx="160" cy="80" r="8" fill="#10b981" />
                      </svg>
                      <div className="relative text-center z-10">
                        <MapPin className="text-emerald-600 mx-auto animate-bounce" size={16} />
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider mt-1">Adresse localisée</span>
                        <span className="text-[10px] text-slate-700 font-bold truncate max-w-[180px] block">{citizenAddress || "Indiquez l'adresse"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées & Soumission */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold text-slate-850">3. Vos coordonnées</h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">NOM COMPLET</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Nom Prénom" 
                          value={citizenName}
                          onChange={(e) => setCitizenName(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-2.5 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">NUMÉRO DE MOBILE</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="06 12 34 56 78" 
                          value={citizenPhone}
                          onChange={(e) => setCitizenPhone(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-2.5 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold block mb-1">E-MAIL</label>
                        <input 
                          type="email" 
                          required
                          placeholder="votre.email@domain.com" 
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-2.5 rounded-lg"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Envoyer ma demande à la mairie</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Onglet : Règles de tri */}
            {citizenTab === 'rules' && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Réglementation municipale du tri</h3>
                  <p className="text-xs text-slate-500">Pour la sécurité des agents de Choisy-le-Roi et la préservation de la nature, merci de suivre rigoureusement ces règles.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Autorisé */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl space-y-6">
                    <h4 className="font-extrabold text-emerald-800 text-sm flex items-center gap-2 border-b border-emerald-100 pb-3">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      <span>Acceptés à la collecte sur le trottoir</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {COLLECTIBLE_ITEMS.map(item => (
                        <div key={item.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex gap-2.5 items-center shadow-sm">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-xs font-bold text-slate-700">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interdit */}
                  <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl space-y-6">
                    <h4 className="font-extrabold text-red-800 text-sm flex items-center gap-2 border-b border-red-100 pb-3">
                      <XCircle className="text-red-500" size={18} />
                      <span>Strictement interdits sur la voie publique</span>
                    </h4>

                    <div className="space-y-3.5">
                      {FORBIDDEN_EXAMPLES.map(ex => (
                        <div key={ex.name} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-3.5 items-start shadow-sm">
                          <span className="text-2xl bg-slate-55 p-1 rounded-lg">{ex.icon}</span>
                          <div>
                            <span className="text-xs font-extrabold text-red-750 block">{ex.name}</span>
                            <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">{ex.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet : Suivi */}
            {citizenTab === 'track' && (
              <div className="max-w-2xl mx-auto space-y-8 bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800">Suivre ma demande de collecte</h3>
                  <p className="text-xs text-slate-400">Entrez le code de suivi CP-XXXX reçu par SMS ou e-mail.</p>
                </div>

                <form onSubmit={handleSearchTrack} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="ex: CP-94300-1042" 
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value)}
                    className="bg-slate-50 border border-slate-200 uppercase tracking-widest text-center text-sm font-black py-3 rounded-xl"
                  />
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl transition-all text-xs flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Search size={14} />
                    <span>Rechercher</span>
                  </button>
                </form>

                {trackedRequest ? (
                  <div className="border-t border-slate-100 pt-6 space-y-6 animate-fade-in text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase bg-emerald-55 px-2 py-0.5 rounded">DOSSIER MUNICIPAL</span>
                        <h4 className="text-base font-black text-slate-800 mt-2">{trackedRequest.id}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Adresse : {trackedRequest.address}</p>
                      </div>
                      <span className={`badge ${
                        trackedRequest.status === 'Pending' ? 'badge-warning' :
                        trackedRequest.status === 'Refused' ? 'badge-danger' : 'badge-success'
                      }`}>
                        {trackedRequest.status === 'Pending' ? 'En attente de validation' : 
                         trackedRequest.status === 'Approved' ? 'Demande approuvée' : 
                         trackedRequest.status === 'Scheduled' ? 'Passage planifié' : 
                         trackedRequest.status === 'In progress' ? 'Collecte en cours' : 
                         trackedRequest.status === 'Collected' ? 'Objets collectés' : 'Demande refusée'}
                      </span>
                    </div>

                    {/* Progression */}
                    <div className="relative py-6">
                      <div className="absolute top-1/2 left-3 right-3 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                      <div 
                        className="absolute top-1/2 left-3 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ 
                          width: trackedRequest.status === 'Pending' ? '0%' :
                                 trackedRequest.status === 'Approved' ? '25%' :
                                 trackedRequest.status === 'Scheduled' ? '50%' :
                                 trackedRequest.status === 'In progress' ? '75%' :
                                 trackedRequest.status === 'Collected' ? '100%' : '0%' 
                        }}
                      ></div>

                      <div className="relative z-10 flex justify-between">
                        {[
                          { name: 'Créé', status: 'Pending' },
                          { name: 'Approuvé', status: 'Approved' },
                          { name: 'Planifié', status: 'Scheduled' },
                          { name: 'En cours', status: 'In progress' },
                          { name: 'Collecté', status: 'Collected' }
                        ].map((step, idx) => {
                          const isCompleted = trackedRequest.status !== 'Refused' && (
                            trackedRequest.status === step.status || 
                            (idx === 0) ||
                            (idx === 1 && ['Approved', 'Scheduled', 'In progress', 'Collected'].includes(trackedRequest.status)) ||
                            (idx === 2 && ['Scheduled', 'In progress', 'Collected'].includes(trackedRequest.status)) ||
                            (idx === 3 && ['In progress', 'Collected'].includes(trackedRequest.status)) ||
                            (idx === 4 && trackedRequest.status === 'Collected')
                          );

                          return (
                            <div key={step.name} className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isCompleted ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-500'}`}>
                                {isCompleted ? <Check size={11} strokeWidth={3} /> : idx + 1}
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold mt-2">{step.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Passage programmé :</span>
                        <strong className="text-slate-800">{trackedRequest.preferredDate}</strong>
                      </div>
                      {trackedRequest.assignedRound && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Tournée affectée :</span>
                          <strong className="text-emerald-700">{trackedRequest.assignedRound}</strong>
                        </div>
                      )}
                      {trackedRequest.refusalReason && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-red-700 mt-2 font-medium">
                          <strong>Motif de refus municipal :</strong> {trackedRequest.refusalReason}
                        </div>
                      )}
                      {trackedRequest.adminComment && (
                        <div className="bg-white p-3 rounded-lg text-slate-650 mt-2 border border-slate-200">
                          <strong>Note du service technique :</strong> {trackedRequest.adminComment}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 font-bold">
                    Recherchez votre numéro ci-dessus pour afficher sa fiche d'état.
                  </div>
                )}
              </div>
            )}

            {/* Onglet : Confirmation */}
            {citizenTab === 'confirm' && (
              <div className="max-w-md mx-auto bg-white border border-slate-200/80 p-8 rounded-3xl text-center space-y-6 shadow-md animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  <CheckCircle2 size={36} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-850">Demande soumise !</h3>
                  <p className="text-xs text-slate-400">Le dossier a été envoyé aux agents de la mairie de Choisy.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">RÉFÉRENCE DE RETRAIT</span>
                  <div className="text-2xl font-black text-emerald-600 tracking-wider mt-1">{generatedRef}</div>
                  <span className="text-[10px] text-slate-500 block mt-2">Copiez ce code pour suivre l'état en direct.</span>
                </div>

                <div className="text-xs text-slate-600 text-left space-y-2 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                  <p>✔ **SMS envoyé** : Vous recevrez des alertes à chaque changement d'état.</p>
                  <p>🕒 **Instruction** : Veillez à déposer vos objets la veille au soir uniquement. Le dépôt anticipé constitue une infraction.</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setSearchRef(generatedRef); setTrackedRequest(requests.find(r => r.id === generatedRef) || null); setCitizenTab('track'); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl transition-all text-xs cursor-pointer shadow-sm"
                  >
                    Suivre ma demande
                  </button>
                  <button 
                    onClick={() => setCitizenTab('home')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold py-3.5 rounded-xl transition-all text-xs border border-slate-200 cursor-pointer"
                  >
                    Retour accueil
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ──────── VUE ADMINISTRATEUR ──────── */}
        {role === 'admin' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">Espace Technique Municipal</span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">Gestion logistique des tournées</h3>
              </div>

              {/* Commutateur onglet admin */}
              <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl">
                <button 
                  onClick={() => setAdminActiveTab('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <FileText size={13} className="text-emerald-500" /> Dossiers reçus
                </button>
                <button 
                  onClick={() => setAdminActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <MapPin size={13} className="text-blue-500" /> Carte des dépôts
                </button>
                <button 
                  onClick={() => setAdminActiveTab('heatmap')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminActiveTab === 'heatmap' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <BarChart3 size={13} className="text-amber-500" /> Carte thermique
                </button>
              </div>
            </div>

            {/* KPIs en blanc épuré */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Demandes aujourd\'hui', value: kpiToday, color: 'text-emerald-600', trend: '▲ +15% ce jour' },
                { label: 'En attente de validation', value: kpiPending, color: 'text-amber-600', trend: 'À traiter sous 24h' },
                { label: 'Collectes complétées', value: kpiCollected, color: 'text-blue-600', trend: 'Mise à jour en direct' },
                { label: 'Temps traitement moyen', value: '2,4 h', color: 'text-slate-850', trend: 'Objectif : < 3h' },
                { label: 'Quartier le plus actif', value: 'Gondoles', color: 'text-rose-600', trend: '45% des demandes' }
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{kpi.label}</span>
                  <div className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</div>
                  <span className="text-[9px] text-slate-500 font-medium block mt-1">{kpi.trend}</span>
                </div>
              ))}
            </div>

            {/* Onglet : Liste et modales */}
            {adminActiveTab === 'list' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Table de gauche */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Filtres de recherche */}
                  <div className="bg-white border border-slate-250/60 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between shadow-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Rechercher (nom, réf, rue)..." 
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs w-48 pl-8 py-2 rounded-lg"
                        />
                        <Search size={12} className="absolute left-2.5 top-3 text-slate-400" />
                      </div>

                      <select 
                        value={adminFilterStatus}
                        onChange={(e) => setAdminFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-lg w-auto"
                      >
                        <option value="All">Tous les statuts</option>
                        <option value="Pending">En attente</option>
                        <option value="Approved">Validé</option>
                        <option value="Scheduled">Planifié</option>
                        <option value="In progress">En cours</option>
                        <option value="Collected">Collecté</option>
                        <option value="Refused">Refusé</option>
                      </select>

                      <select 
                        value={adminFilterDistrict}
                        onChange={(e) => setAdminFilterDistrict(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-lg w-auto"
                      >
                        <option value="All">Tous les quartiers</option>
                        {DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs text-slate-400 font-bold">{filteredRequests.length} dossiers</span>
                  </div>

                  {/* Table des dossiers */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="table-container">
                      <table className="text-xs">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th>Référence</th>
                            <th>Citoyen / Adresse</th>
                            <th>Quartier</th>
                            <th>Date programmée</th>
                            <th>Objets</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequests.map(req => {
                            const totalQty = Object.values(req.items).reduce((a, b) => a + b, 0);
                            return (
                              <tr 
                                key={req.id} 
                                onClick={() => setSelectedRequestForDetail(req)}
                                className={`cursor-pointer transition-colors hover:bg-slate-50/60 ${selectedRequestForDetail?.id === req.id ? 'bg-emerald-50/40 hover:bg-emerald-50/50' : ''}`}
                              >
                                <td className="font-bold text-slate-800 tracking-wider">{req.id}</td>
                                <td>
                                  <span className="font-bold text-slate-700 block">{req.name}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">{req.address}</span>
                                </td>
                                <td className="font-medium text-slate-600">{req.district}</td>
                                <td>
                                  <span className="font-bold block text-slate-700">{req.preferredDate}</span>
                                  <span className="text-[9px] text-slate-400 block">Créé le {req.createdAt}</span>
                                </td>
                                <td>
                                  <span className="bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-slate-600">
                                    {totalQty} objets
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    req.status === 'Pending' ? 'badge-warning' :
                                    req.status === 'Refused' ? 'badge-danger' : 'badge-success'
                                  }`}>
                                    {req.status === 'Pending' ? 'À valider' : 
                                     req.status === 'Approved' ? 'Validé' :
                                     req.status === 'Scheduled' ? 'Planifié' : 
                                     req.status === 'In progress' ? 'En cours' : 
                                     req.status === 'Collected' ? 'Collecté' : 'Refusé'}
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

                {/* Volet détail à droite */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit space-y-6">
                  {selectedRequestForDetail ? (
                    <div className="space-y-6 text-left">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase">Dossier technique</span>
                          <h4 className="text-base font-black text-slate-850 mt-1">{selectedRequestForDetail.id}</h4>
                        </div>
                        <span className={`badge ${
                          selectedRequestForDetail.status === 'Pending' ? 'badge-warning' :
                          selectedRequestForDetail.status === 'Refused' ? 'badge-danger' : 'badge-success'
                        }`}>
                          {selectedRequestForDetail.status}
                        </span>
                      </div>

                      {/* Objets */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Inventaire déclaré</span>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 space-y-1.5">
                          {Object.entries(selectedRequestForDetail.items).map(([itemId, qty]) => {
                            const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                            return (
                              <div key={itemId} className="flex justify-between items-center text-xs font-medium">
                                <span className="text-slate-600">{itemDef ? itemDef.name : itemId}</span>
                                <strong className="text-slate-850">x{qty}</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Détails citoyen */}
                      <div className="space-y-2.5 text-xs">
                        <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Citoyen & Localisation</span>
                        <p className="text-slate-650"><span className="text-slate-400 font-semibold">Nom :</span> {selectedRequestForDetail.name}</p>
                        <p className="text-slate-650"><span className="text-slate-400 font-semibold">Téléphone :</span> {selectedRequestForDetail.phone}</p>
                        <p className="text-slate-650"><span className="text-slate-400 font-semibold">Adresse :</span> {selectedRequestForDetail.address}</p>
                        <p className="text-slate-650"><span className="text-slate-400 font-semibold">Quartier :</span> {selectedRequestForDetail.district}</p>
                      </div>

                      {/* Actions */}
                      {selectedRequestForDetail.status === 'Pending' ? (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-400 font-extrabold block uppercase">Note d'instruction (Optionnel)</label>
                            <textarea 
                              placeholder="Ajouter une consigne pour l'équipe de collecte..."
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-xs h-16 py-2 px-3 rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => handleApproveRequest(selectedRequestForDetail.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Check size={14} /> Valider
                            </button>
                            <button 
                              onClick={() => {
                                const reason = prompt("Indiquer le motif de refus de collecte :");
                                if (reason) {
                                  setRefusalReason(reason);
                                  setTimeout(() => {
                                    setRequests(prev => prev.map(r => {
                                      if (r.id === selectedRequestForDetail.id) {
                                        return { ...r, status: 'Refused', refusalReason: reason, adminComment: adminComment || undefined };
                                      }
                                      return r;
                                    }));
                                    setSelectedRequestForDetail(prev => prev ? { ...prev, status: 'Refused', refusalReason: reason } : null);
                                  }, 50);
                                }
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-extrabold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <XCircle size={14} /> Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 font-medium">
                          <span className="font-extrabold text-slate-500 block mb-1 uppercase text-[9px] tracking-wider">Décision municipale</span>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date d'action :</span>
                            <strong className="text-slate-700">{selectedRequestForDetail.createdAt}</strong>
                          </div>
                          {selectedRequestForDetail.assignedRound && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tournée affectée :</span>
                              <strong className="text-emerald-700">{selectedRequestForDetail.assignedRound}</strong>
                            </div>
                          )}
                          {selectedRequestForDetail.refusalReason && (
                            <div className="text-red-600 mt-1 border-t border-slate-200/60 pt-1.5">
                              <strong>Raison du refus :</strong> {selectedRequestForDetail.refusalReason}
                            </div>
                          )}
                          {selectedRequestForDetail.adminComment && (
                            <div className="text-slate-650 mt-1 border-t border-slate-200/60 pt-1.5">
                              <strong>Note interne :</strong> {selectedRequestForDetail.adminComment}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs">
                      Cliquez sur une demande à gauche pour l'instruire.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Onglet : Carte des dépôts */}
            {adminActiveTab === 'map' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Plan de situation de Choisy-le-Roi</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Visualisez les dépôts géolocalisés pour organiser les circuits logistiques.</p>
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
                      <path d="M 0 200 Q 250 250 500 180" fill="none" stroke="#e2e8f0" strokeWidth="3" />

                      {/* Marqueurs */}
                      {requests.map(req => {
                        const x = req.coordinates.x * 1.5;
                        const y = req.coordinates.y * 0.9;
                        const isSelected = selectedRequestForDetail?.id === req.id;
                        return (
                          <g key={req.id} onClick={() => setSelectedRequestForDetail(req)} className="cursor-pointer">
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

                  {/* Sidebar detail carte */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                    {selectedRequestForDetail ? (
                      <div className="space-y-4 text-left text-xs">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Marqueur de dépôt</span>
                        <p className="font-extrabold text-slate-800 text-sm">{selectedRequestForDetail.id}</p>
                        <p className="text-slate-600"><span className="text-slate-400 font-semibold">Citoyen :</span> {selectedRequestForDetail.name}</p>
                        <p className="text-slate-600"><span className="text-slate-400 font-semibold">Lieu :</span> {selectedRequestForDetail.address}</p>
                        <p className="text-slate-650"><span className="text-slate-400 font-semibold">Statut :</span> {selectedRequestForDetail.status}</p>
                      </div>
                    ) : (
                      <p className="text-slate-450 font-bold text-center py-12 text-xs">Sélectionnez un point sur la carte.</p>
                    )}

                    <button 
                      onClick={() => setAdminActiveTab('list')}
                      className="w-full bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-bold text-xs shadow-sm cursor-pointer hover:bg-slate-100"
                    >
                      Retour à la liste
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Heatmap */}
            {adminActiveTab === 'heatmap' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Densité géographique des encombrants</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Identifiez visuellement les zones à forte charge de travail municipal.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Heatmap interactive SVG */}
                  <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl h-96 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#dbeafe" strokeWidth="24" opacity="0.4" />
                      
                      <circle cx="160" cy="140" r="50" fill="url(#light-heat-red)" />
                      <circle cx="280" cy="90" r="40" fill="url(#light-heat-yellow)" />
                      <circle cx="90" cy="240" r="60" fill="url(#light-heat-green)" />
                      
                      <defs>
                        <radialGradient id="light-heat-red">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="light-heat-yellow">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="light-heat-green">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Liste volume par quartier */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 text-xs">
                    <h5 className="font-extrabold text-slate-800">Volume par quartier</h5>
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

        {/* ──────── VUE COLLECTEUR ──────── */}
        {role === 'collector' && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            
            {/* Simulation smartphone claire */}
            <div className="bg-white border-8 border-slate-800 rounded-[36px] overflow-hidden shadow-2xl relative">
              {/* Encoche téléphone */}
              <div className="bg-slate-800 h-4.5 w-28 mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 block"></span>
              </div>

              {/* Écran blanc */}
              <div className="p-4 pt-8 bg-slate-50 min-h-[580px] flex flex-col justify-between text-xs space-y-4">
                
                {/* Header mobile */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <Truck size={14} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-[11px]">Équipe Propreté 94</h4>
                      <p className="text-[9px] text-slate-400 font-bold">Camion #12</p>
                    </div>
                  </div>

                  <select 
                    value={activeRound}
                    onChange={(e) => { setActiveRound(e.target.value); setCollectorCurrentStop(0); }}
                    className="bg-white border border-slate-250 text-[10px] py-1 px-1.5 w-32 rounded-lg font-bold"
                  >
                    <option value="Tournée Bleue (Nord)">Tournée Nord</option>
                    <option value="Tournée Verte (Sud)">Tournée Sud</option>
                  </select>
                </div>

                {/* Progression de remplissage */}
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>REMPLISSAGE DU CAMION</span>
                    <span className="text-amber-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Arrêt courant */}
                {currentStopRequest ? (
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4 text-left relative overflow-hidden">
                    <span className="absolute top-0 right-0 bg-amber-500 text-white font-black px-3 py-1 rounded-bl-xl text-[9px] uppercase tracking-wider">
                      Étape en cours
                    </span>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Adresse du dépôt</span>
                      <h5 className="font-black text-slate-800 text-sm leading-snug">{currentStopRequest.address}</h5>
                      <span className="text-[10px] text-emerald-600 font-bold block">{currentStopRequest.district}</span>
                    </div>

                    {/* Liste objets */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Objets à enlever</span>
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1.5">
                        {Object.entries(currentStopRequest.items).map(([itemId, qty]) => {
                          const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                              <span>{itemDef ? itemDef.name : itemId}</span>
                              <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-800">x{qty}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Guidage GPS dessiné */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start">
                      <Compass className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                      <p className="text-[10px] text-emerald-800 leading-normal font-medium">
                        Prendre **Rue Jean d'Orves** à gauche, puis rouler sur 200m. Le dépôt est situé à droite près de l'abribus.
                      </p>
                    </div>

                    {/* Preuve photo */}
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Preuve d'arrêt (obligatoire si impossible)</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const mockName = "preuve_collecte_" + currentStopRequest.id + ".jpg";
                          setCollectorProofPhoto(mockName);
                          alert("Photo justificative enregistrée fictivement dans la base : " + mockName);
                        }}
                        className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-650 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-bold"
                      >
                        <Upload size={12} className="text-slate-450" />
                        <span>{collectorProofPhoto ? "Modifier la photo" : "Prendre une photo"}</span>
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
                        className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold py-3.5 rounded-xl text-[10px] transition-colors cursor-pointer"
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => {
                          if (!collectorProofPhoto) {
                            alert("Veuillez prendre une photo de preuve pour justifier le refus.");
                            return;
                          }
                          handleCollectorStatus('Impossible');
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-extrabold py-3.5 rounded-xl text-[9px] transition-colors cursor-pointer"
                      >
                        Impossible
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-3 my-auto">
                    <CheckCircle2 className="text-emerald-500 mx-auto" size={32} />
                    <p className="font-extrabold text-slate-800 text-sm">Tournée terminée !</p>
                    <p className="text-[10px] text-slate-400">Tous les dossiers de propreté ont été instruits avec succès.</p>
                  </div>
                )}

              </div>

              {/* Bouton Home iPhone */}
              <div className="bg-slate-200 h-1.5 w-28 mx-auto rounded-full my-2"></div>
            </div>
          </div>
        )}

      </div>

      {/* ═══ MODALE SIGNALEMENT DÉPÔT SAUVAGE ═══ */}
      {isDumpingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form 
            onSubmit={submitDumpingReport}
            className="bg-white border border-slate-250 rounded-3xl p-6 max-w-md w-full space-y-4 animate-fade-in text-xs shadow-2xl text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />
                <span>Signaler un dépôt sauvage</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setIsDumpingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <p className="text-slate-550 leading-relaxed">
              Aidez nos équipes à maintenir Choisy-le-Roi propre. Indiquez la localisation exacte de l'infraction. La brigade verte interviendra d'ici 2 heures.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold block mb-1">ADRESSE PRÉCISE</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Face au 18 Rue des Gondoles" 
                  value={dumpingAddress}
                  onChange={(e) => setDumpingAddress(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold block mb-1">DESCRIPTION DU SIGNALEMENT</label>
                <textarea 
                  placeholder="ex: Canapé déchiré posé près des poubelles collectives..." 
                  value={dumpingDesc}
                  onChange={(e) => setDumpingDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs h-20 py-2 px-3 rounded-lg"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-650 hover:bg-red-600 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
            >
              Envoyer l'alerte brigade
            </button>
          </form>
        </div>
      )}

      {/* ═══ PIED DE PAGE (Scoped Div) ═══ */}
      <div className="w-full bg-white border-t border-slate-200 py-8 px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Mairie de Choisy-le-Roi — Direction de la Transition Écologique.</p>
          <div className="flex gap-6 font-semibold">
            <a href="/" className="hover:text-emerald-600 transition-colors">Données Personnelles</a>
            <a href="/" className="hover:text-emerald-600 transition-colors">Mentions Légales</a>
            <a href="/" className="hover:text-emerald-600 transition-colors">Consignes de tri</a>
          </div>
        </div>
      </div>

    </div>
  );
}
