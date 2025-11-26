import axiosClient from "@/kernel/axiosClient";
import { API_ENDPOINTS } from "@/lib/endpoints";

export const holidayService = {
  async getAll(params = {}) {
    return await axiosClient.get(API_ENDPOINTS.HOLIDAYS.LIST, { params });
  },

  async create(holidayData) {
    return await axiosClient.post(API_ENDPOINTS.HOLIDAYS.CREATE, holidayData);
  },

  async update(id, holidayData) {
    return await axiosClient.put(API_ENDPOINTS.HOLIDAYS.UPDATE.replace(':id', id), holidayData);
  },

  async delete(id) {
    return await axiosClient.delete(API_ENDPOINTS.HOLIDAYS.DELETE.replace(':id', id));
  },

  async getById(id) {
    return await axiosClient.get(API_ENDPOINTS.HOLIDAYS.GET_BY_ID.replace(':id', id));
  },
};

export const payrollConfigService = {
  async get() {
    return await axiosClient.get(API_ENDPOINTS.PAYROLL_CONFIG.GET);
  },

  async update(configData) {
    return await axiosClient.put(API_ENDPOINTS.PAYROLL_CONFIG.UPDATE, configData);
  },
};

export const systemConfigService = {
  holidays: {
    async getAll(params = {}) {
      return await axiosClient.get(API_ENDPOINTS.SYSTEM_CONFIG.HOLIDAYS.LIST, { params });
    },
    async create(holidayData) {
      return await axiosClient.post(API_ENDPOINTS.SYSTEM_CONFIG.HOLIDAYS.CREATE, holidayData);
    },
    async update(id, holidayData) {
      return await axiosClient.put(API_ENDPOINTS.SYSTEM_CONFIG.HOLIDAYS.UPDATE.replace(':id', id), holidayData);
    },
    async delete(id) {
      return await axiosClient.delete(API_ENDPOINTS.SYSTEM_CONFIG.HOLIDAYS.DELETE.replace(':id', id));
    },
    async getById(id) {
      return await axiosClient.get(API_ENDPOINTS.SYSTEM_CONFIG.HOLIDAYS.GET_BY_ID.replace(':id', id));
    },
  },
  workSchedules: {
    async getAll(params = {}) {
      return await axiosClient.get(API_ENDPOINTS.SYSTEM_CONFIG.WORK_SCHEDULES.LIST, { params });
    },
    async create(workScheduleData) {
      return await axiosClient.post(API_ENDPOINTS.SYSTEM_CONFIG.WORK_SCHEDULES.CREATE, workScheduleData);
    },
    async update(id, workScheduleData) {
      return await axiosClient.put(API_ENDPOINTS.SYSTEM_CONFIG.WORK_SCHEDULES.UPDATE.replace(':id', id), workScheduleData);
    },
    async delete(id) {
      return await axiosClient.delete(API_ENDPOINTS.SYSTEM_CONFIG.WORK_SCHEDULES.DELETE.replace(':id', id));
    },
    async getById(id) {
      return await axiosClient.get(API_ENDPOINTS.SYSTEM_CONFIG.WORK_SCHEDULES.GET_BY_ID.replace(':id', id));
    },
  },
  payrollConfig: {
    async get() {
      return await axiosClient.get(API_ENDPOINTS.SYSTEM_CONFIG.PAYROLL_CONFIG.GET);
    },
    async update(configData) {
      return await axiosClient.put(API_ENDPOINTS.SYSTEM_CONFIG.PAYROLL_CONFIG.UPDATE, configData);
    },
  },
};
