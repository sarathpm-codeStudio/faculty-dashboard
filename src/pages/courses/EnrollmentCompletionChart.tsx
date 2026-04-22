import { useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { SectionCard } from '@/components/features'

type Period = 'week' | 'month' | 'year'

type DataPoint = { label: string; enrollments: number; completions: number }

const weekData: DataPoint[] = [
    { label: 'MON', enrollments: 18, completions: 10 },
    { label: 'TUE', enrollments: 25, completions: 14 },
    { label: 'WED', enrollments: 20, completions: 12 },
    { label: 'THU', enrollments: 30, completions: 18 },
    { label: 'FRI', enrollments: 28, completions: 20 },
    { label: 'SAT', enrollments: 15, completions: 9 },
    { label: 'SUN', enrollments: 10, completions: 6 },
]

const monthData: DataPoint[] = [
    { label: 'Wk 1', enrollments: 55, completions: 30 },
    { label: 'Wk 2', enrollments: 72, completions: 45 },
    { label: 'Wk 3', enrollments: 60, completions: 38 },
    { label: 'Wk 4', enrollments: 88, completions: 58 },
]

const yearData: DataPoint[] = [
    { label: 'JAN', enrollments: 65, completions: 35 },
    { label: 'FEB', enrollments: 78, completions: 50 },
    { label: 'MAR', enrollments: 90, completions: 60 },
    { label: 'APR', enrollments: 120, completions: 75 },
    { label: 'MAY', enrollments: 100, completions: 65 },
    { label: 'JUN', enrollments: 110, completions: 80 },
]

const dataMap: Record<Period, DataPoint[]> = { week: weekData, month: monthData, year: yearData }

const PERIODS: { key: Period; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
]

const EnrollmentCompletionChart = () => {
    const [period, setPeriod] = useState<Period>('year')
    const currentData = dataMap[period]

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

    return (
        <SectionCard
            title="Enrollment vs. Completion"
            title_color="text-black"
            className="h-full"
            rightContent={
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#767683]">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#000B60]" />
                        Enrollments
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#767683]">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00C6DE]" />
                        Completions
                    </span>
                    {filter}
                </div>
            }
        >
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                        <CartesianGrid vertical={false} stroke="#f0f1f5" strokeDasharray="4 4" />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: '#767683', fontSize: 11, fontWeight: 700 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#a0a0ae', fontSize: 10, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            width={36}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null
                                return (
                                    <div className="rounded-lg bg-[#000b60] px-3 py-2 shadow-lg space-y-1">
                                        <p className="text-[10px] font-semibold text-indigo-200">{label}</p>
                                        {payload.map((p: any) => (
                                            <p key={p.dataKey} className="text-xs font-bold text-white">
                                                {p.name}: {p.value}
                                            </p>
                                        ))}
                                    </div>
                                )
                            }}
                        />
                        <Legend content={() => null} />
                        <Bar dataKey="enrollments" name="Enrollments" fill="#000B60" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completions" name="Completions" fill="#00C6DE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </SectionCard>
    )
}

export default EnrollmentCompletionChart
