import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Share2, Trash2, Pencil, Clock,
    Layers, BookOpen, Wallet, Users, MousePointer2, Globe, TrendingUp,
} from 'lucide-react'
import { Button, Heading, Paragraph, Skeleton, Subheading, StarRating, ConfirmDeleteModal } from '@/components/ui'
import { ReviewCard, VideoPlayer } from '@/components/features'
import man from '@/assets/images/man.jpg'
import coverImge from "@/assets/images/cou1.png"
import { useGetCourseById, useGetCourseReviews, useDeleteCourse } from '@/hooks/useCourse'
import formatNumber from '@/utils/helper/numberFormating'
import { toast } from 'sonner'


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


const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: 'easeOut' as const },
})

const CourseDetailPage = () => {
    const navigate = useNavigate()
    const { id }: any = useParams()
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    // query
    const { data: course, isLoading, error } = useGetCourseById(id)
    const { data: reviews, isLoading: reviewsLoading, error: reviewsError } = useGetCourseReviews(id, { page: 1, limit: 2 })
    const { mutateAsync: deleteCourse, isPending: deleteCoursePending } = useDeleteCourse()

    const confirmDeleteCourse = async () => {
        const toastId = toast.loading('Deleting course...')
        try {
            await deleteCourse(String(id))
            toast.success('Course deleted successfully', { id: toastId })
            setDeleteModalOpen(false)
            navigate('/courses')
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to delete course', { id: toastId })
        }
    }

    const MOCK_STATS = [
    { icon: <Clock size={15} className="text-[#00A6BF]" />, label: course?.data?.validity === '1' ? '1 Month Validity' : course?.data?.validity === '3' ? '3 Months Validity' : course?.data?.validity === '6' ? '6 Months Validity' : course?.data?.validity === '12' ? '1 Year Validity' : 'Lifetime Validity' },
    { icon: <Layers size={15} className="text-[#00A6BF]" />, label: `${course?.data?.level} Level` },
    { icon: <BookOpen size={15} className="text-[#00A6BF]" />, label: `${course?.data?.total_folders} Modules + ${course?.data?.total_materials} Lessons`},
    { icon: <Wallet size={15} className="text-[#00A6BF]" />, label: `₹${formatNumber(course?.data?.total_revenue)} Revenue Earned` },
    { icon: <Users size={15} className="text-[#00A6BF]" />, label:  `${course?.data?.total_enrolled} Students Enrolled` },
    { icon: <MousePointer2 size={15} className="text-[#00A6BF]" />, label: '45 Clicks' },
    { icon: <Globe size={15} className="text-[#00A6BF]" />, label: `${course?.data?.languages.join(', ')} Instruction` },
]






    if (isLoading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-8 w-96" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
                    <div className="space-y-5">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* Back */}
            <motion.button
                onClick={() => navigate('/courses')}
                className="flex items-center gap-1.5 text-sm font-bold text-[#767683] hover:text-[#000B60] mb-4 transition-colors"
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
                    <Heading className="text-[#000B60]">{course?.data?.title}</Heading>
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
                        className="!h-10 !text-sm !px-4 !font-semibold cursor-pointer"
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
                        className="!h-10 !text-sm !px-4 !font-semibold !text-[#BA1A1A] cursor-pointer"
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 size={14} />
                        Delete
                    </Button>
                    <Button
                        variant="primary"
                        className="!h-10 !text-sm !px-4 !font-semibold cursor-pointer"
                        onClick={() => navigate(`/courses/${id}/edit`)}
                    >
                        <Pencil size={13} />
                        Edit Course
                    </Button>
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
                        {/* Intro video — course cover shown as thumbnail until play */}
                        {course?.data?.video_asset_id ? (
                            <VideoPlayer
                                embed
                                src={`https://app.tpstreams.com/embed/${import.meta.env.VITE_TPSTREAMS_ORG_ID}/${course.data.video_asset_id}/?access_token=${import.meta.env.VITE_TPSTREAMS_ACCESS_TOKEN}`}
                                poster={course?.data?.cover_image || coverImge}
                            />
                        ) : course?.data?.cover_image ? (
                            <div className="w-full aspect-video relative bg-[#F8F9FB]">
                                <img
                                    src={course.data.cover_image}
                                    alt={course.data.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-video relative bg-[#E8EBFF] flex items-center justify-center">
                                <img
                                    src={coverImge}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                                />
                                <Paragraph className="relative text-sm text-[#767683]">No intro video</Paragraph>
                            </div>
                        )}

                        {/* About this Course — below video, same card */}
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <Subheading className="font-bold text-[#000b60]">About this Course</Subheading>
                                <div className="text-right shrink-0">
                                    <Paragraph className="!text-[12px] uppercase tracking-widest text-gray-500 ">Category</Paragraph>
                                    <Paragraph className="text-sm font-bold text-[#000B60] mt-0.5">{course?.data?.category} : {course?.data?.level}</Paragraph>
                                </div>
                            </div>
                            <Paragraph className="text-[#767683] leading-relaxed text-sm">
                                {
                                    course?.data?.description
                                }
                            </Paragraph>
                        </div>
                    </motion.div>

                    {/* Students Reviews */}
                    <motion.div {...fadeUp(0.24)} className='w-[1000px]'>
                        <div className="flex items-center justify-between mb-4 w-[1045px]">
                            <Subheading className="font-bold text-[#000b60]">Students Reviews</Subheading>
                            
                            {
                                reviews?.data?.total_reviews > 0 && (
                                    <button
                                onClick={() => navigate(`/courses/${id}/reviews`)}
                                className="text-sm font-semibold text-[#000B60] hover:underline underline-offset-2"
                            >
                                View All {reviews?.data?.total_reviews} Reviews
                            </button>
                                )

                            }
                            
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            {
                                reviews?.data?.reviews?.length > 0 ? (
                                    reviews?.data?.reviews?.map((r: any) => (
                                        <ReviewCard key={r.id} {...r} />
                                    ))
                                ) : (
                                    <div className="col-span-full flex items-center justify-center py-8">
                                        <Paragraph className="text-[#767683] text-center">No reviews found</Paragraph>
                                    </div>
                                )
                            }
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
                            <Heading className="font-bold text-[#000b60]">₹{formatNumber(course?.data?.final_price)}</Heading>
                            {/* <span className="text-3xl font-extrabold text-[#191c1e]">₹3,500</span> */}
                            <Paragraph className="text-[#767683] line-through font-bold">₹{formatNumber(course?.data?.price)}</Paragraph>
                            {/* <span className="text-sm text-[#767683] line-through">₹4,500</span> */}
                        </div>

                        {/* Stars */}
                        <StarRating rating={course?.data?.avg_rating} />

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
                        onClick={() => navigate(`/courses/${id}/analytics`,{state: {course_title: course?.data?.title}})}
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

            <ConfirmDeleteModal
                open={deleteModalOpen}
                onClose={() => !deleteCoursePending && setDeleteModalOpen(false)}
                onConfirm={confirmDeleteCourse}
                title="Delete Course"
                itemName={course?.data?.title}
                loading={deleteCoursePending}
            />
        </div>
    )
}

export default CourseDetailPage
