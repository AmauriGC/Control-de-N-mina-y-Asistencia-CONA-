export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        LOGIN_GOOGLE: "/auth/google",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        CHANGE_PASSWORD: "/auth/change-password",
    },
    EMPLOYEES: {
        LIST: "/employees",
        CREATE: "/employees",
        GET_BY_ID: "/employees/:id",
        GET_BY_USER_ID: "/employees/by-user/:userId",
        UPDATE: "/employees/:id",
        TOGGLE_STATUS: "/employees/:id/status",
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
    HOLIDAYS: {
        LIST: "/holidays",
        CREATE: "/holidays",
        GET_BY_ID: "/holidays/:id",
        UPDATE: "/holidays/:id",
        DELETE: "/holidays/:id",
    },
    PAYROLL_CONFIG: {
        GET: "/payroll-config",
        UPDATE: "/payroll-config",
    },
    SYSTEM_CONFIG: {
        HOLIDAYS: {
            LIST: "/system-config/holidays",
            CREATE: "/system-config/holidays",
            GET_BY_ID: "/system-config/holidays/:id",
            UPDATE: "/system-config/holidays/:id",
            DELETE: "/system-config/holidays/:id",
        },
        WORK_SCHEDULES: {
            LIST: "/system-config/work-schedules",
            ACTIVE: "/system-config/work-schedules/active",
            CREATE: "/system-config/work-schedules",
            GET_BY_ID: "/system-config/work-schedules/:id",
            UPDATE: "/system-config/work-schedules/:id",
            TOGGLE_STATUS: "/system-config/work-schedules/:id/toggle-status",
            DELETE: "/system-config/work-schedules/:id",
        },
        PAYROLL_CONFIG: {
            GET: "/system-config/payroll-config",
            UPDATE: "/system-config/payroll-config",
        },
    },
    PAYROLL: {
        LIST: "/api/payroll",
        CALCULATE: "/api/payroll/calculate",
        GET_BY_EMPLOYEE: "/api/payroll/employee/:employeeId",
        GET_DETAIL: "/api/payroll/employee/:employeeId/detail",
        GET_LATEST: "/api/payroll/employee/:employeeId/latest",
    },
    DASHBOARD: {
        TODAY: "/dashboard/today",
        PENDING_JUSTIFICATIONS: "/dashboard/justifications/pending",
        CONTRACT_ALERTS: "/dashboard/contracts/alerts",
        WEEKLY_ATTENDANCE: "/dashboard/weekly-attendance",
        MONTHLY_OVERTIME: "/dashboard/monthly-overtime",
        WEEKLY_PAYROLL: "/dashboard/weekly-payroll",
    }
}
