'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Film, LayoutDashboard, MapPin, Plus, Sparkles, Ticket, Users } from 'lucide-react';
import './xinema.css';

type View = 'welcome' | 'agenda' | 'programming' | 'team';
type Room = { id: string; name: string; capacity: number; format: string };
type Screening = { id: number; title: string; roomId: string; day: number; time: string; duration: number; buffer: number; format: string };
type MovieResult = { imdbId: string; title: string; year: string; posterUrl: string | null; durationMin?: number };

const rooms: Room[] = [
  { id: 'imax', name: 'Salle 1', capacity: 250, format: 'IMAX' },
  { id: 'classic', name: 'Salle 2', capacity: 120, format: 'Premium' },
];
const days = [
  { name: 'lundi', date: '13 avr.' }, { name: 'mardi', date: '14 avr.' }, { name: 'mercredi', date: '15 avr.' },
  { name: 'jeudi', date: '16 avr.' }, { name: 'vendredi', date: '17 avr.' }, { name: 'samedi', date: '18 avr.' }, { name: 'dimanche', date: '19 avr.' },
];
const initialScreenings: Screening[] = [
  { id: 1, title: 'Dune : Deuxième partie', roomId: 'imax', day: 0, time: '13:40', duration: 166, buffer: 20, format: 'VO IMAX' },
  { id: 2, title: 'Le Comte de Monte-Cristo', roomId: 'classic', day: 0, time: '16:10', duration: 178, buffer: 15, format: 'VF' },
  { id: 3, title: 'Vice-Versa 2', roomId: 'imax', day: 0, time: '18:25', duration: 96, buffer: 15, format: 'VF' },
  { id: 4, title: 'Furiosa', roomId: 'classic', day: 1, time: '14:15', duration: 148, buffer: 15, format: 'VO' },
  { id: 5, title: 'Un p’tit truc en plus', roomId: 'imax', day: 2, time: '10:30', duration: 99, buffer: 15, format: 'VF' },
];
const initialTeam = ['Alice Dupont', 'Thomas Bernard', 'Maya Khelifi', 'Louis Martin'];
const hours = Array.from({ length: 18 }, (_, index) => 8 + index);

export default function XInemaPage() {
  const [view, setView] = useState<View>('welcome');
  const [screenings, setScreenings] = useState(initialScreenings);
  const [team, setTeam] = useState(initialTeam);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [showPlanner, setShowPlanner] = useState(false);
  const [filmTitle, setFilmTitle] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [movieResults, setMovieResults] = useState<MovieResult[]>([]);
  const [movieMessage, setMovieMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [screeningTime, setScreeningTime] = useState('20:30');
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [employeeName, setEmployeeName] = useState('');
  const [availability, setAvailability] = useState<'available' | 'unavailable'>('available');

  const totalSeats = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const plannedMinutes = useMemo(() => screenings.reduce((sum, screening) => sum + screening.duration + screening.buffer, 0), [screenings]);
  const dayScreenings = useMemo(() => screenings.filter((screening) => screening.day === selectedDay), [screenings, selectedDay]);

  useEffect(() => {
    const query = movieSearch.trim();
    if (query.length < 2) { setMovieResults([]); setMovieMessage(''); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setMovieMessage('Recherche IMDb…');
      try {
        const response = await fetch(`/api/xinema/movies?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const payload = await response.json() as { movies?: MovieResult[]; error?: string; message?: string };
        if (!response.ok) throw new Error(payload.error ?? 'La recherche est indisponible.');
        setMovieResults(payload.movies ?? []);
        setMovieMessage(payload.message ?? (payload.movies?.length ? '' : 'Aucun film trouvé.'));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') { setMovieResults([]); setMovieMessage((error as Error).message || 'La recherche est indisponible.'); }
      }
    }, 350);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [movieSearch]);

  function addScreening(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = filmTitle.trim();
    if (!title) return;
    setScreenings((current) => [...current, { id: Date.now(), title, roomId: selectedRoomId, day: selectedDay, time: screeningTime, duration: selectedMovie?.durationMin ?? 120, buffer: bufferMinutes, format: selectedMovie ? 'IMDb' : 'À confirmer' }]);
    setFilmTitle(''); setMovieSearch(''); setSelectedMovie(null); setShowPlanner(false);
  }

  async function selectMovie(movie: MovieResult) {
    setSelectedMovie(movie); setFilmTitle(`${movie.title} (${movie.year})`); setMovieResults([]); setMovieMessage('Chargement de la durée…');
    try {
      const response = await fetch(`/api/xinema/movies?id=${encodeURIComponent(movie.imdbId)}`);
      const payload = await response.json() as { movie?: MovieResult; error?: string };
      if (!response.ok || !payload.movie) throw new Error(payload.error);
      setSelectedMovie(payload.movie); setMovieMessage(`${payload.movie.durationMin ?? 120} min · IMDb ${payload.movie.imdbId}`);
    } catch { setMovieMessage('Film sélectionné · durée par défaut : 120 min.'); }
  }

  function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const name = employeeName.trim(); if (!name) return;
    setTeam((current) => [...current, name]); setEmployeeName('');
  }

  if (view === 'welcome') return <Welcome setView={setView} />;

  return <main className="xinema-app">
    <header className="xinema-topbar">
      <button className="xinema-wordmark" onClick={() => setView('welcome')} aria-label="Retour à l’accueil XInéma"><Film size={20} /> XI<b>NÉMA</b></button>
      <nav className="xinema-nav" aria-label="Navigation XInéma">
        <button className={view === 'agenda' ? 'is-active' : ''} onClick={() => setView('agenda')}><CalendarDays size={15} /> Agenda</button>
        <button className={view === 'programming' ? 'is-active' : ''} onClick={() => setView('programming')}><Film size={15} /> Salles</button>
        <button className={view === 'team' ? 'is-active' : ''} onClick={() => setView('team')}><Users size={15} /> Équipe</button>
      </nav>
      <div className="xinema-topbar__meta"><Sparkles size={15} /> Mode démo local</div>
      <button className="xinema-back" onClick={() => setView('welcome')}><ArrowLeft size={16} /> Accueil</button>
    </header>
    {view === 'agenda' && <AgendaView selectedDay={selectedDay} setSelectedDay={setSelectedDay} screenings={dayScreenings} setView={setView} />}
    {view === 'programming' && <section className="xinema-shell">
      <div className="xinema-hero xinema-hero--manager"><div><p className="xinema-kicker">Programmation · {days[selectedDay].name} {days[selectedDay].date}</p><h1>Deux salles, un seul rythme.</h1><p>Construisez le programme de la journée et préservez le temps nécessaire entre chaque séance.</p></div><button className="xinema-primary" onClick={() => setShowPlanner(true)}><Plus size={17} /> Nouvelle projection</button></div>
      <div className="xinema-stat-grid"><Stat icon={<Ticket />} value={`${dayScreenings.length}`} label="Séances du jour" /><Stat icon={<MapPin />} value={`${totalSeats}`} label="Places dans le multiplexe" /><Stat icon={<Clock3 />} value={`${Math.round(plannedMinutes / 60)} h`} label="Temps de projection" /><Stat icon={<Users />} value={`${team.length}`} label="Salariés actifs" /></div>
      <DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      <div className="xinema-section-heading"><div><p className="xinema-kicker">Programme du jour</p><h2>Projection par salle</h2></div><span className="xinema-status"><span /> Exploitation ouverte</span></div>
      <div className="xinema-room-columns">{rooms.map((room) => <section className="xinema-room-card" key={room.id}><div className="xinema-room-card__header"><div><p>{room.name}</p><h3>{room.format}</h3></div><span>{room.capacity} places</span></div>{dayScreenings.filter((screening) => screening.roomId === room.id).sort((a, b) => a.time.localeCompare(b.time)).map((screening) => <ScreeningCard key={screening.id} screening={screening} />)}{!dayScreenings.some((screening) => screening.roomId === room.id) && <div className="xinema-empty-room"><Film size={19} /> Aucune projection programmée</div>}</section>)}</div>
      {showPlanner && <PlannerDialog filmTitle={filmTitle} setFilmTitle={setFilmTitle} movieSearch={movieSearch} setMovieSearch={setMovieSearch} movieResults={movieResults} movieMessage={movieMessage} selectMovie={selectMovie} screeningTime={screeningTime} setScreeningTime={setScreeningTime} selectedRoomId={selectedRoomId} setSelectedRoomId={setSelectedRoomId} bufferMinutes={bufferMinutes} setBufferMinutes={setBufferMinutes} onClose={() => setShowPlanner(false)} onSubmit={addScreening} />}
    </section>}
    {view === 'team' && <TeamView team={team} selectedDay={selectedDay} setSelectedDay={setSelectedDay} employeeName={employeeName} setEmployeeName={setEmployeeName} addEmployee={addEmployee} availability={availability} setAvailability={setAvailability} />}
  </main>;
}

function Welcome({ setView }: { setView: (view: View) => void }) {
  return <main className="xinema-home"><div className="xinema-home__backdrop" /><div className="xinema-home__grain" /><section className="xinema-home__content"><div className="xinema-brand"><span className="xinema-brand__mark"><Film size={22} /></span><span>XI<b>NÉMA</b></span></div><p className="xinema-kicker">Prototype intégré à XIRH</p><h1>L’écosystème numérique des salles premium.</h1><p className="xinema-home__intro">Une démonstration complète de gestion d’un cinéma multiplexe : agenda de direction, programmation multi-salles et planning d’équipe.</p><div className="xinema-portal-grid"><button className="xinema-portal-card" onClick={() => setView('agenda')}><span className="xinema-portal-card__icon"><LayoutDashboard size={24} /></span><span className="xinema-portal-card__eyebrow">Espace direction</span><strong>Agenda & programmation</strong><small>Suivre la semaine, les deux salles et les projections.</small><span className="xinema-portal-card__action">Ouvrir les tours de contrôle <ArrowRight size={16} /></span></button><button className="xinema-portal-card xinema-portal-card--team" onClick={() => setView('team')}><span className="xinema-portal-card__icon"><Users size={24} /></span><span className="xinema-portal-card__eyebrow">Espace équipe</span><strong>Planning & disponibilités</strong><small>Consulter l’équipe et ses créneaux de présence.</small><span className="xinema-portal-card__action">Accéder à l’équipe <ArrowRight size={16} /></span></button></div></section></main>;
}

function AgendaView({ selectedDay, setSelectedDay, screenings, setView }: { selectedDay: number; setSelectedDay: (day: number) => void; screenings: Screening[]; setView: (view: View) => void }) {
  return <section className="xinema-shell"><div className="xinema-agenda-hero"><div><p className="xinema-kicker">Tours de contrôle · direction</p><h1>Agenda du multiplexe</h1><p>Un planning de semaine pour arbitrer les salles, les horaires et la cadence de projection.</p></div><button className="xinema-primary" onClick={() => setView('programming')}><Film size={17} /> Gérer les salles</button></div><DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} /><div className="xinema-section-heading"><div><p className="xinema-kicker">Aujourd’hui · {days[selectedDay].name} {days[selectedDay].date}</p><h2>Agenda multi-salles</h2></div><span className="xinema-status"><span /> 2 salles ouvertes</span></div><div className="xinema-agenda-scroll"><div className="xinema-agenda-grid"><div className="xinema-agenda-grid__head">Heure</div>{rooms.map((room) => <div className="xinema-agenda-grid__head" key={room.id}>{room.name}<small>{room.format} · {room.capacity} places</small></div>)}{hours.map((hour) => <HourRow key={hour} hour={hour} screenings={screenings} />)}</div></div><div className="xinema-agenda-legend"><span><i className="xinema-legend-film" /> Projection</span><span><i className="xinema-legend-buffer" /> Tampon pub / rotation</span><span>08 h → 01 h</span></div></section>;
}

function TeamView({ team, selectedDay, setSelectedDay, employeeName, setEmployeeName, addEmployee, availability, setAvailability }: { team: string[]; selectedDay: number; setSelectedDay: (day: number) => void; employeeName: string; setEmployeeName: (value: string) => void; addEmployee: (event: FormEvent<HTMLFormElement>) => void; availability: 'available' | 'unavailable'; setAvailability: (value: 'available' | 'unavailable') => void }) {
  return <section className="xinema-shell"><div className="xinema-hero xinema-hero--team"><div><p className="xinema-kicker">Agenda de l’équipe</p><h1>Chaque salle a son équipe.</h1><p>Visualisez les rotations de la semaine, les postes et les disponibilités du personnel.</p></div><button className="xinema-primary" onClick={() => setAvailability(availability === 'available' ? 'unavailable' : 'available')}><Check size={17} /> Je suis {availability === 'available' ? 'disponible' : 'indisponible'}</button></div><DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} /><div className="xinema-team-layout"><section className="xinema-panel xinema-panel--wide"><p className="xinema-kicker">Planning hebdomadaire</p><h2>Présences de l’équipe</h2><div className="xinema-staff-agenda"><div className="xinema-staff-agenda__head"><span>Collaborateur</span>{days.map((day) => <span key={day.date}>{day.name.slice(0, 3)}<small>{day.date}</small></span>)}</div>{team.map((member, index) => <div className="xinema-staff-agenda__row" key={member}><strong>{member}</strong>{days.map((day, dayIndex) => <span className={(index + dayIndex) % 5 === 0 ? 'is-off' : ''} key={day.date}>{(index + dayIndex) % 5 === 0 ? 'Repos' : index % 2 === 0 ? '12h–20h' : '16h–00h'}</span>)}</div>)}</div></section><section className="xinema-panel xinema-panel--form"><p className="xinema-kicker">Administration</p><h2>Registre du personnel</h2><p>Ajoutez un collaborateur et retrouvez-le immédiatement dans le planning de démonstration.</p><form onSubmit={addEmployee}><label>Prénom et nom<input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Ex. Camille Durand" /></label><button className="xinema-primary"><Plus size={16} /> Ajouter à l’équipe</button></form></section></div><div className="xinema-section-heading xinema-section-heading--team"><div><p className="xinema-kicker">Vue du jour</p><h2>Disponibilités · {days[selectedDay].name}</h2></div></div><div className="xinema-team-list xinema-team-list--cards">{team.map((member, index) => <div className="xinema-member" key={`${member}-${index}`}><span>{member.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>{member}</strong><small>{index % 2 === 0 ? 'Accueil & caisse' : 'Projection & salle'} · {(index + selectedDay) % 5 === 0 ? 'Repos' : 'Créneau confirmé'}</small></div><i>{(index + selectedDay) % 5 === 0 ? 'Indisponible' : 'Disponible'}</i></div>)}</div></section>;
}

function HourRow({ hour, screenings }: { hour: number; screenings: Screening[] }) { return <><div className="xinema-agenda-time">{String(hour % 24).padStart(2, '0')} h</div>{rooms.map((room) => { const session = screenings.find((screening) => screening.roomId === room.id && Number(screening.time.slice(0, 2)) === hour); return <div className="xinema-agenda-slot" key={`${room.id}-${hour}`}>{session && <div className="xinema-agenda-session"><strong>{session.time} · {session.title}</strong><span>{session.duration} min + {session.buffer} min</span></div>}</div>; })}</>; }
function DaySelector({ selectedDay, setSelectedDay }: { selectedDay: number; setSelectedDay: (day: number) => void }) { return <div className="xinema-day-selector"><ChevronLeft size={17} />{days.map((day, index) => <button key={day.date} className={index === selectedDay ? 'is-active' : ''} onClick={() => setSelectedDay(index)}><span>{day.name.slice(0, 3)}</span><strong>{day.date.split(' ')[0]}</strong></button>)}<ChevronRight size={17} /></div>; }
function ScreeningCard({ screening }: { screening: Screening }) { return <article className="xinema-screening"><img src="/xinema/movie-placeholder.png" alt="" /><div className="xinema-screening__time"><strong>{screening.time}</strong><span>{screening.duration} min</span></div><div className="xinema-screening__title"><h3>{screening.title}</h3><p>{screening.format} · tampon de {screening.buffer} min</p></div><span className="xinema-tag">Programmé</span></article>; }
function PlannerDialog(props: { filmTitle: string; setFilmTitle: (value: string) => void; movieSearch: string; setMovieSearch: (value: string) => void; movieResults: MovieResult[]; movieMessage: string; selectMovie: (movie: MovieResult) => void; screeningTime: string; setScreeningTime: (value: string) => void; selectedRoomId: string; setSelectedRoomId: (value: string) => void; bufferMinutes: number; setBufferMinutes: (value: number) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="xinema-dialog-backdrop" role="presentation"><form className="xinema-dialog" onSubmit={props.onSubmit}><div><p className="xinema-kicker">Nouvelle projection</p><h2>Programmer une séance</h2></div><label>Rechercher un film sur IMDb<input autoFocus value={props.movieSearch} onChange={(event) => props.setMovieSearch(event.target.value)} placeholder="Ex. Inception" /></label>{props.movieResults.length > 0 && <div className="xinema-movie-results">{props.movieResults.map((movie) => <button type="button" key={movie.imdbId} onClick={() => props.selectMovie(movie)}><span>{movie.title} <small>({movie.year})</small></span><i>{movie.imdbId}</i></button>)}</div>}{props.movieMessage && <p className="xinema-movie-message">{props.movieMessage}</p>}<label>Film à programmer<input required value={props.filmTitle} onChange={(event) => props.setFilmTitle(event.target.value)} placeholder="Sélectionnez ou saisissez un film" /></label><div className="xinema-form-grid"><label>Salle<select value={props.selectedRoomId} onChange={(event) => props.setSelectedRoomId(event.target.value)}>{rooms.map((room) => <option value={room.id} key={room.id}>{room.name} · {room.format}</option>)}</select></label><label>Heure de début<input type="time" value={props.screeningTime} onChange={(event) => props.setScreeningTime(event.target.value)} /></label></div><label>Buffer pub / rotation<select value={props.bufferMinutes} onChange={(event) => props.setBufferMinutes(Number(event.target.value))}><option value={10}>10 min</option><option value={15}>15 min</option><option value={20}>20 min</option><option value={25}>25 min</option></select></label><div className="xinema-dialog__actions"><button type="button" className="xinema-secondary" onClick={props.onClose}>Annuler</button><button className="xinema-primary"><Check size={16} /> Planifier</button></div></form></div>; }
function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) { return <article className="xinema-stat"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>; }
