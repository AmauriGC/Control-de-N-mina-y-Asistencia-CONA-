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
        // Solo agregar token si no se especifica skipAuth
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
        // El backend usa ApiResponse {success, message, data}
        const body = response.data;
        if (body && typeof body === 'object' && 'success' in body) {
            return {
                success: body.success,
                message: body.message,
                data: body.data,
                errors: Array.isArray(body.data) ? body.data : [],
                status: response.status,
            };
        }
        // Fallback por si alguna ruta no usa ApiResponse
        return {
            success: true,
            message: '',
            data: body,
            errors: [],
            status: response.status,
        };
    },
    (error) => {
        if (error.response) {
            const {status, data} = error.response;

            if (status === 401 || status === 403) {
                tokenManager.clearAll();
                const requestUrl = error.config?.url || "";
                const isAuthLogin = requestUrl.includes("/auth/login");
                const isOnLoginPage = window.location.pathname === "/login";
                if (!isAuthLogin && !isOnLoginPage) {
                    window.location.assign("/login");
                }
            }

            return Promise.reject({
                success: false,
                message: data?.message || "Error en la solicitud",
                status,
                data: data?.data || null,
                errors: Array.isArray(data?.data) ? data.data : [],
            });
        }

        return Promise.reject({
            success: false,
            message: error.message || "Error de conexión",
            status: 0,
            errors: [],
        });
    }
);

export default axiosClient;
