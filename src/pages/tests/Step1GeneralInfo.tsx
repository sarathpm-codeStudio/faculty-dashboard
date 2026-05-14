
import { ArrowRight, Loader2 } from 'lucide-react'
import { Input, Textarea, Select, Paragraph } from '@/components/ui'
import Button from '@/components/ui/Button'
import { IoAddCircleOutline } from "react-icons/io5";
import { useGetAllCourses, useGetAllFoldersInCourse } from "@/hooks/useCourse"
import { useEffect, useState } from 'react';
import { useFormik } from 'formik'
import { testSchema } from '@/utils/validator/test.validator';


export type TestFormData = {
  title: string
  course: string
  module: string
  testType: string
  totalMarks: string
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
const marksOptions = [{ value: '', label: 'Select Marks' }, { value: '25', label: '25' }, { value: '50', label: '50' }, { value: '100', label: '100' }]
const durationOptions = [{ value: '', label: 'Select Duration' }, { value: '30', label: '30 mins' }, { value: '60', label: '1 hour' }, { value: '90', label: '1h 30 mins' }, { value: '120', label: '2 hours' }]

const Step1GeneralInfo = ({ form, update, onNext, onSaveDraft, isSubmiting, setIsDraft, testData }: Props) => {



  const [courseOptions, setCourseOptions] = useState<{ value: string; label: string }[]>([])
  const [moduleOptions, setModuleOptions] = useState<{ value: string; label: string }[]>([])
  const [courseId, setCourseId] = useState<string>("")
  const [moduleId, setModuleId] = useState<string>("")
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [activeBtn, setActiveBtn] = useState<'draft' | 'next' | null>("next")
  const [testId, setTestId] = useState<string>("")


  // query
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses({ filter: false }, true)
  const { data: folders, isLoading: foldersLoading } = useGetAllFoldersInCourse(courseId, !!courseId)

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
    if (testData) {
      setIsEdit(true)
      formik.setValues({
        title: testData?.data?.title,
        course: testData?.data?.course_id,
        module: testData?.data?.module_id,
        testType: testData?.data?.type,
        totalMarks: testData?.data?.total_marks,
        duration: testData?.data?.duration_minutes,
        instructions: testData?.data?.instructions,
      })
      if (testData?.data?.course_id) {
        setCourseId(testData?.data?.course_id)
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


  return (


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
              }}
              disabled={isEdit}
              error={formik.touched.course && formik.errors.course ? formik.errors.course : undefined}
            />

            <Select
              label="Module"
              options={moduleOptions}
              placeholder="Select module"
              value={formik.values.module}
              disabled={isEdit}
              onChange={e => {
                setModuleId(e.target.value)
                formik.setFieldValue('module', e.target.value)
              }}
            />
            {/* <Input
              label="Chapter"
              placeholder="e.g., Differential Equations"
              value={form.chapter}
              onChange={e => update({ chapter: e.target.value })}
            /> */}
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              label="Total Marks"
              options={marksOptions}
              name="totalMarks"
              value={formik.values.totalMarks}
              onChange={formik.handleChange}
              error={formik.touched.totalMarks && formik.errors.totalMarks ? formik.errors.totalMarks : undefined}
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
          <div className="flex items-center gap-3 border-l-4 border-[#000B60] pl-3">
            <Paragraph className="font-bold text-[#000B60] !text-base">Instructions</Paragraph>
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
          <Button variant="primary" disabled={isSubmiting} onClick={() => { setActiveBtn('next'); formik.handleSubmit() }} fullWidth >
            {isSubmiting && activeBtn === 'next'
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Add Questions</span><ArrowRight size={18} /></>}
          </Button>
          <Button variant="white" disabled={isSubmiting} fullWidth onClick={() => { setActiveBtn('draft'); formik.handleSubmit(); setIsDraft(true) }}>
            {isSubmiting && activeBtn === 'draft'
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Save Draft</span></>}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Step1GeneralInfo
