import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelClassName?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  showCount?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, labelClassName = '', error, id, leftIcon, rightIcon, showCount = false, className = '', ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const current = String(props.value ?? '').length
  const max = props.maxLength

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={`text-sm font-bold text-gray-700 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full py-4 bg-[#F2F4F6] rounded-lg border text-base font-medium outline-none transition-all
            ${leftIcon ? 'pl-9' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-100 focus:border-gray-100 focus:ring-0'}
            ${className}`}
          {...props}
        />
        {/* Unlike leftIcon this stays interactive — it holds the clear button. */}
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        {error ? <p className="text-red-500 text-xs">{error}</p> : <span />}
        {showCount && max && (
          <span className="text-xs text-gray-400">{current} / {max}</span>
        )}
      </div>
    </div>
  )
})

Input.displayName = 'Input'

export default Input
