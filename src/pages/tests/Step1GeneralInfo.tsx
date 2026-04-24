
import { ArrowRight } from 'lucide-react'
import { Input, Textarea, Select, Paragraph } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoAddCircleOutline } from "react-icons/io5";


export type TestFormData = {
  title: string
  course: string
  chapter: string
  testType: string
  totalMarks: string
  duration: string
  instructions: string
}

interface Props {
  form: TestFormData
  update: (f: Partial<TestFormData>) => void
  onNext: () => void
  onSaveDraft: () => void
}

const courseOptions = [{ value: 'math301', label: 'Mathematics 301' }, { value: 'taxation', label: 'Taxation' }, { value: 'biz_laws', label: 'Business Laws' }]
const testTypeOptions = [{ value: 'final', label: 'Final Examination' }, { value: 'midterm', label: 'Mid-Term' }, { value: 'quiz', label: 'Quiz' }]
const marksOptions = [{ value: '25', label: '25' }, { value: '50', label: '50' }, { value: '100', label: '100' }]
const durationOptions = [{ value: '30', label: '30 mins' }, { value: '60', label: '1 hour' }, { value: '90', label: '1h 30 mins' }, { value: '120', label: '2 hours' }]

const Step1GeneralInfo = ({ form, update, onNext, onSaveDraft }: Props) => (
  <div className="grid grid-cols-12 gap-6">

    {/* ── Left form ── */}
    <div className="col-span-8 flex flex-col gap-5">

      {/* General Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 border-l-4 border-[#000B60] pl-3">
          <Paragraph className="font-bold text-[#000B60] !text-base">General Information</Paragraph>
        </div>

        <Input
          label="Test Title"
          placeholder="e.g., Midterm Assessment - Advanced Calculus"
          value={form.title}
          onChange={e => update({ title: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Course"
            options={courseOptions}
            placeholder="Select course"
            value={form.course}
            onChange={e => update({ course: e.target.value })}
          />
          <Input
            label="Chapter"
            placeholder="e.g., Differential Equations"
            value={form.chapter}
            onChange={e => update({ chapter: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Test Type"
            options={testTypeOptions}
            placeholder="Select type"
            value={form.testType}
            onChange={e => update({ testType: e.target.value })}
          />
          <Select
            label="Total Marks"
            options={marksOptions}
            value={form.totalMarks}
            onChange={e => update({ totalMarks: e.target.value })}
          />
          <Select
            label="Duration"
            options={durationOptions}
            value={form.duration}
            onChange={e => update({ duration: e.target.value })}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-l-4 border-[#000B60] pl-3">
          <Paragraph className="font-bold text-[#000B60] !text-base">Instructions</Paragraph>
        </div>
        <Textarea
          placeholder="Outline the guidelines for students..."
          rows={5}
          value={form.instructions}
          onChange={e => update({ instructions: e.target.value })}
        />
      </div>

      {/* Continue */}
      {/* <div className="flex justify-end">
        <Button variant="primary" className="!h-11 !text-sm !px-6" onClick={onNext}>
          Continue
          <ArrowRight size={16} />
        </Button>
      </div> */}
    </div>

    {/* ── Right sidebar ── */}
    <div className="col-span-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <Button variant="primary" fullWidth onClick={onNext}>
          <IoAddCircleOutline size={20} /> Add Questions
        </Button>
        <Button variant="white" fullWidth onClick={onSaveDraft}>
          🖫 Save Draft
        </Button>
      </div>
    </div>
  </div>
)

export default Step1GeneralInfo
