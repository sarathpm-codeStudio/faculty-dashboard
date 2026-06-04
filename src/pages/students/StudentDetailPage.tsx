import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, Calendar, User, Clock, MoreVertical } from 'lucide-react'
import { MdOutlineMenuBook } from 'react-icons/md'
import { BsPencilFill } from 'react-icons/bs'
import { HiMiniCurrencyDollar } from 'react-icons/hi2'
import { Button, Heading, DataTable, Subheading, Skeleton, SkeletonStatCard } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard, ProgressBar } from '@/components/features'
import man from '@/assets/images/man.jpg'
import { useGetStudentAnalytics, useGetStudentCourses } from '@/hooks/student'

type EnrolledCourse = {
    id: number
    title: string
    progress: number
    test_score: number
    completed:boolean
    status: 'Completed' | 'Active'
}



const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const StudentDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [rangeLabel, setRangeLabel] = useState('')


    
    
    const COURSE_COLUMNS: TableColumn<EnrolledCourse>[] = [
        {
            key: 'details',
            header: 'Course Details',
            render: row => (
                <div>
                    <p className="font-bold text-[#191c1e] text-sm">{row.title}</p>
                    {/* <p className="text-xs text-[#767683] mt-0.5">{row.subtitle}</p> */}
                </div>
            ),
        },
        {
            key: 'progress',
            header: 'Current Progress',
            render: row => (
                <div className="min-w-[180px] flex items-center justify-center gap-2">
                                        <p className="text-xs text-[#767683]">{row.progress}%</p>

                    <div className="h-1.5 w-full rounded-full bg-gray-200 mb-1.5">
                        <div
                            className="h-full rounded-full bg-[#1a237e]"
                            style={{ width: `${row.progress}%` }}
                        />
                    </div>

                </div>
            ),
        },
        {
            key: 'avgScore',
            header: 'Avg Test Score',
            render: row => <span className="text-sm text-[#767683] font-medium">{row.test_score}%</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: row => (
                <span className={`text-xs font-bold ${row.status === 'Completed' ? 'text-[#00875A]' : 'text-[#B49C00]'}`}>
                    {row.status.toUpperCase()}
                </span>
            ),
        },
        // {
        //     key: 'actions',
        //     header: 'Actions',
        //     render: () => (
        //         <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        //             <MoreVertical size={15} className="text-[#767683]" />
        //         </button>
        //     ),
        //     headerClassName: 'text-right',
        //     cellClassName: 'text-right',
        // },
    ]

    // query

    const { data: studentCourses, isLoading: studentCoursesLoading } = useGetStudentCourses(id,{
        page,
        limit: pageSize,
      } ,!!id)
    const { data: studentAnalytics, isLoading: studentAnalyticsLoading } = useGetStudentAnalytics(id, !!id)

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50">

            {/* Back */}
            <motion.button
                onClick={() => navigate(-1)}
                className="flex shrink-0 items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#000B60] mb-5 px-2 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}

            >
                <ArrowLeft size={14} />
                Back
            </motion.button>

            {/* Profile card */}
            <motion.div className="shrink-0 px-2 pb-5" {...fadeUp(0.05)}>
                <div className="flex items-start justify-between gap-6">

                    {/* Avatar + info */}
                    <div className="flex items-start gap-5">
                        <div className="relative shrink-0">
                            {studentAnalyticsLoading ? (
                                <Skeleton className="w-30 h-30 rounded-2xl" />
                            ) : (
                                <img src={studentAnalytics?.data?.student?.avatar_url} alt="Elena Rodriguez" className="w-30 h-30 rounded-2xl object-cover" />
                            )}
                        </div>
                        <div className="mt-1 flex-1">
                            {studentAnalyticsLoading ? (
                                <div className="space-y-3 mb-3">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            ) : (
                                <>
                            <Heading className="text-[#000B60] mb-3">{studentAnalytics?.data?.student?.first_name} {studentAnalytics?.data?.student?.last_name}</Heading>
                            <div className="grid grid-cols-3 gap-x-8 gap-y-2 mt-1">
                                <span className="flex items-center gap-1.5 text-xs text-black font-medium">
                                    <Clock className='text-[#00A6BF]' size={12} /> Recent Active: Today 11:40 pm
                                </span>
                            </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                        <Button className="!h-10 !text-sm !px-5">
                            <Mail size={14} />
                            Message Student
                        </Button>
                        <Button variant="white" className="!h-10 !text-sm !px-5 !text-red-500 w-full">
                            Block
                        </Button>
                    </div>

                </div>
            </motion.div>

            {/* Stat cards */}
            <motion.div className="grid shrink-0 grid-cols-2 lg:grid-cols-3 gap-4 mb-5 px-2" {...fadeUp(0.1)}>
                {studentAnalyticsLoading ? (
                    <>
                        <SkeletonStatCard showIcon showFooter={false} />
                        <SkeletonStatCard showIcon showFooter={false} />
                        <SkeletonStatCard showIcon showFooter={false} />
                    </>
                ) : (
                    <>
                <StatCard

                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#A8EDFF]"><MdOutlineMenuBook className="text-[#00A6BF]" size={25} /></div>}

                    label="Course Enrolled"
                    value={studentAnalytics?.data?.totalCourseCount ?? 0}
                />
                <StatCard
                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#CCFFE8]"><BsPencilFill className="text-[#00875A]" size={18} /></div>}
                    label="Test Score"
                    value={`${studentAnalytics?.data?.testScoreRate ?? 0}%`}
                // valueColor="#00875A"
                />
                <StatCard

                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-gray-400"><HiMiniCurrencyDollar className="text-yellow-400" size={30} /></div>}

                    label="Total Spend"
                    value={studentAnalytics?.data?.totalAmountSpent ?? 0}
                    prefix="₹"
                // valueColor="#00875A"
                />
                    </>
                )}
            </motion.div>

            {/* Enrolled Courses — flex-1 + min-h-0: scroll only inside table */}
            <motion.div className="flex min-h-0 flex-1 flex-col px-2" {...fadeUp(0.15)}>
                <Subheading className="mb-3 shrink-0 text-[#000B60] font-bold">Enrolled Courses</Subheading>
                <div className="min-h-0 flex-1">
                <DataTable
                    className="h-full"
                    columns={COURSE_COLUMNS}
                    data={studentCourses?.data?.data ?? []}
                    total={studentCourses?.data?.total ?? 0}
                    page={page}
                    loading={studentCoursesLoading}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPage(1)
                    }}
                    onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
                    fixedBodyRows={5}
                />
                </div>
            </motion.div>

        </div>
    )
}

export default StudentDetailPage
