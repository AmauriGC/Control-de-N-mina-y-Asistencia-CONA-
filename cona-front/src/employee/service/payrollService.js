import axiosClient from '@/kernel/axiosClient'
import { API_ENDPOINTS } from '@/lib/endpoints'

export const payrollService = {
    /**
     * Obtener la última nómina de un empleado
     */
    async getLatestPayroll(employeeId) {
        try {
            const url = API_ENDPOINTS.PAYROLL.GET_LATEST.replace(':employeeId', employeeId)
            console.log('Calling payroll URL:', url)
            const response = await axiosClient.get(url)
            console.log('Payroll API response:', response)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Payroll API error:', error)
            return {
                success: false,
                message: error.message || error.response?.data?.message || 'Error al obtener la nómina',
                error
            }
        }
    },

    /**
     * Obtener el detalle de una nómina específica
     */
    async getPayrollDetail(employeeId, periodStart, periodEnd) {
        try {
            const url = API_ENDPOINTS.PAYROLL.GET_DETAIL.replace(':employeeId', employeeId)
            const response = await axiosClient.get(url, {
                params: {
                    periodStart,
                    periodEnd
                }
            })
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener el detalle de la nómina',
                error
            }
        }
    },

    /**
     * Obtener todas las nóminas de un empleado
     */
    async getEmployeePayrolls(employeeId) {
        try {
            const url = API_ENDPOINTS.PAYROLL.GET_BY_EMPLOYEE.replace(':employeeId', employeeId)
            const response = await axiosClient.get(url)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al obtener las nóminas del empleado',
                error
            }
        }
    },

    /**
     * Calcular nómina para un empleado en un período específico
     */
    async calculatePayroll(employeeId, periodStart, periodEnd) {
        try {
            const response = await axiosClient.post(API_ENDPOINTS.PAYROLL.CALCULATE, {
                employeeId,
                periodStart,
                periodEnd
            })
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al calcular la nómina',
                error
            }
        }
    },

    /**
     * Formatear período de nómina para mostrar
     */
    formatPayrollPeriod(periodStart, periodEnd) {
        const start = new Date(periodStart).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short'
        })
        const end = new Date(periodEnd).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        return `${start} - ${end}`
    },

    /**
     * Formatear moneda mexicana
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0)
    }
}