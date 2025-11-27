import axiosClient from "../../kernel/axiosClient.js";
import { tokenManager } from "../../auth/utils/tokenManager.js";

const getUserId = () => {
  const user = tokenManager.getUser();
  if (!user || !user.id) {
    throw new Error('Usuario no autenticado');
  }
  return user.id;
};

export const vacationsService = {
  // Create new vacation request
  createRequest: async (requestData) => {
    try {
      const userId = getUserId();
      const response = await axiosClient.post(`/leave-requests/user/${userId}`, requestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employee's vacation requests
  getMyRequests: async () => {
    try {
      const userId = getUserId();
      const response = await axiosClient.get(`/leave-requests/user/${userId}/requests`);
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
  }
};