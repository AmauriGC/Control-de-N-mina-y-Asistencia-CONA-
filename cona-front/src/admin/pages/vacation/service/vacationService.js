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
      
      const response = await axiosClient.get(`/leave-requests?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single vacation request
  getById: async (id) => {
    try {
      const response = await axiosClient.get(`/leave-requests/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Review vacation request (approve/reject)
  reviewRequest: async (id, approved, comments = '') => {
    try {
      // Import tokenManager here to avoid circular imports
      const { tokenManager } = await import('../../../../auth/utils/tokenManager.js');
      const user = tokenManager.getUser();
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }
      const response = await axiosClient.post(`/leave-requests/${id}/review/user/${user.id}`, {
        approved,
        comments
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get pending requests count
  getPendingCount: async () => {
    try {
      const response = await axiosClient.get('/leave-requests/stats/pending');
      return response;
    } catch (error) {
      throw error;
    }
  }
};