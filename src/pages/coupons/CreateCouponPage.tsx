import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Clock, Plus, X, Eye, Loader2 } from 'lucide-react'
import { Button, Heading, Input, Paragraph } from '@/components/ui'
import { useGetAllCouponsEnabledCourses } from '@/hooks/coupons'
import { useFormik } from 'formik'
import { couponValidator } from '@/utils/validator/coupon.validator'
import { useCreateCoupon } from '@/hooks/coupons'
import { toast } from 'sonner'
import type { CreateCouponPayload } from '@/types/coupons.type'

type DiscountType = 'PERCENTAGE' | 'FLAT'

type CourseOption = { value: string; label: string }

const ALL_COURSES_OPTION: CourseOption = { value: 'all', label: 'All Courses' }

const LABEL_CLS = 'text-xs font-bold uppercase tracking-wider text-[#767683]'

const CreateCouponPage = () => {
  const navigate = useNavigate()

  const [selectedCourses, setSelectedCourses] = useState<CourseOption[]>([])
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [enabledCourses, setEnabledCourses] = useState<CourseOption[]>([])

  // query
  const { data: Courses, isLoading: enabledCoursesLoading } = useGetAllCouponsEnabledCourses(true)

  // mutation
  const { mutateAsync: createCoupon, isPending: isCreatingCoupon } = useCreateCoupon()

  useEffect(() => {
    if (Courses) {
      setEnabledCourses(Courses.data.map((course: any) => ({ value: course.id, label: course.title })))
    }
  }, [Courses])

  const isAllSelected = selectedCourses.some(c => c.value === ALL_COURSES_OPTION.value)

  const removeCourse = (value: string) =>
    setSelectedCourses(prev => prev.filter(c => c.value !== value))

  const addCourse = (course: CourseOption) => {
    if (course.value === ALL_COURSES_OPTION.value) {
      setSelectedCourses([ALL_COURSES_OPTION])
    } else {
      setSelectedCourses(prev => {
        const withoutAll = prev.filter(c => c.value !== ALL_COURSES_OPTION.value)
        if (withoutAll.some(c => c.value === course.value)) return withoutAll
        return [...withoutAll, course]
      })
    }
    setShowCourseDropdown(false)
  }

  const dropdownOptions: CourseOption[] = isAllSelected
    ? []
    : [ALL_COURSES_OPTION, ...enabledCourses.filter(c => !selectedCourses.some(s => s.value === c.value))]

    const formik = useFormik({
        initialValues: {
            code: '',
            discountType: 'PERCENTAGE' as DiscountType,
            discountValue: '',
            expiryDate: '',
            maxUsage: '',
            usagePerPerson: '',
            courses: [] as string[],
        },
        validationSchema: couponValidator,
        onSubmit: async (values) => {
            try {

              const payload: CreateCouponPayload = {
                code: values.code,
                discountType: values.discountType,
                discountValue: Number(values.discountValue),
                expiryDate: values.expiryDate,
                maxUsage: Number(values.maxUsage),
                usagePerPerson: Number(values.usagePerPerson),
                courses: values.courses,
              }
              const response = await createCoupon(payload)
              toast.success('Coupon created successfully')
              navigate('/coupons')
            } catch (error:any) {
              toast.error(error.message || 'Something went wrong')
            }
        }
    })   

  const previewCode = formik.values.code || 'FALL2024'
  const rawValue = formik.values.discountValue?.toString().trim() || '25'
  const displayValue = formik.values.discountType === 'PERCENTAGE' ? `${rawValue}% OFF` : `₹${rawValue} OFF`

  const formattedExpiry = formik.values.expiryDate
    ? new Date(formik.values.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Dec 31, 2024'

  useEffect(() => {
    formik.setFieldValue(
      'courses',
      selectedCourses.map(c => c.value),
      formik.touched.courses ?? false,
    )
  }, [selectedCourses])




  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <Heading className="text-[#000B60]">Create New Coupon</Heading>
        <Paragraph className="text-[#767683] mt-1">
          Set up a new promotional campaign for your courses.
        </Paragraph>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: Form card */}
        <div className="col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">

          {/* Coupon Code */}
          <Input
            label="Coupon Code"
            name='code'
            labelClassName={LABEL_CLS}
            placeholder="E.G. FALL2024"
            value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.code ? formik.errors.code : undefined}
          />

          {/* Discount Type */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-bold text-gray-700 ${LABEL_CLS}`}>Discount Type</label>
            <div className="flex items-center bg-[#F2F4F6] rounded-xl p-1 w-fit">
              {(['PERCENTAGE', 'FLAT'] as DiscountType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => formik.setFieldValue('discountType', type)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${formik.values.discountType === type
                    ? 'bg-white text-[#000B60] shadow-sm'
                    : 'text-[#767683] hover:text-[#000B60]'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value + Expiry Date */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={formik.values.discountType === 'PERCENTAGE' ? 'Discount Value (%)' : 'Discount Value (₹)'}
              labelClassName={LABEL_CLS}
              name='discountValue'
              type="number"
              min={0}
              max={formik.values.discountType === 'PERCENTAGE' ? 100 : undefined}
              placeholder={formik.values.discountType === 'PERCENTAGE' ? '25' : '50'}
              value={formik.values.discountValue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.discountValue ? formik.errors.discountValue : undefined}
            />
            <div className="flex flex-col gap-2">
              {/* <label className={LABEL_CLS}>Expiry Date</label> */}
              <Input
              label="Expiry Date"
              name='expiryDate'
              labelClassName={LABEL_CLS}
              type="date"
              placeholder="e.g. 100"
              value={formik.values.expiryDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expiryDate ? formik.errors.expiryDate : undefined}
            />
            </div>
          </div>

          {/* Max Usage + Usage Per Person */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Usage"
              labelClassName={LABEL_CLS}
              type="number"
              name='maxUsage'
              min={1}
              placeholder="e.g. 100"
              value={formik.values.maxUsage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.maxUsage ? formik.errors.maxUsage : undefined}
            />
            <Input
              label="Usage Per Person"
              labelClassName={LABEL_CLS}
              type="number"
              name='usagePerPerson'
              min={1}
              placeholder="e.g. 1"
              value={formik.values.usagePerPerson}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.usagePerPerson ? formik.errors.usagePerPerson : undefined}
            />
          </div>

          {/* Applicable Courses */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLS}>Applicable Courses</label>
            <div
              className={`relative min-h-[52px] px-3 py-2.5 rounded-lg border bg-[#F2F4F6] flex flex-wrap items-center gap-2 ${
                formik.touched.courses && formik.errors.courses ? 'border-red-500' : 'border-gray-100'
              }`}
            >
              {selectedCourses.map(course => (
                <span
                  key={course.value}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#EAECFF] rounded-full text-xs font-semibold text-[#000B60]"
                >
                  {course.label}
                  <button
                    type="button"
                    onClick={() => {
                      removeCourse(course.value)
                      formik.setFieldTouched('courses', true, false)
                    }}
                    className="text-[#000B60]/60 hover:text-red-500 transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowCourseDropdown(prev => !prev)
                  formik.setFieldTouched('courses', true, false)
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#000B60] text-[#000B60] hover:bg-[#000B60] hover:text-white transition-colors"
              >
                <Plus size={13} />
              </button>

              {showCourseDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-56 max-h-48 overflow-y-auto">
                  {enabledCoursesLoading ? (
                    <div className="px-4 py-2.5 text-sm text-[#767683]">Loading courses...</div>
                  ) : dropdownOptions.length === 0 ? (
                    <div className="px-4 py-2.5 text-sm text-[#767683]">No courses available</div>
                  ) : (
                    dropdownOptions.map(course => {
                      const isAllOption = course.value === ALL_COURSES_OPTION.value
                      return (
                        <button
                          key={course.value}
                          type="button"
                          onClick={() => addCourse(course)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F2F4F6] transition-colors ${
                            isAllOption
                              ? 'font-semibold text-[#000B60] border-b border-gray-100'
                              : 'text-[#191c1e]'
                          }`}
                        >
                          {course.label}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
            {formik.touched.courses && formik.errors.courses ? (
              <p className="text-xs text-red-500">{formik.errors.courses as string}</p>
            ) : (
              <p className="text-xs text-[#767683]">Select courses where this coupon can be redeemed.</p>
            )}
          </div>
        </div>

        {/* Right: Preview + Actions */}
        <div className="col-span-5 flex flex-col gap-5">

          {/* Coupon Preview card with top accent */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Top accent line */}
            <div className="h-1 bg-[#000B60]" />

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-[#000B60]" />
                <p className="text-sm font-bold text-[#000B60]">Coupon Preview</p>
              </div>

              {/* Preview gradient card */}
              <div
                className="rounded-xl p-4 flex flex-col gap-3"
                style={{ background: 'linear-gradient(135deg, #000B60 0%, #142283 100%)' }}
              >
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-blue-300 mb-1">Exclusive Discount</p>
                  <p className="text-3xl font-extrabold text-white leading-tight">{displayValue}</p>
                </div>

                <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-sm font-bold text-white tracking-widest">{previewCode}</span>
                  <button className="text-blue-300 hover:text-white transition-colors">
                    <Copy size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-blue-300" />
                  <p className="text-[10px] text-blue-300 font-medium">Valid until {formattedExpiry}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button variant="white" className="!text-[#191c1e] !text-[14px] !h-10 !px-6" onClick={() => navigate(-1)}>
              Cancel
            </Button> 
            <Button variant="primary" type='submit' onClick={() => { formik.handleSubmit() }} className="!h-10 !text-sm !px-6">
              Create Coupon
              {isCreatingCoupon && <Loader2 size={14} className="animate-spin" />}
            </Button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default CreateCouponPage
