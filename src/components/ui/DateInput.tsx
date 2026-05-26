import { useRef } from 'react'
import { CalendarDays } from 'lucide-react'

interface DateInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  id?: string
  placeholder?: string
  min?: string
  max?: string
}

/** Normalizes legacy `DD/MM/YYYY` or ISO `YYYY-MM-DD` to ISO for the native picker. */
export const toIsoDateValue = (value: string): string => {
  if (!value) return ''
  const trimmed = value.replace(/\s/g, '')
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const parts = trimmed.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    if (day && month && year?.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }
  return ''
}

const formatDisplay = (iso: string) => {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const DateInput = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  id,
  placeholder = 'Select date',
  min,
  max,
}: DateInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const isoValue = toIsoDateValue(value)
  const display = formatDisplay(isoValue) ?? placeholder

  const openPicker = () => {
    const input = inputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
      input.click()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={inputId}
          onClick={openPicker}
          className={`w-full px-4 py-4 bg-[#F2F4F6] rounded-lg border text-base font-medium outline-none transition-all text-left flex items-center gap-2
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-100'}
            ${!isoValue ? 'text-gray-400' : 'text-gray-700'}`}
        >
          <CalendarDays size={18} className="text-[#767683] shrink-0" />
          <span>{display}</span>
        </button>
        <input
          ref={inputRef}
          type="date"
          value={isoValue}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
          tabIndex={-1}
          aria-hidden
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

export default DateInput
