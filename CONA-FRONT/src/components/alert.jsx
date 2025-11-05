import Swal from "sweetalert2";

const base = (opts) =>
  Swal.fire({
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#111827",
    customClass: {
      popup: "rounded-lg",
      confirmButton: "rounded-md",
      cancelButton: "rounded-md",
    },
    ...opts,
  });

export const alertSuccess = (title = "Éxito", text = "Operación realizada correctamente") =>
  base({ icon: "success", title, text });

export const alertError = (title = "Error", text = "Ha ocurrido un problema") => base({ icon: "error", title, text });

export const alertInfo = (title = "Información", text = "") => base({ icon: "info", title, text });

export const alertWarning = (title = "Atención", text = "") => base({ icon: "warning", title, text });

export const alertConfirm = async ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  icon = "question",
} = {}) =>
  base({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

export const alertToast = (title, icon = "success") =>
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    icon,
    title,
  });

export default {
  success: alertSuccess,
  error: alertError,
  info: alertInfo,
  warning: alertWarning,
  confirm: alertConfirm,
  toast: alertToast,
};
