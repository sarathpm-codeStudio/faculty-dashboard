import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, Calendar, User, Clock, MoreVertical } from 'lucide-react'
import { MdOutlineMenuBook } from 'react-icons/md'
import { BsPencilFill } from 'react-icons/bs'
import { PiCoinsFill } from 'react-icons/pi'
import { HiMiniCurrencyDollar } from 'react-icons/hi2'
import { Button, Heading, Spinner, DataTable } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import man from '@/assets/images/man.jpg'

type EnrolledCourse = {
    id: number
    name: string
    subtitle: string
    progress: number
    progressLabel: string
    avgScore: string
    status: 'Completed' | 'Active'
}

const ENROLLED_COURSES: EnrolledCourse[] = [
    {
        id: 1,
        name: 'Advanced Microeconomics',
        subtitle: 'ECON-401 • Prof. Sinclair',
        progress: 100,
        progressLabel: 'Completed',
        avgScore: '92%',
        status: 'Completed',
    },
    {
        id: 2,
        name: 'Data Science 101',
        subtitle: 'DS-101 • Prof. Zhang',
        progress: 90,
        progressLabel: '90% Complete',
        avgScore: '50%',
        status: 'Active',
    },
    {
        id: 3,
        name: 'Statistical Modelling',
        subtitle: 'MATH-315 • Prof. Gauthier',
        progress: 40,
        progressLabel: '40% Complete',
        avgScore: '—',
        status: 'Active',
    },
]

const COURSE_COLUMNS: TableColumn<EnrolledCourse>[] = [
    {
        key: 'details',
        header: 'Course Details',
        render: row => (
            <div>
                <p className="font-bold text-[#191c1e] text-sm">{row.name}</p>
                <p className="text-xs text-[#767683] mt-0.5">{row.subtitle}</p>
            </div>
        ),
    },
    {
        key: 'progress',
        header: 'Current Progress',
        render: row => (
            <div className="min-w-[180px]">
                <div className="h-1.5 w-full rounded-full bg-gray-200 mb-1.5">
                    <div
                        className="h-full rounded-full bg-[#1a237e]"
                        style={{ width: `${row.progress}%` }}
                    />
                </div>
                <p className="text-xs text-[#767683]">{row.progressLabel}</p>
            </div>
        ),
    },
    {
        key: 'avgScore',
        header: 'Avg Test Score',
        render: row => <span className="text-sm text-[#767683] font-medium">{row.avgScore}</span>,
    },
    {
        key: 'status',
        header: 'Status',
        render: row => (
            <span className={`text-xs font-bold ${row.status === 'Completed' ? 'text-[#00875A]' : 'text-[#B49C00]'}`}>
                {row.status}
            </span>
        ),
    },
    {
        key: 'actions',
        header: 'Actions',
        render: () => (
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical size={15} className="text-[#767683]" />
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

const StudentDetailPage = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Spinner label="Loading student..." />
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* Back */}
            <motion.button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#000B60] mb-5 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
            >
                <ArrowLeft size={14} />
                Back
            </motion.button>

            {/* Profile card */}
            <motion.div className=" p-6 mb-5" {...fadeUp(0.05)}>
                <div className="flex items-start justify-between gap-6">

                    {/* Avatar + info */}
                    <div className="flex items-start gap-5">
                        <div className="relative shrink-0">
                            <img src={man} alt="Elena Rodriguez" className="w-20 h-20 rounded-2xl object-cover" />
                            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#000B60] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                                Active
                            </span>
                        </div>
                        <div className="mt-1">
                            <Heading className="text-[#000B60] mb-3">Elena Rodriguez</Heading>
                            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                                <span className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
                                    <User size={12} /> ID: 2024-ER8921
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
                                    <MdOutlineMenuBook size={13} /> CMA
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
                                    <Clock size={12} /> Last login: Today 11:40 pm
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-1.5">
                                <span className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
                                    <Calendar size={12} /> Joined 02/12/2026
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
                                    <Phone size={12} /> +91 52485545665
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
                                    <Mail size={12} /> e.rodriguez@academy.edu
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                        <Button className="!h-10 !text-sm !px-5">
                            <Mail size={14} />
                            Message Student
                        </Button>
                        <button className="text-sm font-bold text-[#BA1A1A] hover:underline underline-offset-2 transition-colors">
                            Block
                        </button>
                    </div>

                </div>
            </motion.div>

            {/* Stat cards */}
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" {...fadeUp(0.1)}>
                <StatCard
                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#BCC2FF]"><MdOutlineMenuBook className="text-[#000B60]" size={22} /></div>}
                    label="Course Enrolled"
                    value="03"
                />
                <StatCard
                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#CCFFE8]"><BsPencilFill className="text-[#00875A]" size={18} /></div>}
                    label="Test Score"
                    value="94.8%"
                    valueColor="#00875A"
                />
                <StatCard
                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#FFE8CC]"><PiCoinsFill className="text-[#E6A800]" size={22} /></div>}
                    label="Total Coins"
                    value="1200"
                    valueColor="#E6A800"
                />
                <StatCard
                    icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#CCFFE8]"><HiMiniCurrencyDollar className="text-[#00875A]" size={24} /></div>}
                    label="Total Spend"
                    value="12500"
                    prefix="₹"
                    valueColor="#00875A"
                />
            </motion.div>

            {/* Enrolled Courses */}
            <motion.div {...fadeUp(0.15)}>
                <p className="font-bold text-[#000B60] text-base mb-3">Enrolled Courses</p>
                <DataTable columns={COURSE_COLUMNS} data={ENROLLED_COURSES} defaultPageSize={10} />
            </motion.div>

        </div>
    )
}

export default StudentDetailPage
