import { useRef } from 'react'

interface OtpInputProps {
  value: string[]
  onChange: (value: string[]) => void
  length?: number
}

const OtpInput = ({ value, onChange, length = 6 }: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const next = [...value]
    next[index] = char
    onChange(next)
    if (char && index < length - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted.length === length) {
      onChange(pasted.split(''))
      refs.current[length - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-12 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          placeholder='*'
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-14 h-15 text-center text-xl font-semibold rounded-lg outline-none transition-all bg-[#F2F4F6] border border-gray-100 text-gray-900 focus:border-gray-100 focus:ring-0
            ${value[i] ? 'text-[#000B60] font-bold' : ''}`}
        />
      ))}
    </div>
  )
}

export default OtpInput
