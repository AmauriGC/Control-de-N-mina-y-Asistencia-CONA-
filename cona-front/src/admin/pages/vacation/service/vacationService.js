import axiosClient from "../../../../kernel/axiosClient.js";

export const vacationService = {
  // Get all vacation requests for admin
  getAllRequests: async (page = 0, size = 10, status = null, employeeName = null) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (employeeName) {
        params.append('employeeName', employeeName);
      }
      const res = await axiosClient.get(`/leave-requests?${params.toString()}`);
      return { success: res.success, message: res.message, data: res.data };
    } catch (error) {
      return { success: false, message: error.message || 'Error al listar solicitudes', data: { content: [], total: 0 } };
    }
  },

  // Get single vacation request
  getById: async (id) => {
    try {
      const res = await axiosClient.get(`/leave-requests/${id}`);
      return { success: res.success, message: res.message, data: res.data };
    } catch (error) {
      return { success: false, message: error.message || 'Error al obtener solicitud', data: null };
    }
  },

  // Review vacation request (approve/reject)
  reviewRequest: async (id, approved, comments = '') => {
    try {
      const { tokenManager } = await import('../../../../auth/utils/tokenManager.js');
      const user = tokenManager.getUser();
      if (!user || !user.id) {
        return { success: false, message: 'Usuario no autenticado' };
      }
      const res = await axiosClient.post(`/leave-requests/${id}/review/user/${user.id}`, { approved, comments });
      return { success: res.success, message: res.message, data: res.data };
    } catch (error) {
      return { success: false, message: error.message || 'Error al revisar solicitud', data: null };
    }
  },

  // Get pending requests count
  getPendingCount: async () => {
    try {
      const res = await axiosClient.get('/leave-requests/stats/pending');
      return { success: res.success, message: res.message, data: res.data };
    } catch (error) {
      return { success: false, message: error.message || 'Error al obtener pendientes', data: 0 };
    }
  }
};