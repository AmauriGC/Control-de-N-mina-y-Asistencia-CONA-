export const rulesLib = {
  required: (msg = "Campo obligatorio") => ({ test: (v) => String(v ?? "").trim().length > 0, message: msg }),
  minLength: (min = 1, msg = `Mínimo ${min} caracteres`) => ({
    test: (v) => String(v ?? "").trim().length >= min,
    message: msg,
  }),
  maxLength: (max = 200, msg = `Máximo ${max} caracteres`) => ({
    test: (v) => String(v ?? "").trim().length <= max,
    message: msg,
  }),
  startsWithUpper: (msg = "Debe iniciar con mayúscula") => ({
    test: (v) => {
      const s = String(v ?? "").trim();
      if (!s) return false;
      const first = s.charAt(0);
      return first === first.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(first);
    },
    message: msg,
  }),
  onlyLettersAndSpaces: (msg = "Solo letras y espacios") => ({
    test: (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(String(v ?? "").trim()),
    message: msg,
  }),
  onlyLetters: (msg = "Solo letras") => ({
    test: (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]+$/.test(String(v ?? "").trim()),
    message: msg,
  }),
  onlyNumbers: (msg = "Solo números") => ({
    test: (v) => /^\d+$/.test(String(v ?? "").trim()),
    message: msg,
  }),
  alphanumeric: (msg = "Solo letras y números") => ({
    test: (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+$/.test(String(v ?? "").trim()),
    message: msg,
  }),
  minDigits: (min = 1, msg = `Mínimo ${min} dígitos`) => ({
    test: (v) => String(v ?? "").trim().length >= min,
    message: msg,
  }),
  maxDigits: (max = 1, msg = `Máximo ${max} dígitos`) => ({
    test: (v) => String(v ?? "").trim().length <= max,
    message: msg,
  }),
  email: (msg = "Correo inválido") => ({ test: (v) => /.+@.+\..+/.test(String(v ?? "").trim()), message: msg }),
  positiveNumber: (msg = "Debe ser un número positivo") => ({ test: (v) => Number(v) > 0, message: msg }),
  emailDomain: (domains = [], msg = "Dominio de correo no permitido") => ({
    test: (v) => {
      const s = String(v ?? "")
        .trim()
        .toLowerCase();
      if (!/.+@.+\..+/.test(s)) return false;
      const allowed = domains.map((d) => d.toLowerCase());
      return allowed.some((d) => s.endsWith(`@${d}`));
    },
    message: msg,
  }),
  passwordPolicy: (opts = { length: 10 }, msg = "La contraseña no cumple la política") => ({
    test: (v) => {
      const s = String(v ?? "");
      if (!/^[A-Za-z0-9@._-]+$/.test(s)) return false;
      if (opts?.length && s.length < opts.length) return false;
      if (!/[A-Z]/.test(s)) return false;
      if (!/[a-z]/.test(s)) return false;
      if (!/[0-9]/.test(s)) return false;
      return true;
    },
    message: msg,
  }),
  decimal2: (msg = "Monto inválido") => ({
    test: (v) => {
      const s = String(v ?? "").trim();
      if (!s) return false;
      if (!/^\d+(?:[.,]\d{1,2})?$/.test(s)) return false;
      const n = Number(s.replace(",", "."));
      return !Number.isNaN(n) && n > 0;
    },
    message: msg,
  }),
  phoneMX: (msg = "Teléfono inválido (10 dígitos)") => ({
    test: (v) => /^\d{10}$/.test(String(v ?? "").trim()),
    message: msg,
  }),
  rfcMX: (msg = "RFC inválido") => ({
    test: (v) => {
      const s = String(v ?? "")
        .trim()
        .toUpperCase();
      if (!s) return false;
      const re = /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{2})([A\d])$/;
      return re.test(s);
    },
    message: msg,
  }),
  clabe18: (msg = "CLABE inválida (18 dígitos)") => ({
    test: (v) => /^\d{18}$/.test(String(v ?? "").trim()),
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
  timeHHmm: (msg = "Formato HH:mm inválido") => ({
    test: (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(v ?? "").trim()),
    message: msg,
  }),
  integerRange: (min = 0, max = 100, msg = `Valor fuera de rango (${min}-${max})`) => ({
    test: (v) => {
      const s = String(v ?? "").trim();
      if (!/^\d+$/.test(s)) return false;
      const n = parseInt(s, 10);
      return n >= min && n <= max;
    },
    message: msg,
  }),
  textGeneral: (msg = "Caracteres no permitidos") => ({
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
      } catch (e) {
        return false;
      }
    },
    message: ruleObj.message,
  }),
};

export const passwordCriteria = [
  { id: "length", label: "Mínimo 10 caracteres", test: (s = "") => s.length >= 10 },
  { id: "uppercase", label: "Al menos una mayúscula", test: (s = "") => /[A-Z]/.test(s) },
  { id: "lowercase", label: "Al menos una minúscula", test: (s = "") => /[a-z]/.test(s) },
  { id: "number", label: "Al menos un número", test: (s = "") => /[0-9]/.test(s) },
];

export const nameCriteria = [
  { id: "notEmpty", label: "No vacío", test: (s = "") => s.trim().length > 0 },
  { id: "startsUpper", label: "Empieza con mayúscula", test: (s = "") => /^[A-ZÁÉÍÓÚÑ]/.test(s.trim()) },
  {
    id: "onlyLettersAndSpaces",
    label: "Solo letras y espacios",
    test: (s = "") => /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(s.trim()),
  },
];

export const justificationReviewRules = [
  rulesLib.required("Comentarios requeridos"),
  rulesLib.minLength(5, "Mínimo 5 caracteres"),
  rulesLib.maxLength(300, "Máximo 300 caracteres"),
  rulesLib.textGeneral("Caracteres no permitidos"),
];
