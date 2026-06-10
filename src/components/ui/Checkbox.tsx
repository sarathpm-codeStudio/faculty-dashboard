import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

const Checkbox = ({ label, id, className = '', ...props }: CheckboxProps) => {
  const checkboxId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={checkboxId} className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}>
      <div className="relative w-4 h-4 flex-shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          className="peer appearance-none w-4 h-4 rounded bg-[#F2F4F6] border border-gray-300 cursor-pointer transition-all checked:bg-[#2c1452] checked:border-[#2c1452] focus:outline-none"
          {...props}
        />
        {/* checkmark */}
        <svg
          className="absolute inset-0 w-4 h-4 pointer-events-none hidden peer-checked:block text-white"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
    </label>
  )
}

export default Checkbox
