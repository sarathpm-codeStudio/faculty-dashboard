import { useState } from 'react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { Paragraph, Subheading } from '@/components/ui'

type Period = 'week' | 'month' | 'year'

type DataPoint = {
  label: string
  value: number
}

const weekData: DataPoint[] = [
  { label: 'MON', value: 12 },
  { label: 'TUE', value: 18 },
  { label: 'WED', value: 9 },
  { label: 'THU', value: 24 },
  { label: 'FRI', value: 30 },
  { label: 'SAT', value: 16 },
  { label: 'SUN', value: 8 },
]

const monthData: DataPoint[] = [
  { label: 'Wk 1', value: 45 },
  { label: 'Wk 2', value: 62 },
  { label: 'Wk 3', value: 38 },
  { label: 'Wk 4', value: 75 },
]

const yearData: DataPoint[] = [
  { label: 'JAN', value: 40 },
  { label: 'FEB', value: 60 },
  { label: 'MAR', value: 30 },
  { label: 'APR', value: 80 },
  { label: 'MAY', value: 96 },
  { label: 'JUN', value: 50 },
]

const dataMap: Record<Period, DataPoint[]> = {
  week: weekData,
  month: monthData,
  year: yearData,
}

const trendText: Record<Period, string> = {
  week: '8.2% increase from last week',
  month: '12.5% increase from last month',
  year: '18.4% increase from last year',
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const RevenueChart = () => {
  const [period, setPeriod] = useState<Period>('week')
  const currentData = dataMap[period]
  const peak = Math.max(...currentData.map(d => d.value))

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
            onChange={e => setPeriod(e.target.value as Period)}
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
      <div className="mt-6 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 38, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="28%"
          >
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              tickLine={false}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {currentData.map((entry, index) => (
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
                  const label = `₹${(value * 1000).toLocaleString('en-IN')}`
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
                      {/* Downward pointer */}
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
      </div>

      {/* Trend footer */}
      <div className="mt-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 shrink-0 text-[#dfe0ff]" />
        <Paragraph className="text-[#dfe0ff]">{trendText[period]}</Paragraph>
      </div>
    </div>
  )
}

export default RevenueChart
