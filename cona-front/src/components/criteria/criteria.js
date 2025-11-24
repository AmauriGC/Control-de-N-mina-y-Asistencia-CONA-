import dayjs from 'dayjs';
import {VALIDATION_MESSAGES, VALIDATION_REGEX} from "@/components/criteria/validations";

export const rulesLib = {
    required: (msg = VALIDATION_MESSAGES.REQUIRED) => ({test: (v) => String(v ?? "").trim().length > 0, message: msg}),
    minLength: (min = 1, msg = VALIDATION_MESSAGES.MIN_LENGTH(min)) => ({
        test: (v) => String(v ?? "").trim().length >= min,
        message: msg,
    }),
    maxLength: (max = 200, msg = VALIDATION_MESSAGES.MAX_LENGTH(max)) => ({
        test: (v) => String(v ?? "").trim().length <= max,
        message: msg,
    }),
    startsWithUpper: (msg = VALIDATION_MESSAGES.STARTS_WITH_UPPER) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            const first = s.charAt(0);
            return first === first.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(first);
        },
        message: msg,
    }),
    onlyLettersAndSpaces: (msg = VALIDATION_MESSAGES.ONLY_LETTERS_AND_SPACES) => ({
        test: (v) => VALIDATION_REGEX.ONLY_LETTERS_AND_SPACES.test(String(v ?? "").trim()),
        message: msg,
    }),
    onlyLetters: (msg = VALIDATION_MESSAGES.ONLY_LETTERS) => ({
        test: (v) => VALIDATION_REGEX.ONLY_LETTERS.test(String(v ?? "").trim()),
        message: msg,
    }),
    onlyNumbers: (msg = VALIDATION_MESSAGES.ONLY_NUMBERS) => ({
        test: (v) => VALIDATION_REGEX.ONLY_NUMBERS.test(String(v ?? "").trim()),
        message: msg,
    }),
    alphanumeric: (msg = VALIDATION_MESSAGES.ALPHANUMERIC) => ({
        test: (v) => VALIDATION_REGEX.ALPHANUMERIC.test(String(v ?? "").trim()),
        message: msg,
    }),
    minDigits: (min = 1, msg = VALIDATION_MESSAGES.MIN_DIGITS(min)) => ({
        test: (v) => String(v ?? "").trim().length >= min,
        message: msg,
    }),
    maxDigits: (max = 1, msg = VALIDATION_MESSAGES.MAX_DIGITS(max)) => ({
        test: (v) => String(v ?? "").trim().length <= max,
        message: msg,
    }),
    email: (msg = VALIDATION_MESSAGES.EMAIL_INVALID) => ({
        test: (v) => VALIDATION_REGEX.EMAIL.test(String(v ?? "").trim()),
        message: msg
    }),
    positiveNumber: (msg = VALIDATION_MESSAGES.POSITIVE_NUMBER) => ({test: (v) => Number(v) > 0, message: msg}),
    emailDomain: (domains = [], msg = VALIDATION_MESSAGES.EMAIL_DOMAIN) => ({
        test: (v) => {
            const s = String(v ?? "")
                .trim()
                .toLowerCase();
            if (!VALIDATION_REGEX.EMAIL.test(s)) return false;
            const allowed = domains.map((d) => d.toLowerCase());
            return allowed.some((d) => s.endsWith(`@${d}`));
        },
        message: msg,
    }),
    passwordPolicy: (opts = {length: 8}, msg = VALIDATION_MESSAGES.PASSWORD_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "");
            if (!VALIDATION_REGEX.PASSWORD.test(s)) return false;
            if (opts?.length && s.length < opts.length) return false;
            return true;
        },
        message: msg,
    }),
    hasUppercase: (msg = VALIDATION_MESSAGES.PASSWORD_UPPERCASE) => ({
        test: (v) => /[A-Z]/.test(String(v ?? "")),
        message: msg,
    }),
    hasLowercase: (msg = VALIDATION_MESSAGES.PASSWORD_LOWERCASE) => ({
        test: (v) => /[a-z]/.test(String(v ?? "")),
        message: msg,
    }),
    hasDigit: (msg = VALIDATION_MESSAGES.PASSWORD_DIGIT) => ({
        test: (v) => /\d/.test(String(v ?? "")),
        message: msg,
    }),
    hasSpecial: (msg = VALIDATION_MESSAGES.PASSWORD_SPECIAL) => ({
        test: (v) => /[@$!%*?&.]/.test(String(v ?? "")),
        message: msg,
    }),
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
    phoneMX: (msg = VALIDATION_MESSAGES.PHONE_INVALID) => ({
        test: (v) => VALIDATION_REGEX.PHONE_MX.test(String(v ?? "").trim()),
        message: msg,
    }),
    rfcMX: (msg = VALIDATION_MESSAGES.RFC_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "")
                .trim()
                .toUpperCase();
            if (!s) return false;
            return VALIDATION_REGEX.RFC_MX.test(s);
        },
        message: msg,
    }),
    clabe18: (msg = VALIDATION_MESSAGES.CLABE_INVALID) => ({
        test: (v) => VALIDATION_REGEX.CLABE.test(String(v ?? "").trim()),
        message: msg,
    }),
    digitsBetween: (min = 1, max = 20, msg = "Formato inválido") => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            const re = new RegExp(`^\\d{${min},${max}}$`);
            return re.test(s);
        },
        message: msg,
    }),
    timeHHmm: (msg = VALIDATION_MESSAGES.TIME_INVALID) => ({
        test: (v) => VALIDATION_REGEX.TIME_HHMM.test(String(v ?? "").trim()),
        message: msg,
    }),
    integerRange: (min = 0, max = 100, msg = VALIDATION_MESSAGES.INTEGER_RANGE(min, max)) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!/^\d+$/.test(s)) return false;
            const n = parseInt(s, 10);
            return n >= min && n <= max;
        },
        message: msg,
    }),
    textGeneral: (msg = VALIDATION_MESSAGES.TEXT_GENERAL_INVALID) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return false;
            return /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ,.;:()¿?!¡'"-]+$/.test(s);
        },
        message: msg,
    }),
    optional: (ruleObj) => ({
        test: (v) => {
            const s = String(v ?? "").trim();
            if (!s) return true;
            try {
                return ruleObj.test(s);
            } catch {
                return false;
            }
        },
        message: ruleObj.message,
    }),
    matchValue: (otherValue, message = "Los valores no coinciden") => ({
        test: (v) => v === otherValue,
        message,
    }),
    isValidDate: (msg = VALIDATION_MESSAGES.DATE_INVALID) => ({
        test: (v) => {
            if (!v) return false;
            return dayjs(v).isValid();
        },
        message: msg,
    }),
    dateAfter: (minDate, msg = VALIDATION_MESSAGES.DATE_AFTER(minDate)) => ({
        test: (v) => {
            if (!v) return false;
            const date = dayjs(v);
            if (!date.isValid()) return false;
            return date.isAfter(dayjs(minDate));
        },
        message: msg,
    }),
    dateBefore: (maxDate, msg = VALIDATION_MESSAGES.DATE_BEFORE(maxDate)) => ({
        test: (v) => {
            if (!v) return false;
            const date = dayjs(v);
            if (!date.isValid()) return false;
            return date.isBefore(dayjs(maxDate));
        },
        message: msg,
    }),
    dateBetween: (startDate, endDate, msg = VALIDATION_MESSAGES.DATE_BETWEEN(startDate, endDate)) => ({
        test: (v) => {
            if (!v) return false;
            const date = dayjs(v);
            if (!date.isValid()) return false;
            return date.isAfter(dayjs(startDate)) && date.isBefore(dayjs(endDate));
        },
        message: msg,
    }),
};

export const passwordValidationRules = [
    rulesLib.minLength(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH),
    rulesLib.hasUppercase(),
    rulesLib.hasLowercase(),
    rulesLib.hasDigit(),
    rulesLib.hasSpecial(),
];

export const justificationReviewRules = [
    rulesLib.required("Comentarios requeridos"),
    rulesLib.minLength(5, "Mínimo 5 caracteres"),
    rulesLib.maxLength(300, "Máximo 300 caracteres"),
    rulesLib.textGeneral("Caracteres no permitidos"),
];

export const passwordCriteria = [
    {id: "length", label: "Mínimo 8 caracteres", test: (s = "") => s.length >= 8},
    {id: "uppercase", label: "Al menos una mayúscula", test: (s = "") => /[A-Z]/.test(s)},
    {id: "lowercase", label: "Al menos una minúscula", test: (s = "") => /[a-z]/.test(s)},
    {id: "number", label: "Al menos un número", test: (s = "") => /[0-9]/.test(s)},
    {id: "special", label: "Al menos un carácter especial (@$!%*?&.)", test: (s = "") => /[@$!%*?&.]/.test(s)},
];
