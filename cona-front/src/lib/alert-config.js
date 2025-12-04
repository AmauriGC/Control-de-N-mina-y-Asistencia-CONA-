import Swal from 'sweetalert2'

// Helper para formatear mensajes de error provenientes del backend
// Acepta distintos formatos: string, Error, objeto con {message, data}, array, etc.
const formatErrorText = (input, fallback = '') => {
    try {
        if (!input && !fallback) return ''
        if (!input) return String(fallback)

        // Si es ya string
        if (typeof input === 'string') return input

        // Si es Error nativo
        if (input instanceof Error) return input.message || String(fallback)

        // Si viene un objeto con message/data
        if (typeof input === 'object') {
            const parts = []
            const msg = input.message || input.error || input.title
            if (msg) parts.push(String(msg))

            const data = input.data ?? input.details ?? input.errors
            if (data) {
                // Normalizar data en array de textos
                let items = []
                if (Array.isArray(data)) {
                    items = data
                } else if (typeof data === 'object') {
                    items = Object.values(data)
                } else {
                    items = [String(data)]
                }
                // Aplanar arrays anidados y limpiar vacíos
                const cleanItems = items.flat(Infinity).filter(Boolean).map(x => String(x).trim())
                if (cleanItems.length) parts.push(cleanItems.join('\n'))
            }

            // Si no hubo partes, caer al fallback
            if (!parts.length && fallback) parts.push(String(fallback))
            return parts.join('\n')
        }

        // Tipo desconocido, intentar stringify
        return String(input)
    } catch (e) {
        return String(fallback || 'Ocurrió un error')
    }
}

const base = {
    confirmButtonText: 'Aceptar',
    buttonsStyling: false,
    // Ensure SweetAlert is above Radix Dialog overlays and doesn't trap focus issues
    target: document.body,
    scrollbarPadding: false,
    stopKeydownPropagation: false,
    allowEscapeKey: true,
    customClass: {
        popup: 'rounded-xl border border-border bg-card text-card-foreground',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm text-muted-foreground',
        confirmButton: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2',
        cancelButton: 'bg-muted text-foreground hover:bg-muted/80 rounded-md px-4 py-2',
        actions: 'gap-3',
    },
    didOpen: (el) => {
        // Raise z-index above typical dialog overlays
        el.parentElement.style.zIndex = '10000'
    }
}

export const alertConfig = {
    success({title = 'Éxito', text = '', timer = 1700, showConfirmButton = false} = {}) {
        return Swal.fire({
            ...base,
            icon: 'success',
            iconColor: 'var(--color-primary)',
            title,
            text,
            timer,
            showConfirmButton
        })
    },
    error({title = 'Error', text = '', error} = {}) {
        const formatted = formatErrorText(error ?? text, text)
        return Swal.fire({
            ...base,
            icon: 'error',
            iconColor: 'var(--color-destructive)',
            title,
            text: formatted,
            confirmButtonText: 'Entendido'
        })
    },
    info({title = 'Información', text = ''} = {}) {
        return Swal.fire({
            ...base,
            icon: 'info',
            iconColor: 'var(--color-ring)',
            title,
            text,
            confirmButtonText: 'Entendido'
        })
    },
    toast({
              title = '',
              text = '',
              icon = 'info',
              position = 'bottom-end',
              timer = 2000,
              showCloseButton = true,
              // Permitir pasar error directamente para formatear en toasts si aplica
              error,
          } = {}) {
        // Solo formatear automáticamente en toasts de error; para otros íconos mantener texto tal cual
        const finalText = icon === 'error' ? formatErrorText(error ?? text, text) : text
        return Swal.fire({
            // no heredamos heightAuto/allowOutsideClick del base porque son incompatibles con toasts
            confirmButtonText: base.confirmButtonText,
            buttonsStyling: base.buttonsStyling,
            target: document.body,
            scrollbarPadding: false,
            stopKeydownPropagation: false,
            allowEscapeKey: true,
            icon,
            title,
            text: finalText,
            position,
            timer,
            showCloseButton,
            showConfirmButton: false,
            toast: true,
            customClass: {
                popup: 'rounded-md border bg-background text-foreground shadow-lg p-4 pr-8',
                title: 'text-sm font-semibold',
                htmlContainer: 'text-sm opacity-90',
                closeButton: 'text-foreground/50 hover:text-foreground',
            },
        })
    },
    toastSuccess(opts = {}) {
        return this.toast({icon: 'success', ...opts})
    },
    toastError(opts = {}) {
        // Aceptar opts.error o construir desde opts.text y formatear
        return this.toast({icon: 'error', ...opts})
    },
    toastInfo(opts = {}) {
        return this.toast({icon: 'info', ...opts})
    },
    toastWarning(opts = {}) {
        return this.toast({icon: 'warning', ...opts})
    },
    async confirm({
                      title = '¿Confirmar acción?',
                      text = '',
                      confirmText = 'Sí',
                      cancelText = 'Cancelar',
                  } = {}) {
        const res = await Swal.fire({
            ...base,
            icon: 'question',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true,
            focusCancel: true,
        })
        return res.isConfirmed
    },
}

export default alertConfig
