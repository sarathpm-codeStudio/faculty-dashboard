import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

const FilterSelect = ({ options, className = '', ...props }: FilterSelectProps) => (
  <div className="relative">
    <select
      className={`h-9 appearance-none bg-[#E6E8EA] rounded-lg pl-4 pr-8 text-sm font-semibold text-gray-500 focus:outline-none cursor-pointer ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767683]" />
  </div>
)

export default FilterSelect
