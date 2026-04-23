import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Archive, Send, Info, Eye, Pencil, Trash2 } from 'lucide-react'
import { RocketLaunch } from '@phosphor-icons/react'
import { Button, Heading, Paragraph, Subheading, Spinner } from '@/components/ui'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const AnnouncementDetailPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner label="Loading announcement..." />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Breadcrumb */}
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#767683] font-medium hover:text-[#000B60] mb-5 transition-colors"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28 }}
      >
        <ArrowLeft size={14} />
        Announcements &rsaquo; Announcement Details
      </motion.button>

      {/* Page header */}
      <motion.div className="flex items-start justify-between mb-6" {...fadeUp(0.05)}>
        <div>
          <Heading className="text-[#000B60]">Taxation Offer</Heading>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Info size={16} className="text-[#00A6BF]" />
            <Paragraph className="text-[#767683]">
              Published on October 24, 2026 &bull; Active for 14 more days
            </Paragraph>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="white" className="!h-10 !text-sm !px-5 flex items-center gap-2">
            <Archive size={15} />
            Archive
          </Button>
          <Button variant="primary" className="!h-10 !text-sm !px-5 flex items-center gap-2">
            <Send size={15} />
            Resend Now
          </Button>
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: Announcement card */}
        <motion.div className="col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5" {...fadeUp(0.1)}>

          {/* Tag + visibility */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black bg-[#A8EDFF] rounded-full px-3 py-1">
              Promotional
            </span>
            <Paragraph className="flex items-center gap-1.5 text-[#767683] font-medium">
              <Eye size={13} />
              Visible to: All Registered Students
            </Paragraph>
          </div>

          {/* Message body */}
          <div>
            <Subheading className="text-[#000B60] font-bold mb-3">
              Announcement Message
            </Subheading>
            <div className="flex flex-col gap-3 leading-relaxed">
              <Paragraph>Greetings Students,</Paragraph>
              <Paragraph>
                We are pleased to announce an exclusive early-bird registration discount for the upcoming{' '}
                <span className="font-bold text-[#191c1e]">Advanced International Taxation (TAX-402)</span>{' '}
                semester course. This comprehensive program covers emerging global tax policies and digital economy compliance.
              </Paragraph>
              <Paragraph>
                Use the code below to receive 20% off your enrollment fee. This offer is valid until the end of the current academic period.
              </Paragraph>
            </div>
          </div>

          {/* Meta info box */}
          <div className="bg-[#F2F4F6] rounded-xl p-4 grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Course Name</p>
              <Paragraph className="font-bold text-[#000B60]">Advanced International Taxation</Paragraph>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Date</p>
              <Paragraph className="font-bold text-[#000B60]">October 24, 2026</Paragraph>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Time Period</p>
              <Paragraph className="font-bold text-[#000B60]">15 days</Paragraph>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Audience</p>
              <Paragraph className="font-bold text-[#000B60]">Master of Economics</Paragraph>
            </div>
          </div>

          {/* Edit / Delete */}
          <div className="flex items-center gap-5 pt-1">
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#000B60] hover:underline transition-colors">
              <Pencil size={14} />
              Edit
            </button>
            <button className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:underline transition-colors">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </motion.div>

        {/* Right: Views stat */}
        <motion.div className="col-span-4 flex flex-col gap-4" {...fadeUp(0.15)}>
          <div
            className="rounded-2xl p-5 flex flex-col gap-1"
            style={{ background: 'linear-gradient(to right, #000B60, #142283)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Views</p>
            <p className="text-5xl font-extrabold text-white">785</p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default AnnouncementDetailPage
