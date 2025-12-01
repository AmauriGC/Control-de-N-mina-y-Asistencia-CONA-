export default function FieldHint({ value, max }) {
  if (max && typeof value === 'string') {
    return <p className="text-xs text-muted-foreground text-right">{value.length}/{max}</p>
  }
  return null
}

