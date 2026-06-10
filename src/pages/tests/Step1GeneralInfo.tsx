
import { ArrowRight, ChevronRight, Info, Loader2, MapPin } from 'lucide-react'
import { Input, Textarea, Select, Paragraph, Modal } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoAddCircleOutline } from "react-icons/io5";
import { useGetAllCourses, useGetAllFoldersInCourse, useGetAllContentInModule } from "@/hooks/useCourse"
import { useEffect, useState } from 'react';
import { useFormik } from 'formik'
import { testSchema } from '@/utils/validator/test.validator';


export type TestFormData = {
  title: string
  course: string
  module: string
  moduleTitle: string
  material: string
  materialTitle: string
  testType: string
  duration: string
  instructions: string

}

interface Props {
  form: TestFormData
  update: (f: TestFormData) => void
  onNext: () => void
  onSaveDraft: () => void
  isSubmiting: boolean
  setIsDraft: (isDraft: boolean) => void
  testData: any
}

// const courseOptions = [{ value: 'math301', label: 'Mathematics 301' }, { value: 'taxation', label: 'Taxation' }, { value: 'biz_laws', label: 'Business Laws' }]
const testTypeOptions = [{ value: 'final', label: 'Final Examination' }, { value: 'midterm', label: 'Mid-Term' }, { value: 'quiz', label: 'Quiz' }]
const durationOptions = [{ value: '', label: 'Select Duration' }, { value: '30', label: '30 mins' }, { value: '60', label: '1 hour' }, { value: '90', label: '1h 30 mins' }, { value: '120', label: '2 hours' }]

const getLabel = (options: { value: string; label: string }[], value: string) =>
  options.find(option => option.value === value)?.label

const getPlacementInfo = (
  values: TestFormData,
  courseOptions: { value: string; label: string }[],
  moduleOptions: { value: string; label: string }[],
  materialOptions: { value: string; label: string }[],
) => {
  const courseName = getLabel(courseOptions, values.course)
  const moduleName = getLabel(moduleOptions, values.module)
  const materialName = getLabel(materialOptions, values.material)

  if (values.material && materialName) {
    return {
      message: `This test will appear under the material "${materialName}" within the module "${moduleName}" in the course "${courseName}".`,
      path: [courseName, moduleName, materialName].filter(Boolean) as string[],
    }
  }

  if (values.module && moduleName) {
    return {
      message: `This test will appear under the module "${moduleName}" in the course "${courseName}".`,
      path: [courseName, moduleName].filter(Boolean) as string[],
    }
  }

  if (values.course && courseName) {
    return {
      message: `This test will appear under the course "${courseName}".`,
      path: [courseName].filter(Boolean) as string[],
    }
  }

  return {
    message: 'Select a course to see where this test will appear.',
    path: [] as string[],
  }
}

const Step1GeneralInfo = ({ form, update, onNext, onSaveDraft, isSubmiting, setIsDraft, testData }: Props) => {



  const [courseOptions, setCourseOptions] = useState<{ value: string; label: string }[]>([])
  const [moduleOptions, setModuleOptions] = useState<{ value: string; label: string }[]>([])
  const [courseId, setCourseId] = useState<string>("")
  const [moduleId, setModuleId] = useState<string>("")
  const [materialOptions, setMaterialOptions] = useState<{ value: string; label: string }[]>([])
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [activeBtn, setActiveBtn] = useState<'draft' | 'next' | null>("next")
  const [showPlacementModal, setShowPlacementModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'draft' | 'next' | null>(null)


  // query
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses("all", "", true)
  const { data: folders, isLoading: foldersLoading } = useGetAllFoldersInCourse(courseId, !!courseId)
  const { data: contentData, isLoading: materialsLoading } = useGetAllContentInModule(moduleId, !!moduleId)

  console.log("courseId", courseId)

  console.log("folders", folders)

  useEffect(() => {
    if (courses) {
      setCourseOptions(courses.data.map((course: any) => ({ value: course.id, label: course.title })))
    }
  }, [courses])

  useEffect(() => {
    if (folders) {
      setModuleOptions(folders.data.map((folder: any) => ({ value: folder.id, label: folder.title })))
    }
  }, [folders])

  useEffect(() => {
    const materials = contentData?.data ?? contentData?.json?.data ?? []
    setMaterialOptions(materials.map((material: any) => ({ value: material.id, label: material.title })))
  }, [contentData])

  useEffect(() => {
    if (testData) {
      setIsEdit(true)
      formik.setValues({
        title: testData?.data?.title,
        course: testData?.data?.course_id,
        module: testData?.data?.module_id,
        moduleTitle: testData?.data?.module_title ?? '',
        material: testData?.data?.material_id ?? '',
        materialTitle: testData?.data?.material_title ?? '',
        testType: testData?.data?.type,
        duration: testData?.data?.duration_minutes,
        instructions: testData?.data?.instructions,
      })
      if (testData?.data?.course_id) {
        setCourseId(testData?.data?.course_id)
      }
      if (testData?.data?.module_id) {
        setModuleId(testData?.data?.module_id)
      }
      console.log("testData", testData)
    }
  }, [testData])

  console.log("test page", courses)


  const formik = useFormik({
    initialValues: form,
    validationSchema: testSchema,
    onSubmit: (values) => {
      update(values)
    }
  })

  const placement = getPlacementInfo(formik.values, courseOptions, moduleOptions, materialOptions)

  const handleActionClick = async (action: 'next' | 'draft') => {
    const errors = await formik.validateForm()
    formik.setTouched({
      title: true,
      course: true,
      module: true,
      material: true,
      testType: true,
      duration: true,
      instructions: true,
    })
    if (Object.keys(errors).length > 0) return

    setActiveBtn(action)
    setPendingAction(action)
    setShowPlacementModal(true)
  }

  const handleConfirmPlacement = () => {
    setShowPlacementModal(false)
    if (pendingAction === 'draft') setIsDraft(true)
    formik.submitForm()
    setPendingAction(null)
  }

  const closePlacementModal = () => {
    setShowPlacementModal(false)
    setPendingAction(null)
  }


  return (


    <div className="grid grid-cols-12 gap-6">

      {/* ── Left form ── */}
      <div className="col-span-8 flex flex-col gap-5">

        {/* General Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-l-4 border-[#2c1452] pl-3">
            <Paragraph className="font-bold text-[#2c1452] !text-base">General Information</Paragraph>
          </div>

          {!isEdit && (
            <p className="flex items-start gap-2 text-sm text-[#767683] leading-relaxed font-semibold">
              <Info size={18} className="text-[#00A6BF] shrink-0 mt-0.5" />
              <span>You can create this test under a course, module, or material.</span>
            </p>
          )}

          <Input
            label="Test Title"
            placeholder="e.g., Midterm Assessment - Advanced Calculus"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && formik.errors.title ? formik.errors.title : undefined}

          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Course"
              options={courseOptions}
              placeholder="Select course"
              value={formik.values.course}
              onChange={e => {
                setCourseId(e.target.value)
                setModuleId("")
                formik.setFieldValue('course', e.target.value)
                formik.setFieldValue('module', '')
                formik.setFieldValue('moduleTitle', '')
                formik.setFieldValue('material', '')
                formik.setFieldValue('materialTitle', '')
                setModuleOptions([])
                setMaterialOptions([])
              }}
              loading={coursesLoading}
              disabled={isEdit || coursesLoading}
              error={formik.touched.course && formik.errors.course ? formik.errors.course : undefined}
            />

            <Select
              label="Module"
              options={moduleOptions}
              placeholder="Select module"
              value={formik.values.module}
              loading={!!courseId && foldersLoading}
              disabled={isEdit || !courseId || foldersLoading}
              onChange={e => {
                const selectedModule = moduleOptions.find(option => option.value === e.target.value)
                setModuleId(e.target.value)
                formik.setFieldValue('module', e.target.value)
                formik.setFieldValue('moduleTitle', selectedModule?.label || '')
                formik.setFieldValue('material', '')
                formik.setFieldValue('materialTitle', '')
                setMaterialOptions([])
              }}
            />
          </div>

          <Select
            label="Material"
            options={materialOptions}
            placeholder={materialsLoading ? 'Loading materials...' : 'Select material'}
            value={formik.values.material}
            loading={!!moduleId && materialsLoading}
            disabled={isEdit || !moduleId || materialsLoading}
            onChange={e => {
              const selectedMaterial = materialOptions.find(option => option.value === e.target.value)
              formik.setFieldValue('material', e.target.value)
              formik.setFieldValue('materialTitle', selectedMaterial?.label || '')
            }}
            error={formik.touched.material && formik.errors.material ? formik.errors.material : undefined}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Test Type"
              options={testTypeOptions}
              placeholder="Select type"
              name="testType"
              value={formik.values.testType}
              onChange={formik.handleChange}
              error={formik.touched.testType && formik.errors.testType ? formik.errors.testType : undefined}
            />
            <Select
              label="Duration"
              options={durationOptions}
              name="duration"
              value={formik.values.duration}
              onChange={formik.handleChange}
              error={formik.touched.duration && formik.errors.duration ? formik.errors.duration : undefined}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-l-4 border-[#2c1452] pl-3">
            <Paragraph className="font-bold text-[#2c1452] !text-base">Instructions</Paragraph>
          </div>
          <Textarea
            placeholder="Outline the guidelines for students..."
            rows={5}
            name="instructions"
            value={formik.values.instructions}
            onChange={formik.handleChange}
            error={formik.touched.instructions && formik.errors.instructions ? formik.errors.instructions : undefined}
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
          <Button variant="primary" disabled={isSubmiting} onClick={() => handleActionClick('next')} fullWidth >
            {isSubmiting && activeBtn === 'next'
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Add Questions</span><ArrowRight size={18} /></>}
          </Button>
          <Button variant="white" disabled={isSubmiting} fullWidth onClick={() => handleActionClick('draft')}>
            {isSubmiting && activeBtn === 'draft'
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Save Draft</span></>}
          </Button>
        </div>
      </div>

      <Modal
        open={showPlacementModal}
        onClose={closePlacementModal}
        title="Where will this test appear?"
        footer={
          <>
            <Button variant="white" className="!h-10" onClick={closePlacementModal} disabled={isSubmiting}>
              Cancel
            </Button>
            <Button variant="primary" className="!h-10" onClick={handleConfirmPlacement} disabled={isSubmiting}>
              {isSubmiting
                ? <Loader2 size={16} className="animate-spin" />
                : pendingAction === 'draft' ? 'Save Draft' : 'Continue'}
            </Button>
          </>
        }
      >
        <Paragraph className="!text-sm text-gray-600 leading-relaxed">
          {placement.message}
        </Paragraph>

        {placement.path.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap rounded-xl bg-[#F2F4F6] px-4 py-3">
            <MapPin size={16} className="text-[#2c1452] shrink-0" />
            {placement.path.map((segment, index) => (
              <span key={segment} className="flex items-center gap-2 text-sm font-semibold text-[#2c1452]">
                {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
                {segment}
              </span>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Step1GeneralInfo
