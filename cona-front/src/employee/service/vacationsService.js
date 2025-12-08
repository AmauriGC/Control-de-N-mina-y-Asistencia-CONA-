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
      const res = await axiosClient.post(`/leave-requests/user/${userId}`, requestData);
      return { success: res.success, data: res.data, message: res.message }
    } catch (error) {
      const backendErrors = error?.data
      return { success: false, message: error.message, errors: Array.isArray(backendErrors) ? backendErrors : [] }
    }
  },

  // Get employee's vacation requests
  getMyRequests: async () => {
    try {
      const userId = getUserId();
      const res = await axiosClient.get(`/leave-requests/user/${userId}/requests`);
      return { success: res.success, data: res.data, message: res.message }
    } catch (error) {
      const backendErrors = error?.data
      return { success: false, message: error.message, errors: Array.isArray(backendErrors) ? backendErrors : [] }
    }
  },

  // Get single vacation request
  getById: async (id) => {
    try {
      const res = await axiosClient.get(`/leave-requests/${id}`);
      return { success: res.success, data: res.data, message: res.message }
    } catch (error) {
      const backendErrors = error?.data
      return { success: false, message: error.message, errors: Array.isArray(backendErrors) ? backendErrors : [] }
    }
  }
};