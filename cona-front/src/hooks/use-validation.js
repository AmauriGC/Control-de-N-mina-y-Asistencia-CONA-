import { useMemo, useState } from 'react'

export function useFieldValidation(initialValue = '', rules = []) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const rawError = useMemo(() => {
    for (const rule of rules) {
      try {
        if (!rule.test(value)) return rule.message
      } catch (e) {
        return rule.message || 'Valor inválido'
      }
    }
    return ''
  }, [value, rules])

  const onChange = (e) => {
    const v = e?.target ? e.target.value : e
    if (!touched) setTouched(true)
    setValue(v)
  }
  const onBlur = () => setTouched(true)
  const reset = () => {
    setValue(initialValue)
    setTouched(false)
  }
  const isValid = !rawError
  const error = touched ? rawError : ''
  const showError = touched && !!rawError

  return { value, setValue, error, isValid, onChange, onBlur, reset, touched, showError }
}

export function makeRules(...ruleDefs) {
  return ruleDefs
}

export const rulesLib = {
  required: (msg = 'Campo obligatorio') => ({ test: (v) => String(v ?? '').trim().length > 0, message: msg }),
  startsWithUpper: (msg = 'Debe iniciar con mayúscula') => ({
    test: (v) => {
      const s = String(v ?? '').trim()
      if (!s) return false
      const first = s.charAt(0)
      return first === first.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(first)
    },
    message: msg,
  }),
  onlyLettersAndSpaces: (msg = 'Solo letras y espacios') => ({ test: (v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(String(v ?? '').trim()), message: msg }),
  email: (msg = 'Correo inválido') => ({ test: (v) => /.+@.+\..+/.test(String(v ?? '').trim()), message: msg }),
  positiveNumber: (msg = 'Debe ser un número positivo') => ({ test: (v) => Number(v) > 0, message: msg }),
  emailDomain: (domains = [], msg = 'Dominio de correo no permitido') => ({
    test: (v) => {
      const s = String(v ?? '').trim().toLowerCase()
      if (!/.+@.+\..+/.test(s)) return false
      const allowed = domains.map((d) => d.toLowerCase())
      return allowed.some((d) => s.endsWith(`@${d}`))
    },
    message: msg,
  }),
  passwordPolicy: (opts = { length: 10 }, msg = 'La contraseña no cumple la política') => ({
    test: (v) => {
      const s = String(v ?? '')
      if (!/^[A-Za-z0-9@._-]+$/.test(s)) return false
      if (opts?.length && s.length !== opts.length) return false
      if (!/[A-Z]/.test(s)) return false
      if (!/[a-z]/.test(s)) return false
      if (!/[0-9]/.test(s)) return false
      return true
    },
    message: msg,
  }),
}
