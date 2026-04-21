import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'secondary' | 'danger' | "white"
    loading?: boolean
    fullWidth?: boolean
}

const Button2 = ({
    variant = 'primary',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    className = '',
    ...props
}: ButtonProps) => {
    const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variants: Record<NonNullable<ButtonProps['variant']>, { cls: string; style?: React.CSSProperties }> = {
        primary: {
            cls: 'text-white h-[40px] px-6 text-[18px]',
            style: {
                background: 'linear-gradient(to right, #000B60, #142283)',
                boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.10)',
            },
        },
        secondary: {
            cls: ' bg-[#BCC2FF]  text-[#000B60] px-6 text-[18px] h-[56px]',
        },
        white: {
            cls: ' bg-white  text-[#000B60] px-6 text-[18px] h-[56px]',
        },
        ghost: {
            cls: 'px-4 py-2 text-[#000B60] hover:underline bg-transparent text-sm',
        },
        danger: {
            cls: 'px-4 py-1.5 text-red-500 hover:text-red-700 bg-transparent text-xs',
        },




    }

    const { cls, style } = variants[variant]

    return (
        <button
            disabled={disabled || loading}
            style={style}
            className={`${base} ${cls} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {loading ? 'Please wait…' : children}
        </button>
    )
}

export default Button2
