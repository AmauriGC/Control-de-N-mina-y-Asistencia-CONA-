import axiosClient from '@/kernel/axiosClient'

export const payrollService = {
    /**
     * Obtener la última nómina de un empleado
     */
    async getLatestPayroll(employeeId) {
        try {
            return await axiosClient.get(`/payroll/employee/${employeeId}/latest`)
        } catch (error) {
            return error
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
            return { success: false, message: error.message, error }
        }
    },

    /**
     * Obtener el detalle de una nómina específica
     */
    async getPayrollDetail(employeeId, periodStart, periodEnd) {
        try {
            // Validación básica: fechas presentes y orden
            if (!employeeId) throw new Error('Empleado requerido')
            if (!periodStart || !periodEnd) throw new Error('Periodo requerido')
            return await axiosClient.get(`/payroll/detail/${employeeId}`, { params: { periodStart, periodEnd } })
        } catch (error) {
            return error
        }
    },

    /**
     * Obtener todas las nóminas de un empleado
     */
    async getEmployeePayrolls(employeeId) {
        try {
            return await axiosClient.get(`/payroll/employee/${employeeId}`)
        } catch (error) {
            return error
        }
    },

    /**
     * Calcular nómina para un empleado en un período específico
     */
    async calculatePayroll(employeeId, periodStart, periodEnd) {
        try {
            if (!employeeId) throw new Error('Empleado requerido')
            if (!periodStart || !periodEnd) throw new Error('Periodo requerido')
            return await axiosClient.post(`/payroll/calculate/${employeeId}`, null, { params: { periodStart, periodEnd } })
        } catch (error) {
            return error
        }
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
            return await axiosClient.get(`/payroll/employee/${employeeId}`, { params: { page, size } })
        } catch (error) {
            return error
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
        const labels = { DRAFT: 'Borrador', CALCULATED: 'Calculada', APPROVED: 'Aprobada', PAID: 'Pagada', CANCELLED: 'Cancelada' }
        return labels[status] || status
    },

    /**
     * Obtener variantes de color para estados
     */
    getPayrollStatusVariant(status) {
        const variants = { DRAFT: 'secondary', CALCULATED: 'outline', APPROVED: 'default', PAID: 'success', CANCELLED: 'destructive' }
        return variants[status] || 'secondary'
    }
}