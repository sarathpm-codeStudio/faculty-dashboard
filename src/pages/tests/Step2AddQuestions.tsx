import { useState } from 'react'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { Input, Textarea, Select, Paragraph, Checkbox } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoRocketOutline } from 'react-icons/io5'

type Question = {
  id: number
  text: string
  type: string
  marks: number
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

interface Props {
  onPublish: () => void
  onSaveDraft: () => void
  onBack: () => void
}

const questionTypeOptions = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'short', label: 'Short Answer' },
  { value: 'long', label: 'Long Answer' },
]

const typeBadge: Record<string, string> = {
  mcq: 'MCQ',
  short: 'SHORT ANSWER',
  long: 'LONG ANSWER',
}

const INITIAL_QUESTIONS: Question[] = [
  { id: 1, text: 'What is the derivative of sin(x) with respect to x?', type: 'mcq', marks: 5, optionA: '', optionB: '', optionC: '', optionD: '' },
  { id: 2, text: 'Explain the fundamental theorem of calculus in your own words.', type: 'short', marks: 10, optionA: '', optionB: '', optionC: '', optionD: '' },
]

const Step2AddQuestions = ({ onPublish, onSaveDraft, onBack }: Props) => {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS)
  const [randomize, setRandomize] = useState(false)
  const [form, setForm] = useState<Omit<Question, 'id'>>({
    text: '', type: 'mcq', marks: 5,
    optionA: '', optionB: '', optionC: '', optionD: '',
  })

  const updateForm = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }))

  const addQuestion = () => {
    if (!form.text.trim()) return
    setQuestions(prev => [...prev, { ...form, id: Date.now() }])
    setForm({ text: '', type: 'mcq', marks: 5, optionA: '', optionB: '', optionC: '', optionD: '' })
  }

  const removeQuestion = (id: number) => setQuestions(prev => prev.filter(q => q.id !== id))

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* ── Left ── */}
      <div className="col-span-8 flex flex-col gap-5">

        {/* Add Questions form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-l-4 border-[#000B60] pl-3">
            <Paragraph className="font-bold text-[#000B60] !text-base">Add Questions</Paragraph>
          </div>

          <Textarea
            label="Question Text"
            placeholder="Type your question here..."
            rows={3}
            value={form.text}
            onChange={e => updateForm({ text: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Question Type"
              options={questionTypeOptions}
              value={form.type}
              onChange={e => updateForm({ type: e.target.value })}
            />
            <Input
              label="Weightage (Marks)"
              type="number"
              min={1}
              value={String(form.marks)}
              onChange={e => updateForm({ marks: Number(e.target.value) })}
            />
          </div>

          {form.type === 'mcq' && (
            <div className="flex flex-col gap-2">
              <Paragraph className="!text-sm font-bold text-gray-700">Options</Paragraph>
              <div className="grid grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map(letter => {
                  const key = `option${letter}` as keyof typeof form
                  return (
                    <div key={letter} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{letter}</span>
                      <input
                        type="text"
                        placeholder={`Add option ${letter}`}
                        value={form[key] as string}
                        onChange={e => updateForm({ [key]: e.target.value })}
                        className="w-full pl-8 pr-4 py-4 bg-[#F2F4F6] rounded-lg border border-gray-100 text-sm font-medium outline-none"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="primary" className="!h-10 !text-sm !px-5" onClick={addQuestion}>
              + Add to Test
            </Button>
          </div>
        </div>

        {/* Added Questions list */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <Paragraph className="!text-xs font-bold text-[#767683] uppercase tracking-widest">
              Added Questions ({questions.length})
            </Paragraph>
            <div className="flex flex-col divide-y divide-gray-100">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#767683] shrink-0">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <div>
                      <Paragraph className="!text-sm font-bold text-[#000B60]">{q.text}</Paragraph>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wide">
                          {typeBadge[q.type] ?? q.type}
                        </span>
                        <span className="text-[10px] text-[#767683]">•</span>
                        <span className="text-[10px] font-bold text-[#767683] uppercase">{q.marks} Marks</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#767683]">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <div className="col-span-4 flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <Button variant="primary" fullWidth onClick={onPublish}>
            Publish
            <IoRocketOutline size={18} />
          </Button>
          <Button variant="white" fullWidth onClick={onSaveDraft}>
            🖫 Save Draft
          </Button>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#000B60] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to General Info
          </button>
        </div>

        {/* Pro Tip */}
        <div className="bg-[#F2F4F6] rounded-2xl p-4 flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[#000B60]">💡</span>
            <Paragraph className="!text-sm font-bold text-[#00A6BF]">Pro Tip</Paragraph>
          </div>
          <Checkbox
            label="Randomize questions"
            checked={randomize}
            onChange={e => setRandomize(e.target.checked)}
          />
          <Paragraph className="!text-xs text-[#00A6BF] leading-relaxed">
            Use the "Randomize Questions" feature to reduce chances of academic dishonesty during the Test.
          </Paragraph>
        </div>
      </div>
    </div>
  )
}

export default Step2AddQuestions
