import axios from "axios";
import {tokenManager} from "../auth/utils/tokenManager.js";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/cona-api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        if (!config.skipAuth) {
            const token = tokenManager.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => {
        // El backend retorna ApiResponse { success, message, data, timestamp, path }
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const backendResponse = error.response?.data; // ApiResponse cuando existe
        const normalizedError = {
            status,
            message: backendResponse?.message || error.message || "Error de solicitud",
            data: backendResponse?.data,
            path: backendResponse?.path,
            success: false,
        };

        // Manejo de auth: en 401/403, limpiar token; la redirección debe manejarse en capa superior
        if (status === 401 || status === 403) {
            try {
                tokenManager.clearToken?.();
            } catch (_) {}
        }

        return Promise.reject(normalizedError);
    }
);

export default axiosClient;
