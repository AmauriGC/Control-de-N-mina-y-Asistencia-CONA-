import Swal from 'sweetalert2'

const base = {
    confirmButtonText: 'Aceptar',
    buttonsStyling: false,
    // Ensure SweetAlert is above Radix Dialog overlays and doesn't trap focus issues
    target: document.body,
    heightAuto: false,
    scrollbarPadding: false,
    stopKeydownPropagation: false,
    allowOutsideClick: false,
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
    error({title = 'Error', text = ''} = {}) {
        return Swal.fire({
            ...base,
            icon: 'error',
            iconColor: 'var(--color-destructive)',
            title,
            text,
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
          } = {}) {
        return Swal.fire({
            ...base,
            icon,
            title,
            text,
            position,
            timer,
            showCloseButton,
            showConfirmButton: false,
            toast: true,
            allowOutsideClick: true,
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
