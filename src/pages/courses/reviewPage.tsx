import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Button, Heading, Paragraph, Skeleton, StarRating } from '@/components/ui'
import { ReviewListCard } from '@/components/features'
import man from '@/assets/images/man.jpg'

const ALL_REVIEWS = [
    {
        id: 1,
        avatar: man,
        name: 'Julianne H.',
        course: 'Taxation',
        date: 'Oct 24, 2025',
        rating: 5,
        review:
            'The explanation of Macroeconomic principles was very clear. I particularly appreciated the weekly case studies — they made the abstract theories feel much more applicable to real-world scenarios. Dr. Vance is always willing to stay late after lectures to answer extra questions.',
    },
    {
        id: 2,
        avatar: man,
        name: 'Marcus K.',
        course: 'Cost Accounting',
        date: 'Oct 21, 2025',
        rating: 4,
        review:
            'The material is challenging, and while the lectures are great, the exams feel significantly harder than the homework assignments. Would appreciate more practice tests or review sessions before the midterm.',
    },
    {
        id: 3,
        avatar: man,
        name: 'Sarah L.',
        course: 'Business Laws',
        date: 'Oct 18, 2025',
        rating: 4,
        review:
            '"Excellent course. The guest speaker Dr. Vance brought in from the World Bank was the highlight of the semester. Very responsive to emails and gives detailed feedback on every essay."',
    },
    {
        id: 4,
        avatar: man,
        name: 'Priya M.',
        course: 'Financial Management',
        date: 'Oct 15, 2025',
        rating: 5,
        review:
            'Absolutely loved this course. The structured approach to financial analysis was exactly what I needed. The professor explains complex topics with simple examples, making it very easy to follow.',
    },
    {
        id: 5,
        avatar: man,
        name: 'Aditya R.',
        course: 'Taxation',
        date: 'Oct 12, 2025',
        rating: 3,
        review:
            'The course content is good, but the pace is a bit fast. Would be helpful if there were more practice problems and detailed solutions provided for each chapter.',
    },
    {
        id: 6,
        avatar: man,
        name: 'Emily C.',
        course: 'Cost Accounting',
        date: 'Oct 09, 2025',
        rating: 5,
        review:
            'One of the best courses I have taken. The concepts are well structured and the examples used are very relevant to real-world scenarios. Highly recommend to all CA aspirants.',
    },
]

const PAGE_SIZE = 3

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const cardVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.35, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
}

const ReviewPage = () => {
    const navigate = useNavigate()
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const visible = ALL_REVIEWS.slice(0, visibleCount)
    const hasMore = visibleCount < ALL_REVIEWS.length

    const avgRating = (ALL_REVIEWS.reduce((s, r) => s + r.rating, 0) / ALL_REVIEWS.length).toFixed(1)

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <Skeleton className="h-4 w-16 mb-5" />
                <div className="space-y-2 mb-7">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">

            {/* Back */}
            <motion.button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 font-bold  text-sm text-[#767683] hover:text-[#000B60] mb-5 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
            >
                <ArrowLeft size={14} />
                Back
            </motion.button>

            {/* Header */}
            <motion.div className="mb-7" {...fadeUp(0.05)}>
                <Heading className="text-[#000B60]">All Students Review</Heading>
                <Paragraph className="text-[#767683] mt-1 max-w-xl">
                    Monitor academic feedback across your active courses. Use analytics to identify
                    trends and refine the student learning experience.
                </Paragraph>
            </motion.div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">

                {/* Review list */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {visible.map((review, i) => (
                            <motion.div
                                key={review.id}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                            >
                                <ReviewListCard
                                    {...review}
                                    onReply={() => console.log('Reply to', review.name)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Load More */}
                    {hasMore && (
                        <motion.div
                            className="flex justify-center pt-4"
                            {...fadeUp(0.1)}
                        >
                            <Button
                                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                                className="!h-15 !text-sm !px-8"
                            >
                                Load More Reviews
                                <ChevronDown size={16} />
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Average rating sidebar */}
                <motion.div
                    className="bg-white   rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-6"
                    {...fadeUp(0.12)}
                >
                    <p className="text-[10px] uppercase tracking-widest text-[#767683] font-semibold mb-3">
                        Average Rating
                    </p>
                    {/* <Heading className='text-[#000b60]'> {avgRating} </Heading> */}
                    <p className="text-5xl font-extrabold text-[#000b60] leading-none mb-2">{avgRating}</p>
                    <div className="mb-1">
                        <StarRating rating={Math.round(Number(avgRating))} size={16} />
                    </div>
                    <p className="text-xs text-[#767683]">{ALL_REVIEWS.length.toLocaleString()} reviews</p>
                </motion.div>

            </div>
        </div>
    )
}

export default ReviewPage
