import { ChevronDown, Film } from 'lucide-react'
import { FaUsers } from "react-icons/fa6";
import { MdOutlineMenuBook } from "react-icons/md";
import { BsChatSquareTextFill } from "react-icons/bs";
import { HiMiniCurrencyDollar } from "react-icons/hi2";
import { MdVideoSettings } from "react-icons/md";
import {
  StatCard,
  SectionCard,
  ActivityItem,
  CoursePerformanceRow,
  ProgressBar,
} from '@/components/features'
import EnrollmentChart from './EnrollmentChart'
import RevenueChart from './RevenueChart'
import { Heading, Paragraph } from '@/components/ui'

const courses = [
  { id: 1, title: 'Advanced Macroeconomics', students: '1,240', revenue: '₹62,000.00' },
  { id: 2, title: 'CA Inter - Costing', students: '842', revenue: '₹42,100.00' },
  { id: 3, title: 'Financial Accounting', students: '756', revenue: '₹37,800.00' },
]

const activity = [
  { id: 1, fallback: 'JN', bg: '#F97316', name: 'John Enrolled', detail: 'Financial Accounting 101', time: '2 mins ago' },
  { id: 2, fallback: 'SR', bg: '#EAB308', name: 'Sarah Submitted', detail: 'Macroeconomics Test #3', time: '15 mins ago' },
  { id: 3, fallback: '₹', bg: 'rgba(188,194,255,0.5)', name: 'New Payment Received', detail: 'Course: Business Ethics', time: '45 mins ago' },
  { id: 4, fallback: 'MK', bg: '#3B82F6', name: 'Mike Posted a Doubt', detail: '"Question about balance sheets..."', time: '1 hour ago' },
]

const DashboardPage = () => (
  <div className="space-y-5">
    {/* ── Greeting + Filter ── */}
    <div className="flex items-end justify-between">
      <div>
        <Heading className='text-[#000b60]'>Hi, Salsabeel</Heading>
        <Paragraph className='text-[#454652] font-semibold' > Welcome back! Here's what's happening with your courses. </Paragraph>
        {/* <p className="mt-2 text-base font-medium text-[#454652]"> */}

        {/* </p> */}
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

    {/* ── Stat Cards ── */}
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#BCC2FF]"><FaUsers className="text-[#000b60]" size={25} /></div>}
        label="Total Students"
        value="1,050"
      />
      <StatCard
        icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#A8EDFF]"><MdOutlineMenuBook className="text-[#00A6BF]" size={25} /></div>}
        label="Active Courses"
        value="06"
      />
      <StatCard
        icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#FFDAD6]"><BsChatSquareTextFill className="text-[#BA1A1A]" size={25} /></div>}
        label="Pending Doubts"
        value="56"
      />
      <StatCard
        icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-gray-400"><HiMiniCurrencyDollar className="text-yellow-400" size={30} /></div>}
        label="Total Revenue"
        value="123,025"
        prefix="₹"
      />
    </div>

    {/* ── Charts Row ── */}
    <div className="grid grid-cols-3 gap-4 mt-10">
      <div className="col-span-2">
        <EnrollmentChart />
      </div>
      <RevenueChart />
    </div>

    {/* ── Bottom Row ── */}
    <div className="grid grid-cols-3 gap-4 items-start pb-4 mt-10">
      {/* Top Courses */}
      <div className="col-span-2">
        <SectionCard
          title="Top Courses Performance"
          title_color='text-[#000b60]'
          rightContent={
            <Paragraph className='text-[#767683]  font-bold'>
              Enrollment &amp; Revenue
            </Paragraph>
          }
        >
          <div className="space-y-3">
            {courses.map(c => (
              <CoursePerformanceRow
                key={c.id}
                title={c.title}
                students={c.students}
                revenue={c.revenue}
              />
            ))}
          </div>

          {/* Transcoding Status */}
          <div className="mt-6 rounded-lg bg-[#f2f4f6] px-6 pt-7 pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-9 w-10 items-center justify-center rounded-[6px] bg-white">
                <MdVideoSettings className="text-[#1a237e] " size={25} />
              </div>
              <p className="text-sm font-bold text-[#1a237e]">Content Transcoding Status</p>
            </div>
            <ProgressBar label="LECTURE_04_INTRO.MP4" value={78} status="Processing" />
          </div>
        </SectionCard>
      </div>

      {/* Recent Activity */}
      <SectionCard title="Recent Activity">
        <div className="space-y-0">
          {activity.map((item, idx) => (
            <ActivityItem
              key={item.id}
              avatarFallback={item.fallback}
              avatarBg={item.bg}
              name={item.name}
              detail={item.detail}
              time={item.time}
              showDivider={idx < activity.length - 1}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  </div >
)

export default DashboardPage
