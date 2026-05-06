// Reusable — used in: Dashboard

type ProgressBarProps = {
  label: string
  value: number
  status?: string
  barColor?: string
}

const ProgressBar = ({ label, value, status, barColor = '#1a237e' }: ProgressBarProps) => (
  <div className="flex items-center gap-5">
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#767683]">
          {label}
        </span>
        <span className="text-[13px] font-bold text-[#767683]">{value}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#e0e3e5]">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
    {status && (
      <div
        className="shrink-0 rounded-[3px] px-2 py-[3px] leading-none"
        style={{ backgroundColor: barColor }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wide text-white">
          {status}
        </span>
      </div>
    )}
  </div>
)

export default ProgressBar
