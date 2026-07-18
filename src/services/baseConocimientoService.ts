import {
  SugerenciaDTO, BusquedaRequestDTO, ApiResponseDTO,
  ArticuloKBSDTO, CrearArticuloDTO, ResumenKBSDTO,
  IncidenteCierreDTO, CambioCierreDTO, SolicitudRelevanteDTO
} from '@/types/base-conocimiento';

const API = process.env.NEXT_PUBLIC_BASE_CONOCIMIENTO_URL || 'http://localhost:8090/api/base-conocimiento';

class BaseConocimientoService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, { ...options, headers: { ...this.getHeaders(), ...options.headers } });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Error ${response.status}`);
    }
    const result: ApiResponseDTO<T> = await response.json();
    if (!result.exito) throw new Error(result.mensaje || 'Error');
    return result.datos;
  }

  // ==================== BUSQUEDA ====================
  async buscar(data: BusquedaRequestDTO): Promise<SugerenciaDTO[]> {
    return this.request(`${API}/busqueda`, {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async sugerirPorContexto(contexto: string): Promise<SugerenciaDTO[]> {
    return this.request(`${API}/busqueda/sugerir?contexto=${encodeURIComponent(contexto)}`);
  }

  async sugerirPorModulo(modulo: string): Promise<SugerenciaDTO[]> {
    return this.request(`${API}/busqueda/sugerir/por-modulo?modulo=${encodeURIComponent(modulo)}`);
  }

  async sugerirAlCerrarIncidente(incidenteId: number, categoria: string): Promise<SugerenciaDTO[]> {
    return this.request(`${API}/busqueda/sugerir/al-cierre-incidente?incidenteId=${incidenteId}&categoria=${encodeURIComponent(categoria)}`);
  }

  // ==================== CRUD ARTÍCULOS ====================
  async listarTodos(): Promise<ArticuloKBSDTO[]> {
    return this.request(API);
  }

  async obtenerPorId(id: number): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/${id}`);
  }

  async crear(dto: CrearArticuloDTO): Promise<ArticuloKBSDTO> {
    return this.request(API, { method: 'POST', body: JSON.stringify(dto) });
  }

  async actualizar(id: number, dto: CrearArticuloDTO): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
  }

  async cambiarEstado(id: number, estado: string): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/${id}/estado?estado=${encodeURIComponent(estado)}`, { method: 'PATCH' });
  }

  async votar(id: number, tipo: string): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/${id}/votar?tipo=${tipo}`, { method: 'POST' });
  }

  async obtenerResumen(): Promise<ResumenKBSDTO> {
    return this.request(`${API}/resumen`);
  }

  async eliminar(id: number): Promise<void> {
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: this.getHeaders() });
  }

  // ==================== ALIMENTACIÓN ====================
  async alimentarDesdeIncidente(dto: IncidenteCierreDTO): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/alimentacion/incidente`, { method: 'POST', body: JSON.stringify(dto) });
  }

  async alimentarDesdeCambio(dto: CambioCierreDTO): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/alimentacion/cambio`, { method: 'POST', body: JSON.stringify(dto) });
  }

  async alimentarDesdeSolicitud(dto: SolicitudRelevanteDTO): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/alimentacion/solicitud`, { method: 'POST', body: JSON.stringify(dto) });
  }

  async alimentarDesdeCapacidad(metrica: string, proyeccion: string, recomendacion: string): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/alimentacion/capacidad?metrica=${encodeURIComponent(metrica)}&proyeccion=${encodeURIComponent(proyeccion)}&recomendacion=${encodeURIComponent(recomendacion)}`, { method: 'POST' });
  }

  async alimentarDesdeMonitoreo(tipoEvento: string, umbral: string, accionCorrectiva: string): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/alimentacion/monitoreo?tipoEvento=${encodeURIComponent(tipoEvento)}&umbral=${encodeURIComponent(umbral)}&accionCorrectiva=${encodeURIComponent(accionCorrectiva)}`, { method: 'POST' });
  }

  async alimentarDesdeContinuidad(procedimiento: string, contactos: string, checklist: string): Promise<ArticuloKBSDTO> {
    return this.request(`${API}/alimentacion/continuidad?procedimiento=${encodeURIComponent(procedimiento)}&contactos=${encodeURIComponent(contactos)}&checklist=${encodeURIComponent(checklist)}`, { method: 'POST' });
  }
}

export const baseConocimientoService = new BaseConocimientoService();
export default baseConocimientoService;
