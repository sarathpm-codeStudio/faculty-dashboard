import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MoreHorizontal } from 'lucide-react'
import { Heading, Paragraph, Spinner, DataTable, FilterSelect, FilterDatePicker } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import man from '@/assets/images/man.jpg'
import { IoFilterSharp } from "react-icons/io5";

type Student = {
  id: number
  avatar: string
  name: string
  course: string
  enrollmentDate: string
  email: string
  status: 'Active' | 'Expired'
}

const MOCK_STUDENTS: Student[] = [
  { id: 1, avatar: man, name: 'Elena Rodriguez', course: 'Advanced Algorithms', enrollmentDate: 'Sep 14, 2024', email: 'e.rodriguez@academy.edu', status: 'Active' },
  { id: 2, avatar: man, name: 'Julian Vance', course: 'Data Structures', enrollmentDate: 'Sep 14, 2024', email: 'j.vance@academy.edu', status: 'Active' },
  { id: 3, avatar: man, name: 'Maya Ishikawa', course: 'Modern Philosophy', enrollmentDate: 'Sep 10, 2024', email: 'm.ishikawa@academy.edu', status: 'Expired' },
  { id: 4, avatar: man, name: 'Marcus Kalu', course: 'Linear Algebra II', enrollmentDate: 'Aug 28, 2024', email: 'm.kalu@academy.edu', status: 'Active' },
  { id: 5, avatar: man, name: 'Sarah Bennett', course: 'Cybersecurity Ethics', enrollmentDate: 'Sep 01, 2024', email: 's.bennett@academy.edu', status: 'Active' },
  { id: 6, avatar: man, name: 'Priya Sharma', course: 'Cost Accounting', enrollmentDate: 'Aug 20, 2024', email: 'p.sharma@academy.edu', status: 'Expired' },
  { id: 7, avatar: man, name: 'Aditya Rao', course: 'Taxation', enrollmentDate: 'Aug 15, 2024', email: 'a.rao@academy.edu', status: 'Active' },
  { id: 8, avatar: man, name: 'Emily Chen', course: 'Business Laws', enrollmentDate: 'Sep 05, 2024', email: 'e.chen@academy.edu', status: 'Active' },
  { id: 9, avatar: man, name: 'David Okonkwo', course: 'Financial Management', enrollmentDate: 'Jul 30, 2024', email: 'd.okonkwo@academy.edu', status: 'Active' },
  { id: 10, avatar: man, name: 'Sophie Laurent', course: 'Macroeconomics', enrollmentDate: 'Aug 10, 2024', email: 's.laurent@academy.edu', status: 'Expired' },
  { id: 11, avatar: man, name: 'Ravi Menon', course: 'Advanced Algorithms', enrollmentDate: 'Sep 12, 2024', email: 'r.menon@academy.edu', status: 'Active' },
  { id: 12, avatar: man, name: 'Hana Kobayashi', course: 'Data Structures', enrollmentDate: 'Sep 08, 2024', email: 'h.kobayashi@academy.edu', status: 'Active' },
]

const COLUMNS: TableColumn<Student>[] = [
  {
    key: 'name',
    header: 'Student Name',
    render: row => (
      <div className="flex items-center gap-3">
        <img src={row.avatar} alt={row.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
        <span className="font-semibold text-[#191c1e]">{row.name}</span>
      </div>
    ),
  },
  {
    key: 'course',
    header: 'Course',
    render: row => <span className="text-[#191c1e]">{row.course}</span>,
  },
  {
    key: 'enrollmentDate',
    header: 'Enrollment Date',
    render: row => <span className="text-[#767683]">{row.enrollmentDate}</span>,
  },
  {
    key: 'email',
    header: 'Email Address',
    render: row => <span className="text-[#767683]">{row.email}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: row => (
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${row.status === 'Active'
          ? ' text-[#00875A]'
          : ' text-[#BA1A1A]'
          }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <MoreHorizontal size={16} className="text-[#767683]" />
      </button>
    ),
    headerClassName: 'text-right',
    cellClassName: 'text-right',
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const StudentsPage = () => {
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [rangeLabel, setRangeLabel] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner label="Loading students..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <motion.div className="mb-6 px-2 pt-2" {...fadeUp(0.04)}>
        <Heading className="text-[#000B60]">Enrolled Students</Heading>
        <Paragraph className="text-black font-bold mt-0.5">
          {MOCK_STUDENTS.length.toLocaleString()} active learners.
        </Paragraph>
      </motion.div>

      {/* Filter bar */}
      <motion.div className="flex items-center gap-3 mb-5 px-2 justify-between" {...fadeUp(0.08)}>
        <div className="flex items-center gap-3">
          <FilterSelect
            value={department}
            onChange={e => setDepartment(e.target.value)}
            options={[
              { value: '', label: 'All Departments' },
              { value: 'commerce', label: 'Commerce' },
              { value: 'science', label: 'Science' },
              { value: 'arts', label: 'Arts' },
            ]}
          />

          <FilterDatePicker
            value={filterDate}
            onChange={setFilterDate}
            placeholder="Select Date"
          />

          <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-[#E6E8EA] text-sm font-semibold text-gray-500 transition-colors">
            <IoFilterSharp size={14} className="text-[#767683]" />
            More Filters
          </button>
        </div>
        {rangeLabel && (
          <span className="text-xs text-[#767683] font-medium shrink-0">{rangeLabel}</span>
        )}
      </motion.div>

      {/* Table */}
      <motion.div className="flex-1 min-h-0" {...fadeUp(0.12)}>
        <DataTable
          columns={COLUMNS}
          data={MOCK_STUDENTS}
          defaultPageSize={10}
          onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s}–${e} of ${t}`)}
        />
      </motion.div>

    </div>
  )
}

export default StudentsPage
