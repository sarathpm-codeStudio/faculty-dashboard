import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, LabelList, Tooltip } from 'recharts'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { Paragraph, SkeletonChart, Subheading } from '@/components/ui'

export type RevenuePeriod = 'week' | 'month' | 'year'

export type RevenueDataPoint = {
  label: string
  value: number
}

type RevenueChartProps = {
  data: RevenueDataPoint[]
  trend?: string
  isLoading?: boolean
  period: RevenuePeriod
  onPeriodChange: (period: RevenuePeriod) => void
}

const PERIODS: { key: RevenuePeriod; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const RevenueChart = ({
  data,
  trend = '',
  isLoading = false,
  period,
  onPeriodChange,
}: RevenueChartProps) => {
  const peak = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0

  const formatRevenue = (value: number) =>
    `₹${Number(value).toLocaleString('en-IN')}`

  return (
    <div
      className="flex h-full flex-col rounded-lg p-8"
      style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <Subheading className="font-bold text-white">Revenue</Subheading>
        <div className="relative">
          <select
            value={period}
            onChange={e => onPeriodChange(e.target.value as RevenuePeriod)}
            className="h-7 w-[90px] appearance-none rounded-[6px] border border-white/20 bg-transparent pl-3 pr-7 text-sm font-semibold text-white focus:outline-none cursor-pointer"
          >
            {PERIODS.map(({ key, label }) => (
              <option key={key} value={key} className="bg-[#142283] text-white">
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white" />
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 flex-1 min-h-[200px] relative">
        {isLoading ? (
          <SkeletonChart className="h-full min-h-[200px]" variant="dark" />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 38, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="28%"
          >
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.08)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const value = payload[0].value as number
                return (
                  <div className="rounded bg-white px-2.5 py-1.5 shadow-lg text-center">
                    <p className="text-[10px] font-semibold text-brand-to/70">{label}</p>
                    <p className="text-[10px] font-bold text-brand-to">{formatRevenue(value)}</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.value === peak
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(255,255,255,0.18)'
                  }
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={(props: any) => {
                  const { x, y, width, value } = props
                  if (value !== peak) return null
                  const label = formatRevenue(value)
                  const cx = (x ?? 0) + (width ?? 0) / 2
                  const rectW = Math.max((width ?? 0) + 28, 72)
                  return (
                    <g>
                      <rect
                        x={cx - rectW / 2}
                        y={(y ?? 0) - 30}
                        width={rectW}
                        height={22}
                        rx={4}
                        fill="white"
                      />
                      <text
                        x={cx}
                        y={(y ?? 0) - 14}
                        textAnchor="middle"
                        fill="#142283"
                        fontSize={10}
                        fontWeight={700}
                      >
                        {label}
                      </text>
                      <polygon
                        points={`${cx - 5},${(y ?? 0) - 8} ${cx + 5},${(y ?? 0) - 8} ${cx},${(y ?? 0) - 2}`}
                        fill="white"
                      />
                    </g>
                  )
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Trend footer */}
      <div className="mt-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 shrink-0 text-[#dfe0ff]" />
        <Paragraph className="text-[#dfe0ff]">{trend}</Paragraph>
      </div>
    </div>
  )
}

export default RevenueChart
