import { useState } from 'react'
import { IdCard } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import OnboardingLayout from './OnboardingLayout'
import { Select, Button, Subheading, Paragraph } from '@/components/ui'
import { UploadBox } from '@/components/features/UploadBox'
import { IdVerificationData } from './index'
import { idVerificationSchema } from '@/utils/validator/auth.validator'
import { storageService } from '@/services/storageService'
import { IoMdArrowForward } from "react-icons/io"

interface Props {
    data: IdVerificationData
    onChange: (data: IdVerificationData) => void
    onNext: () => void
    onBack: () => void
    animClass?: string
}

const documentTypes = [
    { value: '', label: 'Select Document Type' },
    { value: 'aadhar_card', label: 'Aadhar Card' },
    { value: 'license', label: 'Driving License' },
    { value: 'passport', label: 'Passport' },
    { value: 'voter_id', label: 'Voter ID' },
]

const IdVerificationStep = ({ data, onChange, onNext, onBack, animClass = '' }: Props) => {
    const [preview, setPreview] = useState<string | null>(data.document_url || null)
    const [uploading, setUploading] = useState(false)

    const formik = useFormik<IdVerificationData>({
        initialValues: data,
        validationSchema: idVerificationSchema,
        onSubmit: (values) => {
            onChange(values)
            console.log("id verification values", values)
            onNext()
        },
    })

    const err = (field: keyof IdVerificationData) =>
        formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined

    const handleFile = async (file: File) => {
        setPreview(URL.createObjectURL(file))
        formik.setFieldValue('fileName', file.name)
        formik.setFieldValue('fileSize', `${(file.size / 1024 / 1024).toFixed(1)} MB`)

        setUploading(true)
        try {
            const publicUrl = await storageService.uploadCourseCover(file)
            formik.setFieldValue('document_url', publicUrl)
            toast.success('ID document uploaded')
        } catch (error: any) {
            toast.error(error?.message || 'Failed to upload ID document')
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

    const uploadError = err('document_url')

    return (
        <OnboardingLayout
            step={3}
            total={5}
            title="ID Verification"
            subtitle="Please upload an original government-issued ID document to verify your identity. This helps us keep the platform secure for everyone."
            backLabel="Back to Academic"
            onBack={onBack}
            animClass={animClass}
        >
            <form onSubmit={formik.handleSubmit} className="w-full max-w-4xl">
                <div className="bg-white rounded-xl border-2 border-dotted border-gray-200 p-5">
                    <Subheading className='text-[#000B60] font-bold'>Identity Document</Subheading>
                    <Paragraph className='mb-4 text-gray-500'>Choose your document type and upload a clear, original copy.</Paragraph>

                    <div className="flex flex-col gap-4">

                        <Select
                            label="Document Type"
                            id="document_type"
                            value={formik.values.document_type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            options={documentTypes}
                            error={err('document_type')}
                        />

                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-gray-700">Upload Document</span>
                            <UploadBox
                                accept="image/jpeg,image/png,image/webp"
                                preview={preview}
                                previewType="image"
                                icon={<IdCard size={20} />}
                                title="ID Document"
                                hint="JPG, PNG or WEBP — clear, well-lit photo of your original ID"
                                loading={uploading}
                                onFile={handleFile}
                                onClear={handleClear}
                            />
                            {uploadError && (
                                <p className="text-xs text-red-500 font-medium mt-1">{uploadError}</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={uploading} loading={uploading}>
                                Continue <IoMdArrowForward />
                            </Button>
                        </div>

                    </div>
                </div>
            </form>
        </OnboardingLayout>
    )
}

export default IdVerificationStep
