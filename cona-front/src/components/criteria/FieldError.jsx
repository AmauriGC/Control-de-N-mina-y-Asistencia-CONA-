export default function FieldError({ error, backendError }) {
  const msg = error || backendError
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

