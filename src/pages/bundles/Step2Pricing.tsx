import { useState, useMemo, useRef } from 'react'
import { ImagePlus, ArrowRight } from 'lucide-react'
import { RiCoupon2Fill } from 'react-icons/ri'
import { Input, Textarea, Subheading, Paragraph } from '@/components/ui'
import Button from '@/components/ui/Button'

interface Props {
  sumOfCourses: number
  onPublish: () => void
}

const Step2Pricing = ({ sumOfCourses, onPublish }: Props) => {
  const [bundleName, setBundleName] = useState('')
  const [description, setDescription] = useState('')
  const [discount, setDiscount] = useState('15')
  const [enableCoupons, setEnableCoupons] = useState(true)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const discountPct = parseFloat(discount) || 0
  const bundleOffer = useMemo(() => Math.max(0, sumOfCourses - (sumOfCourses * discountPct) / 100), [sumOfCourses, discountPct])
  const studentSavings = sumOfCourses - bundleOffer

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-full min-h-0">
      {/* ── Left ── */}
      <div className="col-span-8 flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <Input
            label="BUNDLE NAME"
            labelClassName="uppercase tracking-wider text-xs text-gray-500"
            placeholder="Taxation & Laws Combo"
            value={bundleName}
            onChange={e => setBundleName(e.target.value)}
          />

          <Textarea
            label="BUNDLE DESCRIPTION"
            placeholder="Describe what students will learn from this bundle..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SUM OF COURSE PRICE"
              labelClassName="uppercase tracking-wider text-xs text-gray-500"
              value={`₹${sumOfCourses.toLocaleString()}.00`}
              readOnly
              className="cursor-default"
            />
            <div className="relative">
              <Input
                label="DISCOUNT (%)"
                labelClassName="uppercase tracking-wider text-xs text-gray-500"
                type="number"
                min={0}
                max={100}
                placeholder="15"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 bottom-4 text-gray-400 font-bold text-sm pointer-events-none">%</span>
            </div>
          </div>

          {/* Enable Coupons toggle */}
          <div className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <RiCoupon2Fill size={22} className="text-[#000B60]" />
              <div>
                <Subheading className="text-[#000B60] font-bold !text-sm">Enable Coupons</Subheading>
                <Paragraph className="text-gray-400 !text-xs">Allow students to apply additional discount codes at checkout</Paragraph>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableCoupons(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${enableCoupons ? 'bg-[#000B60]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableCoupons ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Discount Calculator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Subheading className="text-[#000b60] font-bold">Discount Calculator</Subheading>
            <span className="text-[10px] font-bold text-[#00A98F] bg-[#E6FBF7] px-2.5 py-1 rounded-full uppercase tracking-wide">
              Smart Pricing Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F2F4F6] rounded-xl p-4">
              <Paragraph className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sum of Courses</Paragraph>
              <p className="text-sm font-bold text-[#191c1e]">₹{sumOfCourses.toLocaleString()}.00</p>
            </div>
            <div className="bg-[#F2F4F6] rounded-xl p-4">
              <Paragraph className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Bundle Price</Paragraph>
              <p className="text-sm font-bold text-[#191c1e]">₹{bundleOffer.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#E6FBF7] rounded-xl p-4">
              <Paragraph className="text-[10px] font-semibold text-[#00A98F] uppercase tracking-wide mb-1">Student Savings</Paragraph>
              <p className="text-sm font-bold text-[#00A98F]">₹{studentSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="col-span-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide min-h-0">
        {/* Cover Image */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#000B60] hover:bg-[#f5f6ff] transition-colors min-h-[300px]"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#F2F4F6] flex items-center justify-center">
                <ImagePlus size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-[#191c1e]">Cover Image</p>
              <p className="text-xs text-gray-400 text-center">Click to upload or drag and drop</p>
              <p className="text-[10px] text-gray-300">High resolution JPEG or PNG (16:9)</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Bundle Offer Price */}
        <div className='bg-gray-100 p-10 rounded-xl' >

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <Paragraph className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bundle Offer</Paragraph>
            <p className="text-3xl font-bold text-[#000B60]">
              ₹{bundleOffer.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>


        <Button variant="primary" fullWidth onClick={onPublish}>
          Publish Bundle
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

export default Step2Pricing
