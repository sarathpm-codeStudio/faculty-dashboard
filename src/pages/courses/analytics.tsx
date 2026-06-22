import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download } from 'lucide-react'
import { FaUsers } from 'react-icons/fa6'
import { HiMiniCurrencyDollar } from 'react-icons/hi2'
import { BsFillStarFill } from 'react-icons/bs'
import { Button, Heading, Skeleton, SkeletonStatCard } from '@/components/ui'
import { StatCard } from '@/components/features'
import EnrollmentCompletionChart from './EnrollmentCompletionChart'
import RevenueChart, { type RevenuePeriod } from '@/pages/dashboard/RevenueChart'
import { FaRegCircleCheck } from "react-icons/fa6";
import { useGetCourseAnalytics } from '@/hooks/useCourse'
import { useGetCourseRevenueTrend } from '@/hooks/useCourse'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const CourseAnalyticsPage = () => {
    const navigate = useNavigate()
    const { id }: any = useParams()
    const { course_title } = useLocation().state
    const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('week')

    // query
    const { data: analytics, isLoading: analyticsLoading } = useGetCourseAnalytics(id, true)
    const { data: revenueTrend, isLoading: revenueTrendLoading } = useGetCourseRevenueTrend(id, revenuePeriod, true)

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
                <Button className="!h-10 !text-sm !px-5 shrink-0 mt-1">
                    <Download size={14} />
                    Export Data
                </Button>
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

        </div>
    )
}

export default CourseAnalyticsPage
