import type { CSSProperties } from 'react'

type SkeletonProps = {
  className?: string
  style?: CSSProperties
}

const BAR_HEIGHTS = ['h-[45%]', 'h-[70%]', 'h-[55%]', 'h-[85%]', 'h-[60%]', 'h-[75%]', 'h-[50%]']

const Skeleton = ({ className = '', style }: SkeletonProps) => (
  <div
    className={`skeleton-shimmer rounded-md ${className}`}
    style={style}
    aria-hidden
  />
)

type SkeletonChartProps = {
  className?: string
  bars?: number
  variant?: 'light' | 'dark'
}

export const SkeletonChart = ({ className = '', bars = 7, variant = 'light' }: SkeletonChartProps) => {
  const barClass = variant === 'dark' ? 'skeleton-shimmer-dark' : 'skeleton-shimmer'

  return (
    <div className={`flex h-full flex-col ${className}`} aria-hidden>
      <div className="relative flex-1 min-h-0 px-4 pt-4">
        <div className="absolute inset-0 flex items-end justify-between gap-2 pb-2">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 max-w-[48px] rounded-t-md ${barClass} ${BAR_HEIGHTS[i % BAR_HEIGHTS.length]}`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between gap-2 px-4 pb-4">
        {Array.from({ length: bars }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 max-w-[48px] rounded ${barClass} opacity-60`} />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
