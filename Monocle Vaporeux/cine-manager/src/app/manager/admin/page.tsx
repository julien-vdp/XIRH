"use client";

import { useState, useEffect } from "react";
import { LogOut, Shield, Users, Plus, Trash2, Calendar, CheckSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Employee = { id: string; name: string };
type TimeOffRequest = { id: string; userId: string; status: "PENDING" | "APPROVED" };
type Shift = { id: string; durationMin: number };

export default function ManagerAdmin() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  
  const [newName, setNewName] = useState("");

  useEffect(() => {
    // Default initialization if entirely empty
    if (!localStorage.getItem("cineManager_employees")) {
        localStorage.setItem("cineManager_employees", JSON.stringify([
            { id: "e1", name: "Alice Dupont" },
            { id: "e2", name: "Bob Martin" }
        ]));
    }

    setEmployees(JSON.parse(localStorage.getItem("cineManager_employees") || "[]"));
    setShifts(JSON.parse(localStorage.getItem("cineManager_shifts") || "[]"));
    setRequests(JSON.parse(localStorage.getItem("cineManager_timeOff") || "[]"));
  }, []);

  const saveEmployees = (emps: Employee[]) => {
      setEmployees(emps);
      localStorage.setItem("cineManager_employees", JSON.stringify(emps));
  };

  const addEmployee = () => {
      if(!newName.trim()) return;
      saveEmployees([...employees, { id: "e" + Date.now(), name: newName.trim() }]);
      setNewName("");
  };

  const removeEmployee = (id: string) => {
      if(confirm("Êtes-vous sûr de vouloir supprimer ce salarié ? Son profil et ses horaires ne seront plus lisibles.")) {
          saveEmployees(employees.filter(e => e.id !== id));
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  // KPI Calculations
  const totalHoursPlanned = shifts.reduce((acc, s) => acc + s.durationMin, 0) / 60;
  const pendingRequestsCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col">
      {/* Banner using CSS Background */}
      <div className="w-full h-48 sm:h-64 relative flex-shrink-0 bg-cover bg-[center_35%]" style={{ backgroundImage: "url('/manager_header.png')" }}>
          <div className="absolute inset-0 bg-[#0a0a0a]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-transparent" />
          
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#E50914] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                     <Shield size={24} className="text-white" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-md">Panel <span className="text-[#E50914]">Administration</span></h1>
                      <p className="text-gray-200 text-sm font-medium drop-shadow">Ressources Humaines & Statistiques</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={() => router.push('/manager/planning')} className="bg-black/50 backdrop-blur-md hover:bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Agenda
                  </button>
                  <button onClick={() => router.push('/manager/screenings')} className="bg-black/50 backdrop-blur-md hover:bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Salles
                  </button>
                  <button onClick={handleLogout} className="bg-[#E50914] hover:bg-[#b80710] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <LogOut size={16} />
                      <span className="text-sm font-medium hidden sm:block">Quitter</span>
                  </button>
              </div>
          </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 -mt-20 z-20 relative pb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Dashboard KPIs */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#141414]/90 backdrop-blur-md border border-[#262626] rounded-xl p-6 shadow-2xl flex items-center gap-4">
                 <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center">
                     <Users size={28} className="text-blue-500" />
                 </div>
                 <div>
                     <p className="text-3xl font-black text-white">{employees.length}</p>
                     <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Salariés Actifs</p>
                 </div>
              </div>

              <div className="bg-[#141414]/90 backdrop-blur-md border border-[#262626] rounded-xl p-6 shadow-2xl flex items-center gap-4">
                 <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
                     <Clock size={28} className="text-orange-500" />
                 </div>
                 <div>
                     <p className="text-3xl font-black text-white">{totalHoursPlanned.toFixed(1)}h</p>
                     <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Heures Plannifiées</p>
                 </div>
              </div>

              <div className="bg-[#141414]/90 backdrop-blur-md border border-[#262626] rounded-xl p-6 shadow-2xl flex items-center gap-4 relative overflow-hidden">
                 {pendingRequestsCount > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-[#E50914] animate-pulse"></div>}
                 <div className="w-14 h-14 bg-[#E50914]/20 rounded-full flex items-center justify-center">
                     <CheckSquare size={28} className="text-[#E50914]" />
                 </div>
                 <div>
                     <p className="text-3xl font-black text-white">{pendingRequestsCount}</p>
                     <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Demandes Off (Attente)</p>
                 </div>
              </div>
          </div>

          {/* Manage Employees */}
          <div className="md:col-span-2 bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[#262626] flex justify-between items-center bg-[#1a1a1a]">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Users className="text-[#E50914]" /> Registre du Personnel</h2>
              </div>
              <div className="p-0">
                  {employees.map(emp => (
                      <div key={emp.id} className="flex justify-between items-center p-4 border-b border-[#262626] last:border-0 hover:bg-[#1a1a1a]/50 transition-colors">
                          <span className="font-semibold text-white">{emp.name}</span>
                          <div className="flex items-center gap-4">
                             <span className="text-xs text-gray-500 font-mono bg-black px-2 py-1 rounded">ID: {emp.id}</span>
                             <button onClick={() => removeEmployee(emp.id)} className="text-gray-500 hover:text-[#E50914] transition-colors p-2"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  ))}
                  {employees.length === 0 && <p className="p-6 text-center text-gray-500">Aucun salarié dans la base.</p>}
              </div>
          </div>

          <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-2xl h-fit">
              <div className="p-6 border-b border-[#262626] bg-[#1a1a1a]">
                  <h2 className="text-lg font-bold">Nouveau Collaborateur</h2>
              </div>
              <div className="p-6 space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Prénom & Nom</label>
                      <input 
                          type="text" 
                          value={newName} 
                          onChange={(e)=>setNewName(e.target.value)} 
                          onKeyDown={(e) => e.key==='Enter' && addEmployee()}
                          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-[#E50914] outline-none"
                          placeholder="Ex: Clara Lemaire"
                      />
                  </div>
                  <button onClick={addEmployee} disabled={!newName.trim()} className="w-full bg-[#E50914] hover:bg-[#b80710] disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.3)] transition-all">
                      <Plus size={18} /> Ajouter à l'équipe
                  </button>
              </div>
          </div>
      </main>
    </div>
  );
}
