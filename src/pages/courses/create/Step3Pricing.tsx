import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Loader2, Gift } from 'lucide-react'
import { useFormik } from 'formik'
import { Input, Select, Button, Subheading, Paragraph, Skeleton, ConfirmDeleteModal } from '@/components/ui'
import type { CourseFormData } from './index'
import { RiCoupon2Fill } from "react-icons/ri";
import { coursePricingSchema } from '@/utils/validator/course.validator'
import { useAddCoursePricing, useFreeCourseValidity, useGetAllCourses, useGstPercent } from "@/hooks/useCourse"
import { toast } from 'sonner'


interface Props {
  form: CourseFormData
  onNext: () => void
  courseId: string
  courseDetails?: any
  isLoadingCourseDetails?: boolean
}

const validityOptions = [
  { value: '1', label: '1 Month' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '1 Year' },
  { value: 'lifetime', label: 'Lifetime' },
]

const discountTypeOptions = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'flat', label: 'Flat Amount' },
]

type PricingValues = {
  validity: string
  price: string
  discount: string
  discountType: string
  /** true → INCLUSIVE_GST: discount applies to the GST-inclusive price */
  discountOnInclusive: boolean
  enableCoupons: boolean
  isFree: boolean
  /** Free courses only: the paid course upsold when this one expires */
  mainCourseId: string
}

const Step3Pricing = ({ form, onNext, courseId, courseDetails, isLoadingCourseDetails }: Props) => {
  const formik = useFormik<PricingValues>({
    initialValues: {
      validity: form.validity ?? '',
      price: form.price ?? '',
      discount: form.discount ?? '',
      discountType: form.discountType ?? '',
      discountOnInclusive: true, // platform default: INCLUSIVE_GST
      enableCoupons: form.enableCoupons ?? false,
      isFree: form.isFree ?? false,
      mainCourseId: '',
    },
    validationSchema: coursePricingSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      try {
        // Faculty enters the base price WITHOUT GST (exclude_price).
        // price / final_price are stored GST-INCLUSIVE (students see these).
        const payload = values.isFree
          ? {
            // Free courses: validity comes from platform_settings
            // ('free_course_validity', in DAYS — stored as '<n>d'), and the
            // faculty picks the paid "main" course upsold on expiry.
            validity: `${freeValidityDays}d`,
            exclude_price: 0,
            price: 0,
            discount: 0,
            discount_type: '',
            discount_mode: 'INCLUSIVE_GST',
            final_price: 0,
            enableCoupons: false,
            is_free: true,
            main_course_id: values.mainCourseId,
          }
          : {
            validity: values.validity,
            exclude_price: Number(values.price) || 0,
            price: Number(priceInclGst) || 0,
            discount: values.discount ? Number(values.discount) : 0,
            discount_type: values.discountType,
            discount_mode: values.discountOnInclusive ? 'INCLUSIVE_GST' : 'EXCLUSIVE_GST',
            final_price: Number(studentPrice) || 0,
            enableCoupons: values.enableCoupons,
            is_free: false,
            main_course_id: null,
          }
        await addCoursePricing(payload)
        toast.success('Course pricing added successfully')
        onNext()
      } catch {
        // Error toast handled globally by the query client.
      }
    },
  })



  const { values, errors, touched, setFieldValue, handleChange, handleBlur, handleSubmit } = formik


  // mutation for add course pricing
  const { mutateAsync: addCoursePricing } = useAddCoursePricing(courseId)

  useEffect(() => {
    if (!courseDetails) return
    const d = courseDetails
    formik.setValues({
      validity: d.validity ?? '',
      // The form edits the ex-GST base (exclude_price). Older rows saved
      // before the GST model may only have price — fall back to it.
      price: d.exclude_price ? String(d.exclude_price) : d.price != null ? String(d.price) : '',
      discount: d.discount != null ? String(d.discount) : '',
      discountType: d.discount_type ?? '',
      discountOnInclusive: d.discount_mode === 'INCLUSIVE_GST',
      enableCoupons: d.enable_coupons ?? d.enableCoupons ?? false,
      isFree: d.is_free ?? false,
      mainCourseId: d.main_course_id ?? '',
    })
  }, [courseDetails])

  // GST-inclusive pricing: faculty enters the base, GST goes on top.
  const { data: gstPercent = 18 } = useGstPercent()
  const gstRate = gstPercent / 100

  // Free courses: validity is platform-set (in days), and the faculty must
  // pick the paid "main" course students are shown when the freebie expires.
  const { data: freeValidityDays = 7 } = useFreeCourseValidity()
  const { data: myCourses } = useGetAllCourses(false, '', values.isFree)
  const mainCourseOptions = useMemo(
    () =>
      (myCourses ?? [])
        .filter((c: any) => !c.is_free && c.id !== courseId)
        .map((c: any) => ({ value: c.id, label: c.title })),
    [myCourses, courseId],
  )

  const price = parseFloat(values.price) || 0
  const discount = parseFloat(values.discount) || 0
  const discountType = values.discountType
  const discountOnInclusive = values.discountOnInclusive
  const enableCoupons = values.enableCoupons
  const isFree = values.isFree

  // confirmation modal shown before turning a course free
  const [freeConfirmOpen, setFreeConfirmOpen] = useState(false)

  const handleFreeToggle = () => {
    if (isFree) {
      // turning OFF free — no confirmation needed
      setFieldValue('isFree', false)
    } else {
      // turning ON free — ask for confirmation first
      setFreeConfirmOpen(true)
    }
  }

  const confirmFree = () => {
    setFieldValue('isFree', true)
    // clear paid-only fields so nothing stale is submitted
    setFieldValue('price', '')
    setFieldValue('discount', '')
    setFieldValue('discountType', '')
    setFieldValue('enableCoupons', false)
    setFreeConfirmOpen(false)
  }

  // price (form field) = faculty's base WITHOUT GST.
  // Two discount models (course-gst-pricing.md):
  //   EXCLUSIVE_GST — discount on the ex-GST base, GST added on what remains
  //   INCLUSIVE_GST — discount straight off the GST-inclusive sticker price
  const priceInclGst = Math.round(price * (1 + gstRate))       // sticker price (incl. GST)

  const discountAmount = useMemo(() => {
    const appliedTo = discountOnInclusive ? priceInclGst : price
    if (discountType === 'percentage') return (appliedTo * discount) / 100
    return discount
  }, [price, priceInclGst, discount, discountType, discountOnInclusive])

  const studentPrice = discountOnInclusive
    ? Math.max(0, priceInclGst - Math.round(discountAmount))
    : Math.round(Math.max(0, price - discountAmount) * (1 + gstRate))

  // GST actually inside what the student pays (extraction works for both models)
  const gstAmount = (studentPrice * gstPercent) / (100 + gstPercent)

  const saved = priceInclGst - studentPrice

  if (courseId && (isLoadingCourseDetails || !courseDetails)) {
    return (
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 lg:col-span-8 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="col-span-5 lg:col-span-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }



  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">

      {/* ── Left column (8 cols) ─────────────────────────── */}
      <div className="col-span-7 lg:col-span-8 flex flex-col gap-4">

        {/* Free Course toggle — top of pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:px-10 lg:py-6 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0"><Gift size={22} className='text-[#2c1452]' /></span>
              <Subheading className='text-[#2c1452] font-bold'>Free Course</Subheading>
            </div>
            <Paragraph className='text-gray-400 mt-0.5 ml-8'>
              Make this course free for everyone. Pricing and coupons will be disabled.
            </Paragraph>
          </div>
          <div className="flex items-center gap-2 shrink-0 lg:mt-0.5">
            <button
              type="button"
              onClick={handleFreeToggle}
              className={`w-10 h-5 rounded-full transition-colors relative ${isFree ? 'bg-[#2c1452]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isFree ? 'left-5' : 'left-0.5'}`} />
            </button>
            <Paragraph className='text-xs font-semibold text-gray-600'>Free Course</Paragraph>
          </div>
        </div>

        {/* White form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          {isFree ? (
            <>
              {/* Free courses: validity is fixed platform-wide by the admin */}
              <div>
                <Input
                  label="Course Validity"
                  value={`${freeValidityDays} ${freeValidityDays === 1 ? 'Day' : 'Days'}`}
                  readOnly
                  className="cursor-default"
                />
                <Paragraph className="text-xs text-gray-400 mt-1.5">
                  Free course validity is set by the platform and applies to all free courses.
                </Paragraph>
              </div>

              {/* The paid course this freebie upsells once it expires */}
              <div>
                <Select
                  label="Main Course"
                  placeholder="Select the main course"
                  options={mainCourseOptions}
                  name="mainCourseId"
                  value={values.mainCourseId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.mainCourseId && errors.mainCourseId ? errors.mainCourseId : undefined}
                />
                <Paragraph className="text-xs text-gray-400 mt-1.5">
                  When the free course expires, students are shown this course to purchase.
                </Paragraph>
              </div>
            </>
          ) : (
            <Select
              label="Course Validity"
              placeholder="Select Validity"
              options={validityOptions}
              name="validity"
              value={values.validity}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.validity && errors.validity ? errors.validity : undefined}
            />
          )}

          {!isFree && (
            <>
              <div>
                <Input
                  label={`Course Price (excluding GST)`}
                  type="number"
                  min={0}
                  placeholder="0"
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.price && errors.price ? errors.price : undefined}
                  leftIcon={<span className="font-semibold text-gray-500">₹</span>}
                />
                {price > 0 && (
                  <Paragraph className="text-xs text-gray-400 mt-1.5">
                    Students will see ₹{priceInclGst.toLocaleString('en-IN')} (₹{price.toLocaleString('en-IN')} + {gstPercent}% GST)
                  </Paragraph>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Discount Type"
                  placeholder="Select discount type"
                  options={discountTypeOptions}
                  name="discountType"
                  value={values.discountType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.discountType && errors.discountType ? errors.discountType : undefined}
                />
                <Input
                  label="Discount"
                  type="number"
                  min={0}
                  max={discountType === 'percentage' ? 100 : undefined}
                  placeholder="0"
                  name="discount"
                  value={values.discount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.discount && errors.discount ? errors.discount : undefined}
                />
              </div>

              {/* Discount model: EXCLUSIVE_GST (off) vs INCLUSIVE_GST (on) */}
              <div className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-4 py-3 gap-4">
                <div className="min-w-0">
                  <Paragraph className="text-xs font-semibold text-gray-700">
                    Apply discount on GST-inclusive price
                  </Paragraph>
                  <Paragraph className="!text-[11px] text-gray-400 mt-0.5">
                    {discountOnInclusive
                      ? `Discount comes off ₹${priceInclGst.toLocaleString('en-IN')} (price incl. GST). GST is inside the final price.`
                      : `Discount comes off ₹${price.toLocaleString('en-IN')} (base price). GST is added on the rest.`}
                  </Paragraph>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldValue('discountOnInclusive', !discountOnInclusive)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${discountOnInclusive ? 'bg-[#2c1452]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${discountOnInclusive ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </>
          )}

        </div>

        {/* Promotional Tools — separate section */}
        {!isFree && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:px-10 lg:py-10 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0"><RiCoupon2Fill size={25} className='text-[#2c1452] font-bold' /></span>
                <Subheading className='text-[#2c1452] font-bold' >Promotional Tools</Subheading>
              </div>
              <Paragraph className='text-gray-400 mt-0.5 ml-8'>
                Allow students to apply additional discount codes at checkout
              </Paragraph>
            </div>
            <div className="flex items-center gap-2 shrink-0 lg:mt-0.5">
              <button
                type="button"
                onClick={() => setFieldValue('enableCoupons', !enableCoupons)}
                className={`w-10 h-5 rounded-full transition-colors relative ${enableCoupons ? 'bg-[#2c1452]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enableCoupons ? 'left-5' : 'left-0.5'}`} />
              </button>
              <Paragraph className='text-xs font-semibold text-gray-600'>Enable Coupons</Paragraph>
            </div>
          </div>
        )}

      </div>

      {/* ── Right column (4 cols) ────────────────────────── */}
      <div className="col-span-5 lg:col-span-4 flex flex-col gap-4">

        {isFree ? (
          /* Free course summary */
          <div
            className="rounded-2xl p-7 text-white"
            style={{ background: 'linear-gradient(135deg, #2c1452, #2c1452)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Students Price</p>
            <p className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <Gift size={28} /> Free
            </p>
            <p className="text-xs opacity-60 mt-2 leading-relaxed">
              This course is free for all students. No payment is required to enroll.
            </p>
          </div>
        ) : (
          <>
            {/* Students Price card */}
            <div
              className="rounded-2xl p-7 text-white"
              style={{ background: 'linear-gradient(135deg, #2c1452, #2c1452)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Students Price</p>
              <p className="text-4xl font-bold tracking-tight">₹{studentPrice.toFixed(2)}</p>
              <p className="text-xs opacity-60 mt-2 leading-relaxed">
                Includes ₹{gstAmount.toFixed(2)} GST ({gstPercent}%)
                {discount > 0 && (
                  <> after a {discountType === 'percentage' ? `${discount}%` : `₹${discount}`} discount on the {discountOnInclusive
                    ? `₹${priceInclGst.toFixed(2)} price (incl. GST)`
                    : `₹${price.toFixed(2)} base price`}</>
                )}.
              </p>
              {discount > 0 && (
                <p className="text-xs opacity-60 mt-2 leading-relaxed">
                  Students save ₹{saved.toFixed(2)} on this course.
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-3 px-1">
              <div className="flex justify-between text-sm">
                <Paragraph className='text-xs font-semibold text-gray-600'>Base Price (excl. GST)</Paragraph>
                <span className="font-semibold text-gray-700">₹{price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <Paragraph className='text-xs font-semibold text-gray-600'>
                  Discount{discountOnInclusive ? ' (on GST-incl. price)' : ''}
                </Paragraph>
                <span className="font-semibold text-gray-700">
                  {discountType === 'percentage' ? `${discount}%` : `₹${discount}`}
                  {discount > 0 && discountType === 'percentage' && ` (₹${discountAmount.toFixed(2)})`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <Paragraph className='text-xs font-semibold text-gray-600'>GST ({gstPercent}%)</Paragraph>
                <span className="font-semibold text-gray-700">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                <Paragraph className='text-xs font-semibold text-gray-600'>Students Price</Paragraph>
                <span className="font-bold text-[#2c1452]">₹{studentPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount Calculator */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
              <Subheading className='text-[#2c1452] font-bold'>Discount Calculator</Subheading>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <div className="min-w-0 bg-[#F2F4F6] rounded-xl p-3 flex items-center justify-between gap-2 xl:flex-col xl:items-start xl:gap-1">
                  <Paragraph className='text-xs font-semibold text-gray-600 leading-tight break-words min-w-0'>Course Price (incl. GST)</Paragraph>
                  <p className="text-sm font-bold text-gray-700 whitespace-nowrap">₹{priceInclGst.toFixed(2)}</p>
                </div>
                <div className="min-w-0 bg-[#F2F4F6] rounded-xl p-3 flex items-center justify-between gap-2 xl:flex-col xl:items-start xl:gap-1">
                  <Paragraph className='text-xs font-semibold text-gray-600 leading-tight break-words min-w-0'>Student Price</Paragraph>
                  <p className="text-sm font-bold text-gray-700 whitespace-nowrap">₹{studentPrice.toFixed(2)}</p>
                </div>
                <div className="min-w-0 bg-[#E6FBF7] rounded-xl p-3 flex items-center justify-between gap-2 xl:flex-col xl:items-start xl:gap-1">
                  <Paragraph className='text-xs font-semibold text-[#00A98F] leading-tight break-words min-w-0'>Student Saved</Paragraph>
                  <p className="text-sm font-bold text-[#00A98F] whitespace-nowrap">₹{saved.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preview CTA */}
        <Button type="submit" variant="primary" fullWidth>
          Preview <ArrowRight size={18} />
        </Button>
      </div>

      {/* Free course confirmation */}
      <ConfirmDeleteModal
        open={freeConfirmOpen}
        onClose={() => setFreeConfirmOpen(false)}
        onConfirm={confirmFree}
        variant="primary"
        icon={<Gift size={24} className="text-[#2c1452]" />}
        title="Make this course free?"
        message="This will remove pricing, discounts and coupons. Students will be able to enroll for free. Do you want to continue?"
        confirmText="Yes, make it free"
        cancelText="Cancel"
      />
    </form>
  )
}

export default Step3Pricing
