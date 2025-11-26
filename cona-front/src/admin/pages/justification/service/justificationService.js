import axiosClient from "@/kernel/axiosClient";
import {API_ENDPOINTS} from "@/lib/endpoints";

export const justificationService = {
    // Crear nueva justificación (Empleado)
    create: async (justificationData) => {
        console.log('Creando justificación:', justificationData);
        const response = await axiosClient.post(API_ENDPOINTS.JUSTIFICATIONS.CREATE, justificationData);
        console.log('Respuesta crear:', response);
        return response.data;
    },

    // Listar todas las justificaciones con filtros (Admin)
    list: async (params = {}) => {
        const { page = 0, size = 20, employeeId, status, documentType, startDate, endDate, sortBy = "createdAt", direction = "DESC" } = params;
        const queryParams = new URLSearchParams({ page, size, sortBy, direction });
        
        if (employeeId) queryParams.append('employeeId', employeeId);
        if (status) queryParams.append('status', status);
        if (documentType) queryParams.append('documentType', documentType);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        const url = `${API_ENDPOINTS.JUSTIFICATIONS.LIST}?${queryParams}`;
        console.log('URL de justificaciones:', url);
        console.log('Parámetros completos:', params);
        
        const response = await axiosClient.get(url);
        console.log('Respuesta del servidor:', response);
        return response.data;
    },

    // Mis justificaciones (Empleado)
    getMyJustifications: async (params = {}) => {
        const { page = 0, size = 20, status, documentType, startDate, endDate, sortBy = "createdAt", direction = "DESC" } = params;
        const queryParams = new URLSearchParams({ page, size, sortBy, direction });
        
        if (status) queryParams.append('status', status);
        if (documentType) queryParams.append('documentType', documentType);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        const response = await axiosClient.get(`${API_ENDPOINTS.JUSTIFICATIONS.MY_JUSTIFICATIONS}?${queryParams}`);
        return response.data;
    },

    // Obtener justificación por ID
    getById: async (id) => {
        const response = await axiosClient.get(API_ENDPOINTS.JUSTIFICATIONS.GET_BY_ID.replace(':id', id));
        return response.data;
    },

    // Procesar justificación (Aprobar/Rechazar) - Admin
    processJustification: async (id, decision) => {
        const response = await axiosClient.patch(API_ENDPOINTS.JUSTIFICATIONS.DECISION.replace(':id', id), decision);
        return response.data;
    },

    // Obtener conteo de justificaciones pendientes - Admin
    getPendingCount: async () => {
        const response = await axiosClient.get(API_ENDPOINTS.JUSTIFICATIONS.PENDING_COUNT);
        return response.data;
    }
};
