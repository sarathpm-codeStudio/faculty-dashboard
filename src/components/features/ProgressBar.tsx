// Reusable — used in: Dashboard, TestDetail. Minimal indeterminate loading bar.

type ProgressBarProps = {
  label?: string
  status?: string
  barColor?: string
  value?: number
  data?: any
}

const ProgressBar = ({ label, status, barColor = '#2c1452', data }: ProgressBarProps) => (
  <div className="flex items-center gap-5">
    <div className="min-w-0 flex-1 space-y-1.5">
      {label && (
        <span className="text-[13px] font-bold uppercase tracking-wide text-[#767683]">
          {
            data?.type === "intro" ? `Intro Video of course ${data?.details?.course_title}`
              : `${data?.details?.material_title} video of course ${data?.details?.course_title}`
          }
        </span>
      )}

      {
        status && status === "TRANSCODING" ? (
          <div
            className="loader-bar h-1 w-full rounded-full bg-[#e0e3e5]"
            style={{ ['--loader-color' as string]: barColor }}
          />
        ) : status === "waiting to transcode" ? (
          <div
            className="h-1 w-full rounded-full bg-[#e0e3e5]"
            style={{ ['--loader-color' as string]: barColor }}
          />
        ) :
          (
            <div />
          )
      }
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
