import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Share2, Trash2, Pencil, Play, Clock, GraduationCap,
  BookOpen, IndianRupee, Users, MousePointer2, Globe, TrendingUp, Star,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Heading, Paragraph, Subheading } from '@/components/ui'
import { SectionCard, ReviewCard } from '@/components/features'

const MOCK_STATS = [
  { icon: <Clock size={16} className="text-[#000B60]" />, label: '6 Months Duration' },
  { icon: <GraduationCap size={16} className="text-[#000B60]" />, label: 'Intermediate Level' },
  { icon: <BookOpen size={16} className="text-[#000B60]" />, label: '12 Modules + 40 Lessons' },
  { icon: <IndianRupee size={16} className="text-[#000B60]" />, label: '22,548 Revenue Earned' },
  { icon: <Users size={16} className="text-[#000B60]" />, label: '458 Students Enrolled' },
  { icon: <MousePointer2 size={16} className="text-[#000B60]" />, label: '45 Clicks' },
  { icon: <Globe size={16} className="text-[#000B60]" />, label: 'English & Hindi Instruction' },
]

const MOCK_REVIEWS = [
  {
    name: 'Sasha Perry',
    date: '2 days ago',
    rating: 5,
    review:
      '"The depth of explanations for overhead absorption was incredible. I finally understand the \'why\' behind the formulas. Highly recommend for CA aspirants!"',
  },
  {
    name: 'MarcusThorne',
    date: '1 week ago',
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
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
)

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
})

const CourseDetailPage = () => {
  const navigate = useNavigate()

  return (
    <div className="p-8 min-h-screen">
      {/* Back */}
      <motion.button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-1.5 text-sm text-[#767683] hover:text-[#000B60] mb-5 transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft size={15} />
        Back to Courses
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Title + Actions */}
          <motion.div
            className="flex items-start justify-between gap-4"
            {...fadeUp(0)}
          >
            <div>
              <Heading className="text-[#000B60]">CA Inter – Costing</Heading>
              <Paragraph className="text-[#767683] mt-1 max-w-md">
                Comprehensive module covering advanced management accounting
                and cost control techniques.
              </Paragraph>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <Button
                variant="white"
                className="!h-9 !text-sm !px-3 !font-semibold border border-gray-200 gap-1.5"
              >
                <Share2 size={14} />
                Share
              </Button>
              <Button
                variant="white"
                className="!h-9 !text-sm !px-3 !font-semibold border border-red-200 !text-red-500 hover:bg-red-50 gap-1.5"
              >
                <Trash2 size={14} />
                Delete
              </Button>
              <Button
                variant="primary"
                className="!h-9 !text-sm !px-3 !font-semibold gap-1.5"
              >
                <Pencil size={14} />
                Edit Course
              </Button>
            </div>
          </motion.div>

          {/* Video Preview */}
          <motion.div
            className="relative rounded-xl overflow-hidden bg-[#0f1540] h-52 flex items-center justify-center"
            {...fadeUp(0.08)}
          >
            <div className="text-center text-white/60 select-none">
              <p className="text-lg font-bold tracking-widest uppercase opacity-40">
                CA Inter Costing Lecture
              </p>
              <p className="text-sm tracking-widest uppercase opacity-25 mt-1">
                Safe Work — Safe Future
              </p>
            </div>
            <button className="absolute w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center backdrop-blur-sm transition-colors">
              <Play size={22} className="text-white fill-white ml-0.5" />
            </button>
          </motion.div>

          {/* About this Course */}
          <motion.div {...fadeUp(0.16)}>
            <SectionCard title="About this Course">
              <div className="flex gap-6">
                <Paragraph className="text-[#767683] flex-1">
                  This course provides an in-depth exploration of Cost Accounting principles
                  specifically tailored for the CA Intermediate examination. Students will master
                  material costs, labor costs, overheads, and process costing. The curriculum is
                  designed by senior industry experts to ensure conceptual clarity and practical
                  application.
                </Paragraph>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase font-bold text-[#767683] tracking-widest">Category</p>
                  <p className="text-sm font-bold text-[#000B60] mt-0.5">CMA: Foundation</p>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Reviews */}
          <motion.div {...fadeUp(0.24)}>
            <div className="flex items-center justify-between mb-4">
              <Subheading className="font-bold text-[#191c1e]">Students Reviews</Subheading>
              <button className="text-sm text-[#000B60] font-semibold hover:underline">
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

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Price & Stats card */}
          <motion.div
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            {...fadeUp(0.12)}
          >
            {/* Price */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-extrabold text-[#000B60]">₹3,500</span>
              <span className="text-sm text-[#767683] line-through font-medium">₹4,500</span>
            </div>

            {/* Stars */}
            <StarRating rating={4} />

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Stats */}
            <ul className="space-y-3">
              {MOCK_STATS.map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="shrink-0">{s.icon}</span>
                  <span className="text-sm text-[#191c1e] font-medium">{s.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* View Analytics card */}
          <motion.div
            className="rounded-xl p-5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
            {...fadeUp(0.22)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">View Analytics</p>
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
