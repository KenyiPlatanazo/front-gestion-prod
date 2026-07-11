export type { TipoSolicitud, EstadoSolicitud, PrioridadLocal as PrioridadSolicitud, Solicitud, CrearSolicitudDTO, ApiResponse, EstadisticasSolicitudes, Rol } from './solicitud';
export { permisosSolicitudes, areasRestaurante } from './solicitud';

export type { TipoCambio, CategoriaCambio, EstadoCambio, RiesgoCambio, Cambio, CrearCambioDTO } from './cambio';
export { permisosCambios, estadoColorsCambio, estadoLabelsCambio, tipoLabelsCambio, tipoColorsCambio, riesgoLabels, riesgoColors } from './cambio';

export type { TipoAreaAfectada, Urgencia, Impacto, Prioridad as PrioridadIncidente, EstadoIncidente, Incidente, CrearIncidenteDTO, ActualizarEstadoDTO } from './incidente';
export { tipoAreaLabels, tipoAreaColors, urgenciaLabels, urgenciaColors, impactoLabels, estadoLabels, estadoColors } from './incidente';

export type { SugerenciaDTO, BusquedaRequestDTO, ApiResponseDTO } from './base-conocimiento';
