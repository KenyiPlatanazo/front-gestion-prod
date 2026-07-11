export interface ApiResponseDTO<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
}

// ========== BÚSQUEDA ==========
export interface SugerenciaDTO {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  relevancia: number;
  rating: number;
  vecesResuelto: number;
  tags: string[];
  moduloOrigen: string;
  afectaCocina: boolean;
  afectaSalon: boolean;
  afectaReservas: boolean;
}

export interface BusquedaRequestDTO {
  query?: string | null;
  ingrediente?: string | null;
  categoria?: string | null;
  tags?: string[] | null;
  afectaCocina?: boolean | null;
  afectaSalon?: boolean | null;
  afectaReservas?: boolean | null;
  moduloOrigen?: string | null;
  limit?: number | null;
}

// ========== CRUD ARTÍCULOS ==========
export interface ArticuloKBSDTO {
  id: number;
  titulo: string;
  descripcion: string;
  solucion: string;
  tipoArticulo: string;
  moduloOrigen: string;
  estado: string;
  categoria: string;
  tags: string[];
  vecesResuelto: number;
  rating: number;
  totalVotos: number;
  afectaCocina: boolean;
  afectaSalon: boolean;
  afectaReservas: boolean;
  ingredientesRelacionados: string;
  creadoPor: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearArticuloDTO {
  titulo: string;
  descripcion: string;
  solucion?: string;
  tipoArticulo: string;
  moduloOrigen: string;
  categoria?: string;
  tags?: string[];
  afectaCocina?: boolean;
  afectaSalon?: boolean;
  afectaReservas?: boolean;
  ingredientesRelacionados?: string;
  idOrigen?: number;
  creadoPor?: string;
  rolCreador?: string;
}

export interface ResumenKBSDTO {
  totalArticulos: number;
  operativos: number;
  estrategicos: number;
  crisis: number;
  publicados: number;
  enRevision: number;
  obsoletos: number;
  porIncidencias: number;
  porCambios: number;
  porSolicitudes: number;
  ratingPromedio: number;
}

// ========== ALIMENTACIÓN ==========
export interface IncidenteCierreDTO {
  id: number;
  titulo: string;
  descripcion: string;
  solucionAplicada: string;
  categoria: string;
  tags: string[];
  afectaCocina: boolean;
  afectaSalon: boolean;
  afectaReservas: boolean;
  resueltoPor: string;
}

export interface CambioCierreDTO {
  id: number;
  resumen: string;
  impacto: string;
  nuevosProcedimientos: string;
  afectaCocina: boolean;
  afectaSalon: boolean;
  afectaReservas: boolean;
  implementadoPor: string;
}

export interface SolicitudRelevanteDTO {
  pregunta: string;
  respuestaEstandar: string;
  categoria: string;
  tags: string[];
  vecesPreguntada: number;
}
