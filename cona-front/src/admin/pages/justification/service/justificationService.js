import axiosClient from '@/kernel/axiosClient'

export const justificationService = {
    async listAll() {
        try {
            const res = await axiosClient.get('/justifications')
            return {success: res.success, data: res.data, message: res.message}
        } catch (error) {
            return {success: false, message: error.message || 'Error al cargar justificaciones'}
        }
    },

    async listByEmployee(employeeId) {
        try {
            const res = await axiosClient.get(`/justifications/employee/${employeeId}`)
            return {success: res.success, data: res.data, message: res.message}
        } catch (error) {
            return {success: false, message: error.message || 'Error al cargar mis justificaciones'}
        }
    },

    async submit({employeeId, attendanceId, documentType, reason}, file) {
        try {
            const form = new FormData()
            const json = JSON.stringify({employeeId, attendanceId, documentType, reason})
            form.append('payload', new File([json], 'payload.json', {type: 'application/json'}))
            if (file) form.append('file', file)
            const res = await axiosClient.post('/justifications', form, {headers: {'Content-Type': 'multipart/form-data'}})
            return {success: res.success, data: res.data, message: res.message}
        } catch (error) {
            return {success: false, message: error.message || 'Error al enviar la justificación'}
        }
    },

    async approve(id, adminUserId, adminComments) {
        try {
            const res = await axiosClient.post(`/justifications/${id}/approve`, null, {
                params: {
                    adminUserId,
                    adminComments
                }
            })
            return {success: res.success, data: res.data, message: res.message}
        } catch (error) {
            return {success: false, message: error.message || 'Error al aprobar la justificación'}
        }
    },

    async reject(id, adminUserId, adminComments) {
        try {
            const res = await axiosClient.post(`/justifications/${id}/reject`, null, {
                params: {
                    adminUserId,
                    adminComments
                }
            })
            return {success: res.success, data: res.data, message: res.message}
        } catch (error) {
            return {success: false, message: error.message || 'Error al rechazar la justificación'}
        }
    },

    async openDocument(id) {
        try {
            const res = await axiosClient.get(`/justifications/${id}/file/raw`, {responseType: 'blob'})
            const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data || res], {type: res?.type || 'application/octet-stream'})
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank', 'noopener,noreferrer')
            setTimeout(() => URL.revokeObjectURL(url), 60_000)
            return {success: true}
        } catch (error) {
            return {success: false, message: error.message || 'No se pudo abrir el documento'}
        }
    },

    async getDocumentUrl(id) {
        try {
            const res = await axiosClient.get(`/justifications/${id}/file/raw`, {responseType: 'blob'})
            const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data || res], {type: res?.type || 'application/octet-stream'})
            const url = URL.createObjectURL(blob)
            return {success: true, url, type: blob.type}
        } catch (error) {
            return {success: false, message: error.message || 'No se pudo obtener el documento'}
        }
    }
}
