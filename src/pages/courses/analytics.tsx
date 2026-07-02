import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import { FaUsers } from 'react-icons/fa6'
import { HiMiniCurrencyDollar } from 'react-icons/hi2'
import { BsFillStarFill } from 'react-icons/bs'
import { Button, Heading, Skeleton, SkeletonStatCard, DataTable } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import EnrollmentCompletionChart from './EnrollmentCompletionChart'
import RevenueChart, { type RevenuePeriod } from '@/pages/dashboard/RevenueChart'
import { FaRegCircleCheck } from "react-icons/fa6";
import { toast } from 'sonner'
import { useGetCourseAnalytics } from '@/hooks/useCourse'
import { useGetCourseRevenueTrend, useGetCourseEnrollments, useExportCourseEnrollments } from '@/hooks/useCourse'
import { formatLongDate } from '@/utils/helper/formatDate'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

// Deterministic background color for initials avatars (varies per student).
const AVATAR_COLORS = [
    { bg: '#BCC2FF', text: '#2c1452' },
    { bg: '#CCFFE8', text: '#00875A' },
    { bg: '#FFF3CC', text: '#B58100' },
    { bg: '#FFD6E7', text: '#C41D7F' },
    { bg: '#D6E4FF', text: '#1D4ED8' },
    { bg: '#E9D5FF', text: '#7E22CE' },
    { bg: '#FFE0CC', text: '#C2410C' },
]

const avatarColorFor = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const CourseAnalyticsPage = () => {
    const navigate = useNavigate()
    const { id }: any = useParams()
    const { course_title } = useLocation().state
    const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('week')
    const [enrollPage, setEnrollPage] = useState(1)
    const [enrollPageSize, setEnrollPageSize] = useState(10)

    // query
    const { data: analytics, isLoading: analyticsLoading } = useGetCourseAnalytics(id, true)
    const { data: revenueTrend, isLoading: revenueTrendLoading } = useGetCourseRevenueTrend(id, revenuePeriod, true)
    const { data: enrollments, isLoading: enrollmentsLoading } = useGetCourseEnrollments(
        id,
        { page: enrollPage, limit: enrollPageSize },
        true
    )
    const { mutate: exportEnrollments, isPending: isExporting } = useExportCourseEnrollments()

    const handleExport = () => {
        exportEnrollments(id, {
            onSuccess: () => toast.success('Enrollments exported'),
            onError: (err: any) => toast.error(err?.message || 'Failed to export enrollments'),
        })
    }

    const ENROLLMENT_COLUMNS: TableColumn<any>[] = [
        {
            key: 'student',
            header: 'Student',
            render: row => {
                const color = avatarColorFor(row.account_id || `${row.first_name} ${row.last_name}`)
                const initial = (row.first_name || row.last_name || '?').charAt(0).toUpperCase()
                return (
                    <div className="flex items-center gap-3">
                        {row.avatar_url ? (
                            <img src={row.avatar_url} alt="student avatar" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        ) : (
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
                                style={{ backgroundColor: color.bg, color: color.text }}
                            >
                                {initial}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#191c1e]">
                                {row.first_name} {row.last_name}
                            </span>
                            <span className="text-xs text-[#767683] mt-0.5">{row.account_id || '—'}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            key: 'enrolled_at',
            header: 'Enrolled Date',
            render: row => <span className="text-[#767683]">{formatLongDate(row.enrolled_at) || '—'}</span>,
        },
        {
            key: 'expires_at',
            header: 'Expire Date',
            render: row => <span className="text-[#767683]">{formatLongDate(row.expires_at) || '—'}</span>,
        },
        {
            key: 'amount_paid',
            header: 'Amount Paid',
            render: row => <span className="text-[#191c1e] font-semibold">₹{row.amount_paid ?? 0}</span>,
        },
    ]

    return (
        <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">

            {/* Back */}
            <motion.button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#2c1452] mb-5 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
            >
                <ArrowLeft size={14} />
                Back
            </motion.button>

            {/* Header */}
            <motion.div className="flex items-start justify-between mb-7" {...fadeUp(0.05)}>
                <div>
                    <Heading className="text-black">
                        Course Performance:{' '}
                        <span className="text-[#2c1452]">{course_title}</span>
                    </Heading>
                    {/* <Paragraph className="text-[#767683] mt-1">
                        Track enrollment trends, revenue, and student performance for this course.
                    </Paragraph> */}
                </div>
            </motion.div>

            {/* Stat Cards */}
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5" {...fadeUp(0.1)}>
                {analyticsLoading ? (
                    <>
                        <SkeletonStatCard showIcon showFooter={false} />
                        <SkeletonStatCard showIcon showFooter={false} />
                        <SkeletonStatCard showIcon showFooter={false} />
                        <SkeletonStatCard showIcon showFooter={false} />
                    </>
                ) : (
                    <>
                        <StatCard
                            icon={
                                <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-gray-400"><HiMiniCurrencyDollar className="text-yellow-400" size={30} /></div>}


                            label="Total Revenue"
                            value={analytics?.totalRevenue || 0}
                            prefix="₹"
                        />
                        <StatCard

                            icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#BCC2FF]"><FaUsers className="text-[#2c1452]" size={25} /></div>}

                            label="Total Students"
                            value={analytics?.activeStudents || 0}
                        />
                        <StatCard
                            icon={
                                <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#CCFFE8]">
                                    <FaRegCircleCheck className="text-[#00875A]" size={24} />
                                </div>
                            }
                            label="Completion Rate"
                            value={`${analytics?.completionRate || 0}%`}
                        // valueColor="#00875A"
                        />
                        <StatCard
                            icon={
                                <div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#FFF3CC]">
                                    <BsFillStarFill className="text-[#E6A800]" size={20} />
                                </div>
                            }
                            label="Test Score"
                            value="4.8/5"
                        // valueColor="#E6A800"
                        />
                    </>
                )}
            </motion.div>

            {/* Charts */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" {...fadeUp(0.16)}>
                <div className="lg:col-span-2">
                    <EnrollmentCompletionChart courseId={id} />
                </div>
                <RevenueChart
                    data={revenueTrend?.data ?? []}
                    trend={revenueTrend?.trend}
                    isLoading={revenueTrendLoading}
                    period={revenuePeriod}
                    onPeriodChange={setRevenuePeriod}
                />
            </motion.div>

            {/* Enrollment Table */}
            <motion.div className="mt-6" {...fadeUp(0.2)}>
                <div className="flex items-center justify-between mb-3">
                    <Heading className="text-black !text-lg">Course Enrollments</Heading>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="!h-10 !text-sm !px-5 shrink-0"
                    >
                        <Download size={14} />
                        {isExporting ? 'Exporting…' : 'Export Data'}
                    </Button>
                </div>
                <DataTable
                    columns={ENROLLMENT_COLUMNS}
                    data={enrollments?.data ?? []}
                    total={enrollments?.pagination?.total ?? 0}
                    page={enrollPage}
                    pageSize={enrollPageSize}
                    loading={enrollmentsLoading}
                    onPageChange={setEnrollPage}
                    onPageSizeChange={(size) => {
                        setEnrollPageSize(size)
                        setEnrollPage(1)
                    }}
                />
            </motion.div>

        </div>
    )
}

export default CourseAnalyticsPage
