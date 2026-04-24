import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Heading, Paragraph } from '@/components/ui'
import Step1GeneralInfo from './Step1GeneralInfo'
import Step2AddQuestions from './Step2AddQuestions'
import type { TestFormData } from './Step1GeneralInfo'

const emptyForm = (): TestFormData => ({
  title: '', course: '', chapter: '',
  testType: '', totalMarks: '25', duration: '30',
  instructions: '',
})

const BREADCRUMBS = ['Create New', 'Add Questions']

const CreateTestPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<TestFormData>(emptyForm)

  const update = (f: Partial<TestFormData>) => setForm(prev => ({ ...prev, ...f }))

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide gap-5 pb-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
        <button onClick={() => navigate('/tests')} className="hover:text-[#000B60] transition-colors">
          Tests
        </button>
        <ChevronRight size={13} />
        <span className="text-[#000B60] font-bold">{BREADCRUMBS[step - 1]}</span>
      </div>

      {/* Title + DRAFT badge */}
      <div className="flex items-center gap-3">
        <Heading className="text-[#000B60]">Create Test</Heading>
        <span className="px-2.5 py-0.5 rounded-md bg-[#F2F4F6] text-xs font-bold text-[#767683] tracking-wide">
          DRAFT
        </span>
      </div>

      {step === 1 && (
        <Step1GeneralInfo
          form={form}
          update={update}
          onNext={() => setStep(2)}
          onSaveDraft={() => navigate('/tests')}
        />
      )}
      {step === 2 && (
        <Step2AddQuestions
          onPublish={() => navigate('/tests')}
          onSaveDraft={() => navigate('/tests')}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  )
}

export default CreateTestPage
