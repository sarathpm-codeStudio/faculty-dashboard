import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { Input, Select, Button, Subheading, Paragraph } from '@/components/ui'
import type { CourseFormData } from './index'
import { RiCoupon2Fill } from "react-icons/ri";

interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  onNext: () => void
}

const durationOptions = [
  { value: '1_month', label: '1 Month' },
  { value: '3_month', label: '3 Months' },
  { value: '6_month', label: '6 Months' },
  { value: '1_year', label: '1 Year' },
  { value: 'lifetime', label: 'Lifetime' },
]

const discountTypeOptions = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'flat', label: 'Flat Amount' },
]

const Step3Pricing = ({ form, update, onNext }: Props) => {
  const price = parseFloat(form.price) || 0
  const discount = parseFloat(form.discount) || 0

  const studentPrice = useMemo(() => {
    if (form.discountType === 'percentage') {
      return Math.max(0, price - (price * discount) / 100)
    }
    return Math.max(0, price - discount)
  }, [price, discount, form.discountType])

  const saved = price - studentPrice

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* ── Left column (8 cols) ─────────────────────────── */}
      <div className="col-span-8 flex flex-col gap-4">

        {/* White form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <Select
            label="Course Duration"
            placeholder="Select duration"
            options={durationOptions}
            value={form.duration}
          // onChange={(e) => update({ duration: e.target.value })}
          />

          <Input
            label="Course Price"
            type="number"
            min={0}
            placeholder="0"
            value={form.price}
            // onChange={(e) => update({ price: e.target.value })}
            leftIcon={<span className="font-semibold text-gray-500">₹</span>}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              options={discountTypeOptions}
              value={form.discountType}
            // onChange={(e) => update({ discountType: e.target.value })}
            />
            <Input
              label="Discount"
              type="number"
              min={0}
              max={form.discountType === 'percentage' ? 100 : undefined}
              placeholder="0"
              value={form.discount}
            // onChange={(e) => update({ discount: e.target.value })}
            />
          </div>

        </div>

        {/* Promotional Tools — separate section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base"><RiCoupon2Fill size={25} className='text-[#000B60] font-bold' /></span>
              <Subheading className='text-[#000B60] font-bold' >Promotional Tools</Subheading>
            </div>
            <Paragraph className='text-gray-400 mt-0.5 ml-8'>
              Allow students to apply additional discount codes at checkout
            </Paragraph>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <button
              type="button"
              // onClick={() => update({ enableCoupons: !form.enableCoupons })}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.enableCoupons ? 'bg-[#000B60]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.enableCoupons ? 'left-5' : 'left-0.5'}`} />
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
          style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Students Price</p>
          <p className="text-4xl font-bold tracking-tight">₹{studentPrice.toFixed(2)}</p>
          <p className="text-xs opacity-60 mt-2 leading-relaxed">
            Calculated based on a {discount}{form.discountType === 'percentage' ? '%' : '₹'} discount applied to the ₹{price.toFixed(2)}.
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
              {discount}{form.discountType === 'percentage' ? '%' : '₹'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
            <Paragraph className='text-xs font-semibold text-gray-600'>Students Price</Paragraph>
            <span className="font-bold text-[#000B60]">₹{studentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount Calculator */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
          <Subheading className='text-[#000B60] font-bold'>Discount Calculator</Subheading>
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
        <Button variant="primary" fullWidth onClick={onNext}>
          Preview <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  )
}

export default Step3Pricing
