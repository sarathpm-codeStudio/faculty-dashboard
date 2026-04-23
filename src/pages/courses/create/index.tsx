import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import Step1BasicDetails from './Step1BasicDetails'
import Step2AcademicStructure from './Step2AcademicStructure'
import Step3Pricing from './Step3Pricing'
import Step4Review from './Step4Review'

export type CourseFormData = {
  // Step 1
  name: string
  description: string
  category: string
  level: string
  languages: string[]
  coverImage: File | null
  // Step 2
  modules: { id: string; title: string; lessons: Lesson[] }[]
  offlineDownload: boolean
  pdfPermissions: boolean
  // Step 3
  duration: string
  price: string
  discount: string
  discountType: string
  enableCoupons: boolean
}

export type Lesson = {
  id: string
  title: string
  description: string
  type: 'video' | 'test' | 'document' | 'image'
  videoAccess: boolean
  watchTimeHH: string
  watchTimeMM: string
  watchTimeSS: string
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
  name: '',
  description: '',
  category: '',
  level: '',
  languages: [],
  coverImage: null,
  modules: [],
  offlineDownload: false,
  pdfPermissions: false,
  duration: '',
  price: '',
  discount: '',
  discountType: 'percentage',
  enableCoupons: false,
})

const CourseCreatePage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CourseFormData>(emptyForm)

  const update = (fields: Partial<CourseFormData>) =>
    setForm((prev) => ({ ...prev, ...fields }))

  const next = () => setStep((s) => Math.min(s + 1, 4))
  const back = () => {
    if (step === 1) navigate('/courses')
    else setStep((s) => s - 1)
  }

  const progressPct = ((step - 1) / 3) * 100

  return (
    <div className="flex flex-col h-full">
      {/* Back link */}
      <button
        onClick={back}
        className="flex items-center gap-2 text-[#000B60] font-semibold text-sm hover:opacity-70 transition-opacity mb-5 w-fit"
      >
        <ArrowLeft size={16} weight="bold" />
        {BACK_LABELS[step - 1]}
      </button>

      {/* Step header + progress rail */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-[#000B60]">{STEPS[step - 1]}</h1>
        <span className="text-sm font-medium text-gray-400">
          <span className="text-[#000B60] font-bold">{String(step).padStart(2, '0')}</span>
          <span className="text-gray-300"> / 04</span>
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(to right, #000B60, #142283)',
          }}
        />
      </div>

      {/* Step content */}
      {step === 1 && <Step1BasicDetails form={form} update={update} onNext={next} />}
      {step === 2 && <Step2AcademicStructure form={form} update={update} onNext={next} />}
      {step === 3 && <Step3Pricing form={form} update={update} onNext={next} />}
      {step === 4 && (
        <Step4Review
          form={form}
          onPublish={() => navigate('/courses')}
          onDraft={() => navigate('/courses')}
        />
      )}
    </div>
  )
}

export default CourseCreatePage
