import dayjs from 'dayjs';
import {VALIDATION_MESSAGES, VALIDATION_REGEX} from "@/components/criteria/validations";

// Reglas base reutilizables
export const rulesLib = {
    required: (msg = VALIDATION_MESSAGES.REQUIRED) => ({ test: (v) => String(v ?? "").trim().length > 0, message: msg }),
    minLength: (min = 1, msg = VALIDATION_MESSAGES.MIN_LENGTH(min)) => ({ test: (v) => String(v ?? "").trim().length >= min, message: msg }),
    maxLength: (max = 200, msg = VALIDATION_MESSAGES.MAX_LENGTH(max)) => ({ test: (v) => String(v ?? "").trim().length <= max, message: msg }),

    // Texto
    startsWithUpper: (msg = VALIDATION_MESSAGES.STARTS_WITH_UPPER) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            const first = s.charAt(0);
            return first === first.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(first);
        },
        message: msg,
    }),
    onlyLettersAndSpaces: (msg = VALIDATION_MESSAGES.ONLY_LETTERS_AND_SPACES) => ({ test: (v) => VALIDATION_REGEX.ONLY_LETTERS_AND_SPACES.test(String(v ?? "").trim()), message: msg }),
    onlyLetters: (msg = VALIDATION_MESSAGES.ONLY_LETTERS) => ({ test: (v) => VALIDATION_REGEX.ONLY_LETTERS.test(String(v ?? "").trim()), message: msg }),
    textGeneral: (msg = VALIDATION_MESSAGES.TEXT_GENERAL_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            return /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ,.;:()¿?!¡'"-]+$/.test(s);
        },
        message: msg,
    }),

    // Numéricos
    onlyNumbers: (msg = VALIDATION_MESSAGES.ONLY_NUMBERS) => ({ test: (v) => VALIDATION_REGEX.ONLY_NUMBERS.test(String(v ?? "").trim()), message: msg }),
    digitsBetween: (min = 1, max = 20, msg = VALIDATION_MESSAGES.INTEGER_RANGE(min, max)) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            const re = new RegExp(`^\\d{${min},${max}}$`);
            return re.test(s);
        },
        message: msg,
    }),
    // Alias deprecados: usar digitsBetween
    minDigits: (min = 1, msg = VALIDATION_MESSAGES.MIN_DIGITS(min)) => ({ test: (v) => rulesLib.digitsBetween(min, Infinity).test(v), message: msg }),
    maxDigits: (max = 1, msg = VALIDATION_MESSAGES.MAX_DIGITS(max)) => ({ test: (v) => rulesLib.digitsBetween(0, max).test(v), message: msg }),

    // Alfanuméricos y email
    alphanumeric: (msg = VALIDATION_MESSAGES.ALPHANUMERIC) => ({ test: (v) => VALIDATION_REGEX.ALPHANUMERIC.test(String(v ?? "").trim()), message: msg }),
    email: (msg = VALIDATION_MESSAGES.EMAIL_INVALID) => ({ test: (v) => VALIDATION_REGEX.EMAIL.test(String(v ?? "").trim()), message: msg }),
    emailDomain: (domains = [], msg = VALIDATION_MESSAGES.EMAIL_DOMAIN) => ({
        test: (v) => {
            const s = String(v ?? "").trim().toLowerCase();
            if (!VALIDATION_REGEX.EMAIL.test(s)) return false;
            const allowed = domains.map((d) => d.toLowerCase());
            return allowed.some((d) => s.endsWith(`@${d}`));
        },
        message: msg,
    }),

    // Password
    passwordPolicy: (opts = { length: 8 }, msg = VALIDATION_MESSAGES.PASSWORD_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "");
            if (!VALIDATION_REGEX.PASSWORD.test(s)) return false;
            if (opts?.length && s.length < opts.length) return false;
            return true;
        },
        message: msg,
    }),
    hasUppercase: (msg = VALIDATION_MESSAGES.PASSWORD_UPPERCASE) => ({ test: (v) => /[A-Z]/.test(String(v ?? "")), message: msg }),
    hasLowercase: (msg = VALIDATION_MESSAGES.PASSWORD_LOWERCASE) => ({ test: (v) => /[a-z]/.test(String(v ?? "")), message: msg }),
    hasDigit: (msg = VALIDATION_MESSAGES.PASSWORD_DIGIT) => ({ test: (v) => /\d/.test(String(v ?? "")), message: msg }),
    hasSpecial: (msg = VALIDATION_MESSAGES.PASSWORD_SPECIAL) => ({ test: (v) => /[@$!%*?&.]/.test(String(v ?? "")), message: msg }),

    // Decimales y formatos
    decimal2: (msg = VALIDATION_MESSAGES.DECIMAL_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            if (!VALIDATION_REGEX.DECIMAL_2.test(s)) return false;
            const n = Number(s.replace(",", "."));
            return !Number.isNaN(n) && n > 0;
        },
        message: msg,
    }),
    timeHHmm: (msg = VALIDATION_MESSAGES.TIME_INVALID) => ({ test: (v) => VALIDATION_REGEX.TIME_HHMM.test(String(v ?? "").trim()), message: msg }),
    integerRange: (min = 0, max = 100, msg = VALIDATION_MESSAGES.INTEGER_RANGE(min, max)) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!/^\d+$/.test(s)) return false;
            const n = parseInt(s, 10);
            return n >= min && n <= max;
        },
        message: msg,
    }),

    // RFC, teléfono, CLABE
    phoneMX: (msg = VALIDATION_MESSAGES.PHONE_INVALID) => ({ test: (v) => VALIDATION_REGEX.PHONE_MX.test(String(v ?? "").trim()), message: msg }),
    rfcMX: (msg = VALIDATION_MESSAGES.RFC_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "").trim().toUpperCase();
            if (!s) return false;
            return VALIDATION_REGEX.RFC_MX.test(s);
        },
        message: msg,
    }),
    clabe18: (msg = VALIDATION_MESSAGES.CLABE_INVALID) => ({ test: (v) => VALIDATION_REGEX.CLABE.test(String(v ?? "").trim()), message: msg }),

    // Combinadores y utilidades
    optional: (ruleObj) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return true;
            try { return ruleObj.test(s); } catch { return false; }
        },
        message: ruleObj.message,
    }),
    matchValue: (otherValue, message = "Los valores no coinciden") => ({ test: (v) => v === otherValue, message }),

    // Fechas
    isValidDate: (msg = VALIDATION_MESSAGES.DATE_INVALID) => ({ test: (v) => { if (!v) return false; return dayjs(v).isValid(); }, message: msg }),
    dateAfter: (minDate, msg = VALIDATION_MESSAGES.DATE_AFTER(minDate)) => ({
        test: (v) => { if (!v) return false; const date = dayjs(v); if (!date.isValid()) return false; return date.isAfter(dayjs(minDate)); },
        message: msg,
    }),
    dateBefore: (maxDate, msg = VALIDATION_MESSAGES.DATE_BEFORE(maxDate)) => ({
        test: (v) => { if (!v) return false; const date = dayjs(v); if (!date.isValid()) return false; return date.isBefore(dayjs(maxDate)); },
        message: msg,
    }),
    dateBetween: (startDate, endDate, msg = VALIDATION_MESSAGES.DATE_BETWEEN(startDate, endDate)) => ({
        test: (v) => { if (!v) return false; const date = dayjs(v); if (!date.isValid()) return false; return date.isAfter(dayjs(startDate)) && date.isBefore(dayjs(endDate)); },
        message: msg,
    }),

    // Número positivo
    positiveNumber: (msg = VALIDATION_MESSAGES.POSITIVE_NUMBER) => ({ test: (v) => Number(v) > 0, message: msg }),
};

// Conjuntos preconfigurados (presets) por caso de uso
export const passwordValidationRules = [
    rulesLib.minLength(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH),
    rulesLib.hasUppercase(),
    rulesLib.hasLowercase(),
    rulesLib.hasDigit(),
    rulesLib.hasSpecial(),
];

export const commentValidationRules = [
    rulesLib.required("Comentarios requeridos"),
    rulesLib.minLength(5, "Mínimo 5 caracteres"),
    rulesLib.maxLength(300, "Máximo 300 caracteres"),
    rulesLib.textGeneral("Caracteres no permitidos"),
];

// Sanitización
export const sanitize = {
    trimAndLower: (value) => { if (value == null) return null; return value.trim().toLowerCase(); },
    trim: (value) => { if (value == null) return null; return value.trim(); },
    normalizeEmail: (email) => { return email != null ? email.trim().toLowerCase().replace(/\s+/g, "") : null; },
    sanitizeString: (input) => { return input != null ? input.trim().replace(/\s+/g, " ") : null; },
};

export const presets = {
    employee: {
        name: [ rulesLib.required(), rulesLib.minLength(2), rulesLib.maxLength(100), rulesLib.onlyLettersAndSpaces() ],
        phone: [ rulesLib.required(), rulesLib.phoneMX() ],
        rfc:   [ rulesLib.required(), rulesLib.rfcMX() ],
        clabe: [ rulesLib.required(), rulesLib.clabe18() ],
        bankAccount: [ rulesLib.required(), rulesLib.digitsBetween(1, 20, VALIDATION_MESSAGES.MAX_DIGITS(20)) ],
    },
    justifications: {
        reason: [ rulesLib.required(), rulesLib.maxLength(500), rulesLib.textGeneral() ],
    },
};
