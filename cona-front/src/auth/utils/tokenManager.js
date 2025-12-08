const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";
const LEGACY_USER_KEY = "user";

function safeParse(json) {
    if (json == null) return null;
    const trimmed = String(json).trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
    try {
        return JSON.parse(trimmed);
    } catch (e) {
        console.warn("[tokenManager] JSON inválido en almacenamiento, limpiando...", e);
        return null;
    }
}

export const tokenManager = {
    getToken: () => localStorage.getItem(TOKEN_KEY),

    setToken: (token) => {
        if (token == null || token === "undefined") {
            localStorage.removeItem(TOKEN_KEY);
        } else {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    getUser: () => {
        const raw = localStorage.getItem(USER_KEY) ?? localStorage.getItem(LEGACY_USER_KEY);
        const parsed = safeParse(raw);
        if (!parsed) {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(LEGACY_USER_KEY);
            return null;
        }
        return parsed;
    },

    setUser: (user) => {
        if (!user || typeof user !== "object") {
            localStorage.removeItem(USER_KEY);
            return;
        }
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
            console.error("[tokenManager] No se pudo serializar usuario", e);
        }
    },

    clearAll: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
    },
};
