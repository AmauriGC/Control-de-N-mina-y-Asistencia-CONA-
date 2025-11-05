import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  fullWidth = true,
  onClick,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60";
  const height = fullWidth ? "h-44" : "";
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base}${height} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 animate-spin" size={16} /> {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
