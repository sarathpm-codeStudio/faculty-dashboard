import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Heading, Paragraph } from '@/components/ui'
import Step1CourseSelection from './Step1CourseSelection'
import Step2Pricing from './Step2Pricing'
import { useGetBundleById } from '@/hooks/useBundle'

const CreateBundlePage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [sumOfCourses, setSumOfCourses] = useState(0)
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])

  const { id } = useParams()

  const handleStep1Next = (_ids: number[], total: number) => {
    setSelectedCourses(_ids)
    setSumOfCourses(total)
    setStep(2)
  }

  const { data: bundle, isLoading: bundleLoading } = useGetBundleById(id, !!id)




  return (
    <div className="flex flex-col h-full p-8 overflow-hidden">
      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#2c1452] mb-4 transition-colors w-fit shrink-0"
        >
          <ArrowLeft size={16} />
          Back to Course Selection
        </button>
      )}

      <Heading className="text-[#2c1452] mb-1 shrink-0">
        {step === 1 ? 'Create Bundle' : 'Pricing'}
      </Heading>
      <Paragraph className="text-[#767683] mb-6 shrink-0">
        {step === 1
          ? 'Choose the specialized courses you want to combine into this premium curriculum bundle.'
          : 'Define the value and projected growth of your curriculum bundle.'}
      </Paragraph>

      <div className="flex-1 min-h-0">
        {step === 1 && <Step1CourseSelection onNext={handleStep1Next} bundleId={id} bundle={bundle} bundleLoading={bundleLoading} />}
        {step === 2 && <Step2Pricing sumOfCourses={sumOfCourses} selectedCourses={selectedCourses} bundleId={id} bundle={bundle} onPublish={() => navigate('/bundles')} />}
      </div>
    </div>
  )
}

export default CreateBundlePage
