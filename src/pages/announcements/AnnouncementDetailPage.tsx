import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Archive, Send, Info, Eye, Pencil, Trash2 } from 'lucide-react'
import { RocketLaunch } from '@phosphor-icons/react'
import { Button, Heading, Paragraph, Subheading, Skeleton } from '@/components/ui'
import { useParams } from 'react-router-dom'
import { useGetAnnouncementById, useDeleteAnnouncement } from '@/hooks/announcement'
import { calculateDays, formatDateTime } from '@/utils/helper/formatDate'
import { toast } from 'sonner'


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const AnnouncementDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: announcement, isLoading } = useGetAnnouncementById(id, true)

  // mutation
  const { mutateAsync: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement()


  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
        <Skeleton className="h-4 w-56 mb-5" />
        <div className="space-y-3 mb-6">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  const handleDeleteAnnouncement = async () => {

    const toastId = toast.loading("Deleting announcement...")

    try {

      await deleteAnnouncement(id)


      toast.success("Announcement deleted successfully", { id: toastId })
      navigate('/announcements')

    } catch {
      // Error toast handled globally; just clear the loading spinner.
      toast.dismiss(toastId)
    }
  }



  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">

      {/* Breadcrumb */}
      <motion.button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#767683] font-medium hover:text-[#2c1452] mb-5 transition-colors"
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
          <Heading className="text-[#2c1452]">{announcement?.data?.title}</Heading>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Info size={16} className="text-[#00A6BF]" />
            <Paragraph className="text-[#767683]">
              Published on {formatDateTime(announcement?.data?.published)} &bull; Active for {calculateDays(announcement?.data?.published)} days
            </Paragraph>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* <Button variant="white" className="!h-10 !text-sm !px-5 flex items-center gap-2">
            <Archive size={15} />
            Archive
          </Button> */}
          <Button variant="primary" className="!h-10 !text-sm !px-5 flex items-center gap-2">
            <Send size={15} />
            Resend Now
          </Button>
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Announcement card */}
        <motion.div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5" {...fadeUp(0.1)}>

          {/* Tag + visibility */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black bg-[#A8EDFF] rounded-full px-3 py-1">
              Promotional
            </span>
            <Paragraph className="flex items-center gap-1.5 text-[#767683] font-medium">
              <Eye size={13} />
              Visible to: {announcement?.data?.course_id ? "Selected Course" : "All Students"}
            </Paragraph>
          </div>

          {/* Message body */}
          <div>
            <Subheading className="text-[#2c1452] font-bold mb-3">
              Announcement Message
            </Subheading>
            {/* <div className="flex flex-col gap-3 leading-relaxed">
              <Paragraph>Greetings Students,</Paragraph>
              <Paragraph>
                We are pleased to announce an exclusive early-bird registration discount for the upcoming{' '}
                <span className="font-bold text-[#191c1e]">Advanced International Taxation (TAX-402)</span>{' '}
                semester course. This comprehensive program covers emerging global tax policies and digital economy compliance.
              </Paragraph>
              <Paragraph>
                Use the code below to receive 20% off your enrollment fee. This offer is valid until the end of the current academic period.
              </Paragraph>
            </div> */}
            <div
              className="prose prose-sm max-w-none text-gray-800 prose-a:text-[#2c1452] prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: announcement?.data?.content }}
            />
          </div>

          {/* Meta info box */}
          <div className="bg-[#F2F4F6] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Course Name</p>
              <Paragraph className="font-bold text-[#2c1452]">{announcement?.data?.courses?.title || ""}</Paragraph>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Date</p>
              <Paragraph className="font-bold text-[#2c1452]">{formatDateTime(announcement?.data?.published) || ""}</Paragraph>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Time Period</p>
              <Paragraph className="font-bold text-[#2c1452]">{formatDateTime(announcement?.data?.time_period.split("/")[0])} to {formatDateTime(announcement?.data?.time_period.split("/")[1])}</Paragraph>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#767683] mb-1">Audience</p>
              <Paragraph className="font-bold text-[#2c1452]">{announcement?.data?.courses ? "Selected Course" : "All Students"}</Paragraph>
            </div>
          </div>

          {/* Edit / Delete */}
          <div className="flex items-center gap-5 pt-1">
            <button onClick={() => navigate(`/announcements/${announcement?.data?.id}/edit`)} className="flex items-center gap-1.5 text-sm font-bold text-[#2c1452] hover:underline transition-colors">
              <Pencil size={14} />
              Edit
            </button>
            <button onClick={handleDeleteAnnouncement} className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:underline transition-colors">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </motion.div>

        {/* Right: Views stat */}
        <motion.div className="lg:col-span-4 flex flex-col gap-4" {...fadeUp(0.15)}>
          <div
            className="rounded-2xl p-5 flex flex-col gap-1"
            style={{ background: 'linear-gradient(to right, #2c1452, #2c1452)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Views</p>
            <p className="text-5xl font-extrabold text-white">{announcement?.data?.view_count}</p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default AnnouncementDetailPage
