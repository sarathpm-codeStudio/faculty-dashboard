import { useMemo } from 'react'
import { Input, Select, Button } from '@/components/ui'
import type { CourseFormData } from './index'

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

  const toggle = (field: 'enableCoupons') =>
    update({ [field]: !form[field] })

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Configuration Form (7 cols) */}
      <div className="col-span-7 flex flex-col gap-6">
        {/* Section 1: Pricing */}
        <div className="flex flex-col gap-4">
          <Select
            label="Course Duration"
            placeholder="Select duration"
            options={durationOptions}
            value={form.duration}
            onChange={(e) => update({ duration: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Course Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-base">₹</span>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
                className="w-full pl-8 pr-4 py-4 bg-[#F2F4F6] border border-gray-100 rounded-lg text-base font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Discount</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={form.discountType === 'percentage' ? 100 : undefined}
                  placeholder="0"
                  value={form.discount}
                  onChange={(e) => update({ discount: e.target.value })}
                  className="w-full px-4 py-4 bg-[#F2F4F6] border border-gray-100 rounded-lg text-base font-medium outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {form.discountType === 'percentage' ? '%' : '₹'}
                </span>
              </div>
            </div>
            <Select
              label="Discount Type"
              options={discountTypeOptions}
              value={form.discountType}
              onChange={(e) => update({ discountType: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Promotional Tools */}
        <div className="flex flex-col gap-3 p-4 bg-[#F2F4F6] rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#000B60]">Promotional Tools</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Allow students to apply additional discount codes at checkout
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enable Coupons</span>
            <button
              type="button"
              onClick={() => toggle('enableCoupons')}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.enableCoupons ? 'bg-[#000B60]' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.enableCoupons ? 'left-5' : 'left-0.5'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Summary + Discount Calculator (5 cols) */}
      <div className="col-span-5 flex flex-col gap-4">
        {/* Student Price Card */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
        >
          <p className="text-xs font-medium opacity-70 mb-1">Students Price</p>
          <p className="text-4xl font-bold">₹{studentPrice.toFixed(2)}</p>
          {discount > 0 && (
            <p className="text-xs opacity-70 mt-2">
              Calculated based on a {discount}
              {form.discountType === 'percentage' ? '%' : '₹'} discount applied to the ₹{price.toFixed(2)}.
            </p>
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-[#F2F4F6] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Course Price</span>
            <span className="font-semibold text-gray-700">₹{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount</span>
            <span className="font-semibold text-gray-700">
              {discount}{form.discountType === 'percentage' ? '%' : '₹'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
            <span className="font-bold text-[#000B60]">Students Price</span>
            <span className="font-bold text-[#000B60]">₹{studentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Discount Calculator */}
        <div className="bg-[#F2F4F6] rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-[#000B60]">Discount Calculator</h3>
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="text-gray-500">Sum of Courses</span>
            <span className="font-semibold text-gray-700">₹{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="text-gray-500">Student Price</span>
            <span className="font-semibold text-gray-700">₹{studentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 bg-white rounded-lg px-3">
            <span className="text-[#000B60] font-bold">Student Saved</span>
            <span className="font-bold text-green-600">₹{saved.toFixed(2)}</span>
          </div>
        </div>

        {/* CTA */}
        <Button variant="primary" fullWidth onClick={onNext}>
          Preview
        </Button>
      </div>
    </div>
  )
}

export default Step3Pricing
