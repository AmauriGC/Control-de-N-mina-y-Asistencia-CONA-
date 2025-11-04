import api from '../../AxiosClient/axiosClient'

const authService = {
	async login(email, password) {
		const res = await api.post('/auth/login', { email, password })
		return res
	},
}

export default authService

