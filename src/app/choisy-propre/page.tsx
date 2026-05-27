'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, 
  ChevronRight, Plus, Minus, Upload, Filter, Compass, Check, ArrowRight, 
  BarChart3, RefreshCw, Smartphone, ShieldCheck, Mail, Send, Award, FileText,
  User, Truck, Settings, Info, Users, Bell
} from 'lucide-react';

// Types pour l'état de l'application
interface BulkyItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliances' | 'other';
  quantity: number;
}

interface RequestData {
  id: string; // ex: CP-94300-8A7B
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  items: { [key: string]: number }; // item ID -> quantity
  photoUrl?: string;
  photoName?: string;
  preferredDate: string;
  status: 'Pending' | 'Approved' | 'Scheduled' | 'In progress' | 'Collected' | 'Refused';
  refusalReason?: string;
  adminComment?: string;
  createdAt: string;
  assignedRound?: string;
  coordinates: { x: number; y: number }; // Pour affichage sur la carte Choisy
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
    items: { "paint": 5 }, // Objet interdit
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
  { id: 'washing_machine', name: 'Lave-linge / Sèche-linge', category: 'appliances', icon: '🧺' },
  { id: 'refrigerator', name: 'Réfrigérateur / Congélateur', category: 'appliances', icon: '❄️' },
  { id: 'table', name: 'Table / Bureau', category: 'furniture', icon: '🪵' },
  { id: 'misc', name: 'Objets divers encombrants', category: 'other', icon: '📦' }
];

const FORBIDDEN_EXAMPLES = [
  { name: 'Déchets de chantier / Gravats', desc: 'Briques, plâtre, tuiles, ciment. À déposer en déchèterie professionnelle.', icon: '🧱' },
  { name: 'Produits dangereux / Chimiques', desc: 'Acides, solvants, bouteilles de gaz. Risque d\'explosion ou pollution.', icon: '☣️' },
  { name: 'Pots de peinture / Solvants', desc: 'Même vides ou secs, ils contiennent des substances toxiques.', icon: '🎨' },
  { name: 'Pneus et pièces de véhicules', desc: 'Filière de recyclage automobile obligatoire.', icon: '🛞' }
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
  
  // Effets d'auto-simulation
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

    // Calcul de coordonnées aléatoires dans Choisy-le-Roi pour la simulation de carte
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
    
    // Notifications simulées
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

    // Reset formulaire
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
    // Mettre à jour la modale détaillée si ouverte
    const updatedReq = updated.find(r => r.id === id);
    if (updatedReq) setSelectedRequestForDetail(updatedReq);
    setAdminComment('');
  };

  const handleRefuseRequest = (id: string) => {
    if (!refusalReason) {
      alert("Veuillez renseigner un motif de refus.");
      return;
    }
    const updated = requests.map(r => {
      if (r.id === id) {
        addNotification(
          `Votre demande ${r.id} a été refusée pour le motif suivant : ${refusalReason}. Veuillez consulter les règles de tri municipal.`,
          'email',
          r.email
        );
        return { 
          ...r, 
          status: 'Refused' as const, 
          refusalReason,
          adminComment: adminComment || undefined 
        };
      }
      return r;
    });
    setRequests(updated);
    const updatedReq = updated.find(r => r.id === id);
    if (updatedReq) setSelectedRequestForDetail(updatedReq);
    setRefusalReason('');
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
  
  // Demandes par quartier pour le graph
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
      comment = "Non collecté : Dépôt non conforme ou inaccessible (" + (collectorProofPhoto ? "photo à l'appui" : "pas de photo") + ").";
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

  // Progression de chargement du camion simulée
  const totalItemsInRound = currentRoundRequests.length;
  const progressPercent = totalItemsInRound > 0 
    ? Math.round((collectorCurrentStop / totalItemsInRound) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* ═══ MESH GRADIENT & CANVAS SIMULÉ ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full blur-[120px] top-[-10%] left-[-20%] bg-blue-500/10 animate-[orb-float-1_20s_infinite_linear]"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[100px] bottom-[-10%] right-[-10%] bg-emerald-500/10 animate-[orb-float-2_25s_infinite_linear]"></div>
      </div>

      {/* ═══ BARRE DE SIMULATION DU PORTFOLIO (PERSISTANTE) ═══ */}
      <div className="bg-slate-950/90 border-b border-slate-800 py-3 px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Prototype Interactif</p>
              <h2 className="text-sm font-bold text-white leading-tight">Mon Choisy Propre (XIRH)</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => setRole('citizen')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${role === 'citizen' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <User size={14} /> Citoyen
            </button>
            <button 
              onClick={() => { setRole('admin'); setAdminActiveTab('list'); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${role === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <ShieldCheck size={14} /> Administrateur
            </button>
            <button 
              onClick={() => setRole('collector')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${role === 'collector' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Truck size={14} /> Collecteur
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">Ville de Choisy-le-Roi</span>
          </div>
        </div>
      </div>

      {/* ═══ HEADER DE L'APPLICATION ═══ */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 py-4 px-6 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Trash2 className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Mon Choisy Propre
              </h1>
              <p className="text-xs text-emerald-400 font-medium">Service de Propreté Municipale</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} className="text-slate-500" />
              <span>Réponse garantie sous 24h</span>
            </div>
            <div className="w-px h-5 bg-slate-800"></div>
            <a href="/" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>Retour Portfolio</span>
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* ═══ ZONE DE NOTIFICATIONS SIMULÉES (ALERT BAR) ═══ */}
      <div className="bg-slate-950/40 border-b border-slate-800/50 py-2.5 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <Bell size={12} />
            <span>Simulateur d'Alertes</span>
          </div>
          <div className="flex-1 text-xs text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
            {notifications.length > 0 ? (
              <span className="animate-[fadeIn_0.5s_ease-out]">
                <strong>[{notifications[0].type.toUpperCase()} pour {notifications[0].to}] :</strong> "{notifications[0].text}"
              </span>
            ) : (
              <span>Aucune notification pour le moment. Réalisez des actions dans les vues pour générer des alertes.</span>
            )}
          </div>
          <button 
            onClick={() => alert(`Historique des notifications :\n\n` + notifications.map(n => `[${n.time}] ${n.type.toUpperCase()} -> ${n.to}\n${n.text}\n`).join('\n'))}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold underline shrink-0"
          >
            Voir historique ({notifications.length})
          </button>
        </div>
      </div>

      {/* ═══ CONTENU PRINCIPAL PAR RÔLE ═══ */}
      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full z-10">

        {/* ──────── VUE CITOYEN ──────── */}
        {role === 'citizen' && (
          <div className="space-y-8 animate-fade-in">
            {/* Bannière d'accueil citoyenne */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 p-8 md:p-10 shadow-2xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
                <img 
                  src="/encombrant-logo.png" 
                  alt="Inspiration" 
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    // Fallback silencieux si l'image n'est pas encore chargée
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-400/10 px-3 py-1 rounded-full">Propreté & Recyclage Urbain</span>
                <h2 className="text-3xl font-extrabold text-white mt-3 leading-tight">
                  Simplifions ensemble la collecte de vos encombrants à Choisy-le-Roi.
                </h2>
                <p className="text-slate-400 mt-4 leading-relaxed text-sm md:text-base">
                  Déposez votre demande de retrait en moins de 3 minutes. Vos objets seront valorisés ou recyclés par nos services municipaux de propreté.
                </p>
                
                <div className="flex flex-wrap gap-3.5 mt-8">
                  <button 
                    onClick={() => setCitizenTab('form')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm flex items-center gap-2 group"
                  >
                    <span>Faire une demande de retrait</span>
                    <Plus size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setCitizenTab('track')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-3 rounded-xl transition-all text-sm flex items-center gap-2 border border-slate-700"
                  >
                    <SearchIcon className="text-slate-400" size={16} />
                    <span>Suivre ma demande</span>
                  </button>
                  <button 
                    onClick={() => setIsDumpingModalOpen(true)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-5 py-3 rounded-xl transition-all text-sm flex items-center gap-2 border border-red-500/30"
                  >
                    <AlertTriangle size={16} />
                    <span>Signaler un dépôt sauvage</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Menu d'onglets Citoyen */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setCitizenTab('home')}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${citizenTab === 'home' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Vue générale
              </button>
              <button 
                onClick={() => setCitizenTab('form')}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${citizenTab === 'form' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Formulaire de retrait
              </button>
              <button 
                onClick={() => setCitizenTab('rules')}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${citizenTab === 'rules' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Objets refusés / Autorisés
              </button>
              <button 
                onClick={() => setCitizenTab('track')}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${citizenTab === 'track' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Suivi en direct
              </button>
            </div>

            {/* Onglet : Accueil Citoyen */}
            {citizenTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consignes de tri rapides */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Info className="text-emerald-400" size={20} />
                    <span>Comment se déroule la collecte ?</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm mb-4">1</div>
                      <h4 className="font-bold text-white text-sm">Déclaration</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">Listez vos encombrants dans le formulaire en indiquant les quantités et le jour choisi.</p>
                    </div>
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-sm mb-4">2</div>
                      <h4 className="font-bold text-white text-sm">Confirmation</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">Les services municipaux valident votre demande et vous attribuent un numéro de passage.</p>
                    </div>
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-sm mb-4">3</div>
                      <h4 className="font-bold text-white text-sm">Passage</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">Déposez vos encombrants la veille au soir sur le trottoir. La tournée s'occupe du reste !</p>
                    </div>
                  </div>

                  {/* Message écologique */}
                  <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-2xl flex gap-4 items-start">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Engagement Éco-Responsable de Choisy</h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Plus de 65% des meubles et appareils électroniques collectés à Choisy-le-Roi sont revalorisés en ressourcerie locale ou triés pour être réinsérés dans la filière de recyclage matière.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Info Pratique */}
                <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-emerald-400" />
                    <span>Horaires et Contacts</span>
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-3.5">
                    <li className="flex justify-between pb-2.5 border-b border-slate-900">
                      <span>Service Urbanisme :</span>
                      <strong className="text-slate-200">01 48 92 44 44</strong>
                    </li>
                    <li className="flex justify-between pb-2.5 border-b border-slate-900">
                      <span>Déchèterie Choisy-le-Roi :</span>
                      <strong className="text-slate-200">Rue de la Paix, 94300</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Collecte standard :</span>
                      <strong className="text-slate-200">Lundi au Samedi, 6h-18h</strong>
                    </li>
                  </ul>
                  
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 block mb-1">💡 Astuce</span>
                    Saisissez des faux numéros comme <code className="bg-slate-950 text-slate-300 px-1 py-0.5 rounded">CP-94300-1042</code> ou <code className="bg-slate-950 text-slate-300 px-1 py-0.5 rounded">CP-94300-0987</code> dans l'onglet "Suivi" pour voir la démonstration.
                  </div>
                </div>
              </div>
            )}

            {/* Onglet : Formulaire de Retrait */}
            {citizenTab === 'form' && (
              <form onSubmit={submitCitizenForm} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Étape 1 : Objets à collecter */}
                <div className="lg:col-span-2 space-y-6 bg-slate-950/40 border border-slate-800 p-6 rounded-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-white">1. Sélectionnez vos encombrants</h3>
                    <p className="text-xs text-slate-400">Indiquez la quantité pour chaque type d'objet.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COLLECTIBLE_ITEMS.map(item => {
                      const qty = selectedItems[item.id] || 0;
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <span className="font-medium text-sm text-slate-200 block">{item.name}</span>
                              <span className="text-[10px] text-slate-500 capitalize">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              type="button"
                              onClick={() => handleItemCountChange(item.id, false)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-sm text-white w-5 text-center">{qty}</span>
                            <button 
                              type="button"
                              onClick={() => handleItemCountChange(item.id, true)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Photo upload mock */}
                  <div className="border border-dashed border-slate-700 rounded-xl p-5 bg-slate-900/30 text-center">
                    <input 
                      type="file" 
                      id="photo-file" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <label htmlFor="photo-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="text-slate-400" size={24} />
                      <span className="text-xs font-semibold text-slate-300">Ajouter une photo justificative (Optionnel)</span>
                      <span className="text-[10px] text-slate-500">Formats acceptés : JPG, PNG. Max 5 Mo.</span>
                    </label>
                    {uploadedPhoto && (
                      <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-400 inline-flex items-center gap-2">
                        <Check size={14} />
                        <span>{uploadedPhoto.name} ({uploadedPhoto.size})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Étape 2 & 3 : Coordonnées, Date et Soumission */}
                <div className="space-y-6">
                  {/* Carte et géoloc */}
                  <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">2. Lieu & Date de passage</h3>
                      <p className="text-[11px] text-slate-400">Saisissez l'adresse et choisissez le jour.</p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">ADRESSE DU DÉPÔT</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="ex: 12 Rue d'Orves"
                            value={citizenAddress}
                            onChange={(e) => setCitizenAddress(e.target.value)}
                            className="bg-slate-900 border border-slate-800 pl-9"
                          />
                          <MapPin size={14} className="absolute left-3 top-3.5 text-slate-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">QUARTIER</label>
                          <select 
                            value={citizenDistrict}
                            onChange={(e) => setCitizenDistrict(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-xs"
                          >
                            {DISTRICTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">DATE SOUHAITÉE</label>
                          <input 
                            type="date" 
                            required
                            value={citizenDate}
                            onChange={(e) => setCitizenDate(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Simulation de carte Choisy */}
                    <div className="bg-slate-900 rounded-xl h-28 border border-slate-800 relative overflow-hidden flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 300 150">
                        {/* Faux tracés de fleuve et rues de Choisy */}
                        <path d="M 0 50 Q 80 40 120 70 T 300 60" fill="none" stroke="#2563eb" strokeWidth="6" />
                        <path d="M 50 0 L 70 150" fill="none" stroke="#475569" strokeWidth="2" />
                        <path d="M 120 0 L 150 150" fill="none" stroke="#475569" strokeWidth="3" />
                        <path d="M 220 0 L 180 150" fill="none" stroke="#475569" strokeWidth="2" />
                        <path d="M 0 100 Q 150 120 300 90" fill="none" stroke="#475569" strokeWidth="1.5" />
                        {/* Point Choisy le Roi */}
                        <circle cx="130" cy="80" r="15" fill="#10b981" fillOpacity="0.2" />
                        <circle cx="130" cy="80" r="4" fill="#10b981" />
                      </svg>
                      <div className="relative text-center p-2 z-10">
                        <MapPin className="text-emerald-400 mx-auto mb-1 animate-bounce" size={18} />
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Géolocalisation vérifiée</span>
                        <span className="text-[10px] text-slate-300 font-medium">{citizenAddress || "Saisissez votre adresse"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Validation des informations */}
                  <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">3. Coordonnées de contact</h3>
                      <p className="text-[11px] text-slate-400">Pour vous avertir de l'heure précise de passage.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">NOM COMPLET</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Thomas Dubois" 
                          value={citizenName}
                          onChange={(e) => setCitizenName(e.target.value)}
                          className="bg-slate-900 border border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">NUMÉRO PORTABLE</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="06 12 34 56 78" 
                          value={citizenPhone}
                          onChange={(e) => setCitizenPhone(e.target.value)}
                          className="bg-slate-900 border border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">ADRESSE E-MAIL</label>
                        <input 
                          type="email" 
                          required
                          placeholder="t.dubois@email.fr" 
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                          className="bg-slate-900 border border-slate-800"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/10 text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>Envoyer la demande</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Onglet : Règles de tri */}
            {citizenTab === 'rules' && (
              <div className="space-y-8">
                <div className="text-center max-w-xl mx-auto">
                  <h3 className="text-2xl font-bold text-white">Que collectons-nous ?</h3>
                  <p className="text-sm text-slate-400 mt-2">Le dépôt sur la voie publique est réservé aux encombrants d'origine ménagère qui ne peuvent entrer dans un coffre de voiture standard.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Autorisé */}
                  <div className="bg-emerald-950/10 border border-emerald-900/40 p-6 rounded-2xl space-y-6">
                    <h4 className="font-bold text-emerald-400 text-base flex items-center gap-2">
                      <CheckCircle2 size={20} />
                      <span>Objets Autorisés (avec déclaration)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {COLLECTIBLE_ITEMS.map(item => (
                        <div key={item.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 flex gap-2.5 items-center">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <span className="text-xs font-semibold text-slate-200 block">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refusé */}
                  <div className="bg-red-950/10 border border-red-900/40 p-6 rounded-2xl space-y-6">
                    <h4 className="font-bold text-red-400 text-base flex items-center gap-2">
                      <XCircle size={20} />
                      <span>Objets strictement interdits</span>
                    </h4>
                    <div className="space-y-4">
                      {FORBIDDEN_EXAMPLES.map(ex => (
                        <div key={ex.name} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex gap-3.5 items-start">
                          <span className="text-2xl">{ex.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-red-400 block">{ex.name}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">{ex.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet : Suivi en direct */}
            {citizenTab === 'track' && (
              <div className="max-w-2xl mx-auto space-y-8 bg-slate-950/40 border border-slate-800 p-6 rounded-3xl">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">Suivre une demande de collecte</h3>
                  <p className="text-xs text-slate-400 mt-1">Saisissez la référence transmise par SMS ou e-mail.</p>
                </div>

                <form onSubmit={handleSearchTrack} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="ex: CP-94300-1042" 
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value)}
                    className="bg-slate-900 border border-slate-800 uppercase tracking-widest text-center text-sm font-bold py-3"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all text-xs flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <SearchIcon size={14} />
                    <span>Rechercher</span>
                  </button>
                </form>

                {trackedRequest ? (
                  <div className="border-t border-slate-800 pt-6 space-y-6 animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-500/10 px-2.5 py-0.5 rounded-full">Référence validée</span>
                        <h4 className="text-lg font-bold text-white mt-1.5">{trackedRequest.id}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Adresse : {trackedRequest.address}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Statut Actuel</span>
                        <span className={`badge mt-1.5 ${
                          trackedRequest.status === 'Pending' ? 'badge-warning' :
                          trackedRequest.status === 'Refused' ? 'badge-danger' : 'badge-success'
                        }`}>
                          {trackedRequest.status === 'Pending' ? 'Attente Validation' : 
                           trackedRequest.status === 'Approved' ? 'Approuvé' : 
                           trackedRequest.status === 'Scheduled' ? 'Planifié' : 
                           trackedRequest.status === 'In progress' ? 'En cours' : 
                           trackedRequest.status === 'Collected' ? 'Collecté' : 'Refusé'}
                        </span>
                      </div>
                    </div>

                    {/* Ligne de progression des statuts */}
                    <div className="relative py-4">
                      {/* Ligne grise en arrière plan */}
                      <div className="absolute top-1/2 left-3 right-3 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
                      
                      {/* Ligne colorée de progression */}
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
                          { name: 'Validé', status: 'Approved' },
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
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                {isCompleted ? <Check size={12} strokeWidth={3} /> : idx + 1}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium mt-1.5">{step.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explications et actions additionnelles */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Date demandée :</span>
                        <strong className="text-slate-200">{trackedRequest.preferredDate}</strong>
                      </div>
                      {trackedRequest.assignedRound && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Équipe assignée :</span>
                          <strong className="text-emerald-400">{trackedRequest.assignedRound}</strong>
                        </div>
                      )}
                      {trackedRequest.refusalReason && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 mt-2">
                          <span className="font-bold block mb-1">Motif de refus :</span>
                          {trackedRequest.refusalReason}
                        </div>
                      )}
                      {trackedRequest.adminComment && (
                        <div className="bg-slate-950 p-3 rounded-lg text-slate-300 mt-2 border border-slate-850">
                          <span className="font-bold text-slate-400 block mb-1">Note municipale :</span>
                          {trackedRequest.adminComment}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Entrez un numéro de suivi valide ci-dessus.
                  </div>
                )}
              </div>
            )}

            {/* Onglet : Confirmation de demande */}
            {citizenTab === 'confirm' && (
              <div className="max-w-md mx-auto bg-slate-950/60 border border-slate-800 p-8 rounded-3xl text-center space-y-6 animate-fade-in shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                  <CheckCircle2 size={36} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white">Demande enregistrée !</h3>
                  <p className="text-xs text-slate-400 mt-1">Merci pour votre contribution à la propreté de Choisy-le-Roi.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Votre Numéro de Suivi</span>
                  <div className="text-2xl font-black text-emerald-400 tracking-widest mt-1.5">{generatedRef}</div>
                  <span className="text-[10px] text-slate-400 block mt-2">Copiez ce numéro pour suivre l'avancement.</span>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed text-left space-y-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                  <p>💬 Un SMS de confirmation vient de vous être envoyé.</p>
                  <p>📅 Les agents municipaux vont valider votre demande d'ici 24h. Veillez à sortir vos objets <strong>uniquement la veille au soir</strong> de la date confirmée.</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setSearchRef(generatedRef); setTrackedRequest(requests.find(r => r.id === generatedRef) || null); setCitizenTab('track'); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    Suivre en direct
                  </button>
                  <button 
                    onClick={() => setCitizenTab('home')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all text-xs"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────── VUE ADMINISTRATEUR ──────── */}
        {role === 'admin' && (
          <div className="space-y-8 animate-fade-in">
            {/* Titre et select onglet admin */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Console Municipale</span>
                <h3 className="text-2xl font-bold text-white mt-1">Gestion des Encombrants & Logistique</h3>
              </div>

              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setAdminActiveTab('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${adminActiveTab === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <FileText size={14} /> Liste des requêtes
                </button>
                <button 
                  onClick={() => setAdminActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${adminActiveTab === 'map' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <MapPin size={14} /> Carte de Choisy
                </button>
                <button 
                  onClick={() => setAdminActiveTab('heatmap')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${adminActiveTab === 'heatmap' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <BarChart3 size={14} /> Carte thermique (Heatmap)
                </button>
              </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Demandes aujourd'hui</span>
                <div className="text-2xl font-black text-white mt-1">{kpiToday}</div>
                <span className="text-[9px] text-emerald-400 mt-1 block">▲ +12% vs hier</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">En attente</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{kpiPending}</div>
                <span className="text-[9px] text-slate-500 mt-1 block">Demandes à valider</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Collectes accomplies</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{kpiCollected}</div>
                <span className="text-[9px] text-slate-500 mt-1 block">Ce mois-ci</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Temps de traitement</span>
                <div className="text-2xl font-black text-blue-400 mt-1">2,4 h</div>
                <span className="text-[9px] text-emerald-400 mt-1 block">▼ -15 min de moyenne</span>
              </div>
              <div className="bg-slate-950/60 p-4 col-span-2 lg:col-span-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dépôts sauvages</span>
                <div className="text-2xl font-black text-red-400 mt-1">3</div>
                <span className="text-[9px] text-red-500/80 mt-1 block">Interventions en cours</span>
              </div>
            </div>

            {/* Vue Onglet : Liste des requêtes */}
            {adminActiveTab === 'list' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Liste avec filtres */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Barre de filtres */}
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Rechercher nom, réf, adresse..." 
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-xs w-48 pl-8 py-2"
                        />
                        <SearchIcon size={12} className="absolute left-2.5 top-3 text-slate-500" />
                      </div>
                      
                      <select 
                        value={adminFilterStatus}
                        onChange={(e) => setAdminFilterStatus(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs py-2 px-3 w-auto"
                      >
                        <option value="All">Tous les statuts</option>
                        <option value="Pending">En attente</option>
                        <option value="Approved">Approuvé</option>
                        <option value="Scheduled">Planifié</option>
                        <option value="In progress">En cours</option>
                        <option value="Collected">Collecté</option>
                        <option value="Refused">Refusé</option>
                      </select>

                      <select 
                        value={adminFilterDistrict}
                        onChange={(e) => setAdminFilterDistrict(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs py-2 px-3 w-auto"
                      >
                        <option value="All">Tous les quartiers</option>
                        {DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">{filteredRequests.length} résultat(s)</span>
                  </div>

                  {/* Tableau des demandes */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="table-container">
                      <table className="text-xs">
                        <thead>
                          <tr>
                            <th>Référence</th>
                            <th>Citoyen / Adresse</th>
                            <th>Quartier</th>
                            <th>Date / Création</th>
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
                                className={`cursor-pointer transition-colors ${selectedRequestForDetail?.id === req.id ? 'bg-slate-800/50' : ''}`}
                              >
                                <td className="font-bold text-white tracking-wider">{req.id}</td>
                                <td>
                                  <span className="font-semibold text-slate-200 block">{req.name}</span>
                                  <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">{req.address}</span>
                                </td>
                                <td>{req.district}</td>
                                <td>
                                  <span className="font-semibold block">{req.preferredDate}</span>
                                  <span className="text-[10px] text-slate-500 block">Créé le {req.createdAt}</span>
                                </td>
                                <td>
                                  <span className="bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800 text-[10px] font-bold text-slate-300">
                                    {totalQty} objet(s)
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    req.status === 'Pending' ? 'badge-warning' :
                                    req.status === 'Refused' ? 'badge-danger' : 'badge-success'
                                  }`}>
                                    {req.status === 'Pending' ? 'En attente' : 
                                     req.status === 'Approved' ? 'Validé' :
                                     req.status === 'Scheduled' ? 'Planifié' : 
                                     req.status === 'In progress' ? 'En cours' : 
                                     req.status === 'Collected' ? 'Collecté' : 'Refusé'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredRequests.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                                Aucun résultat ne correspond aux filtres.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Volet de Détail de la demande sélectionnée */}
                <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl h-fit space-y-6">
                  {selectedRequestForDetail ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Fiche d'instruction</span>
                          <h4 className="text-lg font-black text-white mt-1">{selectedRequestForDetail.id}</h4>
                        </div>
                        <span className={`badge ${
                          selectedRequestForDetail.status === 'Pending' ? 'badge-warning' :
                          selectedRequestForDetail.status === 'Refused' ? 'badge-danger' : 'badge-success'
                        }`}>
                          {selectedRequestForDetail.status}
                        </span>
                      </div>

                      {/* Liste des objets */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Encombrants déclarés</span>
                        <div className="bg-slate-900 rounded-xl p-3 border border-slate-850 space-y-2">
                          {Object.entries(selectedRequestForDetail.items).map(([itemId, qty]) => {
                            const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                            return (
                              <div key={itemId} className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">{itemDef ? itemDef.name : itemId}</span>
                                <strong className="text-white">x{qty}</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Détails citoyen */}
                      <div className="space-y-2.5 text-xs">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Informations Citoyen</span>
                        <p className="text-slate-300"><span className="text-slate-500">Nom :</span> {selectedRequestForDetail.name}</p>
                        <p className="text-slate-300"><span className="text-slate-500">Téléphone :</span> {selectedRequestForDetail.phone}</p>
                        <p className="text-slate-300"><span className="text-slate-500">Adresse :</span> {selectedRequestForDetail.address}</p>
                        <p className="text-slate-300"><span className="text-slate-500">Quartier :</span> {selectedRequestForDetail.district}</p>
                        {selectedRequestForDetail.photoName && (
                          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2 text-slate-400">
                            <Upload size={14} />
                            <span className="truncate">{selectedRequestForDetail.photoName} (Simulation photo)</span>
                          </div>
                        )}
                      </div>

                      {/* Actions Administrateur */}
                      {selectedRequestForDetail.status === 'Pending' ? (
                        <div className="space-y-4 border-t border-slate-900 pt-4">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Décision administrative</span>
                          
                          <div className="space-y-2">
                            <label className="text-[9px] text-slate-400 font-semibold block uppercase">Commentaire interne / Note</label>
                            <textarea 
                              placeholder="Ajouter une instruction de collecte..."
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              className="bg-slate-900 border border-slate-800 text-xs h-16 py-2 px-3"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <button 
                              onClick={() => handleApproveRequest(selectedRequestForDetail.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check size={14} /> Valider
                            </button>
                            
                            <button 
                              onClick={() => {
                                const reason = prompt("Indiquez la raison du refus (ex: Pots de peinture interdits, Débris de chantiers...) :");
                                if (reason) {
                                  setRefusalReason(reason);
                                  // Hack pour appliquer directement via l'état local dans la foulée
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
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <XCircle size={14} /> Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                          <span className="font-bold text-slate-400 block mb-1">Résumé décision</span>
                          <div className="flex justify-between">
                            <span>Date d'action :</span>
                            <strong className="text-slate-200">{selectedRequestForDetail.createdAt}</strong>
                          </div>
                          {selectedRequestForDetail.assignedRound && (
                            <div className="flex justify-between">
                              <span>Tournée de collecte :</span>
                              <strong className="text-emerald-400">{selectedRequestForDetail.assignedRound}</strong>
                            </div>
                          )}
                          {selectedRequestForDetail.refusalReason && (
                            <div className="text-red-400 mt-2">
                              <strong>Raison du refus :</strong> {selectedRequestForDetail.refusalReason}
                            </div>
                          )}
                          {selectedRequestForDetail.adminComment && (
                            <div className="text-slate-300 mt-2">
                              <strong>Commentaire interne :</strong> {selectedRequestForDetail.adminComment}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      Sélectionnez une requête dans la liste de gauche pour en afficher les détails et prendre une décision.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vue Onglet : Carte de Choisy */}
            {adminActiveTab === 'map' && (
              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h4 className="font-bold text-white text-base">Visualisation des points de collecte</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Localisation en temps réel des dépôts validés et en attente à Choisy-le-Roi.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Carte interactive SVG */}
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl h-96 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      {/* Tracé de la Seine */}
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#1d4ed8" strokeWidth="24" strokeLinecap="round" opacity="0.15" />
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                      
                      {/* Rues principales */}
                      <path d="M 50 0 Q 120 150 80 300" fill="none" stroke="#334155" strokeWidth="3" />
                      <path d="M 250 0 L 290 300" fill="none" stroke="#334155" strokeWidth="2.5" />
                      <path d="M 400 0 L 320 300" fill="none" stroke="#334155" strokeWidth="2" />
                      <path d="M 0 200 Q 250 250 500 180" fill="none" stroke="#334155" strokeWidth="3" />

                      {/* Quartiers Labels */}
                      <text x="70" y="40" fill="#475569" fontSize="10" fontWeight="bold">GONDOLES NORD</text>
                      <text x="350" y="260" fill="#475569" fontSize="10" fontWeight="bold">GONDOLES SUD</text>
                      <text x="210" y="160" fill="#475569" fontSize="10" fontWeight="bold">CENTRE-VILLE</text>
                      <text x="50" y="270" fill="#475569" fontSize="10" fontWeight="bold">HAUTES-FORMES</text>

                      {/* Requêtes affichées comme marqueurs */}
                      {requests.map(req => {
                        const isPending = req.status === 'Pending';
                        const isRefused = req.status === 'Refused';
                        const isSelected = selectedRequestForDetail?.id === req.id;
                        
                        // Calcul d'une position un peu différente pour la démo
                        const x = req.coordinates.x * 1.5;
                        const y = req.coordinates.y * 0.9;
                        
                        return (
                          <g 
                            key={req.id} 
                            onClick={() => setSelectedRequestForDetail(req)}
                            className="cursor-pointer group"
                          >
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 10 : 6} 
                              fill={isPending ? '#f59e0b' : isRefused ? '#ef4444' : '#10b981'}
                              className="transition-all"
                            />
                            {isPending && (
                              <circle 
                                cx={x} 
                                cy={y} 
                                r={14} 
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2"
                                className="animate-ping"
                                opacity="0.4"
                              />
                            )}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 16 : 0} 
                              fill="none" 
                              stroke="#ffffff" 
                              strokeWidth="2" 
                              opacity="0.7" 
                            />
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* Légende de la carte */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-[10px] space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span className="text-slate-300">En attente ({kpiPending})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <span className="text-slate-300">Validé / Planifié ({requests.filter(r => ['Approved', 'Scheduled', 'In progress', 'Collected'].includes(r.status)).length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span className="text-slate-300">Refusé / Annulé ({requests.filter(r => r.status === 'Refused').length})</span>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Info sur le point sélectionné */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    {selectedRequestForDetail ? (
                      <div className="space-y-4">
                        <h5 className="font-bold text-white text-xs block uppercase text-slate-400">Marqueur Sélectionné</h5>
                        <div className="space-y-2 text-xs">
                          <p className="text-white font-bold">{selectedRequestForDetail.id}</p>
                          <p className="text-slate-400"><span className="text-slate-500">Citoyen :</span> {selectedRequestForDetail.name}</p>
                          <p className="text-slate-400"><span className="text-slate-500">Adresse :</span> {selectedRequestForDetail.address}</p>
                          <p className="text-slate-400"><span className="text-slate-500">Statut :</span> {selectedRequestForDetail.status}</p>
                          <div className="border-t border-slate-800 pt-3">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">OBJETS DÉCLARÉS</span>
                            <ul className="list-disc pl-4 text-slate-300 text-[11px] space-y-1">
                              {Object.entries(selectedRequestForDetail.items).map(([itemId, qty]) => (
                                <li key={itemId}>{itemId} (x{qty})</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Cliquez sur un marqueur de la carte pour afficher ses informations de tri.
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setAdminActiveTab('list')}
                      className="mt-6 w-full bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <FileText size={12} />
                      <span>Retour à la liste</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vue Onglet : Heatmap */}
            {adminActiveTab === 'heatmap' && (
              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                  <h4 className="font-bold text-white text-base">Carte Thermique de Densité des Retraits</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Analyse visuelle des zones générant le plus grand volume d'encombrants pour optimiser les plannings municipaux.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Heatmap interactive */}
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl h-96 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300">
                      {/* Tracé de la Seine */}
                      <path d="M 0 100 Q 150 80 230 140 T 500 120" fill="none" stroke="#1d4ed8" strokeWidth="24" opacity="0.1" />
                      
                      {/* Rues principales */}
                      <path d="M 50 0 Q 120 150 80 300" fill="none" stroke="#334155" strokeWidth="2" opacity="0.5" />
                      <path d="M 250 0 L 290 300" fill="none" stroke="#334155" strokeWidth="2" opacity="0.5" />
                      <path d="M 0 200 Q 250 250 500 180" fill="none" stroke="#334155" strokeWidth="2" opacity="0.5" />

                      {/* Simulation de zones thermiques (Gradients floutés) */}
                      {/* Centre-Ville : Zone rouge (très dense) */}
                      <circle cx="160" cy="140" r="45" fill="url(#heat-high)" />
                      {/* Gondoles Nord : Zone jaune (moyenne) */}
                      <circle cx="280" cy="90" r="35" fill="url(#heat-medium)" />
                      {/* Hautes Formes : Zone verte (faible) */}
                      <circle cx="90" cy="240" r="50" fill="url(#heat-low)" />
                      
                      {/* Gradients definitions */}
                      <defs>
                        <radialGradient id="heat-high">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heat-medium">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="heat-low">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Légende textuelle sur la carte */}
                      <text x="140" y="145" fill="#ffffff" fontSize="9" fontWeight="bold" opacity="0.8">Zone A (Dense)</text>
                      <text x="250" y="95" fill="#ffffff" fontSize="9" fontWeight="bold" opacity="0.8">Zone B (Moyenne)</text>
                    </svg>

                    <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-[10px] space-y-1.5 backdrop-blur-md">
                      <span className="font-bold block text-white mb-1">Niveau d'encombrement</span>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-2.5 rounded bg-red-500 opacity-60"></span>
                        <span className="text-slate-300">Très Élevé (Centre)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-2.5 rounded bg-amber-500 opacity-50"></span>
                        <span className="text-slate-300">Modéré (Gondoles)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-2.5 rounded bg-emerald-500 opacity-40"></span>
                        <span className="text-slate-300">Faible (Périphérie)</span>
                      </div>
                    </div>
                  </div>

                  {/* Analyse textuelle des données de répartition */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 text-xs">
                    <h5 className="font-bold text-white text-xs block uppercase text-slate-400">Volume par Quartier</h5>
                    
                    <div className="space-y-3">
                      {districtDistribution.map(item => {
                        const maxVal = Math.max(...districtDistribution.map(d => d.count), 1);
                        const pct = Math.round((item.count / maxVal) * 100);
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-300 font-semibold">{item.name}</span>
                              <strong className="text-white">{item.count} dmds</strong>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
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
            {/* Simulateur Téléphone Mobile Collecteur */}
            <div className="bg-slate-950 border-4 border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative">
              {/* Barre de haut-parleur et capteur photo de l'iPhone simulé */}
              <div className="bg-slate-800 h-5 w-32 mx-auto rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 block mr-2"></span>
                <span className="w-8 h-1 rounded bg-slate-900 block"></span>
              </div>

              {/* Écran du téléphone */}
              <div className="p-4 pt-8 bg-slate-900 min-h-[580px] flex flex-col justify-between text-xs space-y-4">
                
                {/* En-tête mobile */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Truck size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[11px] leading-tight">Équipe 94-Propreté</h4>
                      <p className="text-[9px] text-slate-500">Camion Benne #12</p>
                    </div>
                  </div>

                  <select 
                    value={activeRound}
                    onChange={(e) => { setActiveRound(e.target.value); setCollectorCurrentStop(0); }}
                    className="bg-slate-950 border border-slate-800 text-[10px] py-1 px-2 w-36"
                  >
                    <option value="Tournée Bleue (Nord)">Tournée Nord</option>
                    <option value="Tournée Verte (Sud)">Tournée Sud</option>
                  </select>
                </div>

                {/* État du camion de collecte */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">Remplissage Camion</span>
                    <strong className="text-amber-400">{progressPercent}%</strong>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>{collectorCurrentStop} arrêts visités</span>
                    <span>Temps rest. estimé : ~1h 15</span>
                  </div>
                </div>

                {/* Arrêt courant */}
                {currentStopRequest ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-wider">
                      Arrêt en cours
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Adresse à collecter</span>
                      <h5 className="font-bold text-white text-sm mt-1">{currentStopRequest.address}</h5>
                      <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">{currentStopRequest.district}</span>
                    </div>

                    <div className="border-t border-slate-900 pt-3 space-y-2">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Liste des objets</span>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 space-y-1.5">
                        {Object.entries(currentStopRequest.items).map(([itemId, qty]) => {
                          const itemDef = COLLECTIBLE_ITEMS.find(c => c.id === itemId);
                          return (
                            <div key={itemId} className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-300">{itemDef ? itemDef.name : itemId}</span>
                              <strong className="text-white bg-slate-950 px-1.5 py-0.5 rounded">x{qty}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Simulation Itinéraire GPS sur mobile */}
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 space-y-2.5">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Instructions guidage GPS</span>
                      <div className="flex gap-2.5 items-start text-[10px]">
                        <Compass className="text-amber-400 shrink-0 mt-0.5" size={14} />
                        <p className="text-slate-300 leading-normal">
                          Prenez à gauche sur <strong>Avenue du Général Leclerc</strong>, puis continuez tout droit sur 350 mètres avant le dépôt sur le trottoir.
                        </p>
                      </div>
                    </div>

                    {/* Preuve photo collecteur (simulation) */}
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Justificatif (requis en cas d'absence)</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const mockName = "proof_encombrant_" + currentStopRequest.id + ".jpg";
                          setCollectorProofPhoto(mockName);
                          alert("Photo de preuve enregistrée fictivement : " + mockName);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 py-2 rounded-lg hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload size={12} />
                        <span>{collectorProofPhoto ? "Modifier photo (" + collectorProofPhoto + ")" : "Prendre photo de preuve"}</span>
                      </button>
                    </div>

                    {/* Actions de validation de collecte */}
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3">
                      <button 
                        onClick={() => handleCollectorStatus('Collected')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg text-[10px] transition-colors cursor-pointer"
                      >
                        Enlevé
                      </button>
                      <button 
                        onClick={() => handleCollectorStatus('Absent')}
                        className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold py-3 rounded-lg text-[10px] transition-colors cursor-pointer"
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => {
                          if (!collectorProofPhoto) {
                            alert("Veuillez prendre une photo de preuve pour justifier la collecte impossible.");
                            return;
                          }
                          handleCollectorStatus('Impossible');
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-3 rounded-lg text-[9px] transition-colors cursor-pointer"
                      >
                        Impossible
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-500 space-y-3">
                    <CheckCircle2 className="text-emerald-500 mx-auto" size={28} />
                    <p className="font-bold text-white text-xs">Tournée Accomplie !</p>
                    <p className="text-[10px] text-slate-400">Aucune autre collecte planifiée dans cette zone.</p>
                  </div>
                )}

                {/* Pied de page du téléphone simulé */}
                <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span>GPS Connecté • Choisy-le-Roi Réseau Services</span>
                </div>
              </div>

              {/* Bouton Home de l'iPhone simulé */}
              <div className="bg-slate-800 h-1.5 w-28 mx-auto rounded-full my-2.5"></div>
            </div>
          </div>
        )}

      </main>

      {/* ═══ MODALE SIGNALEMENT DÉPÔT SAUVAGE (CITOYEN) ═══ */}
      {isDumpingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form 
            onSubmit={submitDumpingReport}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 animate-fade-in text-xs"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={20} />
                <span>Signaler un dépôt sauvage</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setIsDumpingModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                Fermer
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Un dépôt sauvage d'encombrants pollue le paysage de Choisy-le-Roi ? Signalez-le immédiatement. Nos brigades d'intervention verte interviendront d'ici 2h.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">ADRESSE DU SIGNALEMENT</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: 14 Rue de la Marne, Choisy-le-Roi" 
                  value={dumpingAddress}
                  onChange={(e) => setDumpingAddress(e.target.value)}
                  className="bg-slate-950 border border-slate-800"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">DESCRIPTION / DESCRIPTION DE L'OBJET</label>
                <textarea 
                  placeholder="ex: 3 vieux matelas jetés sur le trottoir près du parc..." 
                  value={dumpingDesc}
                  onChange={(e) => setDumpingDesc(e.target.value)}
                  className="bg-slate-950 border border-slate-800 h-20 py-2 px-3"
                />
              </div>

              <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center bg-slate-950/40">
                <span className="text-[10px] text-slate-400 font-semibold block">Ajouter une photo du dépôt</span>
                <span className="text-[9px] text-slate-500 mt-1 block">Permet aux agents d'estimer le volume et le camion requis.</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-xs"
            >
              Signaler l'infraction
            </button>
          </form>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Ville de Choisy-le-Roi — Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="/" className="hover:text-emerald-400 transition-colors">Politique de confidentialité</a>
            <a href="/" className="hover:text-emerald-400 transition-colors">Mentions légales</a>
            <a href="/" className="hover:text-emerald-400 transition-colors">Règlement municipal</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Composants Icones personnalisés rapides
function SearchIcon({ size = 16, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
