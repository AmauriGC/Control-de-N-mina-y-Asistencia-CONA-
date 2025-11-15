import React, { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function startOfMonth(date) {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfMonth(date) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

function addMonths(date, count) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + count)
  return d
}

function isSameDay(a, b) {
  return (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBetween(date, min, max) {
  const t = date.getTime()
  if (min && t < min.getTime()) return false
  if (max && t > max.getTime()) return false
  return true
}

export function Calendar({
  value,
  onChange,
  className,
  disabled = false,
  minDate,
  maxDate,
  weekStartsOn = 1,
}) {
  const [viewDate, setViewDate] = useState(value || new Date())
  const today = new Date()

  const { monthDays, monthLabel } = useMemo(() => {
    const start = startOfMonth(viewDate)
    const end = endOfMonth(viewDate)
    const startWeekday = (start.getDay() - weekStartsOn + 7) % 7
    const daysInMonth = end.getDate()

    const days = []
    for (let i = 0; i < startWeekday; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
    }
    while (days.length % 7 !== 0) days.push(null)

    const label = start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    return { monthDays: days, monthLabel: label }
  }, [viewDate, weekStartsOn])

  const handlePrev = () => setViewDate((d) => addMonths(d, -1))
  const handleNext = () => setViewDate((d) => addMonths(d, 1))
  const weekdays = useMemo(() => {
    const base = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    const startIdx = weekStartsOn % 7
    return [...base.slice(startIdx), ...base.slice(0, startIdx)]
  }, [weekStartsOn])

  return (
    <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm p-3 select-none', className)}>
      <div className="flex items-center justify-between px-1 pb-2">
        <button type="button" onClick={handlePrev} disabled={disabled} className="p-1 rounded-md hover:bg-accent disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-semibold capitalize">{monthLabel}</div>
        <button type="button" onClick={handleNext} disabled={disabled} className="p-1 rounded-md hover:bg-accent disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground px-1">
        {weekdays.map((w, i) => (
          <div key={i} className="h-6 grid place-items-center">{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {monthDays.map((d, i) => {
          const isEmpty = !d
          const isToday = d && isSameDay(d, today)
          const selected = d && value && isSameDay(d, value)
          const permitted = d && isBetween(d, minDate, maxDate)
          const isDisabled = disabled || (!isEmpty && !permitted)

          return (
            <button
              key={i}
              type="button"
              disabled={isEmpty || isDisabled}
              onClick={() => d && onChange?.(d)}
              className={cn(
                'h-9 w-9 rounded-md text-sm grid place-items-center outline-none transition-colors',
                isEmpty && 'opacity-0 pointer-events-none',
                isDisabled && 'opacity-40 cursor-not-allowed',
                selected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                isToday && !selected && 'ring-2 ring-primary/50',
              )}
            >
              {d ? d.getDate() : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
