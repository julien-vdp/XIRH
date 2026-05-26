"use client";

import { useState, useEffect, useRef } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parse, differenceInMinutes, addMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { FileDown, LogOut, Shield, ChevronLeft, ChevronRight, User as UserIcon, Calendar, Trash2, Edit2, Popcorn, Ticket, Sparkles, MessageSquare, CheckCircle, Briefcase, Film, PhoneCall, PenTool, Coffee } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GRID_START_HOUR = 8; 
const GRID_END_HOUR = 26; 
const HOUR_HEIGHT = 60; 
const SNAP_MINUTES = 15;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

type Employee = { id: string; name: string };
type TimeOffRequest = { id: string; userId: string; dateStr: string; startTime: string; endTime: string; comment: string; status: "PENDING" | "APPROVED"; };
type Shift = { id: string; userId: string; dateStr: string; startTime: string; endTime: string; durationMin: number; color?: string; icon?: string; bgImage?: string; comment?: string; };

const ICONS: Record<string, any> = {
    "": null,
    "popcorn": Popcorn,
    "ticket": Ticket,
    "broom": Sparkles,
    "briefcase": Briefcase,
    "film": Film,
    "phone": PhoneCall,
    "tools": PenTool,
    "coffee": Coffee
};

const COLORS = [
    { label: "Défaut (Noir)", class: "from-[#1a1a1a] to-[#0a0a0a] border-[#444]" },
    { label: "Bleu", class: "from-blue-900/50 to-[#0a0a0a] border-blue-500/50" },
    { label: "Violet", class: "from-purple-900/50 to-[#0a0a0a] border-purple-500/50" },
    { label: "Vert", class: "from-emerald-900/50 to-[#0a0a0a] border-emerald-500/50" },
    { label: "Rouge", class: "from-red-900/50 to-[#0a0a0a] border-red-500/50" }
];

const BACKGROUNDS = [
    { id: "", label: "Aucun" },
    { id: "/admin_bg_1776420161045.png", label: "Administration" },
    { id: "/caisse_bg_1776420179391.png", label: "Caisse & Billetterie" },
    { id: "/maintenance_bg_1776420196481.png", label: "Maintenance Machines" },
    { id: "/prog_monday_bg_1776420210827.png", label: "Programmation (Lundi)" }
];

const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    let absH = h;
    if(h >= 0 && h < GRID_START_HOUR) absH += 24; 
    return { h: absH, m };
};
const formatTime = (totalMinutes: number) => {
    const totalAbsHour = (GRID_START_HOUR + totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    let h = Math.floor(totalAbsHour);
    if(h >= 24) h -= 24;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export default function ManagerPlanning() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [timeOffReqs, setTimeOffReqs] = useState<TimeOffRequest[]>([]);
  
  const [visibleEmps, setVisibleEmps] = useState<Set<string>>(new Set());

  const [dragState, setDragState] = useState<{ id: string, type: "move"|"resize", initialY: number, initialShiftY: number, initialHeight: number, dragY: number, currentShiftTop: number, currentShiftHeight: number } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [modalStart, setModalStart] = useState("14:00");
  const [modalEnd, setModalEnd] = useState("22:00");
  const [modalColor, setModalColor] = useState(COLORS[0].class);
  const [modalIcon, setModalIcon] = useState("");
  const [modalBg, setModalBg] = useState("");
  const [modalComment, setModalComment] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedEmps = JSON.parse(localStorage.getItem("cineManager_employees") || "[]");
    if(savedEmps.length === 0) {
        const defaultEmps = [{id:"e1", name:"Alice Dupont"}, {id:"e2", name:"Bob Martin"}];
        localStorage.setItem("cineManager_employees", JSON.stringify(defaultEmps));
        setEmployees(defaultEmps);
        setVisibleEmps(new Set(defaultEmps.map(e=>e.id)));
    } else {
        setEmployees(savedEmps);
        setVisibleEmps(new Set(savedEmps.map((e:Employee)=>e.id)));
    }

    const savedReqs = localStorage.getItem("cineManager_timeOff");
    if(savedReqs) setTimeOffReqs(JSON.parse(savedReqs));

    const savedShifts = localStorage.getItem("cineManager_shifts");
    if(savedShifts) setShifts(JSON.parse(savedShifts));
  }, [currentDate]);

  const saveShifts = (newShifts: Shift[]) => { setShifts(newShifts); localStorage.setItem("cineManager_shifts", JSON.stringify(newShifts)); };
  const saveReqs = (newReqs: TimeOffRequest[]) => { setTimeOffReqs(newReqs); localStorage.setItem("cineManager_timeOff", JSON.stringify(newReqs)); };

  const toggleEmpVisibility = (id: string) => {
      const newVis = new Set(visibleEmps);
      if(newVis.has(id)) newVis.delete(id);
      else newVis.add(id);
      setVisibleEmps(newVis);
  };

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const hoursList = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }).map((_, i) => GRID_START_HOUR + i);

  const convertTimeToTop = (timeStr: string) => {
      const { h, m } = parseTime(timeStr);
      return ((h - GRID_START_HOUR) * 60 + m) * PIXELS_PER_MINUTE;
  };
  const calculateHeight = (startStr: string, endStr: string) => {
      const start = parseTime(startStr); const end = parseTime(endStr);
      let eAbs = end.h + (end.m/60); let sAbs = start.h + (start.m/60);
      if(eAbs < sAbs) eAbs += 24;
      return (eAbs - sAbs) * HOUR_HEIGHT;
  };

  const handlePointerDownEvent = (e: React.PointerEvent, shiftId: string, type: "move" | "resize") => {
      e.preventDefault(); e.stopPropagation();
      const shift = shifts.find(s => s.id === shiftId); if(!shift) return;
      const currentTop = convertTimeToTop(shift.startTime);
      const currentHeight = calculateHeight(shift.startTime, shift.endTime);
      setDragState({ id: shiftId, type, initialY: e.clientY, initialShiftY: currentTop, initialHeight: currentHeight, dragY: e.clientY, currentShiftTop: currentTop, currentShiftHeight: currentHeight });
  };
  const handlePointerMove = (e: React.PointerEvent) => {
      if(!dragState) return; e.preventDefault();
      const deltaY = e.clientY - dragState.initialY;
      if(dragState.type === "move") {
          let newTop = Math.max(0, dragState.initialShiftY + deltaY);
          const snappedTop = Math.round((newTop / PIXELS_PER_MINUTE) / SNAP_MINUTES) * SNAP_MINUTES * PIXELS_PER_MINUTE;
          setDragState(prev => ({ ...prev!, dragY: e.clientY, currentShiftTop: snappedTop }));
      } else if(dragState.type === "resize") {
          let newHeight = Math.max(15 * PIXELS_PER_MINUTE, dragState.initialHeight + deltaY);
          const snappedHeight = Math.round((newHeight / PIXELS_PER_MINUTE) / SNAP_MINUTES) * SNAP_MINUTES * PIXELS_PER_MINUTE;
          setDragState(prev => ({ ...prev!, dragY: e.clientY, currentShiftHeight: snappedHeight }));
      }
  };
  const handlePointerUp = () => {
      if(!dragState) return;
      const shift = shifts.find(s => s.id === dragState.id);
      if(shift) {
          if(dragState.type === "move") {
              const startMinutes = dragState.currentShiftTop / PIXELS_PER_MINUTE;
              saveShifts(shifts.map(s => s.id === shift.id ? {...s, startTime: formatTime(startMinutes), endTime: formatTime(startMinutes + shift.durationMin)} : s));
          } else if(dragState.type === "resize") {
              const newDuration = dragState.currentShiftHeight / PIXELS_PER_MINUTE;
              const startMinutes = convertTimeToTop(shift.startTime) / PIXELS_PER_MINUTE;
              saveShifts(shifts.map(s => s.id === shift.id ? {...s, endTime: formatTime(startMinutes + newDuration), durationMin: newDuration} : s));
          }
      }
      setDragState(null);
  };

  const addShiftClick = (dateStr: string, empId: string, clickTop: number) => {
       const topMinutes = clickTop / PIXELS_PER_MINUTE;
       const snappedMinutes = Math.floor(topMinutes / SNAP_MINUTES) * SNAP_MINUTES;
       const newShift: Shift = {
           id: Math.random().toString(), userId: empId, dateStr: dateStr,
           startTime: formatTime(snappedMinutes), endTime: formatTime(snappedMinutes + 120),
           durationMin: 120, color: COLORS[0].class, icon: "", bgImage: "", comment: ""
       };
       saveShifts([...shifts, newShift]);
  };

  const openEditModal = (shift: Shift) => {
      setEditingShiftId(shift.id);
      setModalStart(shift.startTime);
      setModalEnd(shift.endTime);
      setModalColor(shift.color || COLORS[0].class);
      setModalIcon(shift.icon || "");
      setModalBg(shift.bgImage || "");
      setModalComment(shift.comment || "");
      setModalOpen(true);
  };

  const saveEdit = () => {
      if(!editingShiftId) return;
      const s = parseTime(modalStart); const e = parseTime(modalEnd);
      let eAbs = e.h + (e.m/60); let sAbs = s.h + (s.m/60);
      if(eAbs < sAbs) eAbs += 24;
      const durMin = (eAbs - sAbs) * 60;
      saveShifts(shifts.map(sh => sh.id === editingShiftId ? {...sh, startTime: modalStart, endTime: modalEnd, durationMin: durMin, color: modalColor, icon: modalIcon, bgImage: modalBg, comment: modalComment} : sh));
      setModalOpen(false);
  };

  const handlePendingClick = (req: TimeOffRequest) => {
      if(confirm(`Demande de congé de ${req.startTime} à ${req.endTime}.\nRaison : ${req.comment}\n\nVoulez-vous APPROUVER (OK) ou REFUSER (Annuler) ?`)) {
          saveReqs(timeOffReqs.map(r => r.id === req.id ? {...r, status: "APPROVED"} : r));
      } else { saveReqs(timeOffReqs.filter(r => r.id !== req.id)); }
  };

  const getWeeklyHours = (empId: string) => {
     const thisWeekStrs = weekDays.map(d => format(d, "yyyy-MM-dd"));
     const empWeekShifts = shifts.filter(s => s.userId === empId && thisWeekStrs.includes(s.dateStr));
     return empWeekShifts.reduce((acc, curr) => acc + curr.durationMin, 0) / 60;
  };

  const activeEmployees = employees.filter(e => visibleEmps.has(e.id));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {/* Banner using CSS background-image */}
      <div className="w-full h-48 sm:h-64 relative flex-shrink-0 bg-cover bg-[center_35%]" style={{ backgroundImage: "url('/manager_header.png')" }}>
          <div className="absolute inset-0 bg-[#0a0a0a]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-transparent" />
          
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#E50914] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                     <Shield size={24} className="text-white" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-md">Tours de <span className="text-[#E50914]">Contrôle</span></h1>
                      <p className="text-gray-200 text-sm font-medium drop-shadow">Agenda de l'Équipe</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={() => router.push('/manager/admin')} className="bg-black/50 backdrop-blur-md hover:bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">Admin Staff</button>
                  <button onClick={() => router.push('/manager/screenings')} className="bg-black/50 backdrop-blur-md hover:bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">Progs</button>
                  <button onClick={() => {localStorage.removeItem("userRole"); router.push("/");}} className="bg-[#E50914] hover:bg-[#b80710] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><LogOut size={16} /></button>
              </div>
          </div>
      </div>

      <main className="flex-1 w-full px-4 sm:px-8 -mt-20 z-20 relative pb-12">
          <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#262626] rounded-2xl p-4 flex flex-col xl:flex-row items-center justify-between mb-4 shadow-2xl gap-4">
              <div className="flex items-center space-x-2">
                 <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-[#262626] rounded-lg transition-colors border border-transparent hover:border-[#333]"><ChevronLeft size={20} /></button>
                 <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-[#262626] rounded-lg transition-colors text-sm font-medium border border-[#333]">Aujourd'hui</button>
                 <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-[#262626] rounded-lg transition-colors border border-transparent hover:border-[#333]"><ChevronRight size={20} /></button>
                 <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 ml-2"><Calendar className="text-[#E50914]" size={20} /> <span className="text-[#E50914]">{format(startOfCurrentWeek, "d MMM", { locale: fr })}</span></h2>
              </div>
              <div className="flex gap-2 pb-2 xl:pb-0 overflow-x-auto w-full xl:w-auto items-center">
                 {employees.map(emp => {
                     const h = getWeeklyHours(emp.id);
                     const isVis = visibleEmps.has(emp.id);
                     return (
                        <button key={emp.id} onClick={()=>toggleEmpVisibility(emp.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${isVis ? 'border-[#444] bg-[#262626] text-white' : 'border-[#333] bg-transparent text-gray-600'}`}>
                           {isVis && <CheckCircle size={12}/>}
                           <span className="text-xs font-bold">{emp.name} ({h}h)</span>
                        </button>
                     )
                 })}
              </div>
          </div>

          <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-2xl flex max-w-[100vw] overflow-x-auto select-none">
              <div className="w-12 sm:w-16 flex-shrink-0 bg-[#0f0f0f] border-r border-[#262626] flex flex-col z-20 relative">
                  <div className="h-16 border-b border-[#262626] bg-[#0f0f0f]"></div>
                  {hoursList.map(h => {
                     const displayH = h >= 24 ? h - 24 : h;
                     return (
                         <div key={h} className="text-right pr-2 text-xs text-gray-500 font-medium relative" style={{ height: HOUR_HEIGHT }}><span className="absolute -top-2 right-2">{displayH.toString().padStart(2, '0')}h</span></div>
                     )
                  })}
              </div>

              <div className="flex-1 flex flex-col min-w-[900px]" ref={containerRef}>
                  <div className="flex bg-[#1a1a1a] border-b border-[#262626] h-16">
                      {weekDays.map(day => (
                          <div key={day.toISOString()} className="flex-1 border-l border-[#262626] flex flex-col first:border-0 relative">
                              <div className="text-center py-1 border-b border-[#333]"><span className="text-[10px] font-bold text-gray-500 uppercase">{format(day, 'EEEE d MMM', {locale:fr})}</span></div>
                              <div className="flex h-full">
                                  {activeEmployees.map(emp => (
                                      <div key={emp.id} className="flex-1 border-r border-[#333]/30 last:border-0 text-center flex items-center justify-center bg-[#1a1a1a]"><span className="text-[9px] sm:text-[10px] text-gray-300 font-bold truncate">{emp.name.split(' ')[0]}</span></div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="flex relative bg-[#0a0a0a]" style={{ height: hoursList.length * HOUR_HEIGHT }}>
                      <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
                          {hoursList.map(h => (
                              <div key={h} className="w-full border-b border-[#262626]/40" style={{ height: HOUR_HEIGHT }}></div>
                          ))}
                      </div>

                      <div className="flex w-full absolute inset-0 z-10">
                          {weekDays.map(day => {
                              const dStr = format(day, "yyyy-MM-dd");
                              return (
                              <div key={day.toISOString()} className="flex-1 border-l border-[#262626] flex first:border-0 relative">
                                  {activeEmployees.map(emp => {
                                      const empShifts = shifts.filter(s => s.userId === emp.id && s.dateStr === dStr);
                                      const offReqs = timeOffReqs.filter(s => s.userId === emp.id && s.dateStr === dStr);

                                      return (
                                      <div key={`${emp.id}_${dStr}`} className="flex-1 border-r border-[#333]/30 min-w-[30px] sm:min-w-[50px] relative hover:bg-white/5 transition-colors group cursor-crosshair">
                                          <div className="absolute inset-0" onClick={(e) => { if(e.target === e.currentTarget) addShiftClick(dStr, emp.id, e.nativeEvent.offsetY); }}></div>
                                          
                                          {offReqs.map(ev => {
                                              const top = convertTimeToTop(ev.startTime); const height = calculateHeight(ev.startTime, ev.endTime); const isPending = ev.status === "PENDING";
                                              return (
                                                  <div key={ev.id} onClick={() => isPending && handlePendingClick(ev)} className={`absolute left-0.5 right-0.5 rounded overflow-hidden z-20 ${isPending ? 'bg-orange-500/20 border-l-2 border-l-orange-500 cursor-pointer hover:bg-orange-500/40' : 'bg-[#E50914]/10 border-l-2 border-l-[#E50914] pointer-events-none'} transition-colors`} style={{ top, height, backgroundImage: isPending ? 'none' : 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(229,9,20,0.1) 5px, rgba(229,9,20,0.1) 10px)' }}>
                                                      <div className="p-0.5 sm:p-1"><p className={`text-[8px] sm:text-[9px] font-bold leading-none ${isPending ? 'text-orange-400' : 'text-[#E50914]'}`}>{isPending ? 'DEMANDE' : 'OFF'}</p></div>
                                                  </div>
                                              )
                                          })}

                                          {empShifts.map(s => {
                                              const isDraggingThis = dragState?.id === s.id && dragState.type === "move";
                                              const isResizingThis = dragState?.id === s.id && dragState.type === "resize";
                                              
                                              let top = convertTimeToTop(s.startTime); let height = calculateHeight(s.startTime, s.endTime);
                                              if(isDraggingThis && dragState) top = dragState.currentShiftTop;
                                              if(isResizingThis && dragState) height = dragState.currentShiftHeight;

                                              const IconComp = s.icon && ICONS[s.icon] ? ICONS[s.icon] : null;

                                              const hasBgImage = !!s.bgImage;
                                              const dynamicStyle: any = { top, height, touchAction: 'none' };
                                              
                                              if (hasBgImage) {
                                                  dynamicStyle.backgroundImage = `url("${s.bgImage}")`;
                                                  dynamicStyle.backgroundSize = "cover";
                                                  dynamicStyle.backgroundPosition = "center";
                                              }

                                              return (
                                                  <div key={s.id}
                                                     className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 bg-gradient-to-br ${!hasBgImage ? (s.color || COLORS[0].class) : 'border-[#444]'} ${isDraggingThis||isResizingThis ? 'z-50 opacity-90 scale-105 shadow-xl shadow-black' : 'z-30 shadow-md'} rounded p-[1px] overflow-hidden transition-transform`}
                                                     style={dynamicStyle}
                                                  >
                                                      {/* Overlay to ensure text readability if bgImage is present */}
                                                      {hasBgImage && <div className="absolute inset-0 bg-black/60 pointer-events-none" />}

                                                      <div className="w-full h-[calc(100%-8px)] cursor-move relative flex flex-col z-10" 
                                                           onPointerDown={e => handlePointerDownEvent(e, s.id, "move")}
                                                           onClick={() => !isDraggingThis && openEditModal(s)}
                                                      >
                                                        <div className="pointer-events-none flex items-start gap-1 p-0.5">
                                                          {IconComp && <IconComp size={10} className={`mt-0.5 hidden sm:block ${hasBgImage ? 'text-white' : 'text-white/70'}`} />}
                                                          <div className="flex-1">
                                                              <p className="text-[9px] sm:text-[10px] font-bold text-white leading-tight drop-shadow-md">
                                                                  {isDraggingThis ? formatTime(top/PIXELS_PER_MINUTE) : s.startTime} 
                                                                  <span className={hasBgImage ? "text-gray-100 font-normal shadow-black" : "text-gray-400 font-normal"}> - {isResizingThis ? formatTime(top/PIXELS_PER_MINUTE + height/PIXELS_PER_MINUTE) : s.endTime}</span>
                                                              </p>
                                                              {s.comment && <p className="text-[8px] text-white/80 truncate mt-0.5 leading-none drop-shadow-sm font-medium">{s.comment}</p>}
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-ns-resize hover:bg-white/20 z-40 transition-colors"
                                                           onPointerDown={e => handlePointerDownEvent(e, s.id, "resize")}>
                                                          <div className="w-4 h-0.5 bg-white/50 shadow-md rounded"></div>
                                                      </div>
                                                  </div>
                                              )
                                          })}
                                      </div>
                                  )})}
                              </div>
                          )})}
                      </div>
                  </div>
              </div>
          </div>
      </main>

      {/* Edit Modal */}
      {modalOpen && editingShiftId && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent"></div>
                  <h3 className="text-lg font-bold text-white mb-4">Détails du Créneau</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <input type="time" value={modalStart} onChange={e=>setModalStart(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-white [color-scheme:dark] outline-none" />
                      </div>
                      <div>
                          <input type="time" value={modalEnd} onChange={e=>setModalEnd(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-white [color-scheme:dark] outline-none" />
                      </div>
                  </div>

                  <div className="mb-4">
                     <label className="block text-[10px] text-gray-500 mb-1">INTITULÉ / POSTE</label>
                     <input type="text" value={modalComment} onChange={e=>setModalComment(e.target.value)} placeholder="Ex: Caisse 1..." className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-sm text-white outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                         <label className="block text-[10px] text-gray-500 mb-1">COULEUR</label>
                         <select value={modalColor} onChange={e=>setModalColor(e.target.value)} disabled={!!modalBg} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-sm text-white outline-none disabled:opacity-50">
                             {COLORS.map(c => <option key={c.label} value={c.class}>{c.label}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-[10px] text-gray-500 mb-1">ICÔNE</label>
                         <select value={modalIcon} onChange={e=>setModalIcon(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-sm text-white outline-none">
                             <option value="">Aucune</option>
                             <option value="briefcase">Directeur</option>
                             <option value="popcorn">Popcorn</option>
                             <option value="ticket">Tickets</option>
                             <option value="film">Film / Projection</option>
                             <option value="broom">Entretien</option>
                             <option value="tools">Technique</option>
                         </select>
                      </div>
                  </div>

                  <div className="mb-6">
                      <label className="block text-[10px] text-gray-500 mb-1">OU IMAGE DE FOND (PHOTORÉALISTE)</label>
                      <select value={modalBg} onChange={e=>setModalBg(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#E50914]/50 rounded-lg p-2 text-sm text-white outline-none focus:border-[#E50914] transition-colors">
                          {BACKGROUNDS.map(bg => <option key={bg.label} value={bg.id}>{bg.label}</option>)}
                      </select>
                  </div>

                  <div className="flex gap-2">
                      <button onClick={()=>{saveShifts(shifts.filter(sh => sh.id !== editingShiftId)); setModalOpen(false);}} className="bg-transparent border border-red-900 text-red-500 p-2 rounded-lg hover:bg-red-900/20">
                         <Trash2 size={16}/>
                      </button>
                      <button onClick={() => setModalOpen(false)} className="flex-1 border border-[#333] text-gray-300 py-2 rounded-lg hover:bg-[#1a1a1a]">Fermer</button>
                      <button onClick={saveEdit} className="flex-1 bg-[#E50914] text-white py-2 rounded-lg hover:bg-[#b80710] font-bold">Sauver</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
