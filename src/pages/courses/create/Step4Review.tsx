import { VideoCamera, FileText, Image as ImageIcon, PencilSimpleLine, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui'
import type { CourseFormData } from './index'

interface Props {
  form: CourseFormData
  onPublish: () => void
  onDraft: () => void
}

const durationLabel: Record<string, string> = {
  '1_month': '1 Month',
  '3_month': '3 Months',
  '6_month': '6 Months',
  '1_year': '1 Year',
  lifetime: 'Lifetime',
}

const Step4Review = ({ form, onPublish, onDraft }: Props) => {
  const videoLessons = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'video')).length
  const documents = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'document')).length
  const images = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'image')).length
  const tests = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'test')).length
  const totalAssets = videoLessons + documents + images + tests

  const price = parseFloat(form.price) || 0
  const discount = parseFloat(form.discount) || 0
  const studentPrice =
    form.discountType === 'percentage'
      ? Math.max(0, price - (price * discount) / 100)
      : Math.max(0, price - discount)

  const features = [
    form.offlineDownload && 'Offline Download Permission',
    form.pdfPermissions && 'PDF Permission',
    form.enableCoupons && 'Coupon Codes',
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Step 04/04</p>
          <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            Ready to Publish
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Hero Card: Course Name & Visual */}
        <div className="col-span-7 bg-[#F2F4F6] rounded-2xl p-5 flex gap-4">
          {form.coverImage ? (
            <img
              src={URL.createObjectURL(form.coverImage)}
              alt="Cover"
              className="w-32 h-24 object-cover rounded-xl shrink-0"
            />
          ) : (
            <div className="w-32 h-24 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center text-gray-400">
              <ImageIcon size={28} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            {form.category && (
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white w-fit"
                style={{ background: 'linear-gradient(to right, #000B60, #142283)' }}
              >
                {form.category.toUpperCase()}
              </span>
            )}
            <h2 className="text-lg font-bold text-[#000B60] mt-1">
              {form.name || 'Untitled Course'}
            </h2>
            <p className="text-xs text-gray-500 line-clamp-2">{form.description}</p>
            {form.duration && (
              <p className="text-xs text-gray-400 mt-1">{durationLabel[form.duration] || form.duration}</p>
            )}
          </div>
        </div>

        {/* Content Inventory */}
        <div className="col-span-5 bg-[#F2F4F6] rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-[#000B60]">Content Inventory</h3>
          {[
            { icon: <VideoCamera size={16} />, label: 'Video Lessons', count: videoLessons },
            { icon: <FileText size={16} />, label: 'PDF Resources', count: documents },
            { icon: <ImageIcon size={16} />, label: 'Images', count: images },
            { icon: <PencilSimpleLine size={16} />, label: 'Tests', count: tests },
          ].map(({ icon, label, count }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-[#000B60]">{icon}</span>
                {label}
              </div>
              <span className="font-bold text-[#000B60]">{String(count).padStart(2, '0')}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
            <span className="font-bold text-gray-700">Total Contents</span>
            <span className="font-bold text-[#000B60]">{totalAssets} Assets</span>
          </div>
        </div>

        {/* Pricing & Access */}
        <div className="col-span-6 bg-[#F2F4F6] rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-[#000B60]">Pricing & Access</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#000B60]">₹{studentPrice.toFixed(2)}</span>
            <span className="text-xs text-gray-400">/ per enrollment</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Video Duration</p>
              <p className="font-bold text-[#000B60] mt-1">
                {videoLessons > 0 ? `${videoLessons * 10} mins` : '—'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Duration</p>
              <p className="font-bold text-[#000B60] mt-1">
                {form.duration ? durationLabel[form.duration] : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Enabled Features */}
        <div className="col-span-6 bg-[#F2F4F6] rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-[#000B60]">Enabled Features</h3>
          {features.length === 0 ? (
            <p className="text-sm text-gray-400">No features enabled</p>
          ) : (
            <div className="flex flex-col gap-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
                  <CheckCircle size={16} weight="fill" className="text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <Button variant="white" onClick={onDraft}>
          Save as draft
        </Button>
        <Button variant="primary" onClick={onPublish}>
          Publish Course
        </Button>
      </div>
    </div>
  )
}

export default Step4Review
