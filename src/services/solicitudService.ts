// src/services/solicitudService.ts

import { Solicitud, CrearSolicitudDTO, ApiResponse, EstadisticasSolicitudes } from '@/types/solicitud';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';

class SolicitudService {
    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }

    // ========== CREAR SOLICITUD ==========
    async crearSolicitud(data: CrearSolicitudDTO): Promise<Solicitud> {
        const body = {
            tipoSolicitud: data.tipoSolicitud,
            titulo: data.titulo,
            descripcion: data.descripcion,
            prioridad: data.prioridad,
            fechaVencimiento: data.fechaVencimiento,
            labels: data.labels,
            assignee: data.responsableAsignado || data.assignee,
            subtareas: data.subtareas,
            usuarioSolicitante: data.usuarioSolicitante,
            areaSolicitante: data.areaSolicitante,
            responsableAsignado: data.responsableAsignado,
        };

        const response = await fetch(`${API_BASE_URL}/solicitudes/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al crear la solicitud');
        }

        const result: ApiResponse<Solicitud> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== LISTAR SOLICITUDES ==========
    async listarSolicitudes(): Promise<Solicitud[]> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/all`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar las solicitudes');
        }

        const result: ApiResponse<Solicitud[]> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== OBTENER SOLICITUD POR ID ==========
    async obtenerSolicitud(id: number): Promise<Solicitud> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar la solicitud');
        }

        const result: ApiResponse<Solicitud> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== ACTUALIZAR ESTADO (PENDIENTE, EN_PROCESO, COMPLETADA, RECHAZADA) ==========
    async actualizarEstado(id: number, estado: string): Promise<Solicitud> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}/estado?estado=${estado}`, {
            method: 'PUT',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el estado');
        }

        const result: ApiResponse<Solicitud> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== ACTUALIZAR RESPONSABLE ASIGNADO (SOLO ADMIN) ==========
    async actualizarResponsable(id: number, responsable: string): Promise<Solicitud> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}/responsable`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ responsable }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el responsable');
        }

        const result: ApiResponse<Solicitud> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== ACTUALIZAR RESOLUCIÓN (SOLO ADMIN) ==========
    async actualizarResolucion(id: number, resolucion: string): Promise<Solicitud> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/${id}/resolucion`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ resolucion }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la resolución');
        }

        const result: ApiResponse<Solicitud> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== FILTRAR POR ESTADO ==========
    async listarPorEstado(estado: string): Promise<Solicitud[]> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/estado/${estado}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar las solicitudes');
        }

        const result: ApiResponse<Solicitud[]> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== FILTRAR POR TIPO ==========
    async listarPorTipo(tipo: string): Promise<Solicitud[]> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/tipo/${tipo}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar las solicitudes');
        }

        const result: ApiResponse<Solicitud[]> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== OBTENER ESTADÍSTICAS ==========
    async obtenerEstadisticas(): Promise<EstadisticasSolicitudes> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/estadisticas`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Error al cargar las estadísticas (${response.status}): ${text.slice(0, 200)}`);
        }

        const result: ApiResponse<EstadisticasSolicitudes> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }

    // ========== OBTENER CONFIGURACIÓN ==========
    async obtenerConfiguracion(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/solicitudes/configuracion`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error al cargar la configuración');
        }

        const result: ApiResponse<any> = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        return result.data;
    }
}

export const solicitudService = new SolicitudService();