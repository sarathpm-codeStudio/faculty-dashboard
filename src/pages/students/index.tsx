import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreHorizontal, User } from 'lucide-react'
import { Heading, Paragraph, DataTable, FilterSelect, FilterDatePicker } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import man from '@/assets/images/man.jpg'
import { useGetStudents } from '@/hooks/student'
import { useGetAllCourses } from '@/hooks/useCourse'
import { formatDateTime } from '@/utils/helper/formatDate'

type Student = {
  id: number
  avatar: string
  first_name: string
  last_name: string
  course: string
  enrollmentDate: string
  email: string
  status: 'Active' | 'Expired'
  courses: any[]
  avatar_url: string
  created_at: string
  recentActive: {
    display: string
  }
}

// const MOCK_STUDENTS: Student[] = [
//   { id: 1, avatar: man, name: 'Elena Rodriguez', course: 'Advanced Algorithms', enrollmentDate: 'Sep 14, 2024', email: 'e.rodriguez@academy.edu', status: 'Active' },
//   { id: 2, avatar: man, name: 'Julian Vance', course: 'Data Structures', enrollmentDate: 'Sep 14, 2024', email: 'j.vance@academy.edu', status: 'Active' },
//   { id: 3, avatar: man, name: 'Maya Ishikawa', course: 'Modern Philosophy', enrollmentDate: 'Sep 10, 2024', email: 'm.ishikawa@academy.edu', status: 'Expired' },
//   { id: 4, avatar: man, name: 'Marcus Kalu', course: 'Linear Algebra II', enrollmentDate: 'Aug 28, 2024', email: 'm.kalu@academy.edu', status: 'Active' },
//   { id: 5, avatar: man, name: 'Sarah Bennett', course: 'Cybersecurity Ethics', enrollmentDate: 'Sep 01, 2024', email: 's.bennett@academy.edu', status: 'Active' },
//   { id: 6, avatar: man, name: 'Priya Sharma', course: 'Cost Accounting', enrollmentDate: 'Aug 20, 2024', email: 'p.sharma@academy.edu', status: 'Expired' },
//   { id: 7, avatar: man, name: 'Aditya Rao', course: 'Taxation', enrollmentDate: 'Aug 15, 2024', email: 'a.rao@academy.edu', status: 'Active' },
//   { id: 8, avatar: man, name: 'Emily Chen', course: 'Business Laws', enrollmentDate: 'Sep 05, 2024', email: 'e.chen@academy.edu', status: 'Active' },
//   { id: 9, avatar: man, name: 'David Okonkwo', course: 'Financial Management', enrollmentDate: 'Jul 30, 2024', email: 'd.okonkwo@academy.edu', status: 'Active' },
//   { id: 10, avatar: man, name: 'Sophie Laurent', course: 'Macroeconomics', enrollmentDate: 'Aug 10, 2024', email: 's.laurent@academy.edu', status: 'Expired' },
//   { id: 11, avatar: man, name: 'Ravi Menon', course: 'Advanced Algorithms', enrollmentDate: 'Sep 12, 2024', email: 'r.menon@academy.edu', status: 'Active' },
//   { id: 12, avatar: man, name: 'Hana Kobayashi', course: 'Data Structures', enrollmentDate: 'Sep 08, 2024', email: 'h.kobayashi@academy.edu', status: 'Active' },
// ]



const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const StudentsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState<{ value: string, label: string }[]>([]);
  const [filterDate, setFilterDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rangeLabel, setRangeLabel] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')


  const COLUMNS: TableColumn<Student>[] = [
    {
      key: 'name',
      header: 'Student Name',
      render: row => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img src={row.avatar_url} alt="student avatar" className="w-12 h-12 rounded-xl object-cover shrink-0" />
          ) : (
            <User size={36} className="text-gray-300" />
          )}
          <span className="font-semibold text-[#191c1e] cursor-pointer" onClick={() => navigate(`/students/${row.id}`)} >{row?.first_name} {row?.last_name}</span>
        </div>
      ),
    },
    {
      key: 'Total Courses',
      header: 'Total Courses',
      render: row => <span className="text-[#191c1e]">{row.courses?.length}</span>,
    },
    {
      key: 'Joined Date',
      header: 'Joined Date',
      render: row => <span className="text-[#767683]">{formatDateTime(row?.created_at)}</span>,
    },
    {
      key: 'recentActive',
      header: 'Recent Active',
      render: row => (
        <span className="text-[#767683]">{row?.recentActive?.display}</span>
      ),
    },
    // {
    //   key: 'actions',
    //   header: 'Actions',
    //   render: () => (
    //     <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
    //       <MoreHorizontal size={16} className="text-[#767683]" />
    //     </button>
    //   ),
    //   headerClassName: 'text-right',
    //   cellClassName: 'text-right',
    // },
  ]



  // query

  const { data: students, isLoading, error } = useGetStudents(
    {
      search: '',
      page,
      limit: pageSize,
      filter: { selectedCourse: selectedCourse, selectedDate: filterDate }
    },
    true
  )

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useGetAllCourses(false, "", true)


  useEffect(() => {

    if (courses) {
      const courseOptions = courses?.map((course: any) => ({
        value: course.id,
        label: course.title,
      }))
      console.log("opts", courseOptions)
      setDepartment([{ value: 'all', label: 'All Courses' }, ...courseOptions])
    }


  }, [courses])



  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <motion.div className="mb-6 px-2 pt-2" {...fadeUp(0.04)}>
        <Heading className="text-[#2c1452]">Enrolled Students</Heading>
        <Paragraph className="text-black font-bold mt-0.5">
          {students?.pagination?.total} Total Students
        </Paragraph>
      </motion.div>

      {/* Filter bar */}
      <motion.div className="flex items-center gap-3 mb-5 px-2 justify-between" {...fadeUp(0.08)}>
        <div className="flex items-center gap-3">
          <FilterSelect
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            options={department}
            className='w-[200px]'
          />

          <FilterDatePicker
            value={filterDate}
            onChange={setFilterDate}
            placeholder="Select Date"
          />

          {/* <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-[#E6E8EA] text-sm font-semibold text-gray-500 transition-colors">
            More Filters
          </button> */}
        </div>
        {rangeLabel && (
          <span className="text-xs text-[#767683] font-medium shrink-0">{rangeLabel}</span>
        )}
      </motion.div>

      {/* Table */}
      <motion.div className="flex-1 min-h-0" {...fadeUp(0.12)}>
        <DataTable
          columns={COLUMNS}
          data={students?.data}
          total={students?.pagination?.total}
          page={page}
          pageSize={pageSize}
          loading={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
        />
      </motion.div>

    </div>
  )
}

export default StudentsPage
