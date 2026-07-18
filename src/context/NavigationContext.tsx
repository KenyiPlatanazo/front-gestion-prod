"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Section = "perfil" | "solicitudes" | "cambios" | "incidencias" | "base-conocimiento";

// AÑADIR NUEVA GESTIÓN AQUÍ - Agrega nuevas secciones al tipo Section

interface NavigationContextType {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<Section>("base-conocimiento");

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
