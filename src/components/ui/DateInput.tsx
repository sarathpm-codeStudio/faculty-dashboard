import { type InputHTMLAttributes } from 'react'

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

const format = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`
}

const DateInput = ({ label, value, onChange, error, id, className = '', ...props }: DateInputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(format(e.target.value))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        maxLength={14}
        value={value}
        onChange={handleChange}
        className={`w-full px-4 py-4 bg-[#F2F4F6] rounded-lg border text-base font-medium outline-none transition-all
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-100 focus:border-gray-100 focus:ring-0'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

export default DateInput
