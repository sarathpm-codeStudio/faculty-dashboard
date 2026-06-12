import { useState, useEffect } from 'react'
import { Search, ArrowRight, Loader2 } from 'lucide-react'
import { Subheading, Paragraph, Input, Skeleton } from '@/components/ui'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

import Button from '@/components/ui/Button'
import { CourseCard } from '@/components/features'
import courseImg from '@/assets/images/cou1.png'
import courseImg2 from '@/assets/images/cou2.png'
import courseImg3 from '@/assets/images/cou3.png'
import courseImg4 from '@/assets/images/cou4.png'
import courseImg5 from '@/assets/images/cou5.png'
import courseImg6 from '@/assets/images/cou6.png'
import { useGetAllCourses } from '@/hooks/index'
import { useGetBundleById } from '@/hooks/useBundle'


export type Course = {
  id: number
  image: string
  category: string
  hours: string
  title: string
  description: string
  price: number
}

const ALL_COURSES: Course[] = [
  { id: 1, image: courseImg, category: 'CMA', hours: '6 Hours', title: 'Cost Accounting', description: 'Covers the fundamentals of cost accounting including...', price: 2149 },
  { id: 2, image: courseImg2, category: 'CA', hours: '11 Hours', title: 'Business Laws', description: 'Covers fundamental legal principles related to comm...', price: 2199 },
  { id: 3, image: courseImg3, category: 'CS', hours: '24 Hours', title: 'Corporate Governance & Ethics', description: 'Learn the importance of ethics, governance practice...', price: 1189 },
  { id: 4, image: courseImg4, category: 'CA', hours: '8 Hours', title: 'Taxation (Income Tax & GST)', description: 'Comprehensive coverage of direct and indirect taxat...', price: 3175 },
  { id: 5, image: courseImg5, category: 'CMA', hours: '10 Hours', title: 'Financial Management', description: 'Master the core concepts of financial planning and...', price: 2500 },
  { id: 6, image: courseImg6, category: 'CS', hours: '14 Hours', title: 'Advanced Auditing', description: 'Deep dive into auditing standards and practices...', price: 2800 },
]


interface Props {
  onNext: (selectedIds: number[], total: number) => void
  bundleId?: string,
  bundle?: any,
  bundleLoading?: boolean
}

const Step1CourseSelection = ({ onNext, bundleId, bundle, bundleLoading }: Props) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  // query to get all courses
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses(false, search, true)

  // Pre-select courses when editing an existing bundle
  useEffect(() => {
    if (bundle?.course_bundle_courses) {
      const preSelectedIds = bundle.course_bundle_courses.map(
        (item: any) => item.courses.id
      )
      setSelected(preSelectedIds)
    }
  }, [bundle])


  // const filtered = ALL_COURSES.filter(c =>
  //   c.title.toLowerCase().includes(search.toLowerCase()) ||
  //   c.category.toLowerCase().includes(search.toLowerCase())
  // )

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const selectedCourses: any = courses?.filter((c: any) => selected.includes(c.id))
  const total = selectedCourses?.reduce((sum: any, c: any) => sum + c.final_price, 0)

  return (

    <div className="grid grid-cols-12 gap-6 h-full min-h-0">
      {/* ── Left ── */}
      <div className="col-span-8 flex flex-col gap-4 min-h-0">
        {/* Search */}
        <div className="shrink-0">
          <Input
            placeholder="Search your courses by title or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto pr-2 auto-rows-min scrollbar-hide">


          {

            coursesLoading || bundleLoading ? (
              <div className="grid col-span-3 grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                    <Skeleton className="h-36 w-full rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) :

              courses?.length === 0 ? (
                <div className="flex col-span-2 items-center justify-center h-[500px]">
                  <Paragraph className="text-gray-400 !text-xs text-center py-4">
                    No courses found.
                  </Paragraph>
                </div>
              ) : (
                courses?.map((course: any) => (
                  <CourseCard
                    {...course}
                    selectable
                    selected={selected.includes(course.id)}
                    onClick={() => toggle(course.id)}
                  />
                ))
              )
          }
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="col-span-4 flex flex-col gap-4 min-h-0">
        <div className="bg-gray-100 rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-2 items-start">
            <Subheading className="text-[#2c1452] font-bold">Selection Summary</Subheading>
            <span className="text-[10px] font-bold text-white bg-[#2c1452] px-2.5 py-0.5 rounded-full">
              {selected.length} Selected
            </span>
          </div>

          {selectedCourses?.length === 0 ? (
            <Paragraph className="text-gray-400 !text-xs text-center py-4">
              Select courses from the left to add them to your bundle.
            </Paragraph>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedCourses?.map((c: any) => (
                <div key={c.id} className="flex bg-white rounded-xl p-5 items-start gap-3">
                  <img src={c.cover_image} alt="img" className="w-20 h-20 rounded-lg object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#191c1e] truncate leading-tight">{c.title}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{c.category}</p>
                    <p className="text-xs text-[#2c1452] font-bold mt-1">₹{c.final_price.toLocaleString()}.00</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCourses?.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <Paragraph className="text-sm font-semibold text-gray-500">Total Courses</Paragraph>
              <span className="font-bold text-[#191c1e] text-sm">₹{total.toLocaleString()}.00</span>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          disabled={selected.length === 0}
          className=""
          onClick={() => onNext(selected, total)}
        >
          Continue to Pricing
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

export default Step1CourseSelection
