


import { useState } from 'react'
import { Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Input, Textarea, Select, Paragraph, Checkbox } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoRocketOutline } from 'react-icons/io5'
import { useAddQuestion, useGetQuestionsByTestId, useUpdateQuestion, useDeleteQuestion, usePublishTest } from '@/hooks/test'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

type Question = {
  id: number
  text: string
  type: string
  marks: number
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
}

interface Props {
  // onPublish: () => void
  // onSaveDraft: () => void
  onBack: () => void
  testId: string
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

const questionSchema = Yup.object({
  text: Yup.string().trim().required('Question text is required'),
  type: Yup.string().required('Question type is required'),
  marks: Yup.number()
    .min(1, 'Marks must be at least 1')
    .required('Marks are required'),
  optionA: Yup.string().when('type', {
    is: 'mcq',
    then: schema => schema.trim().required('Option A is required'),
    otherwise: schema => schema.notRequired(),
  }),
  optionB: Yup.string().when('type', {
    is: 'mcq',
    then: schema => schema.trim().required('Option B is required'),
    otherwise: schema => schema.notRequired(),
  }),
  optionC: Yup.string().when('type', {
    is: 'mcq',
    then: schema => schema.trim().required('Option C is required'),
    otherwise: schema => schema.notRequired(),
  }),
  optionD: Yup.string().when('type', {
    is: 'mcq',
    then: schema => schema.trim().required('Option D is required'),
    otherwise: schema => schema.notRequired(),
  }),
  correctAnswer: Yup.string().when('type', {
    is: 'mcq',
    then: schema => schema.required('Please select the correct answer'),
    otherwise: schema => schema.notRequired(),
  }),
})

const INITIAL_VALUES = {
  text: '',
  type: 'mcq',
  marks: 5,
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
}

const Step2AddQuestions = ({ onBack, testId }: Props) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [randomize, setRandomize] = useState(false)
  const [isEditQuestion, setIsEditQuestion] = useState(false)
  const [editQuestionId, setEditQuestionId] = useState<any>(null)

  const navigate = useNavigate()


  // queries
  const { data: questionsData, isLoading: isLoadingQuestions, refetch: refetchQuestions } = useGetQuestionsByTestId(testId, true)



  // mutations
  const { mutateAsync: addQuestion, isPending: isAddingQuestion } = useAddQuestion(testId)
  const { mutateAsync: updateQuestion, isPending: isUpdatingQuestion } = useUpdateQuestion(testId, editQuestionId)
  const { mutateAsync: deleteQuestion, isPending: isDeletingQuestion } = useDeleteQuestion(testId)
  const { mutateAsync: publishTest, isPending: isPublishingTest } = usePublishTest()



  console.log('── Questions Data ──', questionsData)


  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: questionSchema,
    validateOnChange: true,  // ✅ show errors as user types
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      const questionPayload = {
        test_id: testId,
        question: values.text,
        type: values.type,
        marks: values.marks,
      }

      const optionsPayload =
        values.type === 'mcq'
          ? [
            { label: 'A', text: values.optionA, is_correct: values.correctAnswer === 'A' },
            { label: 'B', text: values.optionB, is_correct: values.correctAnswer === 'B' },
            { label: 'C', text: values.optionC, is_correct: values.correctAnswer === 'C' },
            { label: 'D', text: values.optionD, is_correct: values.correctAnswer === 'D' },
          ]
          : []

      const payload = {
        ...questionPayload,
        options: optionsPayload
      }
      console.log('── Question payload (questions table) ──', questionPayload)
      console.log('── Options payload  (options table)   ──', optionsPayload)

      // edit questions
      if (isEditQuestion) {
        console.log("edit questions")
        const { data, error } = await updateQuestion(payload)

        if (error) {
          toast.error(error.message)
        }
        if (data) {
          toast.success('Question updated successfully')
          setIsEditQuestion(false)
          setEditQuestionId(null)
          resetForm()
        }

      } else {
        const { data, error } = await addQuestion(payload)

        if (error) {
          toast.error(error.message)
        }
        if (data) {
          toast.success('Question added successfully')
          resetForm()
        }
      }
    },
  })

  const { values, errors, touched, handleBlur, setFieldValue, handleSubmit, setTouched } = formik

  const removeQuestion = (id: number) =>
    setQuestions(prev => prev.filter(q => q.id !== id))

  // ✅ Mark all fields touched so errors show on submit click
  const handleAddQuestion = () => {
    setTouched({
      text: true,
      type: true,
      marks: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correctAnswer: true,
    })
    handleSubmit()
  }

  // const handleEditQuestion = (editQuestionData: any) => {
  //   setIsEditQuestion(true)
  //   console.log("editQuestionData", editQuestionData)
  //   formik.setValues({
  //     text: editQuestionData.question,
  //     type: editQuestionData.type,
  //     marks: editQuestionData.marks,
  //     optionA: editQuestionData.options[0].option_text,
  //     optionB: editQuestionData.options[1].option_text,
  //     optionC: editQuestionData.options[2].option_text,
  //     optionD: editQuestionData.options[3].option_text,
  //     correctAnswer: editQuestionData.options.find((option: any) => option.is_correct).label,
  //   })
  // }

  // const handleEditQuestion = (editQuestionData: any) => {
  //   setIsEditQuestion(true)
  //   console.log("editQuestionData", editQuestionData)
  //   setEditQuestionId(editQuestionData.id)

  //   // Map options by their label (A, B, C, D) instead of array position
  //   const optionsByLabel = editQuestionData.options.reduce((acc: any, option: any) => {
  //     acc[option.label] = option.option_text;
  //     return acc;
  //   }, {});

  //   formik.setValues({
  //     text: editQuestionData.question,
  //     type: editQuestionData.type,
  //     marks: editQuestionData.marks,
  //     optionA: optionsByLabel['A'],
  //     optionB: optionsByLabel['B'],
  //     optionC: optionsByLabel['C'],
  //     optionD: optionsByLabel['D'],
  //     correctAnswer: editQuestionData.options.find((option: any) => option.is_correct).label,
  //   })
  // }


  const handleEditQuestion = (editQuestionData: any) => {
    setIsEditQuestion(true)
    console.log("editQuestionData", editQuestionData)
    setEditQuestionId(editQuestionData.id)

    // Check if type is MCQ and has options
    if (editQuestionData.type === 'mcq' && editQuestionData.options && editQuestionData.options.length > 0) {
      // Map options by their label (A, B, C, D) instead of array position
      const optionsByLabel = editQuestionData.options.reduce((acc: any, option: any) => {
        acc[option.label] = option.option_text;
        return acc;
      }, {});

      formik.setValues({
        text: editQuestionData.question,
        type: editQuestionData.type,
        marks: editQuestionData.marks,
        optionA: optionsByLabel['A'] || '',
        optionB: optionsByLabel['B'] || '',
        optionC: optionsByLabel['C'] || '',
        optionD: optionsByLabel['D'] || '',
        correctAnswer: editQuestionData.options.find((option: any) => option.is_correct)?.label || '',
      })
    } else {
      // If no options or not MCQ type
      formik.setValues({
        text: editQuestionData.question,
        type: editQuestionData.type,
        marks: editQuestionData.marks,
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
      })
    }
  }

  const handleDeleteQuestion = async (id: string) => {

    toast.loading("Deleting question...")

    try {
      const { data, error } = await deleteQuestion(id)
      if (error) {
        toast.error(error.message)
        // toast.dismiss()
      }
      if (data) {
        toast.success('Question deleted successfully')
        // toast.dismiss()
      }
    } catch (error: any) {
      toast.error(error.message)
      // toast.dismiss()
    }
    finally {
      toast.dismiss()
    }

  }

  const handlePublishTest = async () => {
    toast.loading("Publishing test...")
    try {
      const { data, error } = await publishTest(testId)
      if (error) {
        toast.error(error.message)
        // toast.dismiss()
      }
      if (data) {
        toast.success('Test published successfully')
        navigate('/tests')
        // toast.dismiss()
      }
    } catch (error: any) {
      toast.error(error.message)
      // toast.dismiss()
    }
    finally {
      toast.dismiss()
    }
  }

  const handleSaveDraft = () => {
    toast.success('Test saved as draft')
    navigate('/tests')
  }







  // ✅ Show error only when field is touched
  const err = (field: keyof typeof INITIAL_VALUES) =>
    touched[field] && errors[field] ? (
      <p className="text-[11px] text-red-500 mt-1">{errors[field]}</p>
    ) : null

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* ── Left ── */}
      <div className="col-span-8 flex flex-col gap-5">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-l-4 border-[#000B60] pl-3">
            <Paragraph className="font-bold text-[#000B60] !text-base">Add Questions</Paragraph>
          </div>

          {/* Question text */}
          <div>
            <Textarea
              label="Question Text"
              placeholder="Type your question here..."
              rows={3}
              value={values.text}
              onChange={e => setFieldValue('text', e.target.value)}
              onBlur={handleBlur('text')}
            />
            {err('text')}
          </div>

          {/* Type + Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Question Type"
                options={questionTypeOptions}
                value={values.type}
                onChange={e => {
                  setFieldValue('type', e.target.value)
                  if (e.target.value !== 'mcq') {
                    setFieldValue('optionA', '')
                    setFieldValue('optionB', '')
                    setFieldValue('optionC', '')
                    setFieldValue('optionD', '')
                    setFieldValue('correctAnswer', '')
                  }
                }}
                onBlur={handleBlur('type')}
              />
              {err('type')}
            </div>
            <div>
              <Input
                label="Weightage (Marks)"
                type="number"
                min={1}
                value={String(values.marks)}
                onChange={e => setFieldValue('marks', Number(e.target.value))}
                onBlur={handleBlur('marks')}
              />
              {err('marks')}
            </div>
          </div>

          {/* MCQ options + correct answer */}
          {values.type === 'mcq' && (
            <div className="flex flex-col gap-3">
              <Paragraph className="!text-sm font-bold text-gray-700">Options</Paragraph>

              <div className="grid grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map(letter => {
                  const key = `option${letter}` as keyof typeof INITIAL_VALUES
                  return (
                    <div key={letter}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          {letter}
                        </span>
                        <input
                          type="text"
                          placeholder={`Add option ${letter}`}
                          value={values[key] as string}
                          onChange={e => setFieldValue(key, e.target.value)}
                          onBlur={handleBlur(key)}
                          className="w-full pl-8 pr-4 py-4 bg-[#F2F4F6] rounded-lg border border-gray-100 text-sm font-medium outline-none"
                        />
                      </div>
                      {err(key)}
                    </div>
                  )
                })}
              </div>

              {/* Correct answer selector */}
              <div className="bg-[#F2F4F6] rounded-xl px-4 py-3 flex flex-col gap-2">
                <Paragraph className="!text-xs font-bold text-[#000B60]">
                  ✓ Correct Answer
                </Paragraph>
                <div className="flex gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map(letter => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setFieldValue('correctAnswer', letter)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors
                        ${values.correctAnswer === letter
                          ? 'bg-[#000B60] text-white border-[#000B60]'
                          : 'bg-white text-[#000B60] border-[#000B60]/20 hover:bg-[#000B60]/10'
                        }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                {/* ✅ correctAnswer error shows when touched (set on submit click) */}
                {touched.correctAnswer && errors.correctAnswer && (
                  <p className="text-[11px] text-red-500">{errors.correctAnswer}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              className="!h-10 !text-sm !px-5"
              onClick={handleAddQuestion}  // ✅ use new handler
              disabled={isAddingQuestion || isUpdatingQuestion}
            >
              {
                isAddingQuestion || isUpdatingQuestion ? <Loader2 className="animate-spin" /> : isEditQuestion ? 'Update Question' : ' + Add Question'}

            </Button>
          </div>
        </div>

        {/* Added questions list */}
        {questionsData?.data?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <Paragraph className="!text-xs font-bold text-[#767683] uppercase tracking-widest">
              Added Questions ({questionsData?.data?.length})
            </Paragraph>
            <div className="flex flex-col divide-y divide-gray-100">
              {questionsData?.data?.map((q: any, i: number) => (
                <div key={q.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#767683] shrink-0">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <div>
                      <Paragraph className="!text-sm font-bold text-[#000B60]">{q.question}</Paragraph>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wide">
                          {typeBadge[q.type] ?? q.type}
                        </span>
                        <span className="text-[10px] text-[#767683]">•</span>
                        <span className="text-[10px] font-bold text-[#767683] uppercase">
                          {q.marks} Marks
                        </span>
                        {q.type === 'mcq' && q.correctAnswer && (
                          <>
                            <span className="text-[10px] text-[#767683]">•</span>
                            <span className="text-[10px] font-bold text-[#000B60] uppercase">
                              Ans: {q.correctAnswer}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { handleEditQuestion(q) }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#767683]">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
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
          <Button variant="primary" disabled={isPublishingTest} fullWidth onClick={handlePublishTest}>
            {isPublishingTest ? <Loader2 className="animate-spin" /> :
              <>
                Publish
                <IoRocketOutline size={18} />
              </>
            }

          </Button>
          <Button variant="white" fullWidth onClick={handleSaveDraft}>
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