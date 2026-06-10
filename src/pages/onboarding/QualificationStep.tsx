import { useState } from 'react'
import { Trash2, Eye, FileText, Download, GraduationCap } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import OnboardingLayout from './OnboardingLayout'
import { Input, Select, Button, Subheading, Paragraph, DateInput } from '@/components/ui'
import { UploadBox } from '@/components/features/UploadBox'
import { Qualification, type OnboardingStepMode } from './index'
import { qualificationFormSchema } from '@/utils/validator/auth.validator'
import { storageService } from '@/services/storageService'
import { IoMdArrowForward } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";

interface Props {
    qualifications: Qualification[]
    onChange: (q: Qualification[]) => void
    onNext: () => void | Promise<void>
    onBack: () => void
    animClass?: string
    mode?: OnboardingStepMode
    saving?: boolean
    /** When true (edit + rejected), Continue goes to ID step instead of saving. */
    showIdResubmitStep?: boolean
}

interface QualificationForm {
    type: string
    fieldOfStudy: string
    graduationYear: string
    teachingExperience: string
    document_url: string
    fileName: string
    fileSize: string
}

const CERTIFICATE_ACCEPT = 'application/pdf,.pdf'

const isPdfFile = (file: File) =>
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

const qualificationTypes = [
    { value: '', label: 'Select Qualification Type' },
    { value: 'Degree', label: 'Degree' },
    { value: 'Professional Course', label: 'Professional Course' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Masters', label: 'Masters' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Certificate', label: 'Certificate' },
]

const formatGraduationDisplay = (val: string) => {
    if (!val) return ''
    const iso = val.replace(/\s/g, '')
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const d = new Date(iso + 'T00:00:00')
        if (!Number.isNaN(d.getTime())) {
            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }
    }
    return val
}

const emptyForm = (): QualificationForm => ({
    type: '',
    fieldOfStudy: '',
    graduationYear: '',
    teachingExperience: '',
    document_url: '',
    fileName: '',
    fileSize: '',
})

const QualificationStep = ({
    qualifications,
    onChange,
    onNext,
    onBack,
    animClass = '',
    mode = 'onboarding',
    saving = false,
    showIdResubmitStep = false,
}: Props) => {
    const isEdit = mode === 'edit'
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [noQualError, setNoQualError] = useState(false)

    const existingQualifications = qualifications.filter((q) => q.isExisting)
    const newQualifications = qualifications.filter((q) => !q.isExisting)

    const formik = useFormik<QualificationForm>({
        initialValues: emptyForm(),
        validationSchema: qualificationFormSchema,
        onSubmit: (values, { resetForm }) => {
            onChange([
                ...qualifications,
                { ...values, id: `new-${Date.now()}`, isExisting: false },
            ])
            resetForm()
            setPreview(null)
            setNoQualError(false)
        },
    })

    const err = (field: keyof QualificationForm) =>
        formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined

    const handleFile = async (file: File) => {
        if (!isPdfFile(file)) {
            toast.error('Only PDF certificates are allowed')
            return
        }
        setPreview(null)
        formik.setFieldValue('fileName', file.name)
        formik.setFieldValue('fileSize', `${(file.size / 1024 / 1024).toFixed(1)} MB`)

        setUploading(true)
        try {
            const publicUrl = await storageService.uploadCourseCover(file)
            formik.setFieldValue('document_url', publicUrl)
            toast.success('Certificate uploaded')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to upload certificate'
            toast.error(message)
            formik.setFieldValue('document_url', '')
            formik.setFieldValue('fileName', '')
            formik.setFieldValue('fileSize', '')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleClear = () => {
        setPreview(null)
        formik.setFieldValue('document_url', '')
        formik.setFieldValue('fileName', '')
        formik.setFieldValue('fileSize', '')
    }

    const handleRemove = (id: string) =>
        onChange(qualifications.filter((q) => q.id !== id))

    const handleContinue = async () => {
        if (qualifications.length === 0) {
            setNoQualError(true)
            return
        }
        setNoQualError(false)
        await onNext()
    }

    return (
        <OnboardingLayout
            step={2}
            total={isEdit ? (showIdResubmitStep ? 3 : 2) : 5}
            title={isEdit ? 'Edit Academic Profile' : 'Academic Profile'}
            subtitle={
                isEdit
                    ? 'Remove saved qualifications or add new ones. Existing entries cannot be edited—only removed.'
                    : 'To tailor your platform experience, please provide your academic background and professional history.'
            }
            backLabel="Back to information"
            onBack={onBack}
            animClass={animClass}
        >
            <div className="w-full max-w-4xl flex flex-col gap-4">

                {isEdit && existingQualifications.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <Subheading className="text-[#2c1452] font-bold">Saved Qualifications</Subheading>
                        <Paragraph className="text-gray-500 -mt-2">
                            These are on your profile. You can remove them but not edit them.
                        </Paragraph>
                        {existingQualifications.map((q) => (
                            <QualificationCard
                                key={q.id}
                                q={q}
                                isExisting
                                onRemove={() => handleRemove(q.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Add Qualification card */}
                <div className="bg-white rounded-xl border-2 border-dotted border-gray-200 p-5">
                    <Subheading className='text-[#2c1452] font-bold'>Add New Qualification</Subheading>
                    <Paragraph className='mb-4 text-gray-500'>Fill in the details for your next academic degree.</Paragraph>

                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Qualification Type"
                                id="type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                options={qualificationTypes}
                                error={err('type')}
                            />
                            <Input
                                label="Field of Study"
                                id="fieldOfStudy"
                                value={formik.values.fieldOfStudy}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="e.g. Theoretical Physics"
                                error={err('fieldOfStudy')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DateInput
                                label="Graduation Date"
                                value={formik.values.graduationYear}
                                onChange={(val: string) => formik.setFieldValue('graduationYear', val)}
                                onBlur={() => formik.setFieldTouched('graduationYear', true)}
                                error={err('graduationYear')}
                            />
                            <Input
                                label="Teaching Experience"
                                id="teachingExperience"
                                value={formik.values.teachingExperience}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="e.g. 2 Years"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-gray-700">Upload Certificate</span>
                            <UploadBox
                                accept={CERTIFICATE_ACCEPT}
                                preview={preview}
                                previewType="image"
                                icon={<FileText size={20} />}
                                title="Certificate (PDF)"
                                hint="PDF only (max. 10MB)"
                                loading={uploading}
                                onFile={handleFile}
                                onClear={handleClear}
                            />
                            {formik.values.fileName && (
                                <p className="text-xs font-medium text-[#2c1452]">{formik.values.fileName}</p>
                            )}
                            {err('document_url') && (
                                <p className="text-xs text-red-500 font-medium mt-1">{err('document_url')}</p>
                            )}
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button type="submit" variant="secondary" disabled={uploading} loading={uploading}>
                                <IoAddCircleOutline size={25} />
                                Add Qualification
                            </Button>
                        </div>
                    </form>
                </div>

                {isEdit && newQualifications.length > 0 && (
                    <Subheading className="text-[#2c1452] font-bold pt-2">New Qualifications</Subheading>
                )}

                {(isEdit ? newQualifications : qualifications).map((q) => (
                    <QualificationCard
                        key={q.id}
                        q={q}
                        isExisting={false}
                        onRemove={() => handleRemove(q.id)}
                    />
                ))}

                {noQualError && (
                    <p className="text-sm text-red-500 font-medium">
                        Please add at least one qualification before continuing.
                    </p>
                )}

                <div className="flex justify-end">
                    <Button
                        type="button"
                        onClick={handleContinue}
                        disabled={uploading || saving}
                        loading={saving}
                    >
                        {isEdit && !showIdResubmitStep ? 'Save changes' : 'Continue'} <IoMdArrowForward />
                    </Button>
                </div>

            </div>
        </OnboardingLayout>
    )
}

type QualificationCardProps = {
    q: Qualification
    isExisting: boolean
    onRemove: () => void
}

const QualificationCard = ({ q, isExisting, onRemove }: QualificationCardProps) => (
    <div className="rounded-xl bg-white p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#DFE0FF] rounded-lg flex items-center justify-center">
                    <GraduationCap size={15} className="text-[#2c1452]" />
                </div>
                <div>
                    <Subheading>{q.fieldOfStudy}</Subheading>
                    <Paragraph className="text-gray-500">{q.type}</Paragraph>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {isExisting && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#767683] bg-[#F2F4F6] px-2 py-1 rounded">
                        Saved
                    </span>
                )}
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex items-center gap-1 text-[14px] text-[#BA1A1A] hover:text-red-700"
                >
                    <Trash2 size={12} />
                    <span className="font-bold cursor-pointer">Remove</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            {[
                { label: 'Degree Type', value: q.type },
                { label: 'Field of Study', value: q.fieldOfStudy },
                { label: 'Graduation Date', value: formatGraduationDisplay(q.graduationYear) },
                { label: 'Teaching Experience', value: q.teachingExperience },
            ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-gray-700">{label}</span>
                    <div className="w-full px-4 py-4 bg-[#F2F4F6] rounded-lg border border-gray-100 text-base font-medium text-gray-700">
                        {value || <span className="text-gray-400">—</span>}
                    </div>
                </div>
            ))}
        </div>

        {(q.fileName || q.document_url) && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-[#F2F4F6] border border-gray-100 rounded-lg mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-50 rounded flex items-center justify-center border border-red-100">
                        <span className="text-red-500 text-[9px] font-bold">
                            <FileText size={20} />
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-700">{q.fileName}</p>
                        <p className="text-xs text-gray-400">
                            {isExisting ? 'On file' : 'Verified'} • {q.fileSize || '—'}
                        </p>
                    </div>
                </div>
                {q.document_url && (
                    <div className="flex items-center gap-3">
                        <a
                            href={q.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2c1452] font-bold"
                            aria-label="View certificate"
                        >
                            <Eye size={20} />
                        </a>
                        <a
                            href={q.document_url}
                            download={q.fileName}
                            className="text-[#2c1452] font-bold"
                            aria-label="Download certificate"
                        >
                            <Download size={20} />
                        </a>
                    </div>
                )}
            </div>
        )}
    </div>
)

export default QualificationStep
