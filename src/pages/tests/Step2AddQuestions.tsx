


import { useMemo, useState } from 'react'
import { Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Textarea, Select, Paragraph, Checkbox } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoRocketOutline } from 'react-icons/io5'
import { useAddQuestion, useGetQuestionsByTestId, useUpdateQuestion, useDeleteQuestion, usePublishTest } from '@/hooks/test'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useGetAllContentInModule, useGetAllFoldersInCourse } from '@/hooks/useCourse'

interface Props {
  onBack: () => void
  testId: string
  courseId: string
  moduleId: string
  moduleName: string
  materialId: string
  materialName: string
}

const INITIAL_VALUES = {
  text: '',
  moduleId: '',
  moduleTitle: '',
  materialId: '',
  materialTitle: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
}

const Step2AddQuestions = ({
  onBack,
  testId,
  courseId,
  moduleId: testModuleId,
  moduleName: testModuleName,
  materialId: testMaterialId,
  materialName: testMaterialName,
}: Props) => {
  const hasPreselectedMaterial = !!testMaterialId
  const hasPreselectedModule = !!testModuleId
  const needsModuleSelect = !hasPreselectedModule && !!courseId
  const needsMaterialSelect = !hasPreselectedMaterial

  const [randomize, setRandomize] = useState(false)
  const [isEditQuestion, setIsEditQuestion] = useState(false)
  const [editQuestionId, setEditQuestionId] = useState<any>(null)
  const [questionModuleId, setQuestionModuleId] = useState('')

  const navigate = useNavigate()

  const activeModuleId = testModuleId || questionModuleId

  const { data: questionsData } = useGetQuestionsByTestId(testId, true)
  const { data: folders, isLoading: foldersLoading } = useGetAllFoldersInCourse(
    courseId,
    !!courseId && (needsModuleSelect || hasPreselectedModule),
  )
  const { data: contentData, isLoading: isLoadingContent } = useGetAllContentInModule(
    activeModuleId,
    needsMaterialSelect && !!activeModuleId,
  )
  const { data: preselectedContentData } = useGetAllContentInModule(
    testModuleId,
    hasPreselectedMaterial && !!testModuleId,
  )

  const { mutateAsync: addQuestion, isPending: isAddingQuestion } = useAddQuestion(testId)
  const { mutateAsync: updateQuestion, isPending: isUpdatingQuestion } = useUpdateQuestion(testId, editQuestionId)
  const { mutateAsync: deleteQuestion } = useDeleteQuestion(testId)
  const { mutateAsync: publishTest, isPending: isPublishingTest } = usePublishTest()

  const moduleOptions = useMemo(() => {
    const modules = folders?.data ?? []
    return modules.map((folder: any) => ({
      value: folder.id,
      label: folder.title,
    }))
  }, [folders])

  const materialOptions = useMemo(() => {
    const materials = contentData?.data ?? contentData?.json?.data ?? []
    return materials.map((material: any) => ({
      value: material.id,
      label: material.title,
    }))
  }, [contentData])

  const preselectedMaterialTitle = useMemo(() => {
    if (!hasPreselectedMaterial) return ''
    if (testMaterialName) return testMaterialName
    const materials = preselectedContentData?.data ?? preselectedContentData?.json?.data ?? []
    return materials.find((material: any) => material.id === testMaterialId)?.title ?? ''
  }, [hasPreselectedMaterial, testMaterialId, testMaterialName, preselectedContentData])

  const preselectedModuleTitle = useMemo(() => {
    if (!hasPreselectedModule) return ''
    if (testModuleName) return testModuleName
    return moduleOptions.find((module: { value: string; label: string }) => module.value === testModuleId)?.label ?? ''
  }, [hasPreselectedModule, testModuleId, testModuleName, moduleOptions])

  const questionSchema = useMemo(() => Yup.object({
    text: Yup.string().trim().required('Question text is required'),
    moduleId: needsModuleSelect
      ? Yup.string().required('Module is required')
      : Yup.string().optional(),
    materialId: needsMaterialSelect
      ? Yup.string().required('Material is required')
      : Yup.string().optional(),
    optionA: Yup.string().trim().required('Option A is required'),
    optionB: Yup.string().trim().required('Option B is required'),
    optionC: Yup.string().trim().required('Option C is required'),
    optionD: Yup.string().trim().required('Option D is required'),
    correctAnswer: Yup.string().required('Please select the correct answer'),
  }), [needsModuleSelect, needsMaterialSelect])

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: questionSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const selectedMaterial = materialOptions.find(
        (option: { value: string; label: string }) => option.value === values.materialId,
      )
      const effectiveModuleId = testModuleId || questionModuleId || values.moduleId
      const selectedModule = moduleOptions.find(
        (option: { value: string; label: string }) => option.value === effectiveModuleId,
      )
      const effectiveModuleTitle = hasPreselectedModule
        ? preselectedModuleTitle
        : selectedModule?.label || values.moduleTitle
      const effectiveMaterialId = hasPreselectedMaterial ? testMaterialId : values.materialId
      const effectiveMaterialTitle = hasPreselectedMaterial
        ? preselectedMaterialTitle
        : selectedMaterial?.label || values.materialTitle

      const questionPayload = {
        test_id: testId,
        question: values.text,
        type: 'mcq',
        marks: 5,
        module_id: effectiveModuleId,
        module_title: effectiveModuleTitle,
        material_id: effectiveMaterialId,
        material_title: effectiveMaterialTitle,
      }

      const optionsPayload = [
        { label: 'A', text: values.optionA, is_correct: values.correctAnswer === 'A' },
        { label: 'B', text: values.optionB, is_correct: values.correctAnswer === 'B' },
        { label: 'C', text: values.optionC, is_correct: values.correctAnswer === 'C' },
        { label: 'D', text: values.optionD, is_correct: values.correctAnswer === 'D' },
      ]

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
          resetQuestionForm()
        }

      } else {
        const { data, error } = await addQuestion(payload)

        if (error) {
          toast.error(error.message)
        }
        if (data) {
          toast.success('Question added successfully')
          resetQuestionForm()
        }
      }
    },
  })

  const { values, errors, touched, handleBlur, setFieldValue, handleSubmit, setTouched, resetForm } = formik

  const resetQuestionForm = () => {
    resetForm({
      values: {
        ...INITIAL_VALUES,
        moduleId: needsModuleSelect ? questionModuleId : '',
        moduleTitle: needsModuleSelect
          ? moduleOptions.find((option: { value: string; label: string }) => option.value === questionModuleId)?.label || ''
          : '',
      },
    })
  }

  // ✅ Mark all fields touched so errors show on submit click
  const handleAddQuestion = () => {
    setTouched({
      text: true,
      moduleId: true,
      materialId: true,
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
    setEditQuestionId(editQuestionData.id)

    if (editQuestionData.module_id) {
      setQuestionModuleId(editQuestionData.module_id)
    }

    if (editQuestionData.options && editQuestionData.options.length > 0) {
      const optionsByLabel = editQuestionData.options.reduce((acc: any, option: any) => {
        acc[option.label] = option.option_text;
        return acc;
      }, {});

      formik.setValues({
        text: editQuestionData.question,
        moduleId: editQuestionData.module_id || questionModuleId || testModuleId || '',
        moduleTitle: editQuestionData.module_title || preselectedModuleTitle || '',
        materialId: hasPreselectedMaterial ? testMaterialId : (editQuestionData.material_id || ''),
        materialTitle: hasPreselectedMaterial ? preselectedMaterialTitle : (editQuestionData.material_title || ''),
        optionA: optionsByLabel['A'] || '',
        optionB: optionsByLabel['B'] || '',
        optionC: optionsByLabel['C'] || '',
        optionD: optionsByLabel['D'] || '',
        correctAnswer: editQuestionData.options.find((option: any) => option.is_correct)?.label || '',
      })
    } else {
      formik.setValues({
        text: editQuestionData.question,
        moduleId: editQuestionData.module_id || questionModuleId || testModuleId || '',
        moduleTitle: editQuestionData.module_title || preselectedModuleTitle || '',
        materialId: hasPreselectedMaterial ? testMaterialId : (editQuestionData.material_id || ''),
        materialTitle: hasPreselectedMaterial ? preselectedMaterialTitle : (editQuestionData.material_title || ''),
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

          {/* Module selector — only when test was created with course only */}
          {needsModuleSelect && (
            <div>
              <Select
                label="Module"
                placeholder={foldersLoading ? 'Loading modules...' : 'Select module'}
                options={moduleOptions}
                value={questionModuleId}
                loading={foldersLoading}
                disabled={foldersLoading}
                onChange={e => {
                  const selectedModule = moduleOptions.find(
                    (option: { value: string; label: string }) => option.value === e.target.value,
                  )
                  setQuestionModuleId(e.target.value)
                  setFieldValue('moduleId', e.target.value)
                  setFieldValue('moduleTitle', selectedModule?.label || '')
                  setFieldValue('materialId', '')
                  setFieldValue('materialTitle', '')
                }}
                onBlur={handleBlur('moduleId')}
              />
              {err('moduleId')}
            </div>
          )}

          {/* Material selector — hidden when material was selected during test creation */}
          {needsMaterialSelect && (
            <div>
              <Select
                label="Question related to Material"
                placeholder={
                  !activeModuleId
                    ? 'Select a module first'
                    : isLoadingContent
                      ? 'Loading materials...'
                      : 'Select material'
                }
                options={materialOptions}
                value={values.materialId}
                loading={!!activeModuleId && isLoadingContent}
                disabled={!activeModuleId || isLoadingContent}
                onChange={e => {
                  const selectedMaterial = materialOptions.find(
                    (option: { value: string; label: string }) => option.value === e.target.value,
                  )
                  setFieldValue('materialId', e.target.value)
                  setFieldValue('materialTitle', selectedMaterial?.label || '')
                }}
                onBlur={handleBlur('materialId')}
              />
              {err('materialId')}
            </div>
          )}

          {hasPreselectedMaterial && preselectedMaterialTitle && (
            <div className="rounded-xl bg-[#F2F4F6] px-4 py-3">
              <Paragraph className="!text-xs font-bold text-[#767683] uppercase tracking-wide">
                Referenced Material
              </Paragraph>
              <Paragraph className="!text-sm font-semibold text-[#000B60] mt-1">
                {preselectedMaterialTitle}
              </Paragraph>
            </div>
          )}

          {hasPreselectedModule && preselectedModuleTitle && !needsModuleSelect && (
            <div className="rounded-xl bg-[#F2F4F6] px-4 py-3">
              <Paragraph className="!text-xs font-bold text-[#767683] uppercase tracking-wide">
                Module
              </Paragraph>
              <Paragraph className="!text-sm font-semibold text-[#000B60] mt-1">
                {preselectedModuleTitle}
              </Paragraph>
            </div>
          )}

          {/* MCQ options + correct answer */}
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
              {touched.correctAnswer && errors.correctAnswer && (
                <p className="text-[11px] text-red-500">{errors.correctAnswer}</p>
              )}
            </div>
          </div>

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
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {q.module_title && (
                          <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wide">
                            {q.module_title}
                          </span>
                        )}
                        {q.module_title && q.material_title && (
                          <span className="text-[10px] text-[#767683]">•</span>
                        )}
                        {q.material_title && (
                          <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wide">
                            {q.material_title}
                          </span>
                        )}
                        {(q.module_title || q.material_title) && (
                          <span className="text-[10px] text-[#767683]">•</span>
                        )}
                        <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wide">
                          MCQ
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