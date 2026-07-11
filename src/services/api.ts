import type {
  Incidente, TipoAreaAfectada, Urgencia, Impacto, Prioridad
} from '@/types/incidente';
import { incidenteService } from '@/services/incidenteService';
import {
  solicitudService
} from '@/services/solicitudService';
import cambioService from '@/services/cambioService';
import type {
  Solicitud, TipoSolicitud, PrioridadLocal as PrioridadSolicitud
} from '@/types/solicitud';
import type {
  Cambio, TipoCambio, CategoriaCambio, RiesgoCambio
} from '@/types/cambio';
import type {
  SugerenciaDTO, BusquedaRequestDTO, ApiResponseDTO
} from '@/types/base-conocimiento';
import { baseConocimientoService } from '@/services/baseConocimientoService';

// --- Incidencia (no backend, local-only mock) ---
let incidencias: Incidente[] = [
  { id: 1, nombreUsuario: "admin", resumenProblema: "Demo", descripcionDetallada: "Ejemplo", tipoAreaAfectada: "APLICACIONES", urgencia: "MEDIO", impacto: "MODERADO_LIMITADO", prioridad: "MEDIO", estado: "PENDIENTE", fechaCreacion: new Date().toISOString(), fechaActualizacion: new Date().toISOString() },
];
let incidenciaIdCounter = 2;

export async function postIncidencia(data: {
  nombreUsuario: string; resumenProblema: string; descripcionDetallada: string;
  tipoAreaAfectada: TipoAreaAfectada; urgencia: Urgencia; impacto: Impacto; prioridad: Prioridad;
}): Promise<void> {
  await incidenteService.crearIncidente(data);
  const all = await incidenteService.listarTodos();
  incidencias = all;
}

export async function getIncidencias(): Promise<Incidente[]> {
  const all = await incidenteService.listarTodos();
  incidencias = all;
  return [...incidencias];
}

// --- Solicitud (delegates to solicitudService) ---
export async function postSolicitud(data: {
  titulo: string; descripcion: string; tipoSolicitud: TipoSolicitud;
  prioridad: PrioridadSolicitud; fechaVencimiento?: string;
  usuarioSolicitante?: string; areaSolicitante?: string; responsableAsignado?: string;
}): Promise<void> {
  await solicitudService.crearSolicitud({
    tipoSolicitud: data.tipoSolicitud,
    titulo: data.titulo,
    descripcion: data.descripcion,
    prioridad: data.prioridad === "ALTA" ? "High" : data.prioridad === "MEDIA" ? "Medium" : "Low",
    fechaVencimiento: data.fechaVencimiento,
    usuarioSolicitante: data.usuarioSolicitante,
    areaSolicitante: data.areaSolicitante,
    responsableAsignado: data.responsableAsignado,
  });
}

export async function getSolicitudes(): Promise<Solicitud[]> {
  return solicitudService.listarSolicitudes();
}

// --- Cambio (delegates to cambioService) ---
export async function postCambio(data: {
  tipoCambio: TipoCambio; categoriaCambio: CategoriaCambio;
  titulo: string; descripcion: string;
  sistemaAfectado?: string; planRollback?: string;
  riesgo: RiesgoCambio;
  fechaImplementacion?: string; fechaVencimiento?: string;
  usuarioSolicitante?: string; areaSolicitante?: string;
}): Promise<void> {
  await cambioService.crearCambio({
    tipoCambio: data.tipoCambio,
    categoriaCambio: data.categoriaCambio,
    titulo: data.titulo,
    descripcion: data.descripcion,
    sistemaAfectado: data.sistemaAfectado || "",
    planRollback: data.planRollback,
    riesgo: data.riesgo,
    fechaImplementacion: data.fechaImplementacion,
    fechaVencimiento: data.fechaVencimiento,
    usuarioSolicitante: data.usuarioSolicitante || "",
    areaSolicitante: data.areaSolicitante || "",
  });
}

export async function getCambios(): Promise<Cambio[]> {
  return cambioService.listarTodos();
}

// --- Base Conocimiento (delegates to baseConocimientoService) ---
export async function buscarBaseConocimiento(data: BusquedaRequestDTO): Promise<SugerenciaDTO[]> {
  return baseConocimientoService.buscar(data);
}

export async function sugerirPorContexto(contexto: string): Promise<SugerenciaDTO[]> {
  return baseConocimientoService.sugerirPorContexto(contexto);
}

export async function sugerirAlCerrarIncidente(incidenteId: number, categoria: string): Promise<SugerenciaDTO[]> {
  return baseConocimientoService.sugerirAlCerrarIncidente(incidenteId, categoria);
}

export async function sugerirPorModulo(modulo: string): Promise<SugerenciaDTO[]> {
  return baseConocimientoService.sugerirPorModulo(modulo);
}
