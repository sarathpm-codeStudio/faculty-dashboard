import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MoreVertical, CheckCircle2, FileText, BarChart2, SlidersHorizontal, Download } from 'lucide-react'
import { Heading, Paragraph, Spinner, DataTable, Input } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import Button from '@/components/ui/Button'
import { IoAddCircleOutline } from "react-icons/io5";


type Test = {
  id: number
  name: string
  updatedAgo: string
  course: string
  type: string
  questions: number
  attempts: number
  status: 'Active' | 'Draft'
}

const MOCK_TESTS: Test[] = [
  { id: 1, name: 'Mid-Term Differential Equations', updatedAgo: 'Updated 2 days ago', course: 'Taxation', type: 'MCQ Only', questions: 45, attempts: 1240, status: 'Active' },
  { id: 2, name: 'Introduction to Quantum Mechanics', updatedAgo: 'Updated 4 days ago', course: 'Taxation', type: 'MCQ Only', questions: 30, attempts: 892, status: 'Active' },
  { id: 3, name: 'Ethics in AI Research – Final', updatedAgo: 'Updated 1 hour ago', course: 'Taxation', type: 'MCQ Only', questions: 12, attempts: 0, status: 'Draft' },
  { id: 4, name: 'Cell Biology Foundations Quiz 2', updatedAgo: 'Updated 1 hour ago', course: 'Taxation', type: 'MCQ Only', questions: 20, attempts: 3450, status: 'Active' },
  { id: 5, name: 'Advanced Financial Accounting', updatedAgo: 'Updated 3 days ago', course: 'Taxation', type: 'MCQ Only', questions: 35, attempts: 620, status: 'Active' },
  { id: 6, name: 'Business Communication Skills', updatedAgo: 'Updated 5 days ago', course: 'Business Laws', type: 'MCQ Only', questions: 25, attempts: 0, status: 'Draft' },
  { id: 7, name: 'Corporate Law Final Exam', updatedAgo: 'Updated 1 week ago', course: 'Business Laws', type: 'MCQ Only', questions: 50, attempts: 2100, status: 'Active' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const COLUMNS: TableColumn<Test>[] = [
  {
    key: 'name',
    header: 'Test Name',
    render: row => (
      <div>
        <p className="font-bold text-[#191c1e] text-sm">{row.name}</p>
        <p className="text-[11px] text-[#767683] mt-0.5">{row.updatedAgo}</p>
      </div>
    ),
  },
  {
    key: 'course',
    header: 'Course',
    render: row => <span className="text-[#191c1e] text-sm">{row.course}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    render: row => <span className="text-[#191c1e] text-sm">{row.type}</span>,
  },
  {
    key: 'questions',
    header: 'Questions',
    render: row => <span className="text-[#191c1e] text-sm font-medium">{row.questions}</span>,
  },
  {
    key: 'attempts',
    header: 'Attempts',
    render: row => <span className="text-[#191c1e] text-sm font-medium">{row.attempts.toLocaleString()}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: row => (
      <span className={`inline-flex items-center gap-1 text-xs font-bold ${row.status === 'Active' ? 'text-[#00875A]' : 'text-orange-500'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-[#00875A]' : 'bg-orange-500'}`} />
        {row.status}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    headerClassName: 'text-right',
    cellClassName: 'text-right',
    render: () => (
      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <MoreVertical size={16} className="text-[#767683]" />
      </button>
    ),
  },
]

const TestsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rangeLabel, setRangeLabel] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const filtered = MOCK_TESTS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.course.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = MOCK_TESTS.filter(t => t.status === 'Active').length
  const draftCount = MOCK_TESTS.filter(t => t.status === 'Draft').length
  const totalAttempts = MOCK_TESTS.reduce((s, t) => s + t.attempts, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner label="Loading tests..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-5">

      {/* Header */}
      <motion.div className="flex items-center justify-between" {...fadeUp(0.04)}>
        <div>
          <Heading className="text-[#000B60]">Tests</Heading>
          <div className="flex items-center gap-1.5 mt-0.5  p-1 rounded-lg bg-[#A8EDFF]">
            <Paragraph className="text-black font-bold !text-[12px]">
              Total Tests Created: {MOCK_TESTS.length}
            </Paragraph>
            {/* <button className="w-5 h-5 rounded-full bg-[#000B60] flex items-center justify-center">
              <Plus size={11} color="white" strokeWidth={3} />
            </button> */}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
          <Button variant="primary" className="!h-10 !text-sm !px-4 !font-semibold" onClick={() => navigate('/tests/create')}>
            <IoAddCircleOutline size={20} />
            Create Test
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div className="grid grid-cols-3 gap-4" {...fadeUp(0.08)}>
        <StatCard
          icon={<CheckCircle2 size={28} className="text-[#000B60]" />}
          value={String(activeCount)}
          label="Active Tests"
        />
        <StatCard
          icon={<FileText size={28} className="text-orange-400" />}
          value={String(draftCount)}
          label="Drafts"
        />
        <StatCard
          icon={<BarChart2 size={28} className="text-green-500" />}
          value={totalAttempts.toLocaleString()}
          label="Total Completed Attempts"
        />
      </motion.div>

      {/* Assessment Registry */}
      <motion.div className="flex-1 min-h-0 flex flex-col gap-3" {...fadeUp(0.12)}>
        <div className="flex items-center justify-between">
          <Heading className="text-[#000B60] !text-xl">Assessment Registry</Heading>
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
            data={filtered}
            defaultPageSize={5}
            onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
            onRowClick={row => navigate(`/tests/${row.id}`)}
          />
        </div>

        {rangeLabel && (
          <p className="text-xs text-[#767683] font-medium">{rangeLabel}</p>
        )}
      </motion.div>

    </div>
  )
}

export default TestsPage
