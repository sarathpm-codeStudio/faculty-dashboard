import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreVertical, SlidersHorizontal, Download, User, ArrowLeft } from 'lucide-react'
import { Heading, Paragraph, Spinner, DataTable } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import { useGetTestById } from '@/hooks/test'
import { useGetTestAnalytics } from '@/hooks/test'
import { useGetAllAttemptsByTestId } from '@/hooks/test'

type Candidate = {
  id: number
  name: string
  studentId: string
  initials: string
  avatarColor: string
  startTime: string
  endTime: string
  duration: string
  score: number
  total: number
  result: 'PASS' | 'MERIT' | 'FAIL'
  resultPct: number
}

const MOCK_CANDIDATES: Candidate[] = [
  { id: 1, name: 'Julian Martinez', studentId: '#44500', initials: 'JM', avatarColor: '#4F6EF7', startTime: '09:02 AM', endTime: '10:45 AM', duration: '1h 43m total', score: 92, total: 100, result: 'PASS', resultPct: 92 },
  { id: 2, name: 'Elena Rossi', studentId: '#44521', initials: 'ER', avatarColor: '#8B5CF6', startTime: '08:00 AM', endTime: '09:58 AM', duration: '58m total', score: 88, total: 100, result: 'PASS', resultPct: 88 },
  { id: 3, name: 'Samuel Bennett', studentId: '#45103', initials: 'SB', avatarColor: '#10B981', startTime: '09:15 AM', endTime: '11:10 AM', duration: '1h 55m total', score: 74, total: 100, result: 'MERIT', resultPct: 74 },
  { id: 4, name: 'Clara Huang', studentId: '#44472', initials: 'CH', avatarColor: '#0EA5E9', startTime: '08:05 AM', endTime: '10:52 AM', duration: '1h 47m total', score: 81, total: 100, result: 'PASS', resultPct: 81 },
  { id: 5, name: 'Samuel Bennett', studentId: '#45103', initials: 'SB', avatarColor: '#10B981', startTime: '09:15 AM', endTime: '11:10 AM', duration: '1h 55m total', score: 74, total: 100, result: 'MERIT', resultPct: 74 },
  { id: 6, name: 'Clara Huang', studentId: '#44472', initials: 'CH', avatarColor: '#0EA5E9', startTime: '08:05 AM', endTime: '10:52 AM', duration: '1h 47m total', score: 81, total: 100, result: 'PASS', resultPct: 81 },
]

const resultStyle: Record<string, { bg: string; text: string }> = {
  PASS: { bg: '#E6FBF7', text: '#00A98F' },
  MERIT: { bg: '#FFF4E5', text: '#F59E0B' },
  FAIL: { bg: '#FEE2E2', text: '#EF4444' },
}



const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const TestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rangeLabel, setRangeLabel] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)


  
// queries
  const { data: test, isLoading: testLoading } = useGetTestById(id, !!id)
  const { data: testAnalytics, isLoading: testAnalyticsLoading } = useGetTestAnalytics(id, !!id)
  const { data: attempts, isLoading: attemptsLoading } = useGetAllAttemptsByTestId(id, { page, limit: pageSize }, !!id)


  const COLUMNS: TableColumn<Candidate>[] = [
    {
      key: 'student',
      header: 'Students',
      render: row => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: row.avatarColor }}
          >
            {row.initials}
          </div>
          <div>
            <p className="font-semibold text-[#191c1e] text-sm">{row.name}</p>
            <p className="text-[11px] text-[#767683]">ID: {row.studentId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'timing',
      header: 'Timing (Start/End)',
      render: row => (
        <div>
          <p className="text-sm text-[#191c1e] font-medium">{row.startTime} – {row.endTime}</p>
          <p className="text-[11px] text-[#767683]">{row.duration}</p>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Score Detail',
      render: row => (
        <span className="text-sm font-semibold text-[#191c1e]">{row.score} / {row.total}</span>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      render: row => {
        const style = resultStyle[row.result]
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {row.result} • {row.resultPct}%
          </span>
        )
      },
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




  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [id])

  const totalCandidates = MOCK_CANDIDATES.length
  const passed = MOCK_CANDIDATES.filter(c => c.result !== 'FAIL').length
  const completionRate = Math.round((passed / totalCandidates) * 100)
  const topScore = Math.max(...MOCK_CANDIDATES.map(c => c.score))
  const topScorer = MOCK_CANDIDATES.find(c => c.score === topScore)

  if (loading || testLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner label="Loading test details..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-5">

      {/* Back + Heading */}
      <motion.div {...fadeUp(0.04)}>
        <button
          onClick={() => navigate('/tests')}
          className="flex items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#000B60] mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tests
        </button>
        <Heading className="text-[#000B60]">{test?.data?.title ?? 'Test Details'}</Heading>
      </motion.div>

      {/* Stat Cards */}
      <motion.div className="grid grid-cols-3 gap-4" {...fadeUp(0.08)}>
        <StatCard
          icon={null}
          label="Completion Rate"
          value={`${testAnalytics?.data?.completedCount}/${testAnalytics?.data?.totalAttempts}`}
          valueColor="#000B60"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#767683]">{testAnalytics?.data?.completionRate}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#000B60]"
              style={{ width: `${testAnalytics?.data?.completionRate}%` }}
            />
          </div>
        </StatCard>
        <StatCard
          icon={null}
          label="Avg. Duration"
          value={testAnalytics?.data?.avgDuration?.display}
          valueColor="#000B60"
        >
          <Paragraph className="!text-xs text-[#767683]">Allocated: {testAnalytics?.data?.allocatedDuration?.display}</Paragraph>
        </StatCard>
        <StatCard
          icon={null}
          label="Top Student"
          value={`${testAnalytics?.data?.topStudent?.score}/${testAnalytics?.data?.topStudent?.totalQuestions}`}
          valueColor="#000B60"
        >
          {topScorer && (
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-[#000B60]" />
              <Paragraph className="!text-xs text-[#000B60]">{testAnalytics?.data?.topStudent?.name}</Paragraph>
            </div>
          )}
        </StatCard>
      </motion.div>

      {/* Candidate Performance */}
      <motion.div className="flex-1 min-h-0 flex flex-col gap-3" {...fadeUp(0.12)}>
        <div className="flex items-center justify-between">
          <Heading className="text-[#000B60] !text-xl">Candidate Performance</Heading>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#767683] hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={13} />
              Filter
            </button>
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#767683] hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={COLUMNS}
            data={attempts?.data?.data ?? []}
            total={attempts?.data?.total ?? 0}
            page={page}
            loading={attemptsLoading}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
            
          />
        </div>

        {rangeLabel && (
          <p className="text-xs text-[#767683] font-medium">{rangeLabel}</p>
        )}
      </motion.div>

    </div>
  )
}

export default TestDetailPage
