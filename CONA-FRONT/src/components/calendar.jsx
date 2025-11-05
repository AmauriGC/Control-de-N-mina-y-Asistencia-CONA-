import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const WEEK_DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function Calendar({
  value,
  onChange,
  initialYear,
  initialMonth,
  minDate,
  maxDate,
  disabled: isDisabled,
  className = "",
}) {
  const today = new Date();
  const [view, setView] = useState({
    year: initialYear ?? (value ? value.getFullYear() : today.getFullYear()),
    month: initialMonth ?? (value ? value.getMonth() : today.getMonth()),
  });

  const firstOfMonth = new Date(view.year, view.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const days = useMemo(() => {
    const cells = [];
    // prev month padding
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    // current month days
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));
    // ensure full weeks (multiples of 7)
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [startWeekday, daysInMonth, view.year, view.month]);

  const canSelect = (date) => {
    if (!date) return false;
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return false;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return false;
    if (isDisabled && isDisabled(date)) return false;
    return true;
  };

  const prevMonth = () => {
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  };
  const nextMonth = () => {
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));
  };

  return (
    <div className={`w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-sm font-medium capitalize text-gray-900">
          {MONTHS_ES[view.month]} {view.year}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS_ES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
        {days.map((date, idx) => {
          const selectable = canSelect(date);
          const selected = value && date && isSameDay(date, value);
          return (
            <button
              key={idx}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onChange?.(date)}
              className={`h-9 rounded-md border text-sm transition ${
                date
                  ? selected
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                  : "border-transparent bg-transparent"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {date ? date.getDate() : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
