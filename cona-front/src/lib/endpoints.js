export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        CHANGE_PASSWORD: "/auth/change-password",
    },
    EMPLOYEES: {
        LIST: "/employees",
        CREATE: "/employees",
        UPDATE: "/employees/:id",
        DELETE: "/employees/:id",
    },
    ATTENDANCE: {
        LIST: "/attendance",
        CHECK_IN: "/attendance/check-in",

        CHECK_OUT: "/attendance/check-out",
    },
    JUSTIFICATIONS: {
        LIST: "/justifications",
        CREATE: "/justifications",
        APPROVE: "/justifications/:id/approve",
        REJECT: "/justifications/:id/reject",
    },
    VACATIONS: {
        LIST: "/vacations",
        CREATE: "/vacations",
        APPROVE: "/vacations/:id/approve",
        REJECT: "/vacations/:id/reject",
    },
    CONFIG: {
        GET: "/config",
        UPDATE: "/config",
    },
};
