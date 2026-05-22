import { useMemo, type ButtonHTMLAttributes } from 'react'

type ToggleSize = 'sm' | 'md' | 'lg'

interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick'> {
  checked: boolean
  onChange?: (next: boolean) => void
  /**
   * Optional ISO date string. If provided and the date is in the past,
   * the toggle is forced into the "expired" (red, disabled) state.
   */
  expireDate?: string | Date | null
  size?: ToggleSize
  loading?: boolean
  /** Optional label rendered next to the toggle */
  label?: string
  /** Override the active (on) color. Defaults to green. */
  activeColor?: string
  /** Override the inactive / expired (off) color. Defaults to red. */
  inactiveColor?: string
}

const SIZE_MAP: Record<ToggleSize, { track: string; thumb: string; translate: string }> = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
}

const isExpired = (date?: string | Date | null) => {
  if (!date) return false
  const time = new Date(date).getTime()
  if (Number.isNaN(time)) return false
  return time < Date.now()
}

const ToggleButton = ({
  checked,
  onChange,
  expireDate,
  size = 'md',
  loading = false,
  disabled = false,
  label,
  activeColor = '#00875A',
  inactiveColor = '#BA1A1A',
  className = '',
  ...rest
}: ToggleButtonProps) => {
  const expired = useMemo(() => isExpired(expireDate), [expireDate])
  const isOn = checked && !expired
  const isDisabled = disabled || loading || expired

  const { track, thumb, translate } = SIZE_MAP[size]
  const trackColor = isOn ? activeColor : inactiveColor

  const handleClick = () => {
    if (isDisabled) return
    onChange?.(!checked)
  }

  return (
    <label className={`inline-flex items-center gap-2 select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label={label ?? (isOn ? 'Active' : expired ? 'Expired' : 'Inactive')}
        disabled={isDisabled}
        onClick={handleClick}
        style={{ backgroundColor: trackColor }}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#000B60] ${track} ${
          isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        {...rest}
      >
        <span
          className={`inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${thumb} ${
            isOn ? translate : 'translate-x-0.5'
          }`}
        />
      </button>

      {label && (
        <span className={`text-sm font-semibold ${isOn ? 'text-[#00875A]' : 'text-[#BA1A1A]'}`}>
          {label}
        </span>
      )}
    </label>
  )
}

export default ToggleButton
