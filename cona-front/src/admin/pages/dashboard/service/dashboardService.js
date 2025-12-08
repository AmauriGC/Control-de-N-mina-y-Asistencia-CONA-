import axiosClient from "@/kernel/axiosClient";
import { API_ENDPOINTS } from "@/lib/endpoints";

export const dashboardService = {

  // --- PRESENTES HOY + EMPLEADOS ACTIVOS ---
  getTodayCounts: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.DASHBOARD.TODAY);
      return { success: res.success, message: res.message, data: res.data };
    } catch (error) {
      return { success: false, message: error.message || "Error al obtener conteos", data: null };
    }
  },

  // --- JUSTIFICACIONES PENDIENTES ---
  getPendingJustifications: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.DASHBOARD.PENDING_JUSTIFICATIONS);
      const list = Array.isArray(res?.data) ? res.data : [];
      return { success: true, message: res?.message || "", data: list };
    } catch (error) {
      return { success: false, message: error.message || "Error al obtener justificaciones", data: [] };
    }
  },

  // --- CONTRATOS POR VENCER ---
  getContractAlerts: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.DASHBOARD.CONTRACT_ALERTS);
      const list = Array.isArray(res?.data) ? res.data : [];
      return { success: true, message: res?.message || "", data: list };
    } catch (error) {
      return { success: false, message: error.message || "Error al obtener contratos por vencer", data: [] };
    }
  },

  // --- RESUMEN SEMANAL DE ASISTENCIA ---
  getWeeklyAttendance: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.DASHBOARD.WEEKLY_ATTENDANCE);
      const list = Array.isArray(res?.data) ? res.data : [];
      return { success: true, message: res?.message || "", data: list };
    } catch (error) {
      return { success: false, message: error.message || "Error al obtener asistencia semanal", data: [] };
    }
  },

  // --- HORAS EXTRA MENSUALES ---
  getMonthlyOvertime: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.DASHBOARD.MONTHLY_OVERTIME);
      const list = Array.isArray(res?.data) ? res.data : [];
      return { success: true, message: res?.message || "", data: list };
    } catch (error) {
      return { success: false, message: error.message || "Error al obtener horas extra", data: [] };
    }
  },

  // --- NÓMINA SEMANAL ---
  getWeeklyPayroll: async () => {
    try {
      const res = await axiosClient.get(API_ENDPOINTS.DASHBOARD.WEEKLY_PAYROLL);
      return { success: res.success, message: res.message, data: res.data || null };
    } catch (error) {
      return { success: false, message: error.message || "Error al obtener nómina semanal", data: null };
    }
  },
};
