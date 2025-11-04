import axios from "axios";
import Swal from "sweetalert2";

const baseURL = (import.meta.env.VITE_API_BASE_URL);

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
});

function getStoredAuth() {
  try {
    const raw = localStorage.getItem("cona.auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

axiosClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const api = response?.data;
    if (api && typeof api === "object" && "success" in api && "data" in api) {
      return {
        success: api.success,
        message: api.message,
        data: api.data,
        status: response.status,
      };
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const api = error?.response?.data;
    const msg = (api && api.message) || error.message || "Error";

    Swal.fire({ icon: "error", title: "Error", text: msg });

    if (status === 401) {
      localStorage.removeItem("cona.auth");
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    if (status === 403) {
      const auth = getStoredAuth();
      if (auth?.role) {
        const to = auth.role === "ADMIN" ? "/admin" : "/employee";
        window.location.replace(to);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
