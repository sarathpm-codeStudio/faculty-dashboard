type SpinnerProps = {
  size?: number
  color?: string
  label?: string
}

const Spinner = ({ size = 40, color = '#2c1452', label = 'Loading...' }: SpinnerProps) => (
  <div className="flex flex-col items-center justify-center gap-3" role="status" aria-label={label}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke={color}
        strokeOpacity="0.15"
        strokeWidth="4"
      />
      <path
        d="M36 20a16 16 0 0 0-16-16"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    {label && (
      <p className="text-sm text-[#767683] font-medium">{label}</p>
    )}
  </div>
)

export default Spinner
