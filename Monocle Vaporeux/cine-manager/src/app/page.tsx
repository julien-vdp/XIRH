"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Film, User, Shield } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cineManager_employees");
    if (saved) {
      setEmployees(JSON.parse(saved));
    } else {
      const defaultEmps = [
        { id: "e1", name: "Alice Dupont" },
        { id: "e2", name: "Bob Martin" }
      ];
      setEmployees(defaultEmps);
      localStorage.setItem("cineManager_employees", JSON.stringify(defaultEmps));
    }
  }, []);

  const handleLogin = (role: "EMPLOYEE" | "MANAGER", employeeData?: { id: string; name: string }) => {
    localStorage.setItem("userRole", role);
    if (role === "EMPLOYEE" && employeeData) {
      localStorage.setItem("employeeId", employeeData.id);
      localStorage.setItem("employeeName", employeeData.name);
      router.push("/employee/calendar");
    } else if (role === "MANAGER") {
      router.push("/manager/planning");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login_bg.png"
          alt="Cinema Hall"
          fill
          className="object-cover opacity-30 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-[#141414]/90 backdrop-blur-md rounded-2xl border border-[#262626] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-4 group">
             <Image src="/logo.png" alt="XInéma Logo" fill className="object-contain drop-shadow-[0_0_25px_rgba(229,9,20,0.6)] group-hover:scale-105 transition-all duration-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-widest text-white uppercase mt-2">XI<span className="text-[#E50914]">NÉMA</span></h1>
          <p className="text-gray-400 mt-2 text-sm text-center tracking-wide font-medium">L'Écosystème Numérique des Salles Premium</p>
        </div>

        <div className="space-y-6">
          
          <div className="border border-[#262626] rounded-xl p-4 bg-[#0a0a0a]/50">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
               <Shield size={16} className="text-[#E50914]" /> Espace Direction
            </h2>
            <button
              onClick={() => handleLogin("MANAGER")}
              className="w-full group flex items-center justify-between p-3 bg-[#1a1a1a] hover:bg-[#E50914] border border-[#333] hover:border-[#E50914] rounded-lg transition-all duration-300"
            >
              <div className="text-left leading-tight">
                <p className="text-white font-medium">Connexion Manager</p>
                <p className="text-xs text-gray-500 group-hover:text-red-100 mt-0.5">Planning interactif & Salles</p>
              </div>
            </button>
          </div>

          <div className="border border-[#262626] rounded-xl p-4 bg-[#0a0a0a]/50">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
               <User size={16} className="text-[#E50914]" /> Espace Salarié (Test)
            </h2>
            <div className="grid grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {employees.map(emp => (
                 <button 
                  key={emp.id}
                  onClick={() => handleLogin("EMPLOYEE", emp)}
                  className="w-full group text-left p-3 bg-[#1a1a1a] hover:bg-gray-700 border border-[#333] hover:border-gray-500 rounded-lg transition-all duration-300"
                 >
                   <p className="text-white font-medium text-xs truncate">{emp.name}</p>
                   <p className="text-[10px] text-gray-500 mt-0.5">Demandes Off</p>
                 </button>
               ))}
            </div>
          </div>

        </div>

        <div className="mt-8 text-center border-t border-[#262626] pt-6">
          <p className="text-xs text-gray-600">© 2026 XInéma. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
