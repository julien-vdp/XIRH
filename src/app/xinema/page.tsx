'use client';

import { DragEvent, FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Film, GripVertical, LayoutDashboard, Plus, Sparkles, Users } from 'lucide-react';
import './xinema.css';

type View = 'welcome' | 'agenda' | 'team';
type Room = { id: string; name: string; capacity: number; format: string };
type Movie = { imdbId: string; title: string; year: string; posterUrl: string | null; durationMin?: number; plot?: string | null; director?: string | null; actors?: string | null; genre?: string | null; rated?: string | null; devices?: string[]; source?: 'imdb' | 'manual' };
type FilmBankItem = { id: string; title: string; durationMin: number; posterUrl: string | null; imdbId?: string; year?: string; version?: string; distributor?: string; devices: string[]; source: 'imdb' | 'manual' };
type Screening = { id: number; title: string; roomId: string; day: number; time: string; duration: number; buffer: number; format: string; posterUrl?: string | null; imdbId?: string; devices?: string[]; weekOffset?: number };
type DragPayload = { kind: 'movie'; movie: Movie } | { kind: 'screening'; screeningId: number };
type PlanningLayout = 'columns' | 'rows';

const rooms: Room[] = [
  { id: 'lumiere', name: 'Salle Lumière', capacity: 98, format: 'Projection 4K' },
  { id: 'varda', name: 'Salle Varda', capacity: 62, format: 'Écran intimiste' },
  { id: 'melies', name: 'Salle Méliès', capacity: 38, format: 'Patrimoine & répertoire' },
];
type CalendarDay = { name: string; date: string; value: Date };
function startOfWeek(date: Date) { const value = new Date(date); value.setHours(0, 0, 0, 0); value.setDate(value.getDate() - ((value.getDay() + 6) % 7)); return value; }
function weekDays(start: Date): CalendarDay[] { return Array.from({ length: 7 }, (_, index) => { const value = new Date(start); value.setDate(value.getDate() + index); return { name: value.toLocaleDateString('fr-FR', { weekday: 'long' }), date: value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), value }; }); }
function sameDay(left: Date, right: Date) { return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate(); }
const timelineStart = 8 * 60;
const timelineEnd = 26 * 60;
const timelineDuration = timelineEnd - timelineStart;
function clockFromMinutes(minutes: number) { const normalized = ((minutes % 1440) + 1440) % 1440; return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`; }
function timelineMinutesFromTime(time: string) { const [hoursPart, minutesPart] = time.split(':').map(Number); const minutes = hoursPart * 60 + minutesPart; return minutes < timelineStart ? minutes + 1440 : minutes; }
function timelineTime(event: { clientY: number; currentTarget: { getBoundingClientRect: () => DOMRect } }) { const bounds = event.currentTarget.getBoundingClientRect(); const minutes = Math.max(timelineStart, Math.min(timelineEnd - 15, Math.round((timelineStart + ((event.clientY - bounds.top) / (53 / 60))) / 15) * 15)); return clockFromMinutes(minutes); }
function rowTimelineTime(event: { clientX: number; currentTarget: { getBoundingClientRect: () => DOMRect } }) { const bounds = event.currentTarget.getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)); const minutes = Math.max(timelineStart, Math.min(timelineEnd - 15, Math.round((timelineStart + ratio * timelineDuration) / 15) * 15)); return clockFromMinutes(minutes); }
let days = weekDays(startOfWeek(new Date()));
const initialScreenings: Screening[] = [
  { id: 1, title: 'Les Graines du figuier sauvage', roomId: 'lumiere', day: 0, time: '13:40', duration: 167, buffer: 15, format: 'VOST' },
  { id: 2, title: 'All We Imagine as Light', roomId: 'varda', day: 0, time: '16:10', duration: 118, buffer: 15, format: 'VOST' },
  { id: 3, title: 'La Chimère', roomId: 'melies', day: 0, time: '17:00', duration: 130, buffer: 15, format: 'VOST' },
  { id: 4, title: 'Bird', roomId: 'lumiere', day: 1, time: '14:15', duration: 119, buffer: 15, format: 'VOST' },
  { id: 5, title: 'Flow', roomId: 'varda', day: 2, time: '10:30', duration: 85, buffer: 15, format: 'Sans dialogue' },
];
const initialDevices = ['Scolaire', 'Jeune public', 'Ciné-débat', 'Événement', 'Patrimoine'];
const initialFilmBank: FilmBankItem[] = [
  { id: 'bank-graines', title: 'Les Graines du figuier sauvage', durationMin: 167, posterUrl: null, version: 'VOST', distributor: 'Pyramide', devices: ['Ciné-débat', 'Événement'], source: 'manual' },
  { id: 'bank-flow', title: 'Flow', durationMin: 85, posterUrl: null, version: 'Sans dialogue', distributor: 'UFO Distribution', devices: ['Scolaire', 'Jeune public'], source: 'manual' },
  { id: 'bank-chimere', title: 'La Chimère', durationMin: 130, posterUrl: null, version: 'VOST', devices: ['Patrimoine'], source: 'manual' },
];
const hours = Array.from({ length: 18 }, (_, i) => i + 8);
const dragType = 'application/x-xinema';
function bankItemToMovie(item: FilmBankItem): Movie { return { imdbId: item.imdbId ?? `manual-${item.id}`, title: item.title, year: item.year ?? '', posterUrl: item.posterUrl, durationMin: item.durationMin, devices: item.devices, source: item.source }; }

export default function XInemaPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [view, setView] = useState<View>('welcome');
  const [screenings, setScreenings] = useState(initialScreenings);
  const [team, setTeam] = useState(['Alice Dupont', 'Thomas Bernard', 'Maya Khelifi', 'Louis Martin']);
  const [selectedDay, setSelectedDay] = useState(() => (today.getDay() + 6) % 7);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [showPlanner, setShowPlanner] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [filmTitle, setFilmTitle] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [movieMessage, setMovieMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [screeningTime, setScreeningTime] = useState('20:30');
  const [screeningDuration, setScreeningDuration] = useState(120);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [filmBank, setFilmBank] = useState<FilmBankItem[]>(initialFilmBank);
  const [devices, setDevices] = useState(initialDevices);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDuration, setManualDuration] = useState(90);
  const [manualVersion, setManualVersion] = useState('');
  const [manualDistributor, setManualDistributor] = useState('');
  const [newDevice, setNewDevice] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [availability, setAvailability] = useState<'available' | 'unavailable'>('available');
  days = weekDays(weekStart);
  const currentWeekOffset = Math.round((weekStart.getTime() - startOfWeek(today).getTime()) / 604800000);
  const dayScreenings = useMemo(() => screenings.filter((s) => s.day === selectedDay && (s.weekOffset ?? 0) === currentWeekOffset), [screenings, selectedDay, currentWeekOffset]);
  const plannerDialog = showPlanner ? <PlannerDialog editingScreening={editingScreening} filmTitle={filmTitle} setFilmTitle={setFilmTitle} movieSearch={movieSearch} setMovieSearch={setMovieSearch} movieResults={movieResults} movieMessage={movieMessage} selectMovie={selectMovie} selectedMovie={selectedMovie} screeningTime={screeningTime} setScreeningTime={setScreeningTime} screeningDuration={screeningDuration} setScreeningDuration={setScreeningDuration} selectedRoomId={selectedRoomId} setSelectedRoomId={setSelectedRoomId} bufferMinutes={bufferMinutes} setBufferMinutes={setBufferMinutes} repeatWeeks={repeatWeeks} setRepeatWeeks={setRepeatWeeks} onClose={() => { setShowPlanner(false); setEditingScreening(null); }} onSubmit={addScreening} /> : null;

  useEffect(() => {
    const query = movieSearch.trim();
    if (query.length < 2) { setMovieResults([]); setMovieMessage(''); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setMovieMessage('Recherche IMDb…');
      try {
        const response = await fetch(`/api/xinema/movies?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const payload = await response.json() as { movies?: Movie[]; error?: string; message?: string };
        if (!response.ok) throw new Error(payload.error ?? 'La recherche est indisponible.');
        setMovieResults(payload.movies ?? []);
        setMovieMessage(payload.message ?? (payload.movies?.length ? 'Sélectionnez un film pour voir sa fiche.' : 'Aucun film trouvé.'));
      } catch (error) { if ((error as Error).name !== 'AbortError') { setMovieResults([]); setMovieMessage((error as Error).message || 'La recherche est indisponible.'); } }
    }, 350);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [movieSearch]);

  async function selectMovie(movie: Movie) {
    setSelectedMovie(movie); setFilmTitle(movie.title); setScreeningDuration(movie.durationMin ?? 120); setMovieMessage('Chargement de la fiche IMDb…');
    try {
      const response = await fetch(`/api/xinema/movies?id=${encodeURIComponent(movie.imdbId)}`);
      const payload = await response.json() as { movie?: Movie; error?: string };
      if (!response.ok || !payload.movie) throw new Error(payload.error);
      setSelectedMovie({ ...payload.movie, source: 'imdb' }); setFilmTitle(payload.movie.title); setScreeningDuration(payload.movie.durationMin ?? 120); setMovieMessage(`${payload.movie.durationMin ?? 120} min · IMDb ${payload.movie.imdbId}`);
    } catch { setMovieMessage('Film sélectionné · durée par défaut : 120 min.'); }
  }
  function addScreening(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!filmTitle.trim()) return;
    if (editingScreening) {
      setScreenings((items) => items.map((item) => item.id === editingScreening.id ? { ...item, title: filmTitle.trim(), roomId: selectedRoomId, day: selectedDay, time: screeningTime, duration: screeningDuration, buffer: bufferMinutes, format: selectedMovie?.source === 'manual' ? 'Création manuelle' : selectedMovie ? 'IMDb' : item.format, posterUrl: selectedMovie?.posterUrl ?? item.posterUrl, imdbId: selectedMovie?.source === 'imdb' ? selectedMovie.imdbId : item.imdbId, devices: selectedMovie?.devices ?? item.devices, weekOffset: currentWeekOffset } : item));
      setEditingScreening(null); setShowPlanner(false); return;
    }
    setScreenings((items) => [...items, ...Array.from({ length: repeatWeeks }, (_, weekOffset) => ({ id: Date.now() + weekOffset, title: filmTitle.trim(), roomId: selectedRoomId, day: selectedDay, time: screeningTime, duration: screeningDuration, buffer: bufferMinutes, format: selectedMovie?.source === 'manual' ? 'Création manuelle' : selectedMovie ? 'IMDb' : 'À confirmer', posterUrl: selectedMovie?.posterUrl, imdbId: selectedMovie?.source === 'imdb' ? selectedMovie.imdbId : undefined, devices: selectedMovie?.devices, weekOffset: currentWeekOffset + weekOffset }))]);
    setShowPlanner(false);
  }
  function openPlannerAt(roomId: string, time: string) {
    setEditingScreening(null);
    setFilmTitle('');
    setSelectedMovie(null);
    setMovieSearch('');
    setScreeningDuration(120);
    setSelectedRoomId(roomId);
    setScreeningTime(time);
    setShowPlanner(true);
  }
  function openScreeningEditor(screening: Screening) { setEditingScreening(screening); setFilmTitle(screening.title); setScreeningDuration(screening.duration); setSelectedMovie(screening.imdbId ? { imdbId: screening.imdbId, title: screening.title, year: '', posterUrl: screening.posterUrl ?? null, durationMin: screening.duration, devices: screening.devices, source: 'imdb' } : null); setSelectedRoomId(screening.roomId); setScreeningTime(screening.time); setBufferMinutes(screening.buffer); setShowPlanner(true); }
  function moveWeek(amount: number) {
    setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() + amount * 7); return next; });
    setSelectedDay(amount > 0 ? 0 : 6);
  }
  function addMovieToAgenda(movie: Movie, roomId: string, time: string) {
    setScreenings((items) => [...items, { id: Date.now(), title: movie.title, roomId, day: selectedDay, time, duration: movie.durationMin ?? 120, buffer: bufferMinutes, format: movie.source === 'manual' ? 'Création manuelle' : 'IMDb', posterUrl: movie.posterUrl, imdbId: movie.source === 'manual' ? undefined : movie.imdbId, devices: movie.devices, weekOffset: currentWeekOffset }]);
  }
  function moveScreening(id: number, roomId: string, time: string) {
    setScreenings((items) => items.map((s) => s.id === id ? { ...s, roomId, day: selectedDay, time, weekOffset: currentWeekOffset } : s));
  }
  function addEmployee(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (employeeName.trim()) { setTeam((items) => [...items, employeeName.trim()]); setEmployeeName(''); } }
  async function addImdbMovieToBank(movie: Movie) {
    let enriched = { ...movie, source: 'imdb' as const };
    try {
      const response = await fetch(`/api/xinema/movies?id=${encodeURIComponent(movie.imdbId)}`);
      const payload = await response.json() as { movie?: Movie; error?: string };
      if (response.ok && payload.movie) enriched = { ...payload.movie, source: 'imdb' };
    } catch {}
    const bankItem: FilmBankItem = { id: enriched.imdbId, imdbId: enriched.imdbId, title: enriched.title, year: enriched.year, durationMin: enriched.durationMin ?? 120, posterUrl: enriched.posterUrl, devices: [], source: 'imdb' };
    setFilmBank((items) => items.some((item) => item.imdbId === bankItem.imdbId) ? items.map((item) => item.imdbId === bankItem.imdbId ? { ...item, ...bankItem, devices: item.devices } : item) : [bankItem, ...items]);
    setMovieMessage(`${bankItem.title} a été ajouté à la banque de films.`);
  }
  function addManualMovie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualTitle.trim() || manualDuration < 1) return;
    setFilmBank((items) => [{ id: `manual-${Date.now()}`, title: manualTitle.trim(), durationMin: manualDuration, posterUrl: null, version: manualVersion.trim() || undefined, distributor: manualDistributor.trim() || undefined, devices: [], source: 'manual' }, ...items]);
    setManualTitle(''); setManualDuration(90); setManualVersion(''); setManualDistributor('');
  }
  function addDevice(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = newDevice.trim(); if (!value) return; setDevices((items) => items.some((item) => item.toLowerCase() === value.toLowerCase()) ? items : [...items, value]); setNewDevice(''); }
  function toggleFilmDevice(filmId: string, device: string) { setFilmBank((items) => items.map((item) => item.id === filmId ? { ...item, devices: item.devices.includes(device) ? item.devices.filter((value) => value !== device) : [...item.devices, device] } : item)); }
  function programBankFilm(item: FilmBankItem) { const movie = bankItemToMovie(item); setEditingScreening(null); setSelectedMovie(movie); setFilmTitle(movie.title); setScreeningDuration(movie.durationMin ?? 120); setShowPlanner(true); }

  if (view === 'welcome') return <Welcome setView={setView} />;
  return <main className="xinema-app">
    <header className="xinema-topbar"><button className="xinema-wordmark" onClick={() => setView('welcome')}><Film size={20} /> XI<b>NÉMA</b></button><nav className="xinema-nav"><button className={view === 'agenda' ? 'is-active' : ''} onClick={() => setView('agenda')}><CalendarDays size={15} /> Planning</button><button className={view === 'team' ? 'is-active' : ''} onClick={() => setView('team')}><Users size={15} /> Équipe</button></nav><div className="xinema-topbar__meta"><Sparkles size={15} /> Programmation centralisée</div><button className="xinema-back" onClick={() => setView('welcome')}><ArrowLeft size={16} /> Accueil</button></header>
    {view === 'agenda' && <><AgendaView selectedDay={selectedDay} setSelectedDay={setSelectedDay} screenings={dayScreenings} filmBank={filmBank} devices={devices} movieSearch={movieSearch} setMovieSearch={setMovieSearch} movieResults={movieResults} movieMessage={movieMessage} onAddImdbMovie={addImdbMovieToBank} manualTitle={manualTitle} setManualTitle={setManualTitle} manualDuration={manualDuration} setManualDuration={setManualDuration} manualVersion={manualVersion} setManualVersion={setManualVersion} manualDistributor={manualDistributor} setManualDistributor={setManualDistributor} onAddManualMovie={addManualMovie} newDevice={newDevice} setNewDevice={setNewDevice} onAddDevice={addDevice} onToggleDevice={toggleFilmDevice} onProgramBankFilm={programBankFilm} onAddMovie={addMovieToAgenda} onMoveScreening={moveScreening} onCreateAt={openPlannerAt} onEditScreening={openScreeningEditor} moveWeek={moveWeek} />{plannerDialog}</>}
    {view === 'team' && <TeamView team={team} selectedDay={selectedDay} setSelectedDay={setSelectedDay} employeeName={employeeName} setEmployeeName={setEmployeeName} addEmployee={addEmployee} availability={availability} setAvailability={setAvailability} />}
  </main>;
}

function Welcome({ setView }: { setView: (view: View) => void }) { return <main className="xinema-home"><div className="xinema-home__backdrop" /><div className="xinema-home__grain" /><section className="xinema-home__content"><div className="xinema-brand"><span className="xinema-brand__mark"><Film size={22} /></span><span>XI<b>NÉMA</b></span></div><p className="xinema-kicker">Prototype intégré à XIRH</p><h1>Un cinéma art et essai, vivant et singulier.</h1><p className="xinema-home__intro">Un outil de gestion pour trois salles dédiées aux films indépendants, au patrimoine et aux découvertes : agenda, programmation et équipe.</p><div className="xinema-portal-grid"><button className="xinema-portal-card" onClick={() => setView('agenda')}><span className="xinema-portal-card__icon"><LayoutDashboard size={24} /></span><span className="xinema-portal-card__eyebrow">Espace direction</span><strong>Agenda & programmation</strong><small>Suivre la semaine, les trois salles et les projections.</small><span className="xinema-portal-card__action">Ouvrir les tours de contrôle <ArrowRight size={16} /></span></button><button className="xinema-portal-card xinema-portal-card--team" onClick={() => setView('team')}><span className="xinema-portal-card__icon"><Users size={24} /></span><span className="xinema-portal-card__eyebrow">Espace équipe</span><strong>Planning & disponibilités</strong><small>Consulter l’équipe et ses créneaux de présence.</small><span className="xinema-portal-card__action">Accéder à l’équipe <ArrowRight size={16} /></span></button></div></section></main>; }

type AgendaViewProps = {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  screenings: Screening[];
  filmBank: FilmBankItem[];
  devices: string[];
  movieSearch: string;
  setMovieSearch: (value: string) => void;
  movieResults: Movie[];
  movieMessage: string;
  onAddImdbMovie: (movie: Movie) => void;
  manualTitle: string;
  setManualTitle: (value: string) => void;
  manualDuration: number;
  setManualDuration: (value: number) => void;
  manualVersion: string;
  setManualVersion: (value: string) => void;
  manualDistributor: string;
  setManualDistributor: (value: string) => void;
  onAddManualMovie: (event: FormEvent<HTMLFormElement>) => void;
  newDevice: string;
  setNewDevice: (value: string) => void;
  onAddDevice: (event: FormEvent<HTMLFormElement>) => void;
  onToggleDevice: (filmId: string, device: string) => void;
  onProgramBankFilm: (film: FilmBankItem) => void;
  onAddMovie: (movie: Movie, roomId: string, time: string) => void;
  onMoveScreening: (id: number, roomId: string, time: string) => void;
  onCreateAt: (roomId: string, time: string) => void;
  onEditScreening: (screening: Screening) => void;
  moveWeek: (amount: number) => void;
};

function AgendaView(props: AgendaViewProps) {
  const { selectedDay, setSelectedDay, screenings, onAddMovie, onMoveScreening, onCreateAt, onEditScreening, moveWeek } = props;
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [dropTime, setDropTime] = useState<string | null>(null);
  const [planningLayout, setPlanningLayout] = useState<PlanningLayout>('columns');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer); }, []);
  const isToday = sameDay(days[selectedDay].value, now);
  const nowMinutes = timelineMinutesFromTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  const nowTop = isToday ? (nowMinutes - timelineStart) * (53 / 60) : null;
  const nowLeft = isToday ? ((nowMinutes - timelineStart) / timelineDuration) * 100 : null;
  const dragStart = (event: DragEvent<HTMLElement>, payload: DragPayload) => { event.dataTransfer.setData(dragType, JSON.stringify(payload)); event.dataTransfer.effectAllowed = payload.kind === 'movie' ? 'copy' : 'move'; };
  const drop = (event: DragEvent<HTMLDivElement>, roomId: string, time: string) => {
    event.preventDefault(); setHoveredRoom(null); setDropTime(null);
    try { const payload = JSON.parse(event.dataTransfer.getData(dragType)) as DragPayload; if (payload.kind === 'movie') onAddMovie(payload.movie, roomId, time); else onMoveScreening(payload.screeningId, roomId, time); } catch {}
  };
  return <section className="xinema-shell xinema-shell--agenda">
    <div className="xinema-agenda-hero"><div><p className="xinema-kicker">Tours de contrôle · direction</p><h1>Agenda du cinéma</h1><p>Un seul planning pour rechercher sur IMDb, créer une séance et organiser les trois salles.</p></div><button className="xinema-primary" onClick={() => onCreateAt(rooms[0].id, '12:00')}><Plus size={17} /> Ajouter une séance</button></div>
    <DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} onPrevious={() => moveWeek(-1)} onNext={() => moveWeek(1)} />
    <div className="xinema-section-heading xinema-section-heading--agenda"><div><p className="xinema-kicker">{isToday ? 'Aujourd’hui' : 'Programmation'} · {days[selectedDay].name} {days[selectedDay].date}</p><h2>Agenda des trois salles</h2></div><div className="xinema-view-controls"><div className="xinema-view-switch" aria-label="Orientation du planning"><button className={planningLayout === 'columns' ? 'is-active' : ''} onClick={() => setPlanningLayout('columns')}>Vue colonnes</button><button className={planningLayout === 'rows' ? 'is-active' : ''} onClick={() => setPlanningLayout('rows')}>Vue lignes</button></div><span className="xinema-status"><span /> 3 salles ouvertes</span></div></div>
    <div className="xinema-planning-workspace">
      <FilmBank {...props} dragStart={dragStart} />
      <div className="xinema-planning-board">
        <div className="xinema-drop-tray"><div><Film size={17} /> Glissez un film de la banque ou cliquez directement dans le planning pour créer une séance.</div></div>
        {planningLayout === 'columns' ? <div className="xinema-agenda-scroll"><div className="xinema-timeline"><div className="xinema-timeline__head"><div>Heure</div>{rooms.map((room) => <div key={room.id}>{room.name}<small>{room.format} · {room.capacity} places</small></div>)}</div><div className="xinema-timeline__body"><div className="xinema-timeline__hours">{hours.map((hour) => <div key={hour}>{String(hour % 24).padStart(2, '0')} h</div>)}</div>{rooms.map((room) => <TimelineRoom key={room.id} room={room} screenings={screenings.filter((s) => s.roomId === room.id)} hovered={hoveredRoom === room.id} setHovered={setHoveredRoom} dragStart={dragStart} drop={drop} onCreateAt={onCreateAt} onEditScreening={onEditScreening} nowTop={nowTop} dropTime={hoveredRoom === room.id ? dropTime : null} setDropTime={setDropTime} />)}</div></div></div> : <HorizontalAgenda screenings={screenings} hoveredRoom={hoveredRoom} setHoveredRoom={setHoveredRoom} dropTime={dropTime} setDropTime={setDropTime} dragStart={dragStart} drop={drop} onCreateAt={onCreateAt} onEditScreening={onEditScreening} nowLeft={nowLeft} />}
      </div>
    </div>
    <div className="xinema-agenda-legend"><span><i className="xinema-legend-trailer" /> Bandes-annonces · 10 min</span><span><i className="xinema-legend-film" /> Film · durée réelle</span><span><i className="xinema-legend-buffer" /> Tampon pub / rotation</span></div>
  </section>;
}
function FilmBank(props: AgendaViewProps & { dragStart: (event: DragEvent<HTMLElement>, payload: DragPayload) => void }) {
  return <aside className="xinema-film-bank">
    <div className="xinema-film-bank__header"><div><p className="xinema-kicker">Réserve de programmation</p><h3>Banque de films</h3></div><span>{props.filmBank.length}</span></div>
    <label className="xinema-bank-search">Ajouter depuis IMDb<input value={props.movieSearch} onChange={(event) => props.setMovieSearch(event.target.value)} placeholder="Rechercher un titre" /></label>
    {props.movieResults.length > 0 && <div className="xinema-bank-results">{props.movieResults.slice(0, 4).map((movie) => <div key={movie.imdbId}><img src={movie.posterUrl ?? '/xinema/movie-placeholder.png'} alt="" /><span><strong>{movie.title}</strong><small>{movie.year} · IMDb</small></span><button type="button" onClick={() => props.onAddImdbMovie(movie)}>Ajouter</button></div>)}</div>}
    {props.movieMessage && <p className="xinema-bank-message">{props.movieMessage}</p>}
    <details className="xinema-bank-creator"><summary><Plus size={14} /> Création manuelle</summary><form onSubmit={props.onAddManualMovie}><label>Titre *<input required value={props.manualTitle} onChange={(event) => props.setManualTitle(event.target.value)} placeholder="Titre du film" /></label><label>Durée *<div className="xinema-duration-input"><input required min={1} type="number" value={props.manualDuration} onChange={(event) => props.setManualDuration(Number(event.target.value))} /><span>min</span></div></label><div className="xinema-bank-form-grid"><label>Version<input value={props.manualVersion} onChange={(event) => props.setManualVersion(event.target.value)} placeholder="VF, VOST…" /></label><label>Distributeur<input value={props.manualDistributor} onChange={(event) => props.setManualDistributor(event.target.value)} placeholder="Facultatif" /></label></div><button className="xinema-secondary">Créer dans la banque</button></form></details>
    <div className="xinema-device-editor"><p>Dispositifs & événements</p><form onSubmit={props.onAddDevice}><input value={props.newDevice} onChange={(event) => props.setNewDevice(event.target.value)} placeholder="Ex. Festival italien" /><button aria-label="Ajouter le dispositif"><Plus size={15} /></button></form></div>
    <div className="xinema-bank-list">{props.filmBank.map((film) => <article className="xinema-bank-film" key={film.id} draggable onDragStart={(event) => props.dragStart(event, { kind: 'movie', movie: bankItemToMovie(film) })}>
      <div className="xinema-bank-film__main"><span className="xinema-bank-film__grip"><GripVertical size={15} /></span><img src={film.posterUrl ?? '/xinema/movie-placeholder.png'} alt="" /><div><strong>{film.title}</strong><small>{film.durationMin} min · {film.version ?? (film.source === 'imdb' ? 'IMDb' : 'Version à préciser')}</small>{film.distributor && <small>{film.distributor}</small>}</div></div>
      <div className="xinema-device-chips">{props.devices.map((device) => <button type="button" key={device} className={film.devices.includes(device) ? 'is-active' : ''} onClick={(event) => { event.stopPropagation(); props.onToggleDevice(film.id, device); }}>{device}</button>)}</div>
      <button type="button" className="xinema-bank-program" onClick={() => props.onProgramBankFilm(film)}>Programmer</button>
    </article>)}</div>
  </aside>;
}
function TimelineRoom({ room, screenings, hovered, setHovered, dragStart, drop, onCreateAt, onEditScreening, nowTop, dropTime, setDropTime }: { room: Room; screenings: Screening[]; hovered: boolean; setHovered: (value: string | null) => void; dragStart: (event: DragEvent<HTMLElement>, payload: DragPayload) => void; drop: (event: DragEvent<HTMLDivElement>, roomId: string, time: string) => void; onCreateAt: (roomId: string, time: string) => void; onEditScreening: (screening: Screening) => void; nowTop: number | null; dropTime: string | null; setDropTime: (time: string | null) => void }) {
  function clickRoom(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('.xinema-timeline-event')) return;
    onCreateAt(room.id, timelineTime(event));
  }
  const dropTop = dropTime ? (timelineMinutesFromTime(dropTime) - timelineStart) * (53 / 60) : null;
  return <div className={`xinema-timeline__room${hovered ? ' is-drop-target' : ''}`} onClick={clickRoom} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setHovered(room.id); setDropTime(timelineTime(event)); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { setHovered(null); setDropTime(null); } }} onDrop={(event) => drop(event, room.id, timelineTime(event))}>{dropTop !== null && <div className="xinema-drop-indicator" style={{ top: dropTop }}><span>{dropTime}</span></div>}{nowTop !== null && nowTop >= 0 && nowTop <= 954 && <div className="xinema-now-line" style={{ top: nowTop }}><span>Maintenant</span></div>}{screenings.map((screening) => <TimelineEvent key={screening.id} screening={screening} dragStart={dragStart} onEdit={onEditScreening} />)}</div>;
}
function TimelineEvent({ screening, dragStart, onEdit }: { screening: Screening; dragStart: (event: DragEvent<HTMLElement>, payload: DragPayload) => void; onEdit: (screening: Screening) => void }) { const offset = (timelineMinutesFromTime(screening.time) - timelineStart) * (53 / 60); const trailer = 10 * (53 / 60); const film = screening.duration * (53 / 60); const buffer = screening.buffer * (53 / 60); return <article className="xinema-timeline-event" style={{ top: offset, height: trailer + film + buffer }} draggable onClick={(event) => { event.stopPropagation(); onEdit(screening); }} onDragStart={(event) => dragStart(event, { kind: 'screening', screeningId: screening.id })}><div className="xinema-timeline-event__trailer">Bandes-annonces · 10 min</div><div className="xinema-timeline-event__film" style={{ height: film }}><img src={screening.posterUrl ?? '/xinema/movie-placeholder.png'} alt="" /><div><span><GripVertical size={13} /> {screening.time}</span><strong>{screening.title}</strong><small>{screening.duration} min · {screening.format}</small>{screening.devices && screening.devices.length > 0 && <small>{screening.devices.join(' · ')}</small>}</div></div><div className="xinema-timeline-event__buffer" style={{ height: buffer }}>Rotation · {screening.buffer} min</div></article>; }

function HorizontalAgenda({ screenings, hoveredRoom, setHoveredRoom, dropTime, setDropTime, dragStart, drop, onCreateAt, onEditScreening, nowLeft }: { screenings: Screening[]; hoveredRoom: string | null; setHoveredRoom: (value: string | null) => void; dropTime: string | null; setDropTime: (value: string | null) => void; dragStart: (event: DragEvent<HTMLElement>, payload: DragPayload) => void; drop: (event: DragEvent<HTMLDivElement>, roomId: string, time: string) => void; onCreateAt: (roomId: string, time: string) => void; onEditScreening: (screening: Screening) => void; nowLeft: number | null }) {
  return <div className="xinema-row-agenda-scroll"><div className="xinema-row-agenda"><div className="xinema-row-agenda__head"><strong>Salle</strong><div>{hours.filter((_, index) => index % 2 === 0).map((hour) => <span key={hour} style={{ left: `${((hour * 60 - timelineStart) / timelineDuration) * 100}%` }}>{String(hour % 24).padStart(2, '0')} h</span>)}</div></div>{rooms.map((room) => <HorizontalRoom key={room.id} room={room} screenings={screenings.filter((screening) => screening.roomId === room.id)} hovered={hoveredRoom === room.id} setHovered={setHoveredRoom} dropTime={hoveredRoom === room.id ? dropTime : null} setDropTime={setDropTime} dragStart={dragStart} drop={drop} onCreateAt={onCreateAt} onEditScreening={onEditScreening} nowLeft={nowLeft} />)}</div></div>;
}
function HorizontalRoom({ room, screenings, hovered, setHovered, dropTime, setDropTime, dragStart, drop, onCreateAt, onEditScreening, nowLeft }: { room: Room; screenings: Screening[]; hovered: boolean; setHovered: (value: string | null) => void; dropTime: string | null; setDropTime: (value: string | null) => void; dragStart: (event: DragEvent<HTMLElement>, payload: DragPayload) => void; drop: (event: DragEvent<HTMLDivElement>, roomId: string, time: string) => void; onCreateAt: (roomId: string, time: string) => void; onEditScreening: (screening: Screening) => void; nowLeft: number | null }) {
  const dropLeft = dropTime ? ((timelineMinutesFromTime(dropTime) - timelineStart) / timelineDuration) * 100 : null;
  return <div className="xinema-row-agenda__room"><header><strong>{room.name}</strong><small>{room.capacity} places · {room.format}</small></header><div className={`xinema-row-track${hovered ? ' is-drop-target' : ''}`} onClick={(event) => { if (!(event.target as HTMLElement).closest('.xinema-row-event')) onCreateAt(room.id, rowTimelineTime(event)); }} onDragOver={(event) => { event.preventDefault(); setHovered(room.id); setDropTime(rowTimelineTime(event)); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { setHovered(null); setDropTime(null); } }} onDrop={(event) => drop(event, room.id, rowTimelineTime(event))}>{dropLeft !== null && <div className="xinema-row-drop" style={{ left: `${dropLeft}%` }}><span>{dropTime}</span></div>}{nowLeft !== null && nowLeft >= 0 && nowLeft <= 100 && <div className="xinema-row-now" style={{ left: `${nowLeft}%` }}><span>Maintenant</span></div>}{screenings.map((screening) => { const start = timelineMinutesFromTime(screening.time); const left = ((start - timelineStart) / timelineDuration) * 100; const width = ((10 + screening.duration + screening.buffer) / timelineDuration) * 100; return <article key={screening.id} className="xinema-row-event" style={{ left: `${left}%`, width: `${width}%` }} draggable onClick={(event) => { event.stopPropagation(); onEditScreening(screening); }} onDragStart={(event) => dragStart(event, { kind: 'screening', screeningId: screening.id })}><span className="xinema-row-event__trailer" /><img src={screening.posterUrl ?? '/xinema/movie-placeholder.png'} alt="" /><div><span><GripVertical size={12} /> {screening.time}</span><strong>{screening.title}</strong><small>{screening.duration} min{screening.devices?.length ? ` · ${screening.devices.join(', ')}` : ''}</small></div><span className="xinema-row-event__buffer" /></article>; })}</div></div>;
}

function TeamView({ team, selectedDay, setSelectedDay, employeeName, setEmployeeName, addEmployee, availability, setAvailability }: { team: string[]; selectedDay: number; setSelectedDay: (d: number) => void; employeeName: string; setEmployeeName: (v: string) => void; addEmployee: (e: FormEvent<HTMLFormElement>) => void; availability: 'available' | 'unavailable'; setAvailability: (v: 'available' | 'unavailable') => void }) { return <section className="xinema-shell"><div className="xinema-hero xinema-hero--team"><div><p className="xinema-kicker">Agenda de l’équipe</p><h1>Chaque salle a son équipe.</h1><p>Visualisez les rotations de la semaine, les postes et les disponibilités du personnel.</p></div><button className="xinema-primary" onClick={() => setAvailability(availability === 'available' ? 'unavailable' : 'available')}><Check size={17} /> Je suis {availability === 'available' ? 'disponible' : 'indisponible'}</button></div><DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} /><div className="xinema-team-layout"><section className="xinema-panel xinema-panel--wide"><p className="xinema-kicker">Planning hebdomadaire</p><h2>Présences de l’équipe</h2><div className="xinema-staff-agenda"><div className="xinema-staff-agenda__head"><span>Collaborateur</span>{days.map((day) => <span key={day.date}>{day.name.slice(0, 3)}<small>{day.date}</small></span>)}</div>{team.map((member, index) => <div className="xinema-staff-agenda__row" key={member}><strong>{member}</strong>{days.map((day, dayIndex) => <span className={(index + dayIndex) % 5 === 0 ? 'is-off' : ''} key={day.date}>{(index + dayIndex) % 5 === 0 ? 'Repos' : index % 2 === 0 ? '12h–20h' : '16h–00h'}</span>)}</div>)}</div></section><section className="xinema-panel xinema-panel--form"><p className="xinema-kicker">Administration</p><h2>Registre du personnel</h2><p>Ajoutez un collaborateur et retrouvez-le immédiatement dans le planning de démonstration.</p><form onSubmit={addEmployee}><label>Prénom et nom<input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Ex. Camille Durand" /></label><button className="xinema-primary"><Plus size={16} /> Ajouter à l’équipe</button></form></section></div></section>; }
function DaySelector({ selectedDay, setSelectedDay, onPrevious, onNext }: { selectedDay: number; setSelectedDay: (d: number) => void; onPrevious?: () => void; onNext?: () => void }) { return <div className="xinema-day-selector"><button className="xinema-week-nav" aria-label="Semaine précédente" onClick={onPrevious}><ChevronLeft size={17} /></button>{days.map((day, i) => <button key={day.value.toISOString()} className={i === selectedDay ? 'is-active' : ''} onClick={() => setSelectedDay(i)}><span>{day.name.slice(0, 3)}</span><strong>{day.value.getDate()}</strong></button>)}<button className="xinema-week-nav" aria-label="Semaine suivante" onClick={onNext}><ChevronRight size={17} /></button></div>; }
function PlannerDialog(props: { editingScreening?: Screening | null; filmTitle: string; setFilmTitle: (v: string) => void; movieSearch: string; setMovieSearch: (v: string) => void; movieResults: Movie[]; movieMessage: string; selectMovie: (movie: Movie) => void; selectedMovie: Movie | null; screeningTime: string; setScreeningTime: (v: string) => void; screeningDuration: number; setScreeningDuration: (v: number) => void; selectedRoomId: string; setSelectedRoomId: (v: string) => void; bufferMinutes: number; setBufferMinutes: (v: number) => void; repeatWeeks?: number; setRepeatWeeks?: (v: number) => void; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const hasImdbLink = props.selectedMovie?.source !== 'manual' && props.selectedMovie?.imdbId && !props.selectedMovie.imdbId.startsWith('manual-');
  return <div className="xinema-dialog-backdrop"><form className="xinema-dialog xinema-dialog--planner" onSubmit={props.onSubmit}>
    <div><p className="xinema-kicker">{props.editingScreening ? 'Modification' : 'Nouvelle projection'}</p><h2>{props.editingScreening ? 'Modifier la séance' : 'Programmer une séance'}</h2><p className="xinema-dialog__intro">Choisissez un film IMDb, un film de la banque ou renseignez directement son titre et sa durée.</p></div>
    <label>Rechercher un film sur IMDb<input autoFocus={!props.selectedMovie} value={props.movieSearch} onChange={(e) => props.setMovieSearch(e.target.value)} placeholder="Ex. The Substance" /></label>
    {props.movieResults.length > 0 && <div className="xinema-dialog-search-results">{props.movieResults.map((movie) => <button type="button" key={movie.imdbId} onClick={() => props.selectMovie(movie)}><img src={movie.posterUrl ?? '/xinema/movie-placeholder.png'} alt="" /><span><strong>{movie.title}</strong><small>{movie.year} · {movie.imdbId}</small></span></button>)}</div>}
    {props.movieMessage && <p className="xinema-movie-message">{props.movieMessage}</p>}
    {props.selectedMovie && <div className="xinema-dialog-film xinema-dialog-film--detail"><img src={props.selectedMovie.posterUrl ?? '/xinema/movie-placeholder.png'} alt={`Affiche de ${props.selectedMovie.title}`} /><span><strong>{props.selectedMovie.title}</strong><small>{props.screeningDuration} min · {props.selectedMovie.director ?? (props.selectedMovie.source === 'manual' ? 'Création manuelle' : 'Réalisation non renseignée')}</small>{hasImdbLink && <a href={`https://www.imdb.com/title/${props.selectedMovie.imdbId}/`} target="_blank" rel="noreferrer">Voir la fiche IMDb ↗</a>}</span></div>}
    <div className="xinema-form-grid"><label>Film à programmer<input required value={props.filmTitle} onChange={(e) => props.setFilmTitle(e.target.value)} placeholder="Titre du film" /></label><label>Durée du film<input required min={1} type="number" value={props.screeningDuration} onChange={(e) => props.setScreeningDuration(Number(e.target.value))} /></label></div>
    <div className="xinema-form-grid"><label>Salle<select value={props.selectedRoomId} onChange={(e) => props.setSelectedRoomId(e.target.value)}>{rooms.map((room) => <option value={room.id} key={room.id}>{room.name} · {room.format}</option>)}</select></label><label>Heure de début<input type="time" value={props.screeningTime} onChange={(e) => props.setScreeningTime(e.target.value)} /></label></div>
    <label>Buffer pub / rotation<select value={props.bufferMinutes} onChange={(e) => props.setBufferMinutes(Number(e.target.value))}><option value={10}>10 min</option><option value={15}>15 min</option><option value={20}>20 min</option><option value={25}>25 min</option></select></label>
    {props.setRepeatWeeks && !props.editingScreening && <label>Dupliquer cette séance<select value={props.repeatWeeks ?? 1} onChange={(e) => props.setRepeatWeeks?.(Number(e.target.value))}><option value={1}>Cette semaine seulement</option><option value={2}>Pendant 2 semaines</option><option value={3}>Pendant 3 semaines</option><option value={4}>Pendant 4 semaines</option><option value={8}>Pendant 8 semaines</option></select></label>}
    <div className="xinema-dialog__actions"><button type="button" className="xinema-secondary" onClick={props.onClose}>Annuler</button><button className="xinema-primary"><Check size={16} /> {props.editingScreening ? 'Enregistrer' : 'Planifier'}</button></div>
  </form></div>;
}
