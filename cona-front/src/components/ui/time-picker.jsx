"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

function pad2(n) {
  return String(n).padStart(2, "0")
}

export function TimePicker({ id, value, onChange, disabled, className, step = 5, placeholder = "HH:MM" }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const [hour, minute] = useMemo(() => {
    if (!value) return ["", ""]
    const [h, m] = String(value).split(":")
    return [h, m]
  }, [value])

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad2(i)), [])
  const minutes = useMemo(() => Array.from({ length: Math.ceil(60 / step) }, (_, i) => pad2(i * step)), [step])

  useEffect(() => {
    const handle = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handle)
      document.addEventListener("touchstart", handle, { passive: true })
    }
    return () => {
      document.removeEventListener("mousedown", handle)
      document.removeEventListener("touchstart", handle)
    }
  }, [open])

  const setHour = (h) => {
    if (disabled) return
    const next = `${h}:${minute || "00"}`
    onChange?.(next)
  }
  const setMinute = (m) => {
    if (disabled) return
    const next = `${hour || "00"}:${m}`
    onChange?.(next)
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={cn("font-mono tabular-nums", !value && "text-muted-foreground")}>{value || placeholder}</span>
        <Clock className="size-4 opacity-70" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-[260px] rounded-md border bg-popover p-2 shadow-lg">
          <div className="text-xs text-muted-foreground px-1 pb-2">Selecciona hora y minutos</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Hours */}
            <div className="max-h-60 overflow-y-auto">
              <div className="sticky top-0 z-10 bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/75 px-2 py-1 text-xs text-muted-foreground">Hora</div>
              <ul className="grid grid-cols-2 gap-1 p-1">
                {hours.map((h) => (
                  <li key={h}>
                    <button
                      type="button"
                      onClick={() => setHour(h)}
                      className={cn(
                        "w-full rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground",
                        hour === h && "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {h}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Minutes */}
            <div className="max-h-60 overflow-y-auto">
              <div className="sticky top-0 z-10 bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/75 px-2 py-1 text-xs text-muted-foreground">Minutos</div>
              <ul className="grid grid-cols-2 gap-1 p-1">
                {minutes.map((m) => (
                  <li key={m}>
                    <button
                      type="button"
                      onClick={() => setMinute(m)}
                      className={cn(
                        "w-full rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground",
                        minute === m && "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2 px-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange?.("")}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimePicker
