import axiosClient from '../../kernel/axiosClient'

export const attendanceService = {
  // Check-in/check-out (público - no requiere token)
  async checkInOut(employeeKey) {
    try {
      const response = await axiosClient.post('/attendance/check-in-out', { employeeKey }, { skipAuth: true })
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Error al procesar la asistencia' }
    }
  },

  // Obtener asistencia de empleado
  async getEmployeeAttendance(employeeId) {
    try {
      const response = await axiosClient.get(`/attendance/employee/${employeeId}`)
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      const backendErrors = error?.data
      return { success: false, message: error.message || 'Error al obtener la asistencia', errors: Array.isArray(backendErrors) ? backendErrors : [] }
    }
  },

  // Obtener asistencia por rango de fechas
  async getEmployeeAttendanceRange(employeeId, startDate, endDate) {
    try {
      const response = await axiosClient.post(`/attendance/employee/${employeeId}/range`, { startDate, endDate })
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      const backendErrors = error?.data
      return { success: false, message: error.message || 'Error al obtener la asistencia', errors: Array.isArray(backendErrors) ? backendErrors : [] }
    }
  },

  // Obtener estadísticas de asistencia
  async getEmployeeStats(employeeId, startDate, endDate) {
    try {
      const response = await axiosClient.get(`/attendance/employee/${employeeId}/stats`, { params: { startDate, endDate } })
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Error al obtener las estadísticas' }
    }
  },

  // Obtener asistencia del día actual (solo admin)
  async getTodayAttendance() {
    try {
      const response = await axiosClient.get('/attendance/today')
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Error al obtener la asistencia del día' }
    }
  },

  // Obtener asistencia reciente por empleado
  async getRecentEmployeeAttendance(employeeId, limit = 4) {
    try {
      const response = await axiosClient.get(`/attendance/employee/${employeeId}/recent`, { params: { limit } })
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Error al obtener la asistencia reciente' }
    }
  },

  // Obtener conteos del día (presentes y total activos)
  async getTodayCounts() {
    try {
      const response = await axiosClient.get('/attendance/today/counts')
      return { success: response.success, data: response.data, message: response.message }
    } catch (error) {
      return { success: false, message: error.message || 'Error al obtener los conteos de asistencia' }
    }
  },

  // Obtener asistencia paginada de empleado
  async getEmployeeAttendancePaginated(employeeId, page = 0, size = 15, startDate = null, endDate = null) {
    try {
      const params = { page, size }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await axiosClient.get(`/attendance/employee/${employeeId}/paginated`, { params })
      return { success: response.success !== undefined ? response.success : true, data: response.data, message: response.message }
    } catch (error) {
      const isNotFound = error?.status === 422
      if (isNotFound) {
        return { success: false, message: `Empleado con ID ${employeeId} no encontrado o inválido` }
      }
      return { success: false, message: error.message || 'Error al obtener la asistencia paginada' }
    }
  }
}