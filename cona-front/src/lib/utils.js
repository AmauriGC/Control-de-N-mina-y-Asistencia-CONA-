import {clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

// Formatea una fecha ISO (yyyy-MM-dd o yyyy-MM-ddTHH:mm:ss) sin desplazarla por zona horaria.
// new Date('2025-11-27') interpreta la fecha en UTC y en zonas negativas puede mostrar el día anterior.
// Para evitarlo, construimos la fecha con year, monthIndex, day en hora local.
export function formatISODateLocal(dateStr, locale = 'es-ES', options) {
    if (!dateStr) return ''
    try {
        const base = dateStr.split('T')[0]
        const [y, m, d] = base.split('-').map(Number)
        if (!y || !m || !d) return dateStr
        const dateObj = new Date(y, m - 1, d)
        return dateObj.toLocaleDateString(locale, options)
    } catch (e) {
        return dateStr
    }
}
