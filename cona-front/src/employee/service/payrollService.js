import axiosClient from '@/kernel/axiosClient'
import { API_ENDPOINTS } from '@/lib/endpoints'

export const payrollService = {
    /**
     * Obtener la última nómina de un empleado
     */
    async getLatestPayroll(employeeId) {
        try {
            // Usar la ruta correcta del backend
            const response = await axiosClient.get(`/payroll/employee/${employeeId}/latest`)
            console.log('Payroll API response:', response)
            return {
                success: response.success !== undefined ? response.success : true,
                data: response.data,
                message: response.message
            }
        } catch (error) {
            console.error('Payroll API error:', error)
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error al obtener la nómina',
                error
            }
        }
    },

    /**
     * Descargar en PDF la última nómina del empleado
     */
    async downloadLatestPayrollPdf(employeeId) {
        try {
            const blob = await axiosClient.get(`/payroll/employee/${employeeId}/latest/pdf`, {
                responseType: 'blob',
                headers: { Accept: 'application/pdf' }
            })
            return { success: true, data: blob }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al descargar el PDF de la nómina',
                error
            }
        }
    },

    /**
     * Obtener el detalle de una nómina específica
     */
    async getPayrollDetail(employeeId, periodStart, periodEnd) {
        try {
            const response = await axiosClient.get(`/payroll/detail/${employeeId}`, {
                params: {
                    periodStart,
                    periodEnd
                }
            })
            return {
                success: response.success !== undefined ? response.success : true,
                data: response.data,
                message: response.message
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
            const response = await axiosClient.get(`/payroll/employee/${employeeId}`)
            return {
                success: response.success !== undefined ? response.success : true,
                data: response.data,
                message: response.message
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
            const response = await axiosClient.post(`/payroll/calculate/${employeeId}`, null, {
                params: {
                    periodStart,
                    periodEnd
                }
            })
            return {
                success: response.success !== undefined ? response.success : true,
                data: response.data,
                message: response.message
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
        if (amount === null || amount === undefined || amount === 0) return '$0'
        const num = typeof amount === 'number' ? amount : parseFloat(amount)
        if (isNaN(num)) return '$0'
        
        // Si es un número entero, no mostrar decimales
        if (num % 1 === 0) {
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(num)
        }
        
        // Si tiene decimales, mostrar máximo 2
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num)
    },

    /**
     * Obtener historial de nóminas del empleado
     */
    async getEmployeePayrollHistory(employeeId, page = 0, size = 10) {
        try {
            const response = await axiosClient.get(`/payroll/employee/${employeeId}`, {
                params: { page, size }
            })
            return {
                success: response.success,
                data: response.data,
                message: response.message
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error al obtener el historial de nóminas'
            }
        }
    },

    /**
     * Formatear período de nómina con formato mejorado
     */
    formatPayrollPeriod(startDate, endDate) {
        if (!startDate || !endDate) return 'Período no definido'
        
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        const formatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }
        
        return `${start.toLocaleDateString('es-MX', formatOptions)} - ${end.toLocaleDateString('es-MX', formatOptions)}`
    },

    /**
     * Obtener etiquetas de estado de nómina
     */
    getPayrollStatusLabel(status) {
        const statusLabels = {
            'DRAFT': 'Borrador',
            'CALCULATED': 'Calculada',
            'APPROVED': 'Aprobada',
            'PAID': 'Pagada',
            'CANCELLED': 'Cancelada'
        }
        return statusLabels[status] || status
    },

    /**
     * Obtener variantes de color para estados
     */
    getPayrollStatusVariant(status) {
        const statusVariants = {
            'DRAFT': 'secondary',
            'CALCULATED': 'outline',
            'APPROVED': 'default',
            'PAID': 'success',
            'CANCELLED': 'destructive'
        }
        return statusVariants[status] || 'secondary'
    }
}