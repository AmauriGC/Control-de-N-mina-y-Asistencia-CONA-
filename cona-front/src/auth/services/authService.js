import axiosClient from "../../kernel/axiosClient.js";
import { tokenManager } from "../utils/tokenManager";
import { API_ENDPOINTS } from "@/lib/endpoints";

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.success && response.data) {
        const { token, expiresAt } = response.data;
        if (!token) {
          return { success: false, message: "Token no recibido" };
        }
        const payload = decodeJwtPayload(token);
        if (!payload) {
          return { success: false, message: "Token inválido" };
        }
        const role = String(payload.role || "").toLowerCase();
        const user = {
          id: payload.id,
          email: payload.email || payload.sub,
          role,
          tokenExpiresAt: expiresAt,
        };
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        return { success: true, user, token };
      }

      return {
        success: false,
        message: response.message || "Error al iniciar sesión",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al iniciar sesión",
      };
    }
  },

  loginWithGoogle: async (idToken) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN_GOOGLE, {
        idToken,
      });

      if (response.success && response.data) {
        const { token, expiresAt } = response.data;
        if (!token) {
          return { success: false, message: "Token no recibido" };
        }
        const payload = decodeJwtPayload(token);
        if (!payload) {
          return { success: false, message: "Token inválido" };
        }
        const role = String(payload.role || "").toLowerCase();
        const user = {
          id: payload.id,
          email: payload.email || payload.sub,
          role,
          tokenExpiresAt: expiresAt,
        };
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        return { success: true, user, token };
      }

      return {
        success: false,
        message: response.message || "Error al iniciar sesión con Google",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al iniciar sesión con Google",
      };
    }
  },

  logout: async () => {
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      tokenManager.clearAll();
    }
  },

  getCurrentUser: () => {
    return tokenManager.getUser();
  },

  isAuthenticated: () => {
    const token = tokenManager.getToken();
    const user = tokenManager.getUser();
    if (!(token && user)) return false;
    if (user.tokenExpiresAt) {
      const expDate = new Date(user.tokenExpiresAt).getTime();
      if (Date.now() > expDate) {
        tokenManager.clearAll();
        return false;
      }
    }
    return true;
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al enviar solicitud de recuperación",
      };
    }
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
        confirmPassword,
      });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al restablecer contraseña",
      };
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al cambiar contraseña",
      };
    }
  },
};
