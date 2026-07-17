import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreVertical, Filter, ArrowUpDown } from 'lucide-react'
import { TbMessage2 } from 'react-icons/tb'
import { MdOutlineCalendarMonth } from 'react-icons/md'
import { RiMegaphoneLine } from 'react-icons/ri'
import { IoAddCircleOutline } from 'react-icons/io5'
import { Button, Heading, Paragraph, DataTable, ConfirmDeleteModal } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { useGetAllAnnouncements, useDeleteAnnouncement } from '@/hooks/announcement'
import { formatDate, formatDateTime, formatLongDate } from '@/utils/helper/formatDate'
import { getTodayDate, parseTimePeriod } from '@/utils/timePeriod'
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

type AnnouncementStatus = 'draft' | 'scheduled' | 'active' | 'expired'

// Derive a status from the row. ISO yyyy-mm-dd strings compare correctly, so we
// string-compare against today (date-accurate, no timezone drift).
const deriveStatus = (row: any): AnnouncementStatus => {
  if (row?.is_draft) return 'draft'

  const period = parseTimePeriod(row?.time_period)
  const today = getTodayDate()

  if (period?.start && period.start > today) return 'scheduled'
  if (period?.end && period.end < today) return 'expired'
  return 'active'
}

// Pill label + dot/text/background colors per status.
const STATUS_META: Record<AnnouncementStatus, { label: string; text: string; dot: string; bg: string }> = {
  draft: { label: 'Draft', text: 'text-gray-500', dot: 'bg-gray-400', bg: 'bg-gray-100' },
  scheduled: { label: 'Scheduled', text: 'text-orange-500', dot: 'bg-orange-400', bg: 'bg-orange-50' },
  active: { label: 'Active', text: 'text-[#00875A]', dot: 'bg-[#00875A]', bg: 'bg-[#E6F4EF]' },
  expired: { label: 'Expired', text: 'text-gray-400', dot: 'bg-gray-400', bg: 'bg-gray-100' },
}

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
  const [pageSize, setPageSize] = useState(10)
  const [rangeLabel, setRangeLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Only filter by range once both ends are picked.
  const dateRangeActive = !!startDate && !!endDate

  // query
  const { data: announcements, isLoading: getAllAnnouncementsLoading } = useGetAllAnnouncements({
    page,
    limit: pageSize,
    filter: activeTab === 'Drafts' ? 'draft' : 'all',
    search: "",
    start_date: dateRangeActive ? startDate : undefined,
    end_date: dateRangeActive ? endDate : undefined,
  })

  // mutation
  const { mutateAsync: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; title: string } | null>(null)




  const announcementsData = announcements?.data ?? []
  const announcementsTotal = announcements?.total ?? 0


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
          <span
            // onClick={() => navigate(`/announcements/${row.id}`)}
            className="text-sm font-semibold text-[#191c1e] cursor-pointer"
          >{row?.title}</span>
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
      header: 'Created',
      render: row => <span className="text-sm text-[#767683]">{formatDateTime(row?.created_at)}</span>,
    },
    {
      key: 'timePeriod',
      header: 'Time Period',
      render: row => {
        const period = parseTimePeriod(row?.time_period)
        if (!period) return <span className="text-sm text-[#767683]" />
        return (
          <span className="text-sm text-[#767683]">
            <span className="whitespace-nowrap">{formatLongDate(period.start)}</span>
            {' – '}
            <span className="whitespace-nowrap">{formatLongDate(period.end)}</span>
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: row => {
        const meta = STATUS_META[deriveStatus(row)]
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.bg} ${meta.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        )
      },
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




  // Open the confirmation modal for an announcement (does not delete yet).
  const handleDeleteAnnouncement = (id: any) => {
    const announcement = announcementsData.find((a: any) => a.id === id)
    setDeleteTarget({ id, title: announcement?.title ?? 'this announcement' })
  }

  const confirmDeleteAnnouncement = async () => {
    if (!deleteTarget) return
    const toastId = toast.loading("Deleting announcement...")
    try {
      await deleteAnnouncement(deleteTarget.id)
      toast.success("Announcement deleted successfully", { id: toastId })
      setDeleteTarget(null)
    } catch {
      // Error toast handled globally; just clear the loading spinner.
      toast.dismiss(toastId)
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
          {/* Date range filter */}
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5">
            <MdOutlineCalendarMonth size={16} className="text-[#767683] shrink-0" />
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="bg-transparent outline-none text-sm text-[#191c1e] font-medium cursor-pointer"
            />
            <span className="text-[#767683]">–</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="bg-transparent outline-none text-sm text-[#191c1e] font-medium cursor-pointer"
            />
            {dateRangeActive && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setPage(1) }}
                className="text-xs text-[#767683] font-semibold hover:text-[#2c1452] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
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

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDeleteAnnouncement}
        title="Delete Announcement"
        itemName={deleteTarget?.title}
        loading={isDeleting}
      />
    </div>
  )
}

export default AnnouncementsPage
