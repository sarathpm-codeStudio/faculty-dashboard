import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Package } from 'lucide-react'
import Button from '../../components/ui/Button'
import { CourseCard, AddCourseCard } from '../../components/features'
import type { CourseCardProps } from '../../components/features/CourseCard'
import { Heading, Paragraph, Spinner } from '@/components/ui'
import { IoAddCircleOutline } from "react-icons/io5";
import courseImg from "@/assets/images/cou1.png"
import courseImg2 from "@/assets/images/cou2.png"
import courseImg3 from "@/assets/images/cou3.png"
import courseImg4 from "@/assets/images/cou4.png"
import courseImg5 from "@/assets/images/cou5.png"
import courseImg6 from "@/assets/images/cou6.png"
import { useGetAllCourses } from "@/hooks/useCourse"


type Course = Omit<CourseCardProps, 'onViewAnalytics' | 'onEdit' | 'onDelete'> & {
  status: 'active' | 'draft'
}



type Tab = 'active' | 'drafts'

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
}

const CoursesPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [isLoading, setIsLoading] = useState(true)

  const { data: courses, isLoading: coursesLoading } = useGetAllCourses({ filter: activeTab === "active" ? false : true }, true)

  useEffect(() => {
    setIsLoading(true)
    console.log("all courses", courses)
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [activeTab])



  const handleViewAnalytics = (id: number | string) => {
    console.log('View analytics for course', id)
  }

  const handleEdit = (id: number | string) => {
    console.log('Edit course', id)
  }

  const handleDelete = (id: number | string) => {
    console.log('Delete course', id)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div>
          <Heading className="text-[#000b60]">
            My Courses ({String(courses?.data?.length).padStart(2, '0')})
          </Heading>
          <Paragraph className="text-[#767683]">
            Manage and monitor your curriculum performance
          </Paragraph>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="white"
            className="!h-10 !text-sm !px-4 !font-semibold"
            onClick={() => console.log('Create bundle')}
          >
            <Package size={16} />
            Create Bundle
          </Button>
          <Button
            variant="primary"
            className="!h-10 !text-sm !px-4 !font-semibold"
            onClick={() => navigate('/courses/create')}
          >
            <IoAddCircleOutline size={20} />
            Create course
          </Button>
        </div>
      </motion.div>

      {/* Pill Tabs */}
      <motion.div
        className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
      >
        {(['active', 'drafts'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${activeTab === tab
              ? 'bg-white text-[#000B60] shadow-sm'
              : 'text-[#767683] hover:text-[#191c1e]'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Course Grid */}
      <AnimatePresence mode="wait">
        {coursesLoading ? (
          <motion.div
            key="spinner"
            className="flex items-center justify-center min-h-[50vh] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Spinner size={44} label="Loading courses..." />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {courses?.data?.map((course: any) => (
              <motion.div key={course.id} variants={cardVariants}>
                <CourseCard
                  {...course}
                  onViewAnalytics={handleViewAnalytics}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={(id) => navigate(`/courses/${id}`)}
                />
              </motion.div>
            ))}
            <motion.div variants={cardVariants}>
              <AddCourseCard onClick={() => navigate('/courses/create')} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CoursesPage
