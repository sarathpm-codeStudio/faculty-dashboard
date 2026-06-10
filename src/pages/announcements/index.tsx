import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreVertical, Filter, ArrowUpDown } from 'lucide-react'
import { TbMessage2 } from 'react-icons/tb'
import { MdOutlineCalendarMonth } from 'react-icons/md'
import { RiMegaphoneLine } from 'react-icons/ri'
import { IoAddCircleOutline } from 'react-icons/io5'
import { Button, Heading, Paragraph, DataTable } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { useGetAllAnnouncements, useDeleteAnnouncement } from '@/hooks/announcement'
import { formatDate, formatDateTime } from '@/utils/helper/formatDate'
import ActionsMenu from '@/components/features/ActionBtn'
import { toast } from 'sonner'

type Announcement = {
  id: number
  title: string
  audience: string
  course: string
  date: string
  timePeriod: string
  status: 'Active' | 'Draft' | 'Archived'
  iconType: 'megaphone' | 'calendar' | 'message'
}



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



const TABS: Tab[] = ['All', 'Drafts']

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const AnnouncementsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [rangeLabel, setRangeLabel] = useState('')

  // query
  const { data: announcements, isLoading: getAllAnnouncementsLoading } = useGetAllAnnouncements({
    page,
    limit: pageSize,
    filter: activeTab === 'Drafts' ? 'draft' : 'all',
    search: "",
  })

  // mutation
  const { mutateAsync: deleteAnnouncement } = useDeleteAnnouncement()




  const announcementsData = announcements?.data?.data ?? []
  const announcementsTotal = announcements?.data?.total ?? 0


  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <Spinner label="Loading announcements..." />
  //     </div>
  //   )
  // }

  const COLUMNS: TableColumn<any>[] = [
    {
      key: 'name',
      header: 'Announcement Name',
      render: row => (
        <div className="flex items-center gap-3">
          <AnnouncementIcon type={"megaphone"} />
          <span onClick={() => navigate(`/announcements/${row.id}`)} className="text-sm font-semibold text-[#191c1e] cursor-pointer">{row?.title}</span>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Audience',
      render: row => <span className="text-sm text-[#767683]">{row?.course_id === null ? "All Students" : "Selected Course"}</span>,
    },
    {
      key: 'course',
      header: 'Course',
      render: row => <span className="text-sm text-[#767683]">{row.courses?.title || ""}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: row => <span className="text-sm text-[#767683]">{formatDateTime(row?.created_at)}</span>,
    },
    {
      key: 'timePeriod',
      header: 'Time Period',
      render: row => (
        <span className="text-sm text-[#767683] whitespace-pre-line">{row?.time_period.split("/").join(" to ") || ""}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${row?.is_draft ? 'text-orange-500' : 'text-[#00875A]'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row?.is_draft ? 'bg-orange-500' : 'bg-[#00875A]'
            }`} />
          {row?.is_draft ? 'Draft' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: row => (
        <ActionsMenu
          id={row.id}
          editPath={`/announcements/${row.id}/edit`}         // ← dynamic per row
          onDelete={(id) => handleDeleteAnnouncement(id)} // replace with your delete handler
          isAnalytic={false}
        />
      ),
    },
  ]




  const handleDeleteAnnouncement = async (id: any) => {

    const toastId = toast.loading("Deleting announcement...")

    try {

      const { data: response } = await deleteAnnouncement(id)

      if (response) {
        toast.success("Announcement deleted successfully", { id: toastId })
        navigate('/announcements')
      }

    } catch (error: any) {

      toast.error(error.message, { id: toastId })

    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <motion.div className="flex items-start justify-between mb-5 px-2 pt-2" {...fadeUp(0.04)}>
        <div>
          <Heading className="text-[#2c1452]">Announcements</Heading>
          <Paragraph className="text-[#767683] mt-1">
            Communicate important updates and academic news across your enrolled student groups.
          </Paragraph>
        </div>
        <Button variant="primary" className="!h-10 !text-sm !px-5 shrink-0" onClick={() => navigate('/announcements/create')}>
          <IoAddCircleOutline size={20} /> Create Announcement
        </Button>
      </motion.div>

      {/* Tabs + Filters */}
      <motion.div className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-4 py-2 mb-5 mx-2" {...fadeUp(0.08)}>
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab
                ? 'bg-white text-[#2c1452]'
                : 'text-gray-500 hover:text-[#2c1452]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {/* <button className="flex items-center gap-1.5 text-sm text-[#767683] font-semibold hover:text-[#2c1452] transition-colors">
            <Filter size={14} />
            Filter
          </button> */}
          <button className="flex items-center gap-1.5 text-sm text-[#767683] font-semibold hover:text-[#2c1452] transition-colors">
            <ArrowUpDown size={14} />
            Sort by: Date
          </button>
        </div>
      </motion.div>

      {/* Table — flex-1 + min-h-0 keeps scroll inside table, no page scroll */}
      <motion.div className="flex-1 min-h-0 px-2" {...fadeUp(0.12)}>
        <DataTable
          columns={COLUMNS}
          data={announcementsData}
          total={announcementsTotal}
          page={page}
          pageSize={pageSize}
          loading={getAllAnnouncementsLoading}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
        // onRowClick={row => navigate(`/announcements/${row.id}`)}
        />
      </motion.div>

    </div>
  )
}

export default AnnouncementsPage
