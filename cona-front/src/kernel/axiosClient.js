import axios from "axios";
import {tokenManager} from "../auth/utils/tokenManager.js";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = tokenManager.getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
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
            });
        }

        return Promise.reject({
            success: false,
            message: error.message || "Error de conexión",
            status: 0,
        });
    }
);

export default axiosClient;
