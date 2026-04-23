import { Clock, ShieldCheck, CheckCircle } from 'lucide-react'
import { VideoCamera, FileText, Image as ImageIcon, PencilSimpleLine } from '@phosphor-icons/react'
import { Button, Heading, Paragraph, Subheading } from '@/components/ui'
import type { CourseFormData } from './index'
import img from '@/assets/images/cou1.png'
import { MdVideoLibrary } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
import { HiDocumentDuplicate } from "react-icons/hi";
import { FaRegImage } from "react-icons/fa6";
import { MdRocketLaunch } from "react-icons/md";

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

const DEMO = {
  name: 'Cost Accountiong',
  category: 'CMA',
  description:
    'Learn the fundamentals of cost accounting, including cost concepts, cost classification, budgeting, and cost control techniques. This course helps students understand how to analyze and manage costs effectively for decision-making.',
  videoLessons: 24,
  documents: 8,
  images: 12,
  tests: 2,
  price: 2150,
  duration: '6_month',
  videoDuration: '18 Hours 45 Minutes',
}

const Step4Review = ({ form, onPublish, onDraft }: Props) => {
  const videoLessons = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'video')).length || DEMO.videoLessons
  const documents = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'document')).length || DEMO.documents
  const images = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'image')).length || DEMO.images
  const tests = form.modules.flatMap((m) => m.lessons.filter((l) => l.type === 'test')).length || DEMO.tests
  const totalAssets = videoLessons + documents + images + tests

  const price = parseFloat(form.price) || DEMO.price
  const discount = parseFloat(form.discount) || 0
  const studentPrice = form.discountType === 'percentage'
    ? Math.max(0, price - (price * discount) / 100)
    : Math.max(0, price - discount)

  const courseName = form.name || DEMO.name
  const courseCategory = form.category || DEMO.category
  const courseDesc = form.description || DEMO.description
  const courseDuration = form.duration ? durationLabel[form.duration] : durationLabel[DEMO.duration]

  const features = (form.offlineDownload || form.pdfPermissions || form.enableCoupons)
    ? [
      form.offlineDownload && { label: 'Offline Download Permission', sub: '' },
      form.pdfPermissions && { label: 'PDF Permission', sub: 'Private peer-to-peer discussions' },
      form.enableCoupons && { label: 'Coupon Codes', sub: '' },
    ].filter(Boolean) as { label: string; sub: string }[]
    : [
      { label: 'Offline Download Permission', sub: '' },
      { label: 'PDF Permission', sub: 'Private peer-to-peer discussions' },
    ]

  return (
    <div className="flex flex-col gap-5">

      {/* ── Row 1: Hero + Content Inventory ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Hero — no card, plain white */}
        <div className="col-span-7 flex gap-4 bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
          <img
            src={form.coverImage ? URL.createObjectURL(form.coverImage) : img}
            alt="Cover"
            className="w-42 h-42 object-cover rounded-xl shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          />
          <div className="flex flex-col gap-1.5 flex-1 pt-1">
            <div className="flex items-center justify-between">
              <span
                className="inline-block px-2 py-1 rounded text-xs bg-[#A8EDFF] font-bold text-[#000B60]"
              // style={{ background: 'linear-gradient(to right, #000B60, #142283)' }}
              >
                {courseCategory.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">{videoLessons} Hours</span>
            </div>
            <Heading className="font-bold text-[#000B60]"> {courseName} </Heading>
            <Paragraph className="text-gray-500 leading-relaxed line-clamp-4"> {courseDesc} </Paragraph>
          </div>
        </div>

        {/* Content Inventory — gray card */}
        <div className="col-span-5 bg-[#F2F4F6] rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-gray-100">
          <Paragraph className="font-bold uppercase tracking-widest text-black"> Content Inventory </Paragraph>
          {[
            { icon: <MdVideoLibrary size={20} />, label: 'Video Lessons', count: videoLessons, blue: false },
            { icon: <HiDocumentDuplicate size={20} />, label: 'PDF Resources', count: documents, blue: false },
            { icon: <FaRegImage size={20} />, label: 'Images', count: images, blue: true },
            { icon: <BsPencilSquare size={20} />, label: 'Test', count: tests, blue: false },
          ].map(({ icon, label, count, blue }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Paragraph className="text-[#000B60]"> {icon} </Paragraph>
                <Paragraph> {label} </Paragraph>
              </div>
              <Paragraph className={`font-bold ${blue ? 'text-[#4F6EF7]' : 'text-[#000B60]'}`}>
                {String(count).padStart(2, '0')}
              </Paragraph>
            </div>
          ))}
          <div className="border-t border-gray-300 pt-2 flex justify-between text-sm">
            <span className="font-semibold text-gray-700">Total Contents</span>
            <span className="font-bold text-[#000B60]">{totalAssets} Assets</span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Pricing & Access + Enabled Features ── */}
      <div className="grid grid-cols-12 gap-4 items-start">

        {/* Pricing & Access — no card */}
        <div className="col-span-6 bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm border border-gray-100">
          <Paragraph className="font-bold uppercase tracking-widest text-black"> Pricing &amp; Access </Paragraph>
          <div className="flex items-baseline gap-1.5">
            <Heading className="text-[#000B60] font-bold"> ₹{studentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} </Heading>
            <Paragraph className="text-xs text-gray-400">/ per enrollment</Paragraph>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-[#F2F4F6] rounded-xl px-4 py-3">
              <Clock size={16} className="text-[#000B60] shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Video Duration</p>
                <p className="text-sm font-bold text-[#000B60]">{DEMO.videoDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#F2F4F6] rounded-xl px-4 py-3">
              <ShieldCheck size={16} className="text-[#000B60] shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Duration</p>
                <p className="text-sm font-bold text-[#000B60]">{courseDuration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enabled Features — no card */}
        <div className="col-span-6 bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm border border-gray-100 self-center">
          <Paragraph className="font-bold uppercase tracking-widest text-black"> Enabled Features </Paragraph>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                <CheckCircle size={20} className="text-[#000B60] font-bold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{f.label}</p>
                  {f.sub && <p className="text-xs text-gray-400 mt-0.5">{f.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
        <Button variant="white" onClick={onDraft}>Save as draft</Button>
        <Button variant="primary" onClick={onPublish}>Publish Course <MdRocketLaunch size={25} /></Button>
      </div>
    </div>
  )
}

export default Step4Review
