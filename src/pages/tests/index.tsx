


import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MoreVertical, CheckCircle2, FileText, BarChart2, SlidersHorizontal, Download } from 'lucide-react'
import { Heading, Paragraph, DataTable, Input, SkeletonStatCard, ConfirmDeleteModal } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import Button from '@/components/ui/Button'
import { IoAddCircleOutline } from "react-icons/io5"
import { useGetAllTests, useDeleteTest } from '@/hooks/test'
import { timeAgo } from '@/utils/helper/formatDate'
import ActionsMenu from '@/components/features/ActionBtn'
import { toast } from 'sonner'
import { useGetTestsPageAnalytics } from '@/hooks/test'

type Test = {
  id: number
  title: string
  updatedAgo: string
  course: string
  type: string
  questions: number
  attempts: number
  status: 'Active' | 'Draft'
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})


const TestsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [rangeLabel, setRangeLabel] = useState('')

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; title: string } | null>(null)


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  // mutation
  const { mutateAsync: deleteTest, isPending: isDeletingTest } = useDeleteTest()


  // Open the confirmation modal for a test (does not delete yet).
  const handleDeleteTest = (id: any) => {
    const test = testsData.find((t: any) => t.id === id)
    setDeleteTarget({ id, title: test?.title ?? 'this test' })
  }

  const confirmDeleteTest = async () => {
    if (!deleteTarget) return
    const toastId = toast.loading("Deleting test...")
    try {
      await deleteTest(deleteTarget.id)
      toast.success('Test deleted successfully', { id: toastId })
      setDeleteTarget(null)
    } catch {
      // Error toast handled globally; just clear the loading spinner.
      toast.dismiss(toastId)
    }
  }


  const COLUMNS: TableColumn<any>[] = [
    {
      key: 'name',
      header: 'Test Name',
      render: row => (
        <div>
          <p className="font-bold text-[#191c1e] text-sm cursor-pointer" onClick={() => { navigate(`/tests/${row?.id}/analytics`) }} >{row?.title}</p>
          <p className="text-[11px] text-[#767683] mt-0.5">{timeAgo(row?.updated_at)}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: row => (
        <span
          className="text-[#191c1e] text-sm block max-w-[160px] lg:max-w-[260px] truncate"
          title={row?.courses?.title}
        >
          {row?.courses?.title}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: row => <span className="text-[#191c1e] text-sm">{row?.type?.toUpperCase()}</span>,
    },
    {
      key: 'questions',
      header: 'Questions',
      render: row => <span className="text-[#191c1e] text-sm font-medium">{row?.question_count}</span>,
    },
    {
      key: 'attempts',
      header: 'Attempts',
      render: row => <span className="text-[#191c1e] text-sm font-medium">{row?.attempt_count}</span>,
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
    // {
    //   key: 'actions',
    //   header: 'Actions',
    //   headerClassName: 'text-right',
    //   cellClassName: 'text-right',
    //   render: (row) => (
    //     <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
    //       <MoreVertical size={16} className="text-[#767683]" />
    //     </button>


    //   ),
    // },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: row => (
        <ActionsMenu
          id={row.id}
          onViewAnalytics={(id) => navigate(`/tests/${id}/analytics`)}
          editPath={`/tests/${row.id}/edit`}         // ← dynamic per row
          onDelete={(id) => handleDeleteTest(id)} // replace with your delete handler
        />
      ),
    },
  ]


  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  // query
  const { data: testsPageAnalytics, isLoading: testsPageAnalyticsLoading } = useGetTestsPageAnalytics()

  const { data: tests, isLoading: testsLoading } = useGetAllTests({
    page,
    limit: pageSize,
    search,
    filter: 'all',
  })

  const testsData = tests?.data ?? []
  const testsTotal = tests?.total ?? 0

  // Stat counts derived from API summary or fallback to local calc
  const activeCount = testsData.filter((t: any) => t.is_draft === false).length
  const draftCount = testsData.filter((t: any) => t.is_draft === true).length
  // const totalAttempts = testsData.reduce((s: number, t: any) => s + t.attempts, 0)

  // if (testsLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <Spinner label="Loading tests..." />
  //     </div>
  //   )
  // }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-5">

      {/* Header */}
      <motion.div className="flex items-center justify-between" {...fadeUp(0.04)}>
        <div>
          <Heading className="text-[#2c1452]">Tests</Heading>
          <div className="flex items-center gap-1.5 mt-0.5 p-2 rounded-lg bg-[#E1C3FF]">
            <Paragraph className="text-black font-bold !text-[12px]">
              Total Tests Created: {testsTotal}
            </Paragraph>
          </div>
        </div>

        <div className="flex flex-nowrap items-start gap-3 shrink-0">
          <div className="w-44 lg:w-64 shrink-0">
            <Input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
              className="!h-11 !py-0 !text-sm"
            />
          </div>
          <Button
            variant="primary"
            className="!h-11 !text-sm !px-4 !font-semibold whitespace-nowrap"
            onClick={() => navigate('/tests/create')}
          >
            <IoAddCircleOutline size={20} />
            Create Test
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" {...fadeUp(0.08)}>
        {testsPageAnalyticsLoading ? (
          <>
            <SkeletonStatCard showIcon />
            <SkeletonStatCard showIcon />
            <SkeletonStatCard showIcon />
          </>
        ) : (
          <>
            <StatCard
              icon={<CheckCircle2 size={28} className="text-[#2c1452]" />}
              value={String(testsPageAnalytics?.activeTests ?? 0)}
              label="Active Tests"
            />
            <StatCard
              icon={<FileText size={28} className="text-orange-400" />}
              value={String(testsPageAnalytics?.draftTests ?? 0)}
              label="Drafts"
            />
            <StatCard
              icon={<BarChart2 size={28} className="text-green-500" />}
              value={String(testsPageAnalytics?.totalCompletedAttempts ?? 0)}
              label="Total Completed Attempts"
            />
          </>
        )}
      </motion.div>

      {/* Assessment Registry */}
      <motion.div className="flex-1 min-h-0 flex flex-col gap-3" {...fadeUp(0.12)}>
        <div className="flex items-center justify-between">
          <Heading className="text-[#2c1452] !text-xl">Assessment Registry</Heading>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#767683] hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={13} />
              Filter
            </button>
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#767683] hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={COLUMNS}
            data={testsData}
            total={testsTotal}
            page={page}
            loading={testsLoading}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
          // onRowClick={row => navigate(`/tests/${row.id}`)}
          />
        </div>

        {rangeLabel && (
          <p className="text-xs text-[#767683] font-medium">{rangeLabel}</p>
        )}
      </motion.div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => !isDeletingTest && setDeleteTarget(null)}
        onConfirm={confirmDeleteTest}
        title="Delete Test"
        itemName={deleteTarget?.title}
        loading={isDeletingTest}
      />
    </div>
  )
}

export default TestsPage