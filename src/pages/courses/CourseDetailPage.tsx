import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Share2, Trash2, Pencil, Play, Clock,
    Layers, BookOpen, Wallet, Users, MousePointer2, Globe, TrendingUp, Star,
} from 'lucide-react'
import { Button, Heading, Paragraph, Subheading } from '@/components/ui'
import { ReviewCard } from '@/components/features'
import man from '@/assets/images/man.jpg'

const MOCK_STATS = [
    { icon: <Clock size={15} className="text-[#00A6BF]" />, label: '6 Months Duration' },
    { icon: <Layers size={15} className="text-[#00A6BF]" />, label: 'Intermediate Level' },
    { icon: <BookOpen size={15} className="text-[#00A6BF]" />, label: '12 Modules + 40 Lessons' },
    { icon: <Wallet size={15} className="text-[#00A6BF]" />, label: '22548 Revenue Earned' },
    { icon: <Users size={15} className="text-[#00A6BF]" />, label: '458 Students Enrolled' },
    { icon: <MousePointer2 size={15} className="text-[#00A6BF]" />, label: '45 Clicks' },
    { icon: <Globe size={15} className="text-[#00A6BF]" />, label: 'English & Hindi Instruction' },
]

const MOCK_REVIEWS = [
    {
        name: 'Sasha Perry',
        date: '2 days ago',
        rating: 5,
        avatar: man,
        review:
            '"The depth of explanations for overhead absorption was incredible. I finally understand the \'why\' behind the formulas. Highly recommend for CA aspirants!"',
    },
    {
        name: 'MarcusThorne',
        date: '1 week ago',
        avatar: man,
        rating: 5,
        review:
            '"The module on Marginal Costing was a game-changer for me. Clear, concise, and full of practical examples that appear in exams."',
    },
]

const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
            <Star
                key={i}
                size={15}
                className={i < rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}
            />
        ))}
    </div>
)

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: 'easeOut' as const },
})

const CourseDetailPage = () => {
    const navigate = useNavigate()

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* Back */}
            <motion.button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1.5 text-sm text-[#767683] hover:text-[#000B60] mb-4 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
            >
                <ArrowLeft size={14} />
                Back to Courses
            </motion.button>

            {/* ── Title row (full-width, above the grid) ── */}
            <motion.div
                className="flex items-start justify-between gap-6 mb-6"
                {...fadeUp(0.05)}
            >
                <div>
                    <Heading className="text-[#000B60]">CA Inter – Costing</Heading>
                    <Paragraph className="text-[#767683] mt-1 max-w-lg ">
                        Comprehensive module covering advanced management accounting
                        and cost control techniques.
                    </Paragraph>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-1">
                    {/* <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#191c1e] hover:bg-gray-50 transition-colors">
                        <Share2 size={14} />
                        Share
                    </button> */}
                    <Button
                        variant="white"
                        className="!h-10 !text-sm !px-4 !font-semibold"
                        onClick={() => console.log('Create bundle')}
                    >
                        <Share2 size={14} />
                        Share
                    </Button>
                    {/* <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-200 bg-white text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                        Delete
                    </button> */}
                    <Button
                        variant="white"
                        className="!h-10 !text-sm !px-4 !font-semibold !text-[#BA1A1A]"
                        onClick={() => console.log('Create bundle')}
                    >
                        <Trash2 size={14} />
                        Delete
                    </Button>
                    <button
                        className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold text-white transition-colors"
                        style={{ background: 'linear-gradient(to right, #000B60, #142283)' }}
                    >
                        <Pencil size={13} />
                        Edit Course
                    </button>
                </div>
            </motion.div>

            {/* ── Two-column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">

                {/* Left column */}
                <div className="space-y-5">

                    {/* Video + About — single card */}
                    <motion.div
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]"
                        {...fadeUp(0.1)}
                    >
                        {/* Video — full-bleed top of card */}
                        <div
                            className="relative h-[300px] flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #0d1440 0%, #1a2a6c 100%)' }}
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                                <p className="text-white/20 text-xl font-black tracking-[0.25em] uppercase">
                                    CA Inter Costing Lecture
                                </p>
                                <p className="text-white/10 text-sm tracking-[0.3em] uppercase mt-2">
                                    Safeeur Diregturl Safe Work
                                </p>
                            </div>
                            <button className="relative z-10 w-14 h-14 rounded-full bg-white/20 hover:bg-white/35 border border-white/30 flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105">
                                <Play size={20} className="text-white fill-white ml-1" />
                            </button>
                        </div>

                        {/* About this Course — below video, same card */}
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <Subheading className="font-bold text-[#000b60]">About this Course</Subheading>
                                <div className="text-right shrink-0">
                                    <Paragraph className="!text-[12px] uppercase tracking-widest text-gray-500 ">Category</Paragraph>
                                    <Paragraph className="text-sm font-bold text-[#000B60] mt-0.5">CMA: Foundation</Paragraph>
                                </div>
                            </div>
                            <Paragraph className="text-[#767683] leading-relaxed text-sm">
                                This course provides an in-depth exploration of Cost Accounting principles
                                specifically tailored for the CA Intermediate examination. Students will master
                                material costs, labor costs, overheads, and process costing. The curriculum is
                                designed by senior industry experts to ensure conceptual clarity and practical
                                application.

                                This course provides an in-depth exploration of Cost Accounting principles
                                specifically tailored for the CA Intermediate examination. Students will master
                                material costs, labor costs, overheads, and process costing. The curriculum is
                                designed by senior industry experts to ensure conceptual clarity and practical
                                application.
                                This course provides an in-depth exploration of Cost Accounting principles
                                specifically tailored for the CA Intermediate examination. Students will master
                                material costs, labor costs, overheads, and process costing. The curriculum is
                                designed by senior industry experts to ensure conceptual clarity and practical
                                application. dddd
                            </Paragraph>
                        </div>
                    </motion.div>

                    {/* Students Reviews */}
                    <motion.div {...fadeUp(0.24)} className='w-[1000px]'>
                        <div className="flex items-center justify-between mb-4 ">
                            <Subheading className="font-bold text-[#000b60]">Students Reviews</Subheading>
                            <button className="text-sm font-semibold text-[#000B60] hover:underline underline-offset-2">
                                View All 124 Reviews
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {MOCK_REVIEWS.map((r, i) => (
                                <ReviewCard key={i} {...r} />
                            ))}
                        </div>
                    </motion.div>

                </div>

                {/* Right column */}
                <div className="space-y-4 lg:sticky lg:top-6">

                    {/* Price + Stats card */}
                    <motion.div
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                        {...fadeUp(0.14)}
                    >
                        {/* Price row */}
                        <div className="flex items-baseline gap-2 mb-2">
                            <Heading className="font-bold text-[#000b60]">₹3,500</Heading>
                            {/* <span className="text-3xl font-extrabold text-[#191c1e]">₹3,500</span> */}
                            <Paragraph className="text-[#767683] line-through font-bold">₹4,500</Paragraph>
                            {/* <span className="text-sm text-[#767683] line-through">₹4,500</span> */}
                        </div>

                        {/* Stars */}
                        <StarRating rating={4} />

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-4" />

                        {/* Stats */}
                        <ul className="space-y-3">
                            {MOCK_STATS.map((s, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <span className="w-5 flex items-center justify-center">{s.icon}</span>
                                    <Paragraph className="text-black font-semibold !text-[14px]"> {s.label}  </Paragraph>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* View Analytics */}
                    <motion.div
                        className="rounded-2xl p-5 cursor-pointer overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #000B60 0%, #1a2a9c 100%)' }}
                        {...fadeUp(0.22)}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-[15px]">View Analytics</p>
                                <p className="text-xs text-blue-200 mt-0.5">Track performance and insights</p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    )
}

export default CourseDetailPage
