import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Loader2, Send } from 'lucide-react'
import { RocketLaunch } from '@phosphor-icons/react'
import { Button, Heading, Input, Paragraph, Select, Textarea } from '@/components/ui'
import { useFormik } from 'formik'
import { announcementSchema } from '@/utils/validator/announcement.validator'
import { toast } from 'sonner'
import { useGetAllCourses } from '@/hooks/index'
import { useCreateAnnouncement, useGetAnnouncementById, useUpdateAnnouncement } from '@/hooks/announcement'
import { getTodayDate, parseTimePeriod } from '@/utils/timePeriod'



const CreateAnnouncementPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  // Block past dates in the pickers — only today or future days are selectable.
  const today = getTodayDate()


  const [isDraft, setIsDraft] = useState(false)
  const [audience, setAudience] = useState<{ value: string, label: string }[]>([{ value: 'all', label: 'All Registered Students' }])

  // query to get all courses
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses(false, "", true)
  const { data: announcement, isLoading: announcementLoading } = useGetAnnouncementById(id, !!id)

  // mutation
  const { mutateAsync: createAnnouncement, isPending: createAnnouncementLoading } = useCreateAnnouncement()
  const { mutateAsync: updateAnnouncement, isPending: updateAnnouncementLoading } = useUpdateAnnouncement()

  const loading = createAnnouncementLoading || updateAnnouncementLoading

  useEffect(() => {
    if (courses) {
      const data = courses?.map((course: any) => ({
        value: course.id,
        label: course.title,
      }))
      setAudience([
        { value: 'all', label: 'All Registered Students' },
        ...data
      ])
    }
  }, [courses])

  useEffect(() => {
    if (announcement) {
      const period = parseTimePeriod(announcement?.time_period)
      formik.setValues({
        title: announcement?.title,
        audience: announcement?.course_id || "all",
        startDate: period?.start || '',
        endDate: period?.end || '',
        content: announcement?.content,
      })
    }
  }, [announcement])


  const formik = useFormik({
    initialValues: {
      title: '',
      audience: '',
      startDate: '',
      endDate: '',
      content: '',
    },
    validationSchema: announcementSchema,
    onSubmit: async (values) => {

      try {

        const payload = {
          title: values.title,
          audience: values.audience,
          timePeriod: JSON.stringify({ start_date: values.startDate, end_date: values.endDate }),
          content: values.content,
          isDraft: isDraft,
        }
        console.log(" announcement payload", payload)

        if (id) {

          try {

            await updateAnnouncement({ id, payload })

            if (isDraft) {
              toast.success("Announcement saved as draft successfully")
            } else {
              toast.success("Announcement updated successfully")
            }
            formik.resetForm()
            navigate('/announcements')
          } catch {
            // Error toast handled globally by the query client.
          }

        } else {

          try {

            await createAnnouncement(payload)

            if (isDraft) {
              toast.success("Announcement saved as draft successfully")
            } else {
              toast.success("Announcement published successfully")
            }
            formik.resetForm()
            navigate('/announcements')
          } catch {
            // Error toast handled globally by the query client.
          }

        }


      } catch (error: any) {
        // Error toast handled globally by the query client.
        console.error(error)
      }

    },
  })





  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#767683] font-medium hover:text-[#2c1452] mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Announcements
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Heading className="text-[#2c1452]">Create Campaign</Heading>
          <Paragraph className="text-[#767683] mt-1">
            Design and distribute high-impact academic updates.
          </Paragraph>
        </div>
        {
          id ? announcement?.data?.is_draft ? (
            <Button variant="white" disabled={loading && isDraft} type='button' onClick={() => { formik.handleSubmit(); setIsDraft(true) }} className="!h-10 !text-sm !px-5 shrink-0">
              Save Draft
              {
                loading && isDraft && (
                  <Loader2 size={14} className="animate-spin" />
                )
              }
            </Button>
          )
            : <></>

            :
            <Button variant="white" disabled={loading && isDraft} type='button' onClick={() => { formik.handleSubmit(); setIsDraft(true) }} className="!h-10 !text-sm !px-5 shrink-0">
              Save Draft
              {
                loading && isDraft && (
                  <Loader2 size={14} className="animate-spin" />
                )
              }
            </Button>

        }
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: Form */}
        <div className="col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <Input
            label="Announcement Name"
            placeholder="e.g., Mid-Term Symposium Update 2024"
            name='title'
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title ? formik.errors.title : undefined}
          />

          <Select
            label="Audience Selection"
            placeholder="Select audience..."
            name='audience'
            value={formik.values.audience}
            onChange={(e: any) => formik.setFieldValue('audience', e.target.value)}
            onBlur={formik.handleBlur}
            error={formik.touched.audience ? formik.errors.audience : undefined}
            options={audience}
          />

          {/* Time Period */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Time Period</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 bg-[#F2F4F6]">
              <CalendarDays size={16} className="text-[#767683] shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  name="startDate"
                  value={formik.values.startDate}
                  min={today}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="bg-transparent outline-none text-sm text-[#191c1e] font-medium cursor-pointer"
                />
                <span className="text-[#767683]">–</span>
                <input
                  type="date"
                  name="endDate"
                  value={formik.values.endDate}
                  min={formik.values.startDate || today}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="bg-transparent outline-none text-sm text-[#191c1e] font-medium cursor-pointer"
                />
              </div>
            </div>
            {((formik.touched.startDate && formik.errors.startDate) || (formik.touched.endDate && formik.errors.endDate)) && (
              <p className="text-xs text-red-500 font-medium">
                {(formik.touched.startDate && formik.errors.startDate) || (formik.touched.endDate && formik.errors.endDate)}
              </p>
            )}
          </div>

          <Textarea
            label="Announcement Message"
            placeholder="Compose your detailed announcement here..."
            name="content"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.content ? formik.errors.content : undefined}
            rows={8}
          />

        </div>

        {/* Right sidebar */}
        <div className="col-span-4 flex flex-col gap-4">

          {/* Ready to Send */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'linear-gradient(to right, #2c1452, #2c1452)' }}
          >
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <RocketLaunch size={18} weight="bold" />
              Ready to Send?
            </div>
            <Button
              variant="white"
              fullWidth
              disabled={loading}
              className="!h-10 !text-sm flex items-center justify-center gap-2"
              onClick={() => { formik.handleSubmit() }}
              type='submit'
            >
              {
                loading && !isDraft ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    Publish Now
                    <Send size={14} />
                  </>
                )
              }
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreateAnnouncementPage
