"use client";

import { User, ClipboardList, RefreshCw, AlertTriangle, BookOpen } from "lucide-react";
import { useNavigation, type Section } from "@/context/NavigationContext";
import { useAuth } from "@/context/AuthContext";
import SidebarItem from "./SidebarItem";
import { LogOut } from "lucide-react";

const navItems: { id: Section; label: string; icon: typeof User }[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "solicitudes", label: "Solicitudes", icon: ClipboardList },
  { id: "cambios", label: "Cambios", icon: RefreshCw },
  { id: "incidencias", label: "Incidencias", icon: AlertTriangle },
  { id: "base-conocimiento", label: "Base de Conocimiento", icon: BookOpen },
];

// AÑADIR NUEVA GESTIÓN AQUÍ - Agrega nuevos ítems al array navItems para futuras gestiones

export default function Sidebar() {
  const { activeSection, setActiveSection } = useNavigation();
  const { logout } = useAuth();

  return (
    <aside className="w-[280px] min-h-screen bg-neutral-950 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="px-6 py-8 border-b border-zinc-800">
        <h1 className="text-amber-500 text-xl font-bold tracking-wide">Le Bon Gout</h1>
        <p className="text-zinc-500 text-xs mt-1">Sistema de Gestión</p>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
          />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
