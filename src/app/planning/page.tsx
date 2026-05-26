'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Mail, 
  Briefcase, Info, CheckCircle, XCircle, Sun, Clock 
} from 'lucide-react';

// --- API CONFIG ---
const CALENDAR_ID = 'julien.favaux@gmail.com';
const API_KEY = 'AIzaSyA8j4pAeyADQOiVNcCIvcOrPxbCdYHNdWY';

// --- UTILITAIRES ---
const parseGoogleTime = (dateTimeStr: string | null) => {
  if (!dateTimeStr) return null;
  const d = new Date(dateTimeStr);
  return d.getHours() + (d.getMinutes() / 60);
};

// --- COMPOSANT MODAL ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 capitalize">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    const fetchEvents = async () => {
      try {
        const timeMin = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const timeMax = new Date(new Date().getFullYear(), new Date().getMonth() + 4, 0).toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items) {
          const processEvents = data.items.map((item: any, index: number) => {
            const startStr = item.start.dateTime || item.start.date;
            const endStr = item.end.dateTime || item.end.date;
            const dateObj = new Date(startStr);
            
            return {
              id: item.id || index,
              dateObj: dateObj,
              dateStr: startStr,
              isFullDay: !item.start.dateTime,
              startValue: item.start.dateTime ? parseGoogleTime(item.start.dateTime) : 0,
              endValue: item.end.dateTime ? parseGoogleTime(item.end.dateTime) : 24,
            };
          });
          setEvents(processEvents);
        }
      } catch (error) {
        console.error('Erreur lors du chargement API Agenda :', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // --- LOGIQUE METIER ---
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const currentMonthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) { days.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i)); }

  const getEventsForDay = (dateObj: Date | null) => {
    if (!dateObj) return [];
    return events.filter(evt => 
      evt.dateObj.getDate() === dateObj.getDate() &&
      evt.dateObj.getMonth() === dateObj.getMonth() &&
      evt.dateObj.getFullYear() === dateObj.getFullYear()
    );
  };

  const getDayStatus = (dayEvents: any[]) => {
    if (!dayEvents || dayEvents.length === 0) return { type: 'free', label: 'Disponible' };
    
    let busyAM = false;
    let busyPM = false;
    let isFull = false;

    dayEvents.forEach(evt => {
      if (evt.isFullDay) isFull = true;
      else {
        if (evt.startValue <= 12.5) busyAM = true;
        if (evt.endValue >= 13.5) busyPM = true;
      }
    });

    if (isFull || (busyAM && busyPM)) return { type: 'full', label: 'Indisponible' };
    if (busyAM) return { type: 'am', label: 'Matin pris' };
    if (busyPM) return { type: 'pm', label: 'Aprem. pris' };
    return { type: 'free', label: 'Disponible' };
  };

  const handleDayClick = (dateObj: Date | null, dayEvents: any[], status: any) => {
    if (!dateObj) return;
    setSelectedDay({ date: dateObj, events: dayEvents, status: status });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans pb-10 relative transition-colors duration-300">
      
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-300" style={{ background: theme === 'dark' ? '#030a1a' : '#f8fafc' }}>
        <div className="absolute w-[800px] h-[800px] rounded-full blur-[100px] top-[-20%] left-[-10%] animate-[orb-float-1_20s_infinite_linear]" style={{ background: theme === 'dark' ? 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}></div>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[100px] top-[25%] right-[-8%] animate-[orb-float-2_25s_infinite_linear]" style={{ background: theme === 'dark' ? 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)' }}></div>
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[100px] bottom-[-10%] left-[25%] animate-[orb-float-3_22s_infinite_linear]" style={{ background: theme === 'dark' ? 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              J
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Julien - Consultant SIRH</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Disponibilités Missions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Clock size={20} />}
            </button>
            <a href="mailto:julien@xirh.fr?subject=Demande de disponibilité" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 rounded-full transition-all shadow-md active:scale-95">
              <Mail size={16} />
              Me Contacter
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        
        {/* Légende */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 text-sm font-medium bg-white dark:bg-slate-800 py-3 px-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
              <div className="w-full h-full bg-emerald-400"></div>
            </div>
            <span className="text-slate-600 dark:text-slate-400">Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
              <div className="w-1/2 h-full bg-amber-400"></div>
              <div className="w-1/2 h-full bg-emerald-400"></div>
            </div>
            <span className="text-slate-600 dark:text-slate-400">Matin pris</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
              <div className="w-1/2 h-full bg-emerald-400"></div>
              <div className="w-1/2 h-full bg-amber-400"></div>
            </div>
            <span className="text-slate-600 dark:text-slate-400">Aprem. pris</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
              <div className="w-full h-full bg-amber-400"></div>
            </div>
            <span className="text-slate-600 dark:text-slate-400">Occupé</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-md mx-auto">
          <button onClick={prevMonth} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold capitalize text-slate-800 dark:text-slate-100 px-4">{currentMonthName}</h2>
          <button onClick={nextMonth} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Grille Calendrier */}
        <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden relative z-10 transition-colors">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/40">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="py-3 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-900 gap-px border-collapse">
            {days.map((dateObj, idx) => {
              const dayEvents = getEventsForDay(dateObj);
              const isToday = dateObj && new Date().toDateString() === dateObj.toDateString();
              const isWeekend = dateObj && (dateObj.getDay() === 0 || dateObj.getDay() === 6);
              const status = dateObj ? getDayStatus(dayEvents) : { type: 'none' };

              return (
                <div 
                  key={idx} 
                  onClick={() => handleDayClick(dateObj, dayEvents, status)}
                  className={`
                    min-h-[100px] md:min-h-[120px] p-2 bg-white dark:bg-slate-800 transition-all relative group flex flex-col items-center justify-start
                    ${!dateObj ? 'opacity-30 cursor-default bg-slate-50 dark:bg-slate-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'}
                  `}
                >
                  {dateObj && (
                    <>
                      <div className="flex w-full justify-between items-start mb-2">
                        <span className={`
                          text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full
                          ${isToday ? 'bg-teal-600 text-white' : 'text-slate-700 dark:text-slate-300'}
                          ${isWeekend ? 'opacity-50' : ''}
                        `}>
                          {dateObj.getDate()}
                        </span>
                      </div>

                      {!isWeekend && (
                        <div className="mt-2 flex flex-col items-center gap-1 w-full px-2">
                          <div className="flex w-full h-2 rounded-full overflow-hidden shadow-sm max-w-[60px] bg-slate-200 dark:bg-slate-700">
                            <div className={`w-1/2 h-full ${status.type === 'full' || status.type === 'am' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                            <div className="w-px bg-white dark:bg-slate-800 opacity-30"></div>
                            <div className={`w-1/2 h-full ${status.type === 'full' || status.type === 'pm' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                          </div>
                          
                          <span className={`
                            hidden md:block text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded
                            ${status.type === 'free' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-700 bg-amber-50 dark:bg-amber-900/20'}
                          `}>
                            {status.type === 'full' ? 'Indispo' : status.type === 'am' ? 'Aprem Libre' : status.type === 'pm' ? 'Matin Libre' : 'Libre'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal Détails */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedDay?.date ? selectedDay.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
      >
        <div className="text-center py-4">
          {/* INDISPONIBLE */}
          {selectedDay?.status.type === 'full' && (
            <>
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-500">
                <Briefcase size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Journée Indisponible</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Je suis déjà engagé sur toute la journée.</p>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <Info size={16} /> Aucun créneau disponible.
              </div>
            </>
          )}

          {/* MATIN PRIS */}
          {selectedDay?.status.type === 'am' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-l-full flex items-center justify-center text-amber-600 opacity-50"><Sun size={20} /></div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-r-full flex items-center justify-center text-emerald-600 border-l border-white"><Clock size={24} /></div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Disponible l'Après-midi</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Matin occupé, disponible dès 14h00.</p>
              <a href={`mailto:julien@xirh.fr?subject=Réservation après-midi du ${selectedDay?.date.toLocaleDateString('fr-FR')}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-lg w-full">
                <Mail size={18} />Réserver l'après-midi
              </a>
            </>
          )}

          {/* APREM PRIS */}
          {selectedDay?.status.type === 'pm' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-l-full flex items-center justify-center text-emerald-600 border-r border-white"><Clock size={24} /></div>
                <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-r-full flex items-center justify-center text-amber-600 opacity-50"><Sun size={20} /></div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Disponible le Matin</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Après-midi occupée, libre jusqu'à 13h00.</p>
              <a href={`mailto:julien@xirh.fr?subject=Réservation matinée du ${selectedDay?.date.toLocaleDateString('fr-FR')}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-lg w-full">
                <Mail size={18} />Réserver le matin
              </a>
            </>
          )}

          {/* LIBRE */}
          {selectedDay?.status.type === 'free' && (
            <>
              {selectedDay?.date.getDay() === 0 || selectedDay?.date.getDay() === 6 ? (
                <>
                  <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><CalendarIcon size={32} /></div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Week-end</h4>
                  <p className="text-slate-500 dark:text-slate-400">Repos.</p>
                </>
              ) : (
                <>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-500 animate-pulse"><CheckCircle size={32} /></div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Journée Disponible</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">Ce créneau est entièrement libre.</p>
                  <a href={`mailto:julien@xirh.fr?subject=Réservation journée ${selectedDay?.date.toLocaleDateString('fr-FR')}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-lg w-full">
                    <Mail size={18} />Réserver cette date
                  </a>
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
