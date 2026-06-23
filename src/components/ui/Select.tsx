import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  id?: string
  name?: string
  options?: SelectOption[]
  placeholder?: string
  value?: string | number
  onChange?: (e: { target: { name?: string; value: string } }) => void
  onBlur?: (e: { target: { name?: string } }) => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

const Select = ({
  label,
  error,
  id,
  name,
  options = [],
  placeholder,
  value = '',
  onChange,
  onBlur,
  disabled = false,
  loading = false,
  className = '',
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  // Fall back to `id` so formik.handleChange (which keys off target.name) still
  // updates the field when only `id` is provided.
  const fieldName = name ?? id
  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  const hasValue = Boolean(selectedOption)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const handleToggle = () => {
    if (disabled || loading) return
    setOpen((prev) => !prev)
  }

  const handleSelect = (optValue: string | number) => {
    onChange?.({ target: { name: fieldName, value: String(optValue) } })
    setOpen(false)
    // Defer the blur so Formik validates against the just-selected value.
    // Firing onBlur synchronously here would re-validate against the stale
    // (pre-change) value and leave a "required" error showing even though a
    // value was picked — it would only clear once another field was touched.
    setTimeout(() => onBlur?.({ target: { name: fieldName } }), 0)
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={handleToggle}
          onBlur={() => {
            if (!open) onBlur?.({ target: { name: fieldName } })
          }}
          className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border text-base font-medium outline-none transition-all bg-[#F2F4F6] text-left
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : open ? 'border-[#2c1452] ring-2 ring-[#BCC2FF]/40' : 'border-gray-100'}
            ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${className}`}
        >
          <span className={`truncate ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}>
            {loading ? 'Loading...' : hasValue ? selectedOption!.label : placeholder}
          </span>
          {loading ? (
            <Loader2 size={16} className="shrink-0 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown
              size={16}
              className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {open && options.length > 0 && (
          <ul
            role="listbox"
            aria-label={label}
            className="absolute z-30 top-full mt-1.5 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto py-1"
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#2c1452] text-white'
                        : 'text-gray-700 hover:bg-[#F2F4F6]'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

export default Select
