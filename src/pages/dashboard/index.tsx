import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Users,
  BookOpen,
  MessageCircle,
  IndianRupee,
  ChevronDown,
  TrendingUp,
  Film,
  CreditCard,
} from 'lucide-react'

const enrollmentData = [
  { day: 'MON', date: '03', value: 60 },
  { day: 'TUE', date: '04', value: 45 },
  { day: 'WED', date: '05', value: 80 },
  { day: 'THU', date: '06', value: 94 },
  { day: 'FRI', date: '07', value: 55 },
  { day: 'SAT', date: '08', value: 70 },
  { day: 'SUN', date: '09', value: 40 },
]

const revenueData = [
  { month: 'JAN', value: 42 },
  { month: 'FEB', value: 63 },
  { month: 'MAR', value: 32 },
  { month: 'APR', value: 85 },
  { month: 'MAY', value: 100 },
  { month: 'JUN', value: 53 },
]

const topCourses = [
  { id: 1, name: 'Advanced Macroeconomics', students: '1,240', revenue: '62,000.00' },
  { id: 2, name: 'CA Inter - Costing', students: '842', revenue: '42,100.00' },
  { id: 3, name: 'Financial Accounting', students: '756', revenue: '37,800.00' },
]

const recentActivity = [
  { id: 1, name: 'John Enrolled', detail: 'Financial Accounting 101', time: '2 mins ago', initials: 'JN', bg: '#F97316', isPayment: false },
  { id: 2, name: 'Sarah Submitted', detail: 'Macroeconomics Test #3', time: '15 mins ago', initials: 'SR', bg: '#EAB308', isPayment: false },
  { id: 3, name: 'New Payment Received', detail: 'Course: Business Ethics', time: '45 mins ago', initials: '', bg: 'rgba(188,194,255,0.3)', isPayment: true },
  { id: 4, name: 'Mike Posted a Doubt', detail: '"Question about balance sheets..."', time: '1 hour ago', initials: 'MK', bg: '#3B82F6', isPayment: false },
]

const DashboardPage = () => {
  return (
    <div className="space-y-5">
      {/* Greeting + Filter */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-[36px] text-[#000b60]">
            Hi, Salsabeel
          </h1>
          <p className="mt-2 text-base font-medium text-[#454652]">
            Welcome back! Here's what's happening with your courses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#767683]">
            Filter View
          </span>
          <div className="relative">
            <select className="h-9 w-40 appearance-none rounded-[8px] bg-white pl-4 pr-8 text-sm font-semibold text-[#191c1e] shadow-sm focus:outline-none cursor-pointer">
              <option>All Courses</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767683]" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        <div className="flex h-[172px] flex-col justify-between rounded-[8px] bg-white p-6">
          <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-blue-50">
            <Users className="h-5 w-5 text-[#000b60]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#767683]">Total Students</p>
            <p className="mt-0.5 text-2xl font-extrabold text-[#191c1e]">1,050</p>
          </div>
        </div>

        <div className="flex h-[172px] flex-col justify-between rounded-[8px] bg-white p-6">
          <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-indigo-50">
            <BookOpen className="h-5 w-5 text-[#000b60]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#767683]">Active Courses</p>
            <p className="mt-0.5 text-2xl font-extrabold text-[#191c1e]">06</p>
          </div>
        </div>

        <div className="flex h-[172px] flex-col justify-between rounded-[8px] bg-white p-6">
          <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-red-50">
            <MessageCircle className="h-5 w-5 text-[#ba1a1a]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#767683]">Pending Doubts</p>
            <p className="mt-0.5 text-2xl font-extrabold text-[#ba1a1a]">56</p>
          </div>
        </div>

        <div className="flex h-[172px] flex-col justify-between rounded-[8px] bg-white p-6">
          <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-amber-50">
            <IndianRupee className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#767683]">Total Revenue</p>
            <div className="mt-0.5 flex items-center">
              <IndianRupee className="h-[22px] w-[22px] shrink-0 text-[#191c1e]" strokeWidth={2.5} />
              <span className="text-2xl font-extrabold text-[#191c1e]">123,025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="flex gap-5">
        {/* Enrollment Trend */}
        <div className="flex-1 rounded-[8px] bg-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#191c1e]">Enrollment Trend</h2>
              <p className="mt-1 text-sm font-medium text-[#767683]">
                Track how many students joined your courses
              </p>
            </div>
            <div className="relative">
              <select className="h-9 w-[118px] appearance-none rounded-[8px] border border-[#ececec] bg-white pl-4 pr-8 text-sm font-semibold text-[#191c1e] focus:outline-none cursor-pointer">
                <option>This Week</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767683]" />
            </div>
          </div>

          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={enrollmentData}
                margin={{ top: 10, right: 10, left: -10, bottom: 28 }}
              >
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c83e0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c83e0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={40}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  tick={(props: any) => {
                    const { x, y, payload } = props
                    const datum = enrollmentData.find(d => d.day === payload?.value)
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={12} textAnchor="middle" fill="#767683" fontSize={9} fontWeight={700} letterSpacing={1}>
                          {payload?.value}
                        </text>
                        <text x={0} y={0} dy={25} textAnchor="middle" fill="#767683" fontSize={9} fontWeight={700}>
                          {datum?.date}
                        </text>
                      </g>
                    )
                  }}
                />
                <YAxis
                  ticks={[0, 25, 50, 100, 150, 200]}
                  domain={[0, 200]}
                  tick={{ fill: '#767683', fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  cursor={{ stroke: '#99a4ff', strokeWidth: 1.5 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded-lg bg-[#000b60] px-3 py-1.5 text-xs font-bold text-white shadow-md">
                        {payload[0].value}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7c83e0"
                  strokeWidth={2.5}
                  fill="url(#enrollGrad)"
                  dot={false}
                  activeDot={{ r: 7, fill: 'white', stroke: '#000b60', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue */}
        <div
          className="w-[330px] shrink-0 rounded-[8px] p-8 flex flex-col"
          style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
        >
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-semibold text-white">Revenue</h2>
            <div className="relative">
              <select className="h-7 appearance-none rounded-[6px] border border-white/20 bg-transparent pl-3 pr-7 text-sm font-semibold text-white focus:outline-none cursor-pointer">
                <option className="bg-[#142283]">Monthly</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white" />
            </div>
          </div>

          <div className="mt-6 flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 20, right: 0, left: -30, bottom: 0 }}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'white', fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.month === 'MAY' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 shrink-0 text-[#dfe0ff]" />
            <span className="text-xs font-bold text-[#dfe0ff]">
              18.4% increase from last month
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-5 pb-4">
        {/* Top Courses + Transcoding */}
        <div className="flex-1 space-y-6 rounded-[8px] bg-white p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#000b60]">Top Courses Performance</h2>
            <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#767683]">
              Enrollment &amp; Revenue
            </span>
          </div>

          <div className="space-y-4">
            {topCourses.map(course => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-[8px] border border-[rgba(198,197,212,0.2)] p-[17px]"
              >
                <div>
                  <p className="text-base font-bold text-[#191c1e]">{course.name}</p>
                  <p className="mt-0.5 text-sm font-medium text-[#454652]">
                    {course.students} Students
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-extrabold text-[#1a237e]">₹{course.revenue}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#767683]">
                    Total Purchased
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Transcoding Status */}
          <div className="space-y-4 rounded-[8px] bg-[#f2f4f6] px-6 pt-7 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-10 items-center justify-center rounded-[6px] bg-indigo-100">
                <Film className="h-5 w-5 text-[#1a237e]" />
              </div>
              <p className="text-sm font-bold text-[#1a237e]">Content Transcoding Status</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#767683]">
                    LECTURE_04_INTRO.MP4
                  </span>
                  <span className="text-[10px] font-bold text-[#767683]">78%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#e0e3e5]">
                  <div className="h-full rounded-full bg-[#1a237e]" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="shrink-0 rounded-[2px] bg-[#1a237e] px-2 py-1">
                <span className="text-[10px] font-bold text-white">Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="w-[330px] shrink-0 rounded-[8px] bg-white p-8">
          <h2 className="text-[18px] font-bold text-[#191c1e]">Recent Activity</h2>

          <div className="mt-6">
            {recentActivity.map((item, idx) => {
              const isLast = idx === recentActivity.length - 1
              return (
                <div
                  key={item.id}
                  className="relative flex gap-4"
                  style={{ minHeight: isLast ? undefined : '87px' }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[12px] text-xs font-bold text-white overflow-hidden"
                      style={{ backgroundColor: item.bg }}
                    >
                      {item.isPayment ? (
                        <CreditCard className="h-4 w-4 text-[#1a237e]" />
                      ) : (
                        item.initials
                      )}
                    </div>
                    {!isLast && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[rgba(198,197,212,0.3)]" />
                    )}
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-sm font-bold text-[#191c1e]">{item.name}</p>
                    <p className="text-xs text-[#454652]">{item.detail}</p>
                    <p className="mt-1 text-[10px] text-[#767683]">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
