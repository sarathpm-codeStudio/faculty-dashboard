import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  showCount?: boolean
}

const Textarea = ({ label, error, id, showCount = false, className = '', ...props }: TextareaProps) => {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const current = String(props.value ?? '').length
  const max = props.maxLength

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-3 bg-[#F2F4F6] rounded-lg border border-gray-100 text-base font-medium outline-none transition-all resize-none focus:border-gray-100 focus:ring-0
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : ''}
          ${className}`}
        {...props}
      />
      <div className="flex justify-between items-center">
        {error ? <p className="text-red-500 text-xs">{error}</p> : <span />}
        {showCount && max && (
          <span className="text-xs text-gray-400">{current} / {max}</span>
        )}
      </div>
    </div>
  )
}

export default Textarea
