import { useRef } from 'react'
import { CalendarDays } from 'lucide-react'

type FilterDatePickerProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const formatDisplay = (value: string) => {
  if (!value) return null
  const d = new Date(value + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const FilterDatePicker = ({ value, onChange, placeholder = 'Select Date', className = '' }: FilterDatePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const display = formatDisplay(value) ?? placeholder

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker()}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#E6E8EA] text-sm font-semibold text-gray-500  transition-colors whitespace-nowrap"
      >
        <CalendarDays size={14} className="text-[#767683]" />
        {display}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full cursor-pointer"
      />
    </div>
  )
}

export default FilterDatePicker
