import { useEffect, useMemo } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { Input, Select, Button, Subheading, Paragraph, Skeleton } from '@/components/ui'
import type { CourseFormData } from './index'
import { RiCoupon2Fill } from "react-icons/ri";
import { coursePricingSchema } from '@/utils/validator/course.validator'
import { useAddCoursePricing } from "@/hooks/useCourse"
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
  enableCoupons: boolean
}

const Step3Pricing = ({ form, onNext, courseId, courseDetails, isLoadingCourseDetails }: Props) => {
  const formik = useFormik<PricingValues>({
    initialValues: {
      validity: form.validity ?? '',
      price: form.price ?? '',
      discount: form.discount ?? '',
      discountType: form.discountType ?? '',
      enableCoupons: form.enableCoupons ?? false,
    },
    validationSchema: coursePricingSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      try {
        const payload = {
          validity: values.validity,
          price: Number(values.price) || 0,
          discount: values.discount ? Number(values.discount) : 0,
          discount_type: values.discountType,
          final_price: Number(studentPrice) || 0,
          enableCoupons: values.enableCoupons,
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
      price: d.price != null ? String(d.price) : '',
      discount: d.discount != null ? String(d.discount) : '',
      discountType: d.discount_type ?? '',
      enableCoupons: d.enable_coupons ?? d.enableCoupons ?? false,
    })
  }, [courseDetails])

  const price = parseFloat(values.price) || 0
  const discount = parseFloat(values.discount) || 0
  const discountType = values.discountType
  const enableCoupons = values.enableCoupons

  const studentPrice = useMemo(() => {
    if (discountType === 'percentage') {
      return Math.max(0, price - (price * discount) / 100)
    }
    return Math.max(0, price - discount)
  }, [price, discount, discountType])

  const saved = price - studentPrice

  if (courseId && (isLoadingCourseDetails || !courseDetails)) {
    return (
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="col-span-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }



  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">

      {/* ── Left column (8 cols) ─────────────────────────── */}
      <div className="col-span-8 flex flex-col gap-4">

        {/* White form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <Select
            label="Course Duration"
            placeholder="Select duration"
            options={validityOptions}
            name="validity"
            value={values.validity}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.validity && errors.validity ? errors.validity : undefined}
          />

          <Input
            label="Course Price"
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

        </div>

        {/* Promotional Tools — separate section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base"><RiCoupon2Fill size={25} className='text-[#2c1452] font-bold' /></span>
              <Subheading className='text-[#2c1452] font-bold' >Promotional Tools</Subheading>
            </div>
            <Paragraph className='text-gray-400 mt-0.5 ml-8'>
              Allow students to apply additional discount codes at checkout
            </Paragraph>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
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

      </div>

      {/* ── Right column (4 cols) ────────────────────────── */}
      <div className="col-span-4 flex flex-col gap-4">

        {/* Students Price card */}
        <div
          className="rounded-2xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #2c1452, #2c1452)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Students Price</p>
          <p className="text-4xl font-bold tracking-tight">₹{studentPrice.toFixed(2)}</p>
          <p className="text-xs opacity-60 mt-2 leading-relaxed">
            Calculated based on a {discount}{discountType === 'percentage' ? '%' : '₹'} discount applied to the ₹{price.toFixed(2)}.
          </p>
          {discount > 0 && (
            <p className="text-xs opacity-60 mt-2 leading-relaxed">
              You save ₹{saved.toFixed(2)} on this course.
            </p>
          )}
        </div>

        {/* Price breakdown */}
        <div className="flex flex-col gap-3 px-1">
          <div className="flex justify-between text-sm">
            <Paragraph className='text-xs font-semibold text-gray-600'>Course Price</Paragraph>
            <span className="font-semibold text-gray-700">₹{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <Paragraph className='text-xs font-semibold text-gray-600'>Discount</Paragraph>
            <span className="font-semibold text-gray-700">
              {discount}{discountType === 'percentage' ? '%' : '₹'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
            <Paragraph className='text-xs font-semibold text-gray-600'>Students Price</Paragraph>
            <span className="font-bold text-[#2c1452]">₹{studentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount Calculator */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
          <Subheading className='text-[#2c1452] font-bold'>Discount Calculator</Subheading>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 bg-[#F2F4F6] rounded-xl p-2">
              <Paragraph className='text-xs font-semibold text-gray-600'>Sum of Courses</Paragraph>
              <p className="text-sm font-bold text-gray-700">₹{price.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-1 bg-[#F2F4F6] rounded-xl p-3">
              <Paragraph className='text-xs font-semibold text-gray-600'>Student Price</Paragraph>
              <p className="text-sm font-bold text-gray-700">₹{studentPrice.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-1 bg-[#E6FBF7] rounded-xl p-3">
              <Paragraph className='text-xs font-semibold text-[#00A98F]'>Student Saved</Paragraph>
              <p className="text-sm font-bold text-[#00A98F]">₹{saved.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Preview CTA */}
        <Button type="submit" variant="primary" fullWidth>
          Preview <ArrowRight size={18} />
        </Button>
      </div>
    </form>
  )
}

export default Step3Pricing
