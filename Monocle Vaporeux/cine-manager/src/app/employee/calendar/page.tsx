"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { User, LogOut, ChevronLeft, ChevronRight, MessageSquare, Trash2, Calendar, Edit2, ShieldAlert, Popcorn, Ticket, Sparkles, Briefcase, Film, PhoneCall, PenTool, Coffee, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Employee = { id: string; name: string };
type TimeOffRequest = {
  id: string; userId: string; dateStr: string; startTime: string; endTime: string;
  comment: string; status?: "PENDING" | "APPROVED";
};
type Shift = {
  id: string; userId: string; dateStr: string; startTime: string; endTime: string;
  durationMin: number; color?: string; icon?: string; bgImage?: string; comment?: string;
};

const ICONS: Record<string, any> = {
    "": null, "popcorn": Popcorn, "ticket": Ticket, "broom": Sparkles,
    "briefcase": Briefcase, "film": Film, "phone": PhoneCall, "tools": PenTool, "coffee": Coffee
};

const COLORS: Record<string, string> = {
    "from-[#1a1a1a] to-[#0a0a0a] border-[#444]": "Défaut",
    "from-blue-900/50 to-[#0a0a0a] border-blue-500/50": "Bleu",
    "from-purple-900/50 to-[#0a0a0a] border-purple-500/50": "Violet",
    "from-emerald-900/50 to-[#0a0a0a] border-emerald-500/50": "Vert",
    "from-red-900/50 to-[#0a0a0a] border-red-500/50": "Rouge"
};

const GRID_START_HOUR = 8; 
const GRID_END_HOUR = 26; 
const HOUR_HEIGHT = 60; 
const SNAP_MINUTES = 15;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number); let absH = h;
    if(h >= 0 && h < GRID_START_HOUR) absH += 24; return { h: absH, m };
};
const formatTime = (totalMinutes: number) => {
    const totalAbsHour = (GRID_START_HOUR + totalMinutes / 60); const m = Math.round(totalMinutes % 60);
    let h = Math.floor(totalAbsHour); if(h >= 24) h -= 24;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export default function EmployeeCalendar() {
  const router = useRouter();
  
  const [employeeId, setEmployeeId] = useState("e1");
  const [employeeName, setEmployeeName] = useState("Salarié");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const [viewMode, setViewMode] = useState<"MY_REQ" | "TEAM_SCHEDULE">("MY_REQ");

  // Interaction States
  const [dragState, setDragState] = useState<{ id: string, type: "move" | "resize", initialY: number, initialShiftY: number, initialHeight: number, dragY: number, currentShiftTop: number, currentShiftHeight: number } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalStart, setModalStart] = useState("14:00");
  const [modalEnd, setModalEnd] = useState("18:00");
  const [modalComment, setModalComment] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("employeeId") || "e1";
    const name = localStorage.getItem("employeeName") || "Alice Dupont";
    setEmployeeId(id);
    setEmployeeName(name);

    if (!localStorage.getItem("cineManager_employees")) {
        localStorage.setItem("cineManager_employees", JSON.stringify([{ id: "e1", name: "Alice Dupont" }, { id: "e2", name: "Bob Martin" }]));
    }
    setEmployees(JSON.parse(localStorage.getItem("cineManager_employees") || "[]"));
    const savedReqs = localStorage.getItem("cineManager_timeOff");
    if(savedReqs) setRequests(JSON.parse(savedReqs));
    setShifts(JSON.parse(localStorage.getItem("cineManager_shifts") || "[]"));
  }, []);

  const saveRequests = (newReqs: TimeOffRequest[]) => { setRequests(newReqs); localStorage.setItem("cineManager_timeOff", JSON.stringify(newReqs)); };

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const hoursList = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }).map((_, i) => GRID_START_HOUR + i);

  const handleLogout = () => { localStorage.removeItem("userRole"); router.push("/"); };

  const convertTimeToTop = (timeStr: string) => { const { h, m } = parseTime(timeStr); return ((h - GRID_START_HOUR) * 60 + m) * PIXELS_PER_MINUTE; };
  const calculateHeight = (startStr: string, endStr: string) => {
      const start = parseTime(startStr); const end = parseTime(endStr);
      let eAbs = end.h + (end.m/60); let sAbs = start.h + (start.m/60);
      if(eAbs < sAbs) eAbs += 24; return (eAbs - sAbs) * HOUR_HEIGHT;
  };

  const handlePointerDownEvent = (e: React.PointerEvent, reqId: string, type: "move" | "resize") => {
      if(viewMode === "TEAM_SCHEDULE") return; // Read Only
      e.preventDefault(); e.stopPropagation();
      const req = requests.find(r => r.id === reqId); if(!req) return;
      if (req.status === "APPROVED") return; // Cannot edit approved

      const currentTop = convertTimeToTop(req.startTime);
      const currentHeight = calculateHeight(req.startTime, req.endTime);
      setDragState({ id: reqId, type, initialY: e.clientY, initialShiftY: currentTop, initialHeight: currentHeight, dragY: e.clientY, currentShiftTop: currentTop, currentShiftHeight: currentHeight });
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
      const req = requests.find(r => r.id === dragState.id);
      if(req) {
          if(dragState.type === "move") {
              const startMins = dragState.currentShiftTop / PIXELS_PER_MINUTE;
              const durMins = calculateHeight(req.startTime, req.endTime) / PIXELS_PER_MINUTE;
              saveRequests(requests.map(r => r.id === req.id ? {...r, startTime: formatTime(startMins), endTime: formatTime(startMins + durMins), status: "PENDING"} : r)); // Revert to pending on edit
          } else if (dragState.type === "resize") {
              const startMins = convertTimeToTop(req.startTime) / PIXELS_PER_MINUTE;
              const durMins = dragState.currentShiftHeight / PIXELS_PER_MINUTE;
              saveRequests(requests.map(r => r.id === req.id ? {...r, endTime: formatTime(startMins + durMins), status: "PENDING"} : r));
          }
      }
      setDragState(null);
  };

  const addClickReq = (dateStr: string, clickTop: number) => {
      if(viewMode === "TEAM_SCHEDULE") return;
      const topMinutes = clickTop / PIXELS_PER_MINUTE;
      const snappedMinutes = Math.floor(topMinutes / SNAP_MINUTES) * SNAP_MINUTES;
      setSelectedDay(dateStr); setModalMode("CREATE");
      setModalStart(formatTime(snappedMinutes)); setModalEnd(formatTime(snappedMinutes + 120));
      setModalComment(""); setModalOpen(true);
  };

  const openEditModal = (req: TimeOffRequest) => {
      if(viewMode === "TEAM_SCHEDULE" || req.status === "APPROVED") return;
      setModalMode("EDIT"); setEditingId(req.id);
      setModalStart(req.startTime); setModalEnd(req.endTime);
      setModalComment(req.comment); setModalOpen(true);
  };

  const confirmModal = () => {
      if(modalMode === "CREATE" && selectedDay) {
          const newReq: TimeOffRequest = { id: Math.random().toString(), userId: employeeId, dateStr: selectedDay, startTime: modalStart, endTime: modalEnd, comment: modalComment, status: "PENDING" };
          saveRequests([...requests, newReq]);
      } else if (modalMode === "EDIT" && editingId) {
          saveRequests(requests.map(r => r.id === editingId ? {...r, startTime: modalStart, endTime: modalEnd, comment: modalComment, status:"PENDING"} : r));
      }
      setModalOpen(false);
  };
  const deleteReq = () => { saveRequests(requests.filter(r => r.id !== editingId)); setModalOpen(false); };

  // Helper renderers
  const renderShiftBlock = (s: Shift) => {
      let top = convertTimeToTop(s.startTime); let height = calculateHeight(s.startTime, s.endTime);
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
             className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 bg-gradient-to-br ${!hasBgImage ? (s.color || "from-[#1a1a1a] to-[#0a0a0a] border-[#444]") : 'border-[#444]'} z-30 shadow-md rounded p-[1px] overflow-hidden`}
             style={dynamicStyle}
          >
              {hasBgImage && <div className="absolute inset-0 bg-black/60 pointer-events-none" />}
              <div className="w-full h-full relative flex flex-col z-10">
                <div className="pointer-events-none flex items-start gap-1 p-0.5">
                  {IconComp && <IconComp size={10} className={`mt-0.5 hidden sm:block ${hasBgImage ? 'text-white' : 'text-white/70'}`} />}
                  <div className="flex-1">
                      <p className="text-[8px] sm:text-[9px] font-bold text-white leading-tight drop-shadow-md">
                          {s.startTime} <span className={hasBgImage ? "text-gray-100 font-normal shadow-black" : "text-gray-400 font-normal"}> - {s.endTime}</span>
                      </p>
                      {s.comment && <p className="text-[8px] text-white/80 truncate mt-0.5 leading-none drop-shadow-sm font-medium">{s.comment}</p>}
                  </div>
                </div>
              </div>
          </div>
      )
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {/* Banner using CSS */}
      <div className="w-full h-48 sm:h-64 relative flex-shrink-0 bg-cover bg-[center_35%]" style={{ backgroundImage: "url('/employee_header.png')" }}>
          <div className="absolute inset-0 bg-[#0a0a0a]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-transparent" />
          
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#E50914] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                     <User size={24} className="text-white" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-md">Espace <span className="text-[#E50914]">Équipe</span></h1>
                      <p className="text-gray-200 text-sm font-medium drop-shadow">{employeeName}</p>
                  </div>
              </div>
              <button onClick={handleLogout} className="bg-black/50 backdrop-blur-md hover:bg-[#E50914] border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <LogOut size={16} />
                  <span className="text-sm font-medium hidden sm:block">Déconnexion</span>
              </button>
          </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 -mt-20 z-20 relative pb-12">
          
          <div className="bg-[#141414]/90 backdrop-blur-xl border border-[#262626] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between mb-6 shadow-2xl">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                 <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-[#262626] rounded-lg transition-colors border border-transparent hover:border-[#333]"><ChevronLeft size={20} /></button>
                 <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-[#262626] rounded-lg transition-colors text-sm font-medium border border-[#333]">Aujourd'hui</button>
                 <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-[#262626] rounded-lg transition-colors border border-transparent hover:border-[#333]"><ChevronRight size={20} /></button>
                  <h2 className="text-xl font-bold flex items-center gap-3">
                      <Calendar className="text-[#E50914]" size={24} /> <span className="text-[#E50914] hidden sm:block">{format(startOfCurrentWeek, "d MMMM yyyy", { locale: fr })}</span>
                  </h2>
              </div>
              
              <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-[#333]">
                  <button onClick={() => setViewMode("MY_REQ")} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${viewMode === "MY_REQ" ? "bg-[#262626] text-white shadow" : "text-gray-400 hover:text-white"}`}>
                      Mes Indisponibilités
                  </button>
                  <button onClick={() => setViewMode("TEAM_SCHEDULE")} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${viewMode === "TEAM_SCHEDULE" ? "bg-[#262626] text-white shadow" : "text-gray-400 hover:text-white"}`}>
                      <Users size={16}/> Vue Globale
                  </button>
              </div>
          </div>

          <p className="text-gray-400 mb-6 text-sm flex items-center gap-2">
            ℹ️ <span className="font-semibold text-gray-300">Astuce :</span> {viewMode === "MY_REQ" ? "Cliquez sur la grille pour créer votre demande, puis glissez-la ou ajustez ses horaires à la souris !" : "Consultez l'agenda de toute l'équipe de la semaine. Mode Lecture seule."}
          </p>

          <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-2xl flex select-none max-w-[100vw] overflow-x-auto">
              <div className="w-12 sm:w-16 flex-shrink-0 bg-[#0f0f0f] border-r border-[#262626] flex flex-col">
                  <div className="h-16 border-b border-[#262626]"></div>
                  {hoursList.map(h => <div key={h} className="text-right pr-2 text-xs text-gray-500 font-medium relative" style={{ height: HOUR_HEIGHT }}><span className="absolute -top-2 right-2">{h >= 24 ? h - 24 : h}h</span></div>)}
              </div>

              <div className={`flex-1 flex flex-col min-w-[700px] ${viewMode === "TEAM_SCHEDULE" ? "min-w-[900px]" : ""}`}>
                  <div className="flex bg-[#1a1a1a] border-b border-[#262626] relative z-20 h-16">
                      {weekDays.map(day => {
                          const isTdy = isSameDay(day, new Date());
                          return (
                          <div key={day.toISOString()} className="flex-1 min-w-[100px] flex flex-col border-l border-[#262626] first:border-0">
                              {viewMode === "MY_REQ" ? (
                                  <div className="flex-1 flex flex-col items-center justify-center">
                                      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider leading-none">{format(day, 'EEEE', { locale: fr })}</span>
                                      <div className={`mt-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-black ${isTdy ? 'bg-[#E50914] text-white shadow-[0_0_10px_#E50914]' : 'text-gray-200'}`}>
                                          {format(day, 'd')}
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                      <div className="text-center py-1 border-b border-[#333]"><span className="text-[10px] font-bold text-gray-500 uppercase">{format(day, 'EEEE d', {locale:fr})}</span></div>
                                      <div className="flex h-full">
                                          {employees.map(emp => (
                                              <div key={emp.id} className={`flex-1 border-r border-[#333]/30 last:border-0 text-center flex items-center justify-center bg-[#1a1a1a] ${emp.id === employeeId ? 'bg-orange-900/10' : ''}`}><span className="text-[9px] sm:text-[10px] text-gray-300 font-bold truncate">{emp.name.split(' ')[0]}</span></div>
                                          ))}
                                      </div>
                                  </>
                              )}
                          </div>
                      )})}
                  </div>

                  <div className="flex relative bg-[#0a0a0a]" style={{ height: hoursList.length * HOUR_HEIGHT }}>
                      <div className="absolute inset-0 pointer-events-none flex flex-col">
                          {hoursList.map(h => <div key={h} className="w-full border-b border-[#262626]/50" style={{ height: HOUR_HEIGHT }}></div>)}
                      </div>

                      <div className="flex w-full absolute inset-0 z-10">
                          {weekDays.map(day => {
                              const dStr = format(day, "yyyy-MM-dd");
                              const dayEvents = requests.filter(r => r.userId === employeeId && r.dateStr === dStr);

                              return (
                              <div key={day.toISOString()} className="flex-1 border-l border-[#262626] first:border-0 relative flex">
                                  {viewMode === "MY_REQ" ? (
                                      <div className="flex-1 relative hover:bg-white/5 transition-colors cursor-crosshair">
                                          <div className="absolute inset-0" onClick={e => addClickReq(dStr, e.nativeEvent.offsetY)}></div>
                                          {dayEvents.map(ev => {
                                              const isDraggingThis = dragState?.id === ev.id && dragState.type === "move";
                                              const isResizingThis = dragState?.id === ev.id && dragState.type === "resize";
                                              let top = convertTimeToTop(ev.startTime); let height = calculateHeight(ev.startTime, ev.endTime);
                                              if(isDraggingThis && dragState) top = dragState.currentShiftTop;
                                              if(isResizingThis && dragState) height = dragState.currentShiftHeight;
                                              const isApproved = ev.status === "APPROVED";

                                              return (
                                                  <div key={ev.id} className={`absolute left-1 right-1 border rounded overflow-hidden shadow-lg backdrop-blur-sm transition-transform ${isDraggingThis||isResizingThis ? 'z-50 opacity-90 scale-105' : 'z-30'} ${isApproved ? 'bg-[#E50914]/20 border-[#E50914] shadow-[#E50914]/20' : 'bg-orange-500/20 border-orange-500/50 shadow-orange-500/20 hover:bg-orange-500/30'}`} style={{ top, height, touchAction: 'none' }}>
                                                      <div className={`w-full h-[calc(100%-8px)] relative p-1 ${!isApproved ? 'cursor-move' : ''}`} onPointerDown={e => !isApproved && handlePointerDownEvent(e, ev.id, "move")} onClick={() => !isDraggingThis && openEditModal(ev)}>
                                                          <div className="pointer-events-none">
                                                              <p className={`text-[10px] sm:text-xs font-bold leading-tight ${isApproved ? 'text-[#E50914]' : 'text-orange-400'}`}>
                                                                  {isApproved ? 'OFF VALIDÉ' : 'Demande Off'}<br/>
                                                                  <span className="text-white drop-shadow-md font-medium text-[9px] sm:text-[10px]">{isDraggingThis ? formatTime(top/PIXELS_PER_MINUTE) : ev.startTime} - {isResizingThis ? formatTime(top/PIXELS_PER_MINUTE + height/PIXELS_PER_MINUTE) : ev.endTime}</span>
                                                              </p>
                                                              {ev.comment && <div className="mt-0.5 flex gap-1 text-[9px] text-white/50"><MessageSquare size={10}/> <span className="truncate">{ev.comment}</span></div>}
                                                          </div>
                                                          {!isDraggingThis && !isResizingThis && !isApproved && (
                                                              <button onClick={e => {e.stopPropagation(); openEditModal(ev);}} className="absolute top-1 right-1 text-white/50 hover:text-white p-0.5 pointer-events-auto bg-black/40 rounded"><Edit2 size={10}/></button>
                                                          )}
                                                      </div>
                                                      {!isApproved && <div className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-ns-resize z-40 bg-orange-500/30 hover:bg-orange-500/70" onPointerDown={e => handlePointerDownEvent(e, ev.id, "resize")}><div className="w-6 h-0.5 bg-white/50 rounded"></div></div>}
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  ) : (
                                      // READ ONLY TEAM SCHEDULE MODE
                                      employees.map(emp => {
                                          const empShifts = shifts.filter(s => s.userId === emp.id && s.dateStr === dStr);
                                          const empOffs = requests.filter(r => r.userId === emp.id && r.dateStr === dStr);

                                          return (
                                              <div key={`${emp.id}_${dStr}`} className={`flex-1 border-r border-[#333]/30 min-w-[30px] sm:min-w-[50px] relative ${emp.id === employeeId ? 'bg-orange-900/5' : ''}`}>
                                                  {empOffs.map(ev => {
                                                      const top = convertTimeToTop(ev.startTime); const height = calculateHeight(ev.startTime, ev.endTime); const isPending = ev.status === "PENDING";
                                                      return (
                                                          <div key={ev.id} className={`absolute left-0.5 right-0.5 rounded overflow-hidden z-20 ${isPending ? 'bg-orange-500/20 border-l-2 border-l-orange-500' : 'bg-[#E50914]/10 border-l-2 border-l-[#E50914]'}`} style={{ top, height, backgroundImage: isPending ? 'none' : 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(229,9,20,0.1) 5px, rgba(229,9,20,0.1) 10px)' }}>
                                                              <div className="p-0.5 sm:p-1"><p className={`text-[8px] sm:text-[9px] font-bold leading-none ${isPending ? 'text-orange-400' : 'text-[#E50914]'}`}>{isPending ? 'ATTENTE' : 'OFF'}</p></div>
                                                          </div>
                                                      )
                                                  })}
                                                  {empShifts.map(renderShiftBlock)}
                                              </div>
                                          )
                                      })
                                  )}
                              </div>
                          )})}
                      </div>
                  </div>
              </div>
          </div>
      </main>

      {/* Request Modal */}
      {modalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{modalMode === "CREATE" ? "Nouvelle Demande de Off" : "Modifier Demande"}</h3>
                  <p className="text-xs text-orange-400 mb-6 flex items-center gap-1"><ShieldAlert size={14}/> Soumis à validation managériale</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">DE (Heure)</label>
                          <input type="time" value={modalStart} onChange={e=>setModalStart(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-orange-500" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">À (Heure)</label>
                          <input type="time" value={modalEnd} onChange={e=>setModalEnd(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-orange-500" />
                      </div>
                  </div>

                  <div className="mb-8">
                     <label className="block text-xs font-medium text-gray-400 mb-1">COMMENTAIRE / RAISON</label>
                     <textarea value={modalComment} onChange={e=>setModalComment(e.target.value)} rows={2} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-sm text-white outline-none focus:border-orange-500 resize-none"></textarea>
                  </div>

                  <div className="flex gap-2">
                      {modalMode === "EDIT" && (<button onClick={deleteReq} className="bg-transparent border border-[#333] text-gray-500 px-3 py-3 rounded-lg hover:text-red-500 hover:border-red-500 transition-colors"><Trash2 size={20}/></button>)}
                      <button onClick={() => setModalOpen(false)} className="flex-1 bg-transparent border border-[#333] text-gray-300 py-3 rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium">Annuler</button>
                      <button onClick={confirmModal} className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all font-bold">Soumettre</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
