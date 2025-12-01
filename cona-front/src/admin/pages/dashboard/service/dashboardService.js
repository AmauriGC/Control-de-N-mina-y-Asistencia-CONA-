import axiosClient from "@/kernel/axiosClient";
import { API_ENDPOINTS } from "@/lib/endpoints";

export const dashboardService = {

  // --- PRESENTES HOY + EMPLEADOS ACTIVOS ---
  getTodayCounts: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DASHBOARD.TODAY);
      return response.data;
    } catch (error) {
      console.error("Error fetching today's counts:", error);
      return { presentCount: 0, activeEmployeesCount: 0 };
    }
  },

  // --- JUSTIFICACIONES PENDIENTES ---
  getPendingJustifications: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DASHBOARD.PENDING_JUSTIFICATIONS);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching pending justifications:", error);
      return [];
    }
  },

  // --- CONTRATOS POR VENCER ---
  getContractAlerts: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DASHBOARD.CONTRACT_ALERTS);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching contract alerts:", error);
      return [];
    }
  },

  // --- RESUMEN SEMANAL DE ASISTENCIA ---
  getWeeklyAttendance: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DASHBOARD.WEEKLY_ATTENDANCE);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching weekly attendance:", error);
      return [];
    }
  },

  // --- HORAS EXTRA MENSUALES ---
  getMonthlyOvertime: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DASHBOARD.MONTHLY_OVERTIME);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching monthly overtime:", error);
      return [];
    }
  },

  // --- NÓMINA SEMANAL ---
  getWeeklyPayroll: async () => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DASHBOARD.WEEKLY_PAYROLL);
      return response.data || null;
    } catch (error) {
      console.error("Error fetching weekly payroll:", error);
      return null;
    }
  },
};
