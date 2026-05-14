import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Heading, Paragraph } from '@/components/ui'
import Step1GeneralInfo from './Step1GeneralInfo'
import Step2AddQuestions from './Step2AddQuestions'
import type { TestFormData } from './Step1GeneralInfo'
import { generateUniqueId } from '@/utils/helper/numberGenarator'
import { useCreateTest } from '@/hooks/testHooks'
import { toast } from 'sonner'


const emptyForm = (): TestFormData => ({
  title: '', course: '', module: '',
  testType: '', totalMarks: '', duration: '',
  instructions: '',
})

const BREADCRUMBS = ['Create New', 'Add Questions']

const CreateTestPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<TestFormData>(emptyForm)
  const [isDraft, setIsDraft] = useState(false)


  // mutation
  const { mutateAsync: createTest, isPending: isCreatingTest } = useCreateTest()




  const update = async (values: TestFormData) => {
    setForm(values)
    console.log("values", values)
    // genarate unique id for test 
    const unique_id = generateUniqueId()

    const payload = {
      ...values,
      unique_id,
    }

    // call api 
    const { data, error } = await createTest(payload)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Add questions to this test")
    setStep(2)

  }

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
          isSubmiting={isCreatingTest}
          setIsDraft={setIsDraft}
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
