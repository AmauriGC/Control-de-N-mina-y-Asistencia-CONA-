import axiosClient from '@/kernel/axiosClient'

export const payrollService = {
    /**
     * Obtener la última nómina de un empleado
     */
    async getLatestPayroll(employeeId) {
        try {
            const res = await axiosClient.get(`/payroll/employee/${employeeId}/latest`)
            return { success: res.success, data: res.data, message: res.message }
        } catch (error) {
            return { success: false, message: error.message }
        }
    },

    /**
     * Descargar en PDF la última nómina del empleado
     */
    async downloadLatestPayrollPdf(employeeId) {
        try {
            const res = await axiosClient.get(`/payroll/employee/${employeeId}/latest/pdf/raw`, {
                responseType: 'blob',
                headers: { Accept: 'application/pdf' }
            })
            // El interceptor retorna el blob directamente como data
            return { success: true, data: res }
        } catch (error) {
            return { success: false, message: error.message }
        }
    },

    /**
     * Obtener el detalle de una nómina específica
     */
    async getPayrollDetail(employeeId, periodStart, periodEnd) {
        try {
            if (!employeeId) throw new Error('Empleado requerido')
            if (!periodStart || !periodEnd) throw new Error('Periodo requerido')
            const res = await axiosClient.get(`/payroll/detail/${employeeId}`, { params: { periodStart, periodEnd } })
            return { success: res.success, data: res.data, message: res.message }
        } catch (error) {
            return { success: false, message: error.message }
        }
    },

    /**
     * Obtener todas las nóminas de un empleado
     */
    async getEmployeePayrolls(employeeId) {
        try {
            const res = await axiosClient.get(`/payroll/employee/${employeeId}`)
            return { success: res.success, data: res.data, message: res.message }
        } catch (error) {
            return { success: false, message: error.message }
        }
    },

    /**
     * Calcular nómina para un empleado en un período específico
     */
    async calculatePayroll(employeeId, periodStart, periodEnd) {
        try {
            if (!employeeId) throw new Error('Empleado requerido')
            if (!periodStart || !periodEnd) throw new Error('Periodo requerido')
            const res = await axiosClient.post(`/payroll/calculate/${employeeId}`, null, { params: { periodStart, periodEnd } })
            return { success: res.success, data: res.data, message: res.message }
        } catch (error) {
            return { success: false, message: error.message }
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
            const res = await axiosClient.get(`/payroll/employee/${employeeId}`, { params: { page, size } })
            return { success: res.success, data: res.data, message: res.message }
        } catch (error) {
            return { success: false, message: error.message }
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