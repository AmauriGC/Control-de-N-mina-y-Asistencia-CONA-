import axiosClient from '../../kernel/axiosClient'

export const attendanceService = {
  // Check-in/check-out (público - no requiere token)
  async checkInOut(employeeKey) {
    try {
      const response = await axiosClient.post('/attendance/check-in-out', {
        employeeKey
      }, {
        // No agregar token para este endpoint público
        skipAuth: true
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar la asistencia'
      }
    }
  },

  // Obtener asistencia de empleado
  async getEmployeeAttendance(employeeId) {
    try {
      const response = await axiosClient.get(`/attendance/employee/${employeeId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener la asistencia'
      }
    }
  },

  // Obtener asistencia por rango de fechas
  async getEmployeeAttendanceRange(employeeId, startDate, endDate) {
    try {
      const response = await axiosClient.get(`/attendance/employee/${employeeId}/range`, {
        params: { startDate, endDate }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener la asistencia'
      }
    }
  },

  // Obtener estadísticas de asistencia
  async getEmployeeStats(employeeId, startDate, endDate) {
    try {
      const response = await axiosClient.get(`/attendance/employee/${employeeId}/stats`, {
        params: { startDate, endDate }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener las estadísticas'
      }
    }
  },

  // Obtener asistencia del día actual (solo admin)
  async getTodayAttendance() {
    try {
      const response = await axiosClient.get('/attendance/today')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener la asistencia del día'
      }
    }
  }
}