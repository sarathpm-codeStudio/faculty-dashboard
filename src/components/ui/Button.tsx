import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

const Button = ({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const base = 'py-3 px-4 font-bold text-[18px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    ghost: 'text-indigo-600 hover:underline bg-transparent',
  }

  return (
    <button
      disabled={disabled || loading}
      style={{ boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.10)' }}
      className={`${base} text-brand-from bg-brand-to text-white h-[56px] ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export default Button
