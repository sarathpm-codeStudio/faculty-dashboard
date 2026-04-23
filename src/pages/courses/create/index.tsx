import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Step1BasicDetails from './Step1BasicDetails'
import Step2AcademicStructure from './Step2AcademicStructure'
import Step3Pricing from './Step3Pricing'
import Step4Review from './Step4Review'
import { Heading } from '@/components/ui'

export type CourseFormData = {
  // Step 1
  name: string
  description: string
  category: string
  level: string
  languages: string[]
  coverImage: File | null
  introVideo: File | null
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
  introVideo: null,
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

  return (
    <div className="flex flex-col h-full">
      {/* Back link */}
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#000B60] mb-5 transition-colors"

      >
        <ArrowLeft size={16} />
        {BACK_LABELS[step - 1]}
      </button>

      {/* Step header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <Heading className="text-[#000B60]">{STEPS[step - 1]}</Heading>

        <div className="flex items-center gap-3">
          {step === 4 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-700">
              Ready to Publish
            </span>
          )}
          <span className="text-sm font-medium text-gray-400">
            <span className="text-[#000B60] font-bold">Step {String(step).padStart(2, '0')}</span>
            <span className="text-gray-500"> / 04</span>
          </span>
        </div>
      </div>

      {/* Progress rail */}
      <div className="w-full mb-8 md:mb-15" style={{ height: '6px', background: '#E5E7EB', borderRadius: '999px' }}>
        <div
          style={{
            height: '6px',
            borderRadius: '999px',
            width: `${(step / 4) * 100}%`,
            background: 'linear-gradient(to right, #000B60, #142283)',
            transition: 'width 0.5s ease',
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
