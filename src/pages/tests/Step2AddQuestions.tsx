


import { useMemo, useRef, useState } from 'react'
import { Pencil, Trash2, ArrowLeft, Loader2, Download, Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Textarea, Select, Paragraph, Checkbox } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoRocketOutline } from 'react-icons/io5'
import { useAddQuestion, useImportQuestions, useGetQuestionsByTestId, useUpdateQuestion, useDeleteQuestion, usePublishTest, useSaveDraft } from '@/hooks/test'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useGetAllContentInModule, useGetAllFoldersInCourse } from '@/hooks/useCourse'
import { testService } from '@/services/testService'

/** Rows past this are ignored by the import Lambda — surfaced here so the UI can say so. */
const MAX_IMPORT_ROWS = 200

interface ImportResult {
  imported: number
  total: number
  skipped: { row: number; error: string }[]
}

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

  const [mode, setMode] = useState<'manual' | 'import'>('manual')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()

  const activeModuleId = testModuleId || questionModuleId

  const { data: questionsData } = useGetQuestionsByTestId(testId, true)
  const questions: any[] = Array.isArray(questionsData) ? questionsData : []
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
  const { mutateAsync: importQuestions, isPending: isImportingQuestions } = useImportQuestions(testId)
  const { mutateAsync: updateQuestion, isPending: isUpdatingQuestion } = useUpdateQuestion(testId, editQuestionId)
  const { mutateAsync: deleteQuestion } = useDeleteQuestion(testId)
  const { mutateAsync: publishTest, isPending: isPublishingTest } = usePublishTest()
  const { mutateAsync: saveDraft, isPending: isSavingDraft } = useSaveDraft()

  const moduleOptions = useMemo(() => {
    const modules = folders ?? []
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

  /** Where a question lands — shared by the manual form and the Excel import. */
  const resolvePlacement = (formValues: typeof INITIAL_VALUES) => {
    const selectedMaterial = materialOptions.find(
      (option: { value: string; label: string }) => option.value === formValues.materialId,
    )
    const effectiveModuleId = testModuleId || questionModuleId || formValues.moduleId
    const selectedModule = moduleOptions.find(
      (option: { value: string; label: string }) => option.value === effectiveModuleId,
    )

    return {
      moduleId: effectiveModuleId,
      moduleTitle: hasPreselectedModule
        ? preselectedModuleTitle
        : selectedModule?.label || formValues.moduleTitle,
      materialId: hasPreselectedMaterial ? testMaterialId : formValues.materialId,
      materialTitle: hasPreselectedMaterial
        ? preselectedMaterialTitle
        : selectedMaterial?.label || formValues.materialTitle,
    }
  }

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
      const placement = resolvePlacement(values)

      const questionPayload = {
        test_id: testId,
        question: values.text,
        type: 'mcq',
        marks: 5,
        module_id: placement.moduleId,
        module_title: placement.moduleTitle,
        material_id: placement.materialId,
        material_title: placement.materialTitle,
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
        try {
          await updateQuestion(payload)
          toast.success('Question updated successfully')
          setIsEditQuestion(false)
          setEditQuestionId(null)
          resetQuestionForm()
        } catch {
          // Error toast handled globally by the query client.
        }

      } else {

        try {

          await addQuestion(payload)

          toast.success('Question added successfully')
          resetQuestionForm()

        } catch {
          // Error toast handled globally by the query client.
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

  /* ── Excel import ─────────────────────────────────────────────── */

  const resetImport = () => {
    setImportFile(null)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const switchMode = (nextMode: 'manual' | 'import') => {
    if (nextMode === mode) return
    setMode(nextMode)
    if (nextMode === 'import' && isEditQuestion) {
      setIsEditQuestion(false)
      setEditQuestionId(null)
      resetQuestionForm()
    }
    if (nextMode === 'manual') resetImport()
  }

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true)
    try {
      await testService.downloadQuestionTemplate()
      toast.success('Sample template downloaded')
    } catch (error: any) {
      toast.error(error?.message || 'Could not download the template. Please try again.')
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Please upload an .xlsx file. Download the sample template to get the right format.')
      return
    }

    setImportFile(file)
    setImportResult(null)
  }

  const handleImportQuestions = async () => {
    if (!importFile) return

    const placement = resolvePlacement(values)

    if (needsModuleSelect && !placement.moduleId) {
      setTouched({ moduleId: true })
      toast.error('Please select a module for the imported questions.')
      return
    }
    if (needsMaterialSelect && !placement.materialId) {
      setTouched({ moduleId: true, materialId: true })
      toast.error('Please select a material for the imported questions.')
      return
    }

    try {
      // The Lambda parses and validates the workbook — it returns what it imported
      // and which rows it had to skip.
      const result: ImportResult = await importQuestions({ file: importFile, placement })

      setImportResult(result)
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      toast.success(`${result.imported} question${result.imported > 1 ? 's' : ''} imported successfully`)

      if (result.skipped?.length) {
        toast.warning(`${result.skipped.length} row(s) were skipped because they had errors.`)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Could not import that file.')
    }
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
    // Editing is a manual-form action — drop out of import mode so the question
    // being edited is actually visible.
    setMode('manual')
    resetImport()

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
    if (questions.length === 0) {
      toast.warning("You can't publish this test — no questions available. Please add at least one question or save it as a draft.")
      return
    }

    toast.loading("Publishing test...")
    try {
      await publishTest(testId)
      toast.success('Test published successfully')
      navigate('/tests')
      // toast.dismiss()

    } catch (error: any) {
      toast.error(error.message)
      // toast.dismiss()
    }
    finally {
      toast.dismiss()
    }
  }

  const handleSaveDraft = async () => {
    toast.loading('Saving draft...')
    try {
      await saveDraft(testId)
      toast.success('Test saved as draft')
      navigate('/tests')
    } catch (error: any) {
      toast.error(error.message)
    }
    finally {
      toast.dismiss()
    }
  }







  // ✅ Show error only when field is touched
  const err = (field: keyof typeof INITIAL_VALUES) =>
    touched[field] && errors[field] ? (
      <p className="text-[11px] text-red-500 mt-1">{errors[field]}</p>
    ) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* ── Left ── */}
      <div className="lg:col-span-8 flex flex-col gap-5">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 border-l-4 border-[#2c1452] pl-3">
              <Paragraph className="font-bold text-[#2c1452] !text-base">Add Questions</Paragraph>
            </div>

            {/* Manual entry vs Excel import */}
            <div className="flex items-center gap-1 bg-[#F2F4F6] rounded-full p-1">
              {([
                { key: 'manual', label: 'Add Manually' },
                { key: 'import', label: 'Import from Excel' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => switchMode(tab.key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors
                      ${mode === tab.key
                      ? 'bg-[#2c1452] text-white'
                      : 'text-[#767683] hover:text-[#2c1452]'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          {mode === 'manual' && (
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
          )}

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
              <Paragraph className="!text-sm font-semibold text-[#2c1452] mt-1">
                {preselectedMaterialTitle}
              </Paragraph>
            </div>
          )}

          {hasPreselectedModule && preselectedModuleTitle && !needsModuleSelect && (
            <div className="rounded-xl bg-[#F2F4F6] px-4 py-3">
              <Paragraph className="!text-xs font-bold text-[#767683] uppercase tracking-wide">
                Module
              </Paragraph>
              <Paragraph className="!text-sm font-semibold text-[#2c1452] mt-1">
                {preselectedModuleTitle}
              </Paragraph>
            </div>
          )}

          {/* MCQ options + correct answer */}
          {mode === 'manual' && (
          <>
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
              <Paragraph className="!text-xs font-bold text-[#2c1452]">
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
                        ? 'bg-[#2c1452] text-white border-[#2c1452]'
                        : 'bg-white text-[#2c1452] border-[#2c1452]/20 hover:bg-[#2c1452]/10'
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
          </>
          )}

          {/* ── Import questions from Excel ── */}
          {mode === 'import' && (
            <div className="flex flex-col gap-4">

              {/* Step 1 — sample format */}
              <div className="rounded-xl border border-[#2c1452]/15 bg-[#F2F4F6] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet size={18} className="text-[#2c1452] mt-0.5 shrink-0" />
                  <div>
                    <Paragraph className="!text-sm font-bold text-[#2c1452]">
                      Download the sample format
                    </Paragraph>
                    <Paragraph className="!text-xs text-[#767683] mt-0.5">
                      One question per row, four options and the correct answer (A–D). Up to {MAX_IMPORT_ROWS} questions.
                    </Paragraph>
                  </div>
                </div>
                <Button
                  variant="white"
                  className="!h-9 !text-xs !px-4 whitespace-nowrap"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloadingTemplate}
                >
                  {isDownloadingTemplate ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Download size={14} />
                      Sample .xlsx
                    </>
                  )}
                </Button>
              </div>

              {/* Step 2 — upload the filled file */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragging(false)
                  handleFileSelect(e.dataTransfer.files?.[0])
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed px-4 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                    ${isDragging
                    ? 'border-[#2c1452] bg-[#2c1452]/5'
                    : 'border-gray-200 hover:border-[#2c1452]/40 hover:bg-[#F2F4F6]'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={e => handleFileSelect(e.target.files?.[0])}
                />
                <Upload size={20} className="text-[#767683]" />
                <Paragraph className="!text-sm font-bold text-[#2c1452]">
                  Drop your .xlsx file here, or click to browse
                </Paragraph>
                <Paragraph className="!text-xs text-[#767683]">
                  Only .xlsx files created from the sample format are accepted
                </Paragraph>
              </div>

              {/* Selected file */}
              {importFile && (
                <div className="rounded-xl bg-[#F2F4F6] px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSpreadsheet size={16} className="text-[#2c1452] shrink-0" />
                    <Paragraph className="!text-sm font-semibold text-[#2c1452] truncate">
                      {importFile.name}
                    </Paragraph>
                  </div>
                  <button
                    type="button"
                    onClick={resetImport}
                    className="p-1.5 rounded-lg hover:bg-white transition-colors text-[#767683] shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Result of the last import */}
              {importResult && (
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 flex flex-col gap-2">
                  <Paragraph className="!text-sm font-bold text-[#2c1452]">
                    Imported {importResult.imported} of {importResult.total} row{importResult.total > 1 ? 's' : ''}
                  </Paragraph>

                  {importResult.skipped?.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={13} className="text-red-500" />
                        <Paragraph className="!text-xs font-bold text-red-500">
                          {importResult.skipped.length} row(s) skipped
                        </Paragraph>
                      </div>
                      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                        {importResult.skipped.map(skipped => (
                          <p key={skipped.row} className="text-[11px] text-[#767683]">
                            <span className="font-bold text-[#2c1452]">Row {skipped.row}</span> — {skipped.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  className="!h-10 !text-sm !px-5"
                  onClick={handleImportQuestions}
                  disabled={!importFile || isImportingQuestions}
                >
                  {isImportingQuestions ? <Loader2 className="animate-spin" /> : 'Import Questions'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Added questions list */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <Paragraph className="!text-xs font-bold text-[#767683] uppercase tracking-widest">
              Added Questions ({questions.length})
            </Paragraph>
            <div className="flex flex-col divide-y divide-gray-100">
              {questions.map((q: any, i: number) => (
                <div key={q.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#767683] shrink-0">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <div>
                      <Paragraph className="!text-sm font-bold text-[#2c1452]">{q.question}</Paragraph>
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
                            <span className="text-[10px] font-bold text-[#2c1452] uppercase">
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
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <Button variant="primary" className="whitespace-nowrap" disabled={isPublishingTest} fullWidth onClick={handlePublishTest}>
            {isPublishingTest ? <Loader2 className="animate-spin" /> :
              <>
                Publish
                <IoRocketOutline size={18} />
              </>
            }

          </Button>
          <Button variant="white" className="whitespace-nowrap" fullWidth disabled={isSavingDraft} onClick={handleSaveDraft}>
            {isSavingDraft ? <Loader2 className="animate-spin" /> : '🖫 Save Draft'}
          </Button>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 text-sm text-[#767683] font-bold hover:text-[#2c1452] transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={15} />
            Back to General Info
          </button>
        </div>

        {/* Pro Tip */}
        <div className="bg-[#F2F4F6] rounded-2xl p-4 flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[#2c1452]">💡</span>
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