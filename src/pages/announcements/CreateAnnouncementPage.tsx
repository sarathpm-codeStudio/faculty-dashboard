import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ImageIcon, Send } from 'lucide-react'
import { RocketLaunch } from '@phosphor-icons/react'
import { Button, Heading, Input, Paragraph, Select, Textarea } from '@/components/ui'

const CreateAnnouncementPage = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [audience, setAudience] = useState('')
  const [startDate, setStartDate] = useState('Oct 12, 2024')
  const [endDate, setEndDate] = useState('Oct 19, 2024')
  const [message, setMessage] = useState('')
  const [banner, setBanner] = useState<File | null>(null)

  const handleBannerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setBanner(file)
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setBanner(file)
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#767683] font-medium hover:text-[#000B60] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Announcements
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
        <div>
          <Heading className="text-[#000B60]">Create Campaign</Heading>
          <Paragraph className="text-[#767683] mt-1">
            Design and distribute high-impact academic updates.
          </Paragraph>
        </div>
        <Button variant="white" className="!h-10 !text-sm !px-5 md:shrink-0">
          Save Draft
        </Button>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Form */}
        <div className="lg:col-span-8 order-2 lg:order-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col gap-5">

          <Input
            label="Announcement Name"
            placeholder="e.g., Mid-Term Symposium Update 2024"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Select
            label="Audience Selection"
            placeholder="Select audience..."
            value={audience}
            onChange={e => setAudience(e.target.value)}
            options={[
              { value: 'all', label: 'All Registered Students' },
              { value: 'advanced-quantum', label: 'Advanced Quantum Mecha...' },
              { value: 'master-economics', label: 'Master of Economics' },
              { value: 'tax-402', label: 'Advanced International Taxation (TAX-402)' },
            ]}
          />

          {/* Time Period */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Time Period</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 bg-[#F2F4F6]">
              <CalendarDays size={16} className="text-[#767683] shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-transparent outline-none text-sm text-[#191c1e] font-medium w-28"
                  placeholder="Start date"
                />
                <span className="text-[#767683]">–</span>
                <input
                  type="text"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-transparent outline-none text-sm text-[#191c1e] font-medium w-28"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          <Textarea
            label="Announcement Message"
            placeholder="Compose your detailed announcement here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
          />
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-4">

          {/* Ready to Send */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'linear-gradient(to right, #000B60, #142283)' }}
          >
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <RocketLaunch size={18} weight="bold" />
              Ready to Send?
            </div>
            <Button
              variant="white"
              fullWidth
              className="!h-10 !text-sm flex items-center justify-center gap-2"
            >
              Publish Now
              <Send size={14} />
            </Button>
          </div>

          {/* Banner Image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={15} className="text-[#000B60]" />
              <p className="text-sm font-bold text-[#000B60] uppercase tracking-wider">Banner Image</p>
            </div>

            <label
              className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 bg-[#F2F4F6] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#000B60] transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={handleBannerDrop}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
              {banner ? (
                <p className="text-xs text-[#000B60] font-semibold px-3 text-center truncate w-full text-center">
                  {banner.name}
                </p>
              ) : (
                <>
                  <ImageIcon size={24} className="text-gray-300" />
                  <p className="text-xs text-[#767683] font-semibold">Drop files here</p>
                </>
              )}
            </label>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreateAnnouncementPage
