import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  (
    {
      id,
      label,
      type = "text",
      value,
      onChange,
      placeholder,
      autoComplete,
      required,
      disabled,
      icon: Icon,
      error,
      className = "",
      inputClassName = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const computedType = isPassword ? (showPassword ? "text" : "password") : type;

    const baseInput =
      "block w-full h-[44px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200";
    const leftPadding = Icon ? " pl-9" : "";
    const rightPadding = isPassword ? " pr-9" : "";

    return (
      <div className={containerClassName}>
        {label ? (
          <label htmlFor={id} className="mb-1 block text-sm font-medium">
            {label}
          </label>
        ) : null}

        <div className="relative">
          {Icon ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon size={18} />
            </span>
          ) : null}

          <input
            id={id}
            ref={ref}
            type={computedType}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseInput}${leftPadding}${rightPadding} ${inputClassName} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : null}
        </div>

        {error ? (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

export default Input;
