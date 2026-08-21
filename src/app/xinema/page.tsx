'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Film,
  MapPin,
  Plus,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import './xinema.css';

type View = 'welcome' | 'programming' | 'team';

type Screening = {
  id: number;
  title: string;
  room: string;
  time: string;
  duration: number;
  format: string;
};

type MovieResult = {
  imdbId: string;
  title: string;
  year: string;
  posterUrl: string | null;
  durationMin?: number;
};

const initialScreenings: Screening[] = [
  { id: 1, title: 'Dune : Deuxième partie', room: 'Salle 1 · IMAX', time: '13:40', duration: 166, format: 'VO IMAX' },
  { id: 2, title: 'Le Comte de Monte-Cristo', room: 'Salle 2', time: '16:10', duration: 178, format: 'VF' },
  { id: 3, title: 'Vice-Versa 2', room: 'Salle 3', time: '18:25', duration: 96, format: 'VF' },
];

const initialTeam = ['Alice Dupont', 'Thomas Bernard', 'Maya Khelifi', 'Louis Martin'];

export default function XInemaPage() {
  const [view, setView] = useState<View>('welcome');
  const [screenings, setScreenings] = useState(initialScreenings);
  const [team, setTeam] = useState(initialTeam);
  const [showPlanner, setShowPlanner] = useState(false);
  const [filmTitle, setFilmTitle] = useState('');
  const [movieSearch, setMovieSearch] = useState('');
  const [movieResults, setMovieResults] = useState<MovieResult[]>([]);
  const [movieMessage, setMovieMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [screeningTime, setScreeningTime] = useState('20:30');
  const [employeeName, setEmployeeName] = useState('');
  const [availability, setAvailability] = useState<'available' | 'unavailable'>('available');

  const totalSeats = 470;
  const plannedMinutes = useMemo(
    () => screenings.reduce((sum, screening) => sum + screening.duration, 0),
    [screenings],
  );

  useEffect(() => {
    const query = movieSearch.trim();
    if (query.length < 2) {
      setMovieResults([]);
      setMovieMessage('');
      return;
    }

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
        if ((error as Error).name !== 'AbortError') {
          setMovieResults([]);
          setMovieMessage((error as Error).message || 'La recherche est indisponible.');
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [movieSearch]);

  function addScreening(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = filmTitle.trim();
    if (!title) return;

    setScreenings((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        room: 'Salle 2',
        time: screeningTime,
        duration: selectedMovie?.durationMin ?? 120,
        format: 'À confirmer',
      },
    ]);
    setFilmTitle('');
    setMovieSearch('');
    setSelectedMovie(null);
    setShowPlanner(false);
  }

  async function selectMovie(movie: MovieResult) {
    setSelectedMovie(movie);
    setFilmTitle(`${movie.title} (${movie.year})`);
    setMovieResults([]);
    setMovieMessage('Chargement de la durée…');
    try {
      const response = await fetch(`/api/xinema/movies?id=${encodeURIComponent(movie.imdbId)}`);
      const payload = await response.json() as { movie?: MovieResult; error?: string };
      if (!response.ok || !payload.movie) throw new Error(payload.error);
      setSelectedMovie(payload.movie);
      setMovieMessage(`${payload.movie.durationMin ?? 120} min · IMDb ${payload.movie.imdbId}`);
    } catch {
      setMovieMessage('Film sélectionné · durée par défaut : 120 min.');
    }
  }

  function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = employeeName.trim();
    if (!name) return;
    setTeam((current) => [...current, name]);
    setEmployeeName('');
  }

  if (view === 'welcome') {
    return (
      <main className="xinema-home">
        <div className="xinema-home__backdrop" />
        <div className="xinema-home__grain" />
        <section className="xinema-home__content">
          <div className="xinema-brand">
            <span className="xinema-brand__mark"><Film size={22} aria-hidden="true" /></span>
            <span>XI<b>NÉMA</b></span>
          </div>
          <p className="xinema-kicker">Prototype intégré à XIRH</p>
          <h1>L’écosystème numérique des salles premium.</h1>
          <p className="xinema-home__intro">
            Une démonstration de gestion de programmation et d’équipe pour un cinéma multiplexe.
            Les données affichées restent locales à cette page et ne constituent pas un système de production.
          </p>

          <div className="xinema-portal-grid">
            <button className="xinema-portal-card" onClick={() => setView('programming')}>
              <span className="xinema-portal-card__icon"><CalendarDays size={24} /></span>
              <span className="xinema-portal-card__eyebrow">Espace direction</span>
              <strong>Programmation & salles</strong>
              <small>Planifier les séances, visualiser les jauges et suivre l’activité.</small>
              <span className="xinema-portal-card__action">Ouvrir le tableau de bord <ArrowRight size={16} /></span>
            </button>
            <button className="xinema-portal-card xinema-portal-card--team" onClick={() => setView('team')}>
              <span className="xinema-portal-card__icon"><Users size={24} /></span>
              <span className="xinema-portal-card__eyebrow">Espace équipe</span>
              <strong>Planning & disponibilités</strong>
              <small>Consulter l’équipe et signaler une disponibilité dans le prototype.</small>
              <span className="xinema-portal-card__action">Accéder à l’équipe <ArrowRight size={16} /></span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="xinema-app">
      <header className="xinema-topbar">
        <button className="xinema-wordmark" onClick={() => setView('welcome')} aria-label="Retour à l’accueil XInéma">
          <Film size={20} aria-hidden="true" /> XI<b>NÉMA</b>
        </button>
        <div className="xinema-topbar__meta"><Sparkles size={15} /> Mode démo local</div>
        <button className="xinema-back" onClick={() => setView('welcome')}><ArrowLeft size={16} /> Accueil</button>
      </header>

      {view === 'programming' ? (
        <section className="xinema-shell">
          <div className="xinema-hero xinema-hero--manager">
            <div>
              <p className="xinema-kicker">Direction · lundi 13 avril</p>
              <h1>La programmation garde le rythme.</h1>
              <p>Un aperçu clair de la journée, des salles et des séances à venir.</p>
            </div>
            <button className="xinema-primary" onClick={() => setShowPlanner(true)}><Plus size={17} /> Nouvelle projection</button>
          </div>

          <div className="xinema-stat-grid">
            <Stat icon={<Ticket />} value={`${screenings.length}`} label="Séances programmées" />
            <Stat icon={<MapPin />} value={`${totalSeats}`} label="Places disponibles" />
            <Stat icon={<Clock3 />} value={`${Math.round(plannedMinutes / 60)} h ${plannedMinutes % 60} min`} label="Projection planifiée" />
            <Stat icon={<Users />} value={`${team.length}`} label="Salariés actifs" />
          </div>

          <div className="xinema-section-heading">
            <div><p className="xinema-kicker">Programme du jour</p><h2>Salles et séances</h2></div>
            <span className="xinema-status"><span /> En préparation</span>
          </div>
          <div className="xinema-screening-list">
            {screenings.slice().sort((a, b) => a.time.localeCompare(b.time)).map((screening) => (
              <article className="xinema-screening" key={screening.id}>
                <img src="/xinema/movie-placeholder.png" alt="" />
                <div className="xinema-screening__time"><strong>{screening.time}</strong><span>{screening.duration} min</span></div>
                <div className="xinema-screening__title"><h3>{screening.title}</h3><p>{screening.room} · {screening.format}</p></div>
                <span className="xinema-tag">Programmé</span>
              </article>
            ))}
          </div>

          {showPlanner && (
            <div className="xinema-dialog-backdrop" role="presentation">
              <form className="xinema-dialog" onSubmit={addScreening}>
                <div><p className="xinema-kicker">Nouvelle projection</p><h2>Ajouter au programme</h2></div>
                <label>Rechercher un film sur IMDb<input autoFocus value={movieSearch} onChange={(event) => setMovieSearch(event.target.value)} placeholder="Ex. Inception" /></label>
                {movieResults.length > 0 && <div className="xinema-movie-results">{movieResults.map((movie) => <button type="button" key={movie.imdbId} onClick={() => selectMovie(movie)}><span>{movie.title} <small>({movie.year})</small></span><i>{movie.imdbId}</i></button>)}</div>}
                {movieMessage && <p className="xinema-movie-message">{movieMessage}</p>}
                <label>Film à programmer<input required value={filmTitle} onChange={(event) => { setFilmTitle(event.target.value); setSelectedMovie(null); }} placeholder="Sélectionnez ou saisissez un film" /></label>
                <label>Heure de début<input type="time" value={screeningTime} onChange={(event) => setScreeningTime(event.target.value)} /></label>
                <div className="xinema-dialog__actions"><button type="button" className="xinema-secondary" onClick={() => setShowPlanner(false)}>Annuler</button><button className="xinema-primary"><Check size={16} /> Planifier</button></div>
              </form>
            </div>
          )}
        </section>
      ) : (
        <section className="xinema-shell">
          <div className="xinema-hero xinema-hero--team">
            <div><p className="xinema-kicker">Espace équipe</p><h1>Le bon équilibre, séance après séance.</h1><p>Un panneau d’équipe simple pour explorer le futur parcours salarié.</p></div>
            <button className="xinema-primary" onClick={() => setAvailability((current) => current === 'available' ? 'unavailable' : 'available')}><Check size={17} /> Je suis {availability === 'available' ? 'disponible' : 'indisponible'}</button>
          </div>
          <div className="xinema-team-layout">
            <section className="xinema-panel">
              <p className="xinema-kicker">Équipe active</p><h2>{team.length} collaborateurs</h2>
              <div className="xinema-team-list">{team.map((member, index) => <div className="xinema-member" key={`${member}-${index}`}><span>{member.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>{member}</strong><small>{index % 2 === 0 ? 'Accueil & caisse' : 'Projection & salle'}</small></div><i>Disponible</i></div>)}</div>
            </section>
            <section className="xinema-panel xinema-panel--form">
              <p className="xinema-kicker">Administration démo</p><h2>Ajouter un collaborateur</h2>
              <p>Cette action est volontairement éphémère : aucune donnée n’est envoyée ou conservée après rechargement.</p>
              <form onSubmit={addEmployee}><label>Prénom et nom<input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Ex. Camille Durand" /></label><button className="xinema-primary"><Plus size={16} /> Ajouter à l’équipe</button></form>
            </section>
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <article className="xinema-stat"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>;
}
