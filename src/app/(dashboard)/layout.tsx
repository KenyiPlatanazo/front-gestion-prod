"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NavigationProvider, useNavigation } from "@/context/NavigationContext";
import Sidebar from "@/components/Sidebar";
import PerfilPage from "./perfil/page";
import SolicitudesPage from "./solicitudes/page";
import CambiosPage from "./cambios/page";
import IncidenciasPage from "./incidencias/page";
import BaseConocimientoPage from "./base-conocimiento/page";

// AÑADIR NUEVA GESTIÓN AQUÍ - Importa la página de la nueva gestión

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { activeSection } = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "perfil":
        return <PerfilPage />;
      case "solicitudes":
        return <SolicitudesPage />;
      case "cambios":
        return <CambiosPage />;
      case "incidencias":
        return <IncidenciasPage />;
      case "base-conocimiento":
        return <BaseConocimientoPage />;
      // AÑADIR NUEVA GESTIÓN AQUÍ - Agrega un case para la nueva sección
      default:
        return <PerfilPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto bg-neutral-950">
        {renderSection()}
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <NavigationProvider>
      <DashboardContent />
    </NavigationProvider>
  );
}
