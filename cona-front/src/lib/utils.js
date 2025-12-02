import {clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

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

// Construye Date local desde 'YYYY-MM-DD' sin desplazamiento por zona horaria
export function parseISODateLocal(dateStr) {
    if (!dateStr) return null
    try {
        const base = String(dateStr).split('T')[0]
        const [y, m, d] = base.split('-').map(Number)
        if (!y || !m || !d) return new Date(dateStr)
        return new Date(y, m - 1, d)
    } catch {
        return new Date(dateStr)
    }
}

// Serializa Date local a 'YYYY-MM-DD'
export function toISODateLocalString(date) {
    if (!(date instanceof Date)) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}
