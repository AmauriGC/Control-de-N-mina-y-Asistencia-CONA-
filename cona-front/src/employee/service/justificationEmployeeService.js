import axiosClient from "@/kernel/axiosClient";
import {API_ENDPOINTS} from "@/lib/endpoints";

export const justificationEmployeeService = {
    // Crear nueva justificación
    create: async (justificationData) => {
        const response = await axiosClient.post(API_ENDPOINTS.JUSTIFICATIONS.CREATE, justificationData);
        return response.data;
    },

    // Mis justificaciones
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
    }
};