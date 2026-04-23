import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreVertical, Filter, ArrowUpDown } from 'lucide-react'
import { TbMessage2 } from 'react-icons/tb'
import { MdOutlineCalendarMonth } from 'react-icons/md'
import { RiMegaphoneLine } from 'react-icons/ri'
import { IoAddCircleOutline } from 'react-icons/io5'
import { Button, Heading, Paragraph, DataTable, Spinner } from '@/components/ui'
import type { TableColumn } from '@/components/ui'

type Announcement = {
  id: number
  name: string
  audience: string
  course: string
  date: string
  timePeriod: string
  status: 'Active' | 'Draft' | 'Archived'
  iconType: 'megaphone' | 'calendar' | 'message'
}

const ANNOUNCEMENTS: Announcement[] = [
  { id: 1, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'megaphone' },
  { id: 2, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'calendar' },
  { id: 3, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'message' },
  { id: 4, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'megaphone' },
  { id: 5, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'calendar' },
  { id: 6, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'message' },
  { id: 7, name: 'Final Examination Schedule', audience: 'All Users', course: 'Advanced Calculus', date: 'May 12, 2024', timePeriod: '09:00 AM –\n10:00 AM', status: 'Active', iconType: 'megaphone' },
]

const AnnouncementIcon = ({ type }: { type: Announcement['iconType'] }) => {
  const configs = {
    megaphone: { bg: 'bg-red-100', icon: <RiMegaphoneLine size={16} className="text-red-500" /> },
    calendar: { bg: 'bg-orange-100', icon: <MdOutlineCalendarMonth size={16} className="text-orange-500" /> },
    message: { bg: 'bg-blue-100', icon: <TbMessage2 size={16} className="text-blue-500" /> },
  }
  const { bg, icon } = configs[type]
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} shrink-0`}>
      {icon}
    </div>
  )
}

type Tab = 'All' | 'Drafts' | 'Archive'

const COLUMNS: TableColumn<Announcement>[] = [
  {
    key: 'name',
    header: 'Announcement Name',
    render: row => (
      <div className="flex items-center gap-3">
        <AnnouncementIcon type={row.iconType} />
        <span className="text-sm font-semibold text-[#191c1e]">{row.name}</span>
      </div>
    ),
  },
  {
    key: 'audience',
    header: 'Audience',
    render: row => <span className="text-sm text-[#767683]">{row.audience}</span>,
  },
  {
    key: 'course',
    header: 'Course',
    render: row => <span className="text-sm text-[#767683]">{row.course}</span>,
  },
  {
    key: 'date',
    header: 'Date',
    render: row => <span className="text-sm text-[#767683]">{row.date}</span>,
  },
  {
    key: 'timePeriod',
    header: 'Time Period',
    render: row => (
      <span className="text-sm text-[#767683] whitespace-pre-line">{row.timePeriod}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: row => (
      <span className="text-sm font-bold text-[#00875A]">{row.status}</span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    headerClassName: 'text-right',
    cellClassName: 'text-right',
    render: () => (
      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <MoreVertical size={15} className="text-[#767683]" />
      </button>
    ),
  },
]

const TABS: Tab[] = ['All', 'Drafts', 'Archive']

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const AnnouncementsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner label="Loading announcements..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <motion.div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5 px-2 pt-2" {...fadeUp(0.04)}>
        <div>
          <Heading className="text-[#000B60]">Announcements</Heading>
          <Paragraph className="text-[#767683] mt-1">
            Communicate important updates and academic news across your enrolled student groups.
          </Paragraph>
        </div>
        <Button variant="primary" className="!h-10 !text-sm !px-5 md:shrink-0" onClick={() => navigate('/announcements/create')}>
          <IoAddCircleOutline size={20} /> Create Announcement
        </Button>
      </motion.div>

      {/* Tabs + Filters */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F2F4F6] rounded-xl px-4 py-2 mb-5 mx-2" {...fadeUp(0.08)}>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab
                ? 'bg-white text-[#000B60]'
                : 'text-gray-500 hover:text-[#000B60]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-[#767683] font-semibold hover:text-[#000B60] transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-1.5 text-sm text-[#767683] font-semibold hover:text-[#000B60] transition-colors">
            <ArrowUpDown size={14} />
            Sort by: Date
          </button>
        </div>
      </motion.div>

      {/* Table — flex-1 + min-h-0 keeps scroll inside table, no page scroll */}
      <motion.div className="flex-1 min-h-0 px-2" {...fadeUp(0.12)}>
        <DataTable
          columns={COLUMNS}
          data={ANNOUNCEMENTS}
          defaultPageSize={10}
          onRowClick={row => navigate(`/announcements/${row.id}`)}
        />
      </motion.div>

    </div>
  )
}

export default AnnouncementsPage
