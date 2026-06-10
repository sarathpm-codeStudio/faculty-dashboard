import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Copy, Clock, Plus, X, Eye, Loader2 } from 'lucide-react'
import { Button, Heading, Input, Paragraph } from '@/components/ui'
import {
  useGetAllCouponsEnabledCourses,
  useCreateCoupon,
  useUpdateCoupon,
  useGetCouponById,
} from '@/hooks/coupons'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { couponValidator } from '@/utils/validator/coupon.validator'
import { toast } from 'sonner'
import type { CreateCouponPayload } from '@/types/coupons.type'

type DiscountType = 'PERCENTAGE' | 'FLAT'

type CourseOption = { value: string; label: string }

type EditCouponData = {
  id: number | string
  code: string
  discount_type: DiscountType
  discount: number
  is_all_courses: boolean
  max_usage: number
  usage_per_person: number
  expire_date: string
}

const ALL_COURSES_OPTION: CourseOption = { value: 'all', label: 'All Courses' }

const LABEL_CLS = 'text-xs font-bold uppercase tracking-wider text-[#767683]'
const DISABLED_CLS = 'opacity-60 cursor-not-allowed'

const editCouponValidator = Yup.object({
  expiryDate: Yup.date().required('Expiry date is required'),
  maxUsage: Yup.number().min(1, 'Must be at least 1').required('Max usage is required'),
  usagePerPerson: Yup.number().min(1, 'Must be at least 1').required('Usage per person is required'),
  courses: Yup.array()
    .of(Yup.string())
    .min(1, 'Please select at least one course')
    .required('Please select at least one course'),
})

const normalizeCourseList = (raw: any): CourseOption[] => {
  if (!Array.isArray(raw)) return []
  return raw.map((c: any) => {
    if (c == null) return null
    if (typeof c === 'string' || typeof c === 'number') {
      return { value: String(c), label: String(c) }
    }
    const value = c.id ?? c.value ?? c._id
    const label = c.title ?? c.label ?? c.name ?? String(value ?? '')
    if (value == null) return null
    return { value: String(value), label: String(label) }
  }).filter(Boolean) as CourseOption[]
}

const toDateInputValue = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const CreateCouponPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()
  const editingCoupon = (location.state as { coupon?: EditCouponData } | null)?.coupon
  const isEditMode = Boolean(id)

  const [selectedCourses, setSelectedCourses] = useState<CourseOption[]>([])
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [enabledCourses, setEnabledCourses] = useState<CourseOption[]>([])

  // query
  const { data: Courses, isLoading: enabledCoursesLoading } = useGetAllCouponsEnabledCourses(true)
  const { data: couponDetail } = useGetCouponById(id, isEditMode)

  // mutation
  const { mutateAsync: createCoupon, isPending: isCreatingCoupon } = useCreateCoupon()
  const { mutateAsync: updateCoupon, isPending: isUpdatingCoupon } = useUpdateCoupon()

  useEffect(() => {
    if (Courses) {
      setEnabledCourses(Courses.data.map((course: any) => ({ value: course.id, label: course.title })))
    }
  }, [Courses])

  // Redirect back if landing on edit URL without state (e.g. page refresh).
  useEffect(() => {
    if (isEditMode && !editingCoupon) {
      toast.error('Coupon data is missing. Please re-open from the list.')
      navigate('/coupon-management', { replace: true })
    }
  }, [isEditMode, editingCoupon, navigate])

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

  const initialValues = useMemo(() => {
    if (isEditMode && editingCoupon) {
      return {
        code: editingCoupon.code,
        discountType: editingCoupon.discount_type,
        discountValue: String(editingCoupon.discount ?? ''),
        expiryDate: toDateInputValue(editingCoupon.expire_date),
        maxUsage: String(editingCoupon.max_usage ?? ''),
        usagePerPerson: String(editingCoupon.usage_per_person ?? ''),
        courses: editingCoupon.is_all_courses ? ['all'] : [],
      }
    }
    return {
      code: '',
      discountType: 'PERCENTAGE' as DiscountType,
      discountValue: '',
      expiryDate: '',
      maxUsage: '',
      usagePerPerson: '',
      courses: [] as string[],
    }
  }, [isEditMode, editingCoupon])

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: isEditMode ? editCouponValidator : couponValidator,
    onSubmit: async (values) => {
      try {
        if (isEditMode && (editingCoupon || id)) {
          await updateCoupon({
            id: editingCoupon?.id ?? id,
            payload: {
              
              expiryDate: values.expiryDate,
              maxUsage: Number(values.maxUsage),
              usagePerPerson: Number(values.usagePerPerson),
              courses: values.courses,
            },
          })
          toast.success('Coupon updated successfully')
          navigate('/coupon-management')
          return
        }

        const payload: CreateCouponPayload = {
          code: values.code,
          discountType: values.discountType,
          discountValue: Number(values.discountValue),
          expiryDate: values.expiryDate,
          maxUsage: Number(values.maxUsage),
          usagePerPerson: Number(values.usagePerPerson),
          courses: values.courses,
        }
        await createCoupon(payload)

        toast.success('Coupon created successfully')
        navigate('/coupon-management')
      } catch (error: any) {
        console.log("error response", error)
        toast.error(error.message || 'Something went wrong')
      }
    }
  })

  // Sync the courses-chip UI back to form values.
  useEffect(() => {
    formik.setFieldValue(
      'courses',
      selectedCourses.map(c => c.value),
      formik.touched.courses ?? false,
    )
  }, [selectedCourses])

  // Prefill the courses-chip UI when editing an existing coupon. We start with
  // a quick value from navigation state, then refine once the full coupon
  // detail (with its course list) has been fetched.
  useEffect(() => {
    if (!isEditMode) return
    if (editingCoupon?.is_all_courses) {
      setSelectedCourses([ALL_COURSES_OPTION])
    }
  }, [isEditMode, editingCoupon])

  useEffect(() => {
    if (!isEditMode || !couponDetail) return
    const detail = (couponDetail as any).data ?? couponDetail
    if (detail?.is_all_courses) {
      setSelectedCourses([ALL_COURSES_OPTION])
      return
    }
    const courses = normalizeCourseList(detail?.courses)
    if (courses.length > 0) setSelectedCourses(courses)
  }, [isEditMode, couponDetail])

  const previewCode = formik.values.code || 'FALL2024'
  const rawValue = formik.values.discountValue?.toString().trim() || '25'
  const displayValue = formik.values.discountType === 'PERCENTAGE' ? `${rawValue}% OFF` : `₹${rawValue} OFF`

  const formattedExpiry = formik.values.expiryDate
    ? new Date(formik.values.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Dec 31, 2024'

  const minExpiryDate = (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yyyy = tomorrow.getFullYear()
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const isSubmitting = isCreatingCoupon || isUpdatingCoupon

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <Heading className="text-[#2c1452]">{isEditMode ? 'Edit Coupon' : 'Create New Coupon'}</Heading>
        <Paragraph className="text-[#767683] mt-1">
          {isEditMode
            ? 'Update the expiry date and usage limits for this coupon.'
            : 'Set up a new promotional campaign for your courses.'}
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
            error={!isEditMode && formik.touched.code ? formik.errors.code : undefined}
            disabled={isEditMode}
            className={isEditMode ? DISABLED_CLS : ''}
          />

          {/* Discount Type */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-bold text-gray-700 ${LABEL_CLS}`}>Discount Type</label>
            <div className={`flex items-center bg-[#F2F4F6] rounded-xl p-1 w-fit ${isEditMode ? DISABLED_CLS : ''}`}>
              {(['PERCENTAGE', 'FLAT'] as DiscountType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  disabled={isEditMode}
                  onClick={() => !isEditMode && formik.setFieldValue('discountType', type)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${formik.values.discountType === type
                    ? 'bg-white text-[#2c1452] shadow-sm'
                    : 'text-[#767683] hover:text-[#2c1452]'
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
              error={!isEditMode && formik.touched.discountValue ? formik.errors.discountValue : undefined}
              disabled={isEditMode}
              className={isEditMode ? DISABLED_CLS : ''}
            />
            <div className="flex flex-col gap-2">
              <Input
                label="Expiry Date"
                name='expiryDate'
                labelClassName={LABEL_CLS}
                type="date"
                placeholder="e.g. 100"
                min={minExpiryDate}
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
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#EAECFF] rounded-full text-xs font-semibold text-[#2c1452]"
                >
                  {course.label}
                  <button
                    type="button"
                    onClick={() => {
                      removeCourse(course.value)
                      formik.setFieldTouched('courses', true, false)
                    }}
                    className="text-[#2c1452]/60 hover:text-red-500 transition-colors"
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
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#2c1452] text-[#2c1452] hover:bg-[#2c1452] hover:text-white transition-colors"
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
                              ? 'font-semibold text-[#2c1452] border-b border-gray-100'
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
            <div className="h-1 bg-[#2c1452]" />

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-[#2c1452]" />
                <p className="text-sm font-bold text-[#2c1452]">Coupon Preview</p>
              </div>

              {/* Preview gradient card */}
              <div
                className="rounded-xl p-4 flex flex-col gap-3"
                style={{ background: 'linear-gradient(135deg, #2c1452 0%, #2c1452 100%)' }}
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
            <Button
              variant="primary"
              type='submit'
              onClick={() => { formik.handleSubmit() }}
              className="!h-10 !text-sm !px-6"
              disabled={isSubmitting}
            >
              {isEditMode ? 'Update Coupon' : 'Create Coupon'}
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            </Button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default CreateCouponPage
