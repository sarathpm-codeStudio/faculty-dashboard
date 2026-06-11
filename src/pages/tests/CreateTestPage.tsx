import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Heading, Paragraph } from '@/components/ui'
import Step1GeneralInfo from './Step1GeneralInfo'
import Step2AddQuestions from './Step2AddQuestions'
import type { TestFormData } from './Step1GeneralInfo'
import { generateUniqueId } from '@/utils/helper/numberGenarator'
import { useCreateTest, useGetTestById, useUpdateTest } from '@/hooks/test'
import { toast } from 'sonner'


const emptyForm = (): TestFormData => ({
  title: '', course: '', module: '', moduleTitle: '', material: '', materialTitle: '',
  testType: '', duration: '',
  instructions: '',
})

const BREADCRUMBS = ['Create New', 'Add Questions']

const CreateTestPage = () => {

  const { id } = useParams()


  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<TestFormData>(emptyForm)
  const [isDraft, setIsDraft] = useState(false)
  const [testId, setTestId] = useState<string>("")



  // mutation
  const { mutateAsync: createTest, isPending: isCreatingTest } = useCreateTest()
  const { mutateAsync: updateTest, isPending: isUpdatingTest } = useUpdateTest()

  // query
  const { data: testData, isLoading: isFetchingTest } = useGetTestById(id, !!id)




  const update = async (values: TestFormData) => {

    if (id) {
      setTestId(id)

      // edit test basic details
      setForm(values)
      console.log("values>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", values)

      const payload = {
        ...values,
        module_id: values.module,
        module_title: values.moduleTitle,
        material_id: values.material,
        material_title: values.materialTitle,
      }

      // call api 
      const { data, error } = await updateTest({ id, payload })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Test updated successfully")
      setStep(2)

    } else {

      // create test basic details
      setForm(values)
      console.log("values", values)
      // genarate unique id for test 
      const unique_id = generateUniqueId()

      const payload = {
        ...values,
        unique_id,
        module_id: values.module,
        module_title: values.moduleTitle,
        material_id: values.material,
        material_title: values.materialTitle,
      }

      try {
        // call api 
        const data = await createTest(payload)
        console.log("data id ^^^^^^^^^^^^^^^^^^^^", data)
        setTestId(data?.id)
        toast.success("Add questions to this test")
        setStep(2)
      } catch (error: any) {
        toast.error(error.message)
      }

    }

  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide gap-5 pb-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#767683] font-medium">
        <button onClick={() => navigate('/tests')} className="hover:text-[#2c1452] transition-colors">
          Tests
        </button>
        <ChevronRight size={13} />
        <span className="text-[#2c1452] font-bold">{BREADCRUMBS[step - 1]}</span>
      </div>

      {/* Title + DRAFT badge */}
      <div className="flex items-center gap-3">
        <Heading className="text-[#2c1452]">Create Test</Heading>
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
          isSubmiting={isCreatingTest || isUpdatingTest}
          setIsDraft={setIsDraft}
          testData={testData}
        />
      )}
      {step === 2 && (
        <Step2AddQuestions
          onBack={() => setStep(1)}
          testId={testId}
          courseId={form.course}
          moduleId={form.module}
          moduleName={form.moduleTitle}
          materialId={form.material}
          materialName={form.materialTitle}
        />
      )}
    </div>
  )
}

export default CreateTestPage
