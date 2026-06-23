import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Step1BasicDetails from './Step1BasicDetails'
import Step2AcademicStructure from './Step2AcademicStructure'
import Step3Pricing from './Step3Pricing'
import Step4Review from './Step4Review'
import { Heading } from '@/components/ui'
import { useCreateCourseBasicDetails, useUpdateCourse, useGetCourseById } from "@/hooks/useCourse"
import { toast } from 'sonner'
import { generateUniqueId } from '@/utils/helper/numberGenarator'
import { useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useVideoUploadProgress } from '@/hooks/video'


export type ContentKind = 'video' | 'test' | 'document' | 'image'

export type ContentNode = {
  id: string
  kind: ContentKind
  title: string
  description: string
  videoAccess: boolean
  watchTimeHH: string
  watchTimeMM: string
  watchTimeSS: string
}

export type FolderNode = {
  id: string
  kind: 'folder'
  title: string
  children: TreeNode[]
}

export type TreeNode = FolderNode | ContentNode

export type CourseFormData = {
  // Step 1
  unique_Id: string
  title: string
  description: string
  category: string
  level: string
  languages: string[]
  cover_image: any
  cover_image_url?: string | null
  intro_video_url: any
  intro_video_asset_id?: string | null
  // Step 2
  tree: TreeNode[]
  offlineDownload: boolean
  pdfPermissions: boolean
  // Step 3
  validity: string
  price: string
  discount: string
  discountType: string
  enableCoupons: boolean
  isFree: boolean
}

const STEPS = [
  'Basic Course Details',
  'Academic Structure',
  'Course Pricing',
  'Final Review',
]

const BACK_LABELS = [
  'Back to Courses',
  'Back to Information',
  'Back to Content',
  'Back to Pricing',
]

const emptyForm = (): CourseFormData => ({
  unique_Id: generateUniqueId(),
  title: '',
  description: '',
  category: '',
  level: '',
  languages: [],
  cover_image: null,
  intro_video_url: null,
  tree: [],
  offlineDownload: false,
  pdfPermissions: false,
  validity: '',
  price: '',
  discount: '',
  discountType: '',
  enableCoupons: false,
  isFree: false,
})

const CourseCreatePage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CourseFormData>(emptyForm)
  const [courseId, setCourseId] = useState<string>('')
  const [isCreated, setIsCreated] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [vidPreviewUrl, setVidPreviewUrl] = useState<string | null>(null)


  // get course id from url
  const { id } = useParams()

  const facultyId: any = useAuthStore(state => state.user?.id)
  const { uploads } = useVideoUploadProgress(facultyId)


  useEffect(() => {
    if (id) {
      setCourseId(id)
      setIsEdit(true)
      setIsCreated(true)
    }
  }, [id])

  const next = () => setStep((s) => Math.min(s + 1, 4))
  const back = () => {
    if (step === 1) navigate('/courses')
    else setStep((s) => s - 1)
  }


  // mutation

  const { mutateAsync: createBasicDetails, isPending: isCreating } = useCreateCourseBasicDetails()
  const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdateCourse(courseId)
  const isSubmitting = isCreating || isUpdating

  // single source of truth for course details (used by Step1 + Step3)
  const {
    data: courseDetails,
    isLoading: isLoadingCourseDetails,
    isFetching: isFetchingCourseDetails,
  } = useGetCourseById(courseId, !!courseId)




  const update = async (fields: Partial<CourseFormData>) => {

    try {
      console.log("fields>>>>>", fields)
      setForm((prev) => ({ ...prev, ...fields }))
      // call api for course create 

      if (courseId && isCreated) {

        await updateCourse({
          unique_id: fields?.unique_Id || "",
          title: fields?.title || "",
          description: fields?.description || "",
          category: fields?.category || "",
          level: fields?.level || "",
          languages: fields?.languages || [],
          cover_image: fields?.cover_image_url || "",
          // intro_video_url: fields?.intro_video_url || "",
        })

        if (isDraft) {

          toast.success("Course saved as draft")
          navigate('/courses')
        } else {
          toast.success("Create Academic Structure")
          next()
        }



      } else {

        console.log("fields?.unique_Id", fields?.unique_Id)

        const result: any = await createBasicDetails({
          unique_id: fields?.unique_Id || "",
          title: fields?.title || "",
          description: fields?.description || "",
          category: fields?.category || "",
          level: fields?.level || "",
          languages: fields?.languages || [],
          cover_image: fields?.cover_image_url || "",
          // intro_video_url: fields?.intro_video_url || "",
        })
        console.log("result", result)
        setCourseId(result?.id)
        setIsCreated(true)

        if (isDraft) {
          console.log("isDraft", isDraft)
          toast.success("Course saved as draft")
          navigate('/courses')
        } else {
          console.log("isDraft", isDraft)
          toast.success("Create Academic Structure")
          next()
        }
      }

    } catch (error: any) {

      console.log("error", error)

      toast.error(error.message || "Something went wrong")
    }
  }



  return (
    <div className="flex flex-col h-full max-lg:h-auto max-lg:min-h-full">
      {/* Back link */}
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#2c1452] mb-5 transition-colors"

      >
        <ArrowLeft size={16} />
        {BACK_LABELS[step - 1]}
      </button>

      {/* Step header */}
      <div className="flex items-center justify-between mb-3">
        <Heading className="text-[#2c1452]" > {STEPS[step - 1]}  </Heading>
        {/* <h1 className="text-xl font-bold text-[#2c1452]">{STEPS[step - 1]}</h1> */}

        <div className="flex items-center gap-3">
          {step === 4 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-700">
              Ready to Publish
            </span>
          )}
          <span className="text-sm font-medium text-gray-400">
            <span className="text-[#2c1452] font-bold">Step {String(step).padStart(2, '0')}</span>
            <span className="text-gray-500"> / 04</span>
          </span>
        </div>
      </div>

      {/* Progress rail */}
      <div className="w-full mb-15" style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px' }}>
        <div
          style={{
            height: '6px',
            borderRadius: '999px',
            width: `${(step / 4) * 100}%`,
            background: 'linear-gradient(to right, #2c1452, #2c1452)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Step content */}
      {step === 1 && <Step1BasicDetails form={form} update={update} setIsDraft={setIsDraft} isSubmitting={isSubmitting} isEdit={isEdit} courseId={courseId} vidPreviewUrl={vidPreviewUrl} onVidPreviewChange={setVidPreviewUrl} courseDetails={courseDetails} isLoadingCourseDetails={isLoadingCourseDetails} />}
      {step === 2 && <Step2AcademicStructure form={form} update={update} onNext={next} courseId={courseId} />}
      {step === 3 && <Step3Pricing form={form} onNext={next} courseId={courseId} courseDetails={courseDetails} isLoadingCourseDetails={isLoadingCourseDetails || isFetchingCourseDetails} />}
      {step === 4 && (
        <Step4Review
          form={form}
          // onPublish={() => navigate('/courses')}
          onDraft={() => navigate('/courses')}
          courseId={courseId}

        />
      )}
    </div>
  )
}

export default CourseCreatePage
