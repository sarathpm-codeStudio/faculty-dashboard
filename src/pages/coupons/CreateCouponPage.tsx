import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Clock, Plus, X, Eye } from 'lucide-react'
import { Button, Heading, Input, Paragraph } from '@/components/ui'

type DiscountType = 'Percentage' | 'Flat Amount'

const LABEL_CLS = 'text-xs font-bold uppercase tracking-wider text-[#767683]'

const COURSE_OPTIONS = [
  'Cost Accounting',
  'Business Laws',
  'Taxation',
  'Advanced Algorithms',
  'Data Structures',
  'Financial Management',
  'Macroeconomics',
  'Literature 101',
]

const CreateCouponPage = () => {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('Percentage')
  const [discountValue, setDiscountValue] = useState('25%')
  const [expiryDate, setExpiryDate] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['Cost Accounting', 'Business Laws'])
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)

  const removeCourse = (course: string) =>
    setSelectedCourses(prev => prev.filter(c => c !== course))

  const addCourse = (course: string) => {
    if (!selectedCourses.includes(course)) setSelectedCourses(prev => [...prev, course])
    setShowCourseDropdown(false)
  }

  const previewCode = code || 'FALL2024'
  const rawValue = discountValue.replace('%', '').replace('₹', '').trim() || '25'
  const displayValue = discountType === 'Percentage' ? `${rawValue}% OFF` : `₹${rawValue} OFF`

  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Dec 31, 2024'

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
            labelClassName={LABEL_CLS}
            placeholder="E.G. FALL2024"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
          />

          {/* Discount Type */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLS}>Discount Type</label>
            <div className="flex items-center bg-[#F2F4F6] rounded-xl p-1 w-fit">
              {(['Percentage', 'Flat Amount'] as DiscountType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setDiscountType(type)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${discountType === type
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
              label={discountType === 'Percentage' ? 'Discount Value (%)' : 'Discount Value (₹)'}
              labelClassName={LABEL_CLS}
              placeholder={discountType === 'Percentage' ? '25%' : '₹50'}
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className={LABEL_CLS}>Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-4 py-4 rounded-lg border border-gray-100 bg-[#F2F4F6] text-sm text-[#191c1e] outline-none"
              />
            </div>
          </div>

          {/* Applicable Courses */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLS}>Applicable Courses</label>
            <div className="relative min-h-[52px] px-3 py-2.5 rounded-lg border border-gray-100 bg-[#F2F4F6] flex flex-wrap items-center gap-2">
              {selectedCourses.map(course => (
                <span
                  key={course}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#EAECFF] rounded-full text-xs font-semibold text-[#000B60]"
                >
                  {course}
                  <button onClick={() => removeCourse(course)} className="text-[#000B60]/60 hover:text-red-500 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setShowCourseDropdown(prev => !prev)}
                className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#000B60] text-[#000B60] hover:bg-[#000B60] hover:text-white transition-colors"
              >
                <Plus size={13} />
              </button>

              {showCourseDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-56 max-h-48 overflow-y-auto">
                  {COURSE_OPTIONS.filter(c => !selectedCourses.includes(c)).map(course => (
                    <button
                      key={course}
                      onClick={() => addCourse(course)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#191c1e] hover:bg-[#F2F4F6] transition-colors"
                    >
                      {course}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-[#767683]">Select courses where this coupon can be redeemed.</p>
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
            <Button variant="white" className="!text-[#191c1e] !text-[14px]" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button variant="primary" className="!h-10 !text-sm !px-6">
              Create Coupon
            </Button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default CreateCouponPage
