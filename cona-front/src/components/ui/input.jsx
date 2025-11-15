import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

function Input({ className, type = "text", revealToggle = true, ...props }) {
  const isPassword = type === "password";
  const [show, setShow] = React.useState(false);

  const finalType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className={cn("relative", className)}>
      <input
        type={finalType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground/50 placeholder:not-italic placeholder:font-normal selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-background/50 px-3 py-1 pr-9 text-base shadow-xs transition-[color,box-shadow,background] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:bg-background",
          "hover:bg-background/70",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:bg-destructive/5",
          "aria-selected:border-primary aria-selected:ring-primary/20 aria-selected:ring-[3px] aria-selected:bg-primary/5"
        )}
        {...props}
      />
      {isPassword && revealToggle && (
        <button
          type="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShow((s) => !s)}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground transition",
            "focus:outline-none"
          )}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
}

export { Input };
