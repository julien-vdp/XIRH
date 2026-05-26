"use client";

import { useState, useEffect, useRef } from "react";
import { format, addMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { Film, LogOut, Clock, Plus, AlertCircle, Shield, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ROOMS = [
  { id: "r1", name: "Salle 1 (IMAX)", capacity: 250 },
  { id: "r2", name: "Salle 2", capacity: 120 },
];

const MOCK_MOVIES = [
  { id: "m1", title: "Dune: Part Two", durationMin: 166, posterUrl: "/placeholder.png" },
  { id: "m2", title: "Oppenheimer", durationMin: 180, posterUrl: "/placeholder.png" },
  { id: "m3", title: "Furiosa", durationMin: 148, posterUrl: "/placeholder.png" }
];

type Screening = {
  id: string;
  roomId: string;
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  startTime: Date;
  bufferMin: number;
  durationMin: number;
  endTime: Date;
};

export default function ManagerScreenings() {
  const router = useRouter();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0].id);
  
  // Movie Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{id: string, title: string, durationMin: number, posterUrl: string} | null>(null);
  
  const [startTimeStr, setStartTimeStr] = useState("14:00");
  const [buffer, setBuffer] = useState(15);
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const fetchMovies = async () => {
      setIsSearching(true);
      try {
        const OMDb_KEY = "7e77a358";
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${OMDb_KEY}`);
        const data = await res.json();
        
        if (data.Response === "True" && data.Search) {
            const mapped = data.Search.slice(0, 5).map((m: any) => ({
                id: m.imdbID,
                title: `${m.Title} (${m.Year})`,
                posterUrl: m.Poster && m.Poster !== "N/A" ? m.Poster : "/movie_placeholder_1776411396850.png",
                isApi: true
            }));
            setSearchResults(mapped);
        } else {
            // Provide empty or fallback if needed
            setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchMovies();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const selectMovie = async (moviePreview: any) => {
    setSearchQuery("");
    setSearchResults([]);
    
    if (!moviePreview.isApi) {
       setSelectedMovie({
           id: moviePreview.id,
           title: moviePreview.title,
           posterUrl: moviePreview.posterUrl,
           durationMin: moviePreview.durationMin
       });
       return;
    }

    try {
        setIsSearching(true);
        const OMDb_KEY = "7e77a358";
        const res = await fetch(`https://www.omdbapi.com/?i=${moviePreview.id}&apikey=${OMDb_KEY}`);
        const data = await res.json();
        
        let parsedDuration = 120; // fallback
        if (data.Runtime && data.Runtime !== "N/A") {
            const minutes = parseInt(data.Runtime.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(minutes)) {
                parsedDuration = minutes;
            }
        }
        
        setSelectedMovie({
            id: moviePreview.id,
            title: moviePreview.title,
            posterUrl: moviePreview.posterUrl,
            durationMin: parsedDuration
        });
    } catch(err) {
        console.error(err);
    } finally {
        setIsSearching(false);
    }
  };

  const addScreening = () => {
    setError("");
    if (!selectedMovie) {
        setError("Veuillez sélectionner un film.");
        return;
    }

    // Parse startTimeStr
    const [hours, minutes] = startTimeStr.split(":").map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    // Calculate end time
    const end = addMinutes(start, selectedMovie.durationMin + buffer);

    // Conflict validation
    const roomScreenings = screenings.filter(s => s.roomId === selectedRoom);
    const hasConflict = roomScreenings.some(s => {
      return (start < s.endTime && end > s.startTime);
    });

    if (hasConflict) {
      setError("Chevauchement détecté ! Une autre séance est déjà programmée sur ce créneau dans cette salle.");
      return;
    }

    setScreenings([...screenings, {
      id: Math.random().toString(),
      roomId: selectedRoom,
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      posterUrl: selectedMovie.posterUrl,
      startTime: start,
      bufferMin: buffer,
      durationMin: selectedMovie.durationMin,
      endTime: end
    }]);

    setSelectedMovie(null);
  };

  const roomScreenings = screenings.filter(s => s.roomId === selectedRoom).sort((a,b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#262626] p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#E50914] rounded-full flex items-center justify-center">
            <Film size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-wider text-white">Programmation <span className="text-[#E50914]">Salles</span></h1>
            <p className="text-xs text-gray-400">Gestion mathématique des projections</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/manager/planning")} className="text-gray-400 hover:text-white text-sm transition-colors border border-[#262626] px-3 py-1.5 rounded-md hover:border-gray-500">Retour Planning</button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-[#E50914] flex items-center space-x-2 transition-colors border-l border-[#262626] pl-4">
            <LogOut size={16} />
            <span className="text-sm hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulaire ajout */}
        <div className="lg:col-span-1 bg-[#141414] border border-[#262626] rounded-xl p-6 h-fit sticky top-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus size={20} className="text-[#E50914]" />
            Nouvelle projection
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Salle de cinéma</label>
              <select 
                value={selectedRoom} 
                onChange={e => setSelectedRoom(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-[#E50914] outline-none cursor-pointer"
              >
                {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} places)</option>)}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm text-gray-400 mb-2">Recherche Film (API TMDB)</label>
              <div className="relative">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Ex: Inception..."
                   className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 pl-10 text-white focus:border-[#E50914] outline-none"
                 />
                 <Search size={18} className="absolute left-3 top-3.5 text-gray-500" />
                 {isSearching && <Loader2 size={18} className="absolute right-3 top-3.5 text-gray-500 animate-spin" />}
              </div>

              {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden z-50 max-h-60 overflow-y-auto shadow-2xl">
                     {searchResults.map(m => (
                         <button
                           key={m.id}
                           onClick={() => selectMovie(m)}
                           className="w-full text-left p-3 hover:bg-[#262626] flex items-center gap-3 border-b border-[#333] last:border-0"
                         >
                             <div className="w-8 h-12 relative flex-shrink-0 bg-black">
                                 <Image src={m.posterUrl} alt="poster" fill className="object-cover" />
                             </div>
                             <span className="font-medium text-sm text-white">{m.title}</span>
                         </button>
                     ))}
                  </div>
              )}
            </div>

            {selectedMovie && (
                <div className="bg-[#262626] rounded-lg p-3 flex gap-4 items-center">
                    <div className="w-12 h-16 relative flex-shrink-0 rounded overflow-hidden shadow-md">
                        <Image src={selectedMovie.posterUrl} alt="poster" fill className="object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white line-clamp-1">{selectedMovie.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock size={12}/> {selectedMovie.durationMin} minutes</p>
                    </div>
                    <button onClick={() => setSelectedMovie(null)} className="ml-auto text-gray-500 hover:text-white text-xs">Changer</button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Heure de début</label>
                <input 
                  type="time" 
                  value={startTimeStr}
                  onChange={e => setStartTimeStr(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-[#E50914] outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Buffer pub (min)</label>
                <input 
                  type="number" 
                  min="0"
                  value={buffer}
                  onChange={e => setBuffer(Number(e.target.value))}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-[#E50914] outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#E50914]/10 border border-[#E50914]/50 text-[#E50914] p-3 rounded-lg text-sm flex items-start gap-2 mt-4">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button 
              onClick={addScreening}
              disabled={!selectedMovie}
              className="w-full bg-[#E50914] hover:bg-[#b80710] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors mt-4 shadow-lg shadow-[#E50914]/20"
            >
              Planifier la séance
            </button>
          </div>
        </div>

        {/* Visualisation Salle */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            {ROOMS.map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRoom(r.id)}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedRoom === r.id 
                  ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)] border-transparent' 
                  : 'bg-[#141414] border border-[#262626] text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 min-h-[500px]">
             <h3 className="text-xl font-bold mb-6 text-white border-b border-[#262626] pb-4">
               Programme du jour - <span className="text-[#E50914]">{ROOMS.find(r=>r.id===selectedRoom)?.name}</span>
             </h3>

             {roomScreenings.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                 <Film size={48} className="mb-4 opacity-20" />
                 <p>Aucune projection programmée pour cette salle aujourd'hui.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {roomScreenings.map((s) => {
                   return (
                     <div key={s.id} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex gap-6 items-center hover:border-[#E50914] transition-colors group">
                       <div className="w-16 h-24 sm:w-20 sm:h-28 relative rounded-md overflow-hidden flex-shrink-0 border border-[#333]">
                         <Image src={s.posterUrl} alt="poster" fill className="object-cover" />
                       </div>
                       
                       <div className="flex-1">
                         <h4 className="text-lg font-bold text-white group-hover:text-[#E50914] transition-colors">{s.movieTitle}</h4>
                         <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                           <span className="flex items-center gap-1"><Clock size={14}/> {s.durationMin} min</span>
                           <span className="flex items-center gap-1 text-[#E50914]/80">+ {s.bufferMin} min pub</span>
                         </div>
                       </div>

                       <div className="text-right border-l border-[#333] pl-4 sm:pl-6">
                         <p className="text-xl sm:text-2xl font-black text-white">{format(s.startTime, "HH:mm")}</p>
                         <p className="text-xs sm:text-sm text-gray-500">Fin prévue: <span className="font-bold text-gray-300">{format(s.endTime, "HH:mm")}</span></p>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>

      </main>
    </div>
  );
}
