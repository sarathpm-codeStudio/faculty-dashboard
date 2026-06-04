import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { SectionCard } from '@/components/features'
import { SkeletonChart } from '@/components/ui'
import { useGetEnrollmentTrend } from '@/hooks/dashboard'

type Period = 'week' | 'month' | 'year'

type DataPoint = {
  primary: string
  secondary?: string
  value: number
}

const weekData: DataPoint[] = [
  { primary: 'MON', secondary: '03', value: 40 },
  { primary: 'TUE', secondary: '04', value: 94 },
  { primary: 'WED', secondary: '05', value: 55 },
  { primary: 'THU', secondary: '06', value: 110 },
  { primary: 'FRI', secondary: '07', value: 70 },
  { primary: 'SAT', secondary: '08', value: 85 },
  { primary: 'SUN', secondary: '09', value: 60 },
]

const monthData: DataPoint[] = [
  { primary: 'Week 1', value: 45 },
  { primary: 'Week 2', value: 78 },
  { primary: 'Week 3', value: 62 },
  { primary: 'Week 4', value: 90 },
]

const yearData: DataPoint[] = [
  { primary: 'Jan', value: 65 },
  { primary: 'Feb', value: 48 },
  { primary: 'Mar', value: 85 },
  { primary: 'Apr', value: 72 },
  { primary: 'May', value: 110 },
  { primary: 'Jun', value: 95 },
  { primary: 'Jul', value: 88 },
  { primary: 'Aug', value: 75 },
  { primary: 'Sep', value: 65 },
  { primary: 'Oct', value: 90 },
  { primary: 'Nov', value: 105 },
  { primary: 'Dec', value: 78 },
]

const dataMap: Record<Period, DataPoint[]> = {
  week: weekData,
  month: monthData,
  year: yearData,
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const EnrollmentChart = () => {
  const [period, setPeriod] = useState<Period>('week')
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const currentData = dataMap[period]

  // query
  const { data: enrollmentTrend, isLoading: enrollmentTrendLoading } = useGetEnrollmentTrend(period, true)

  const filter = (
    <div className="relative">
      <select
        value={period}
        onChange={e => setPeriod(e.target.value as Period)}
        className="h-9 w-[110px] appearance-none rounded-[8px] border border-[#ececec] bg-white pl-4 pr-8 text-sm font-semibold text-[#191c1e] focus:outline-none cursor-pointer"
      >
        {PERIODS.map(({ key, label }) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767683]" />
    </div>
  )

  useEffect(() => {
    const fetchData = async () => {
        
        if (enrollmentTrend) {
            setChartData(enrollmentTrend.data)
          }
        }
    fetchData()
}, [period, enrollmentTrend])

  return (
    <SectionCard
      title="Enrollment Trend"
      subtitle="Track how many students joined your courses"
      rightContent={filter}
      className="h-full"
    >
      <div className="h-[340px] relative">
        {enrollmentTrendLoading ? (
          <SkeletonChart className="h-full" />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={period}
            data={chartData}
            margin={{ top: 10, right: 16, left: 0, bottom: period === 'week' ? 28 : 8 }}
          >
            <defs>
              <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c7d2fe" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines only */}
            <CartesianGrid
              vertical={false}
              stroke="#f0f1f5"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="primary"
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              interval={0}
              height={period === 'week' ? 42 : 24}
              padding={{ left: 24, right: 16 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tick={(props: any) => {
                const { x, y, payload } = props
                const datum = chartData.find(d => d.primary === payload?.value)
                if (!datum) return <g />
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0} y={0} dy={12}
                      textAnchor="middle"
                      fill="#767683"
                      fontSize={9}
                      fontWeight={700}
                      letterSpacing={0.8}
                    >
                      {payload?.value}
                    </text>
                    {datum.secondary && (
                      <text
                        x={0} y={0} dy={25}
                        textAnchor="middle"
                        fill="#a0a0ae"
                        fontSize={9}
                        fontWeight={600}
                      >
                        {datum.secondary}
                      </text>
                    )}
                  </g>
                )
              }}
            />

            <YAxis
              ticks={[25, 50, 100, 150, 200]}
              domain={[0, 210]}
              tick={{ fill: '#a0a0ae', fontSize: 10, fontWeight: 600 }}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={false}
              width={40}
            />

            <Tooltip
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg bg-[#000b60] px-3 py-2 shadow-lg">
                    <p className="text-[10px] font-semibold text-indigo-200 mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-white">{payload[0].value} students</p>
                  </div>
                )
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#enrollGrad)"
              dot={false}
              activeDot={{
                r: 6,
                fill: 'white',
                stroke: '#6366f1',
                strokeWidth: 3,
              }}
              isAnimationActive
              animationBegin={0}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  )
}

export default EnrollmentChart
