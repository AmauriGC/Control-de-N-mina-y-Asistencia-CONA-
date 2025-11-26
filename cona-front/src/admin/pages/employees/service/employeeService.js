import axiosClient from "@/kernel/axiosClient";
import {API_ENDPOINTS} from "@/lib/endpoints";

export const employeeService = {
    // Registrar un nuevo empleado
    register: async (employeeData) => {
        const response = await axiosClient.post(API_ENDPOINTS.EMPLOYEES.CREATE, employeeData);
        return response.data;
    },

    // Listar empleados con paginación y filtros
    list: async (params = {}) => {
        const {page = 0, size = 10, name, status} = params;
        const queryParams = new URLSearchParams({page, size});
        if (name) queryParams.append('name', name);
        if (status) queryParams.append('status', status);
        const response = await axiosClient.get(`${API_ENDPOINTS.EMPLOYEES.LIST}?${queryParams}`);
        return response.data;
    },

    // Obtener empleado por ID
    getById: async (id) => {
        const response = await axiosClient.get(API_ENDPOINTS.EMPLOYEES.GET_BY_ID.replace(':id', id));
        return response.data;
    },

    // Obtener empleado por ID de usuario
    getByUserId: async (userId) => {
        const response = await axiosClient.get(API_ENDPOINTS.EMPLOYEES.GET_BY_USER_ID.replace(':userId', userId));
        return response.data;
    },

    // Cambiar estado del empleado
    toggleStatus: async (id) => {
        const response = await axiosClient.patch(API_ENDPOINTS.EMPLOYEES.TOGGLE_STATUS.replace(':id', id));
        return response.data;
    },

    // Actualizar empleado
    update: async (id, employeeData) => {
        const response = await axiosClient.put(API_ENDPOINTS.EMPLOYEES.UPDATE.replace(':id', id), employeeData);
        return response.data;
    },
};
