"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { incidenteService } from '@/services/incidenteService';
import { Incidente, CrearIncidenteDTO } from '@/types/incidente';
import { useAuth } from './AuthContext';

interface IncidenteContextType {
  incidentes: Incidente[];
  isLoading: boolean;
  error: string | null;
  crearIncidente: (data: CrearIncidenteDTO) => Promise<Incidente | null>;
  listarIncidentes: () => Promise<void>;
  obtenerIncidente: (id: number) => Promise<Incidente | null>;
  actualizarEstado: (id: number, estado: string) => Promise<Incidente | null>;
  listarPorEstado: (estado: string) => Promise<Incidente[]>;
  listarPorUsuario: (nombreUsuario: string) => Promise<Incidente[]>;
  eliminarIncidente: (id: number) => Promise<boolean>;
}

const IncidenteContext = createContext<IncidenteContextType | undefined>(undefined);

export function IncidenteProvider({ children }: { children: ReactNode }) {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const listarIncidentes = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await incidenteService.listarTodos();
      setIncidentes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const crearIncidente = async (data: CrearIncidenteDTO): Promise<Incidente | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const nuevo = await incidenteService.crearIncidente(data);
      await listarIncidentes();
      return nuevo;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const obtenerIncidente = async (id: number): Promise<Incidente | null> => {
    try {
      return await incidenteService.obtenerPorId(id);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const actualizarEstado = async (id: number, estado: string): Promise<Incidente | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const actualizado = await incidenteService.actualizarEstado(id, { estado: estado as any });
      await listarIncidentes();
      return actualizado;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const listarPorEstado = async (estado: string): Promise<Incidente[]> => {
    try {
      return await incidenteService.listarPorEstado(estado);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const listarPorUsuario = async (nombreUsuario: string): Promise<Incidente[]> => {
    try {
      return await incidenteService.listarPorUsuario(nombreUsuario);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const eliminarIncidente = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await incidenteService.eliminar(id);
      await listarIncidentes();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      listarIncidentes();
    }
  }, [isAuthenticated]);

  return (
    <IncidenteContext.Provider
      value={{
        incidentes,
        isLoading,
        error,
        crearIncidente,
        listarIncidentes,
        obtenerIncidente,
        actualizarEstado,
        listarPorEstado,
        listarPorUsuario,
        eliminarIncidente,
      }}
    >
      {children}
    </IncidenteContext.Provider>
  );
}

export function useIncidentes() {
  const context = useContext(IncidenteContext);
  if (!context) {
    throw new Error('useIncidentes must be used within an IncidenteProvider');
  }
  return context;
}
