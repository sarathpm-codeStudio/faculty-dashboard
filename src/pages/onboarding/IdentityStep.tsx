import { useRef, useState } from 'react'
import { Mail, Phone, Camera, ImagePlus, Trash2, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import OnboardingLayout from './OnboardingLayout'
import { Input, Textarea, Button, DateInput, ImageCropperModal } from '@/components/ui'
import { IdentityData, type OnboardingStepMode } from './index'
import { identitySchema } from '@/utils/validator/auth.validator'
import { storageService } from '@/services/storageService'
import { IoMdArrowForward } from "react-icons/io"

const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [meta, base64] = dataUrl.split(',')
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
    const binary = atob(base64)
    const arr = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
    return new File([arr], filename, { type: mime })
}

interface Props {
    data: IdentityData
    onChange: (data: IdentityData) => void
    onNext: () => void
    onBack: () => void
    animClass?: string
    mode?: OnboardingStepMode
}

const IdentityStep = ({ data, onChange, onNext, onBack, animClass = '', mode = 'onboarding' }: Props) => {
    const isEdit = mode === 'edit'
    const fileRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [rawImage, setRawImage] = useState<string | null>(null)
    const [cropperOpen, setCropperOpen] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(data.avatar_url || null)
    const [avatarUploading, setAvatarUploading] = useState(false)

    const formik = useFormik<IdentityData>({
        initialValues: data,
        validationSchema: identitySchema,
        onSubmit: (values) => {
            onChange(values)
            onNext()
        },
    })

    const err = (field: keyof IdentityData) =>
        formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onloadend = () => {
            setRawImage(reader.result as string)
            setCropperOpen(true)
        }
        reader.readAsDataURL(file)
    }

    const handleSaveCrop = async (cropped: string) => {
        setCropperOpen(false)
        setRawImage(null)
        setAvatarPreview(cropped)
        setAvatarUploading(true)
        try {
            const file = dataUrlToFile(cropped, `avatar-${Date.now()}.png`)
            const url = await storageService.uploadCourseCover(file)
            formik.setFieldValue('avatar_url', url)
            toast.success('Profile picture uploaded')
        } catch (error: any) {
            toast.error(error?.message || 'Failed to upload profile picture')
            formik.setFieldValue('avatar_url', '')
            setAvatarPreview(null)
        } finally {
            setAvatarUploading(false)
        }
    }

    const handleCancelCrop = () => {
        setCropperOpen(false)
        setRawImage(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleRemove = () => {
        formik.setFieldValue('avatar_url', '')
        setAvatarPreview(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleChange = () => fileRef.current?.click()

    const hasImage = !!avatarPreview

    return (
        <OnboardingLayout
            step={1}
            total={isEdit ? 2 : 5}
            title={isEdit ? 'Edit Basic Information' : 'Basic Information'}
            subtitle={
                isEdit
                    ? 'Update your personal details and profile photo. ID verification and policies cannot be changed here.'
                    : 'Welcome to the Academic Curator. To begin your journey as a faculty member, please provide your fundamental identification details.'
            }
            backLabel={isEdit ? 'Back to profile' : 'Back to Sign in'}
            onBack={onBack}
            animClass={animClass}
        >
            <form onSubmit={formik.handleSubmit} className="w-full max-w-4xl">
                <div className="bg-white rounded-xl border-2 border-dotted border-gray-200 p-6">
                    <div className="flex flex-col gap-5">

                        {/* Profile photo uploader */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-gray-700">Profile Photo</span>

                            {!hasImage ? (
                                <div
                                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onClick={handleChange}
                                    className={`border-2 border-dashed rounded-xl py-5 px-4 flex items-center gap-4 cursor-pointer transition-colors
                                        ${dragOver ? 'border-[#2c1452] bg-blue-50' : 'border-gray-200 hover:border-[#2c1452]'}`}
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#DFE0FF] flex items-center justify-center shrink-0">
                                        <ImagePlus size={26} className="text-[#2c1452]" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <p className="text-sm font-bold text-[#2c1452]">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-0.5">JPG or PNG (max. 2MB) — you can crop after upload</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl py-4 px-4 flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        <img
                                            src={avatarPreview!}
                                            alt="Profile"
                                            className="w-16 h-16 rounded-full object-cover border border-gray-100"
                                        />
                                        {avatarUploading ? (
                                            <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                                                <Loader2 size={18} className="text-[#2c1452] animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#2c1452] rounded-full flex items-center justify-center text-white">
                                                <Camera size={10} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#2c1452] truncate">
                                            {avatarUploading ? 'Uploading profile photo…' : 'Profile photo added'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {avatarUploading
                                                ? 'Please wait while we securely upload your image.'
                                                : 'Looks good — change or remove anytime'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleChange}
                                            disabled={avatarUploading}
                                            className="text-sm font-bold text-[#2c1452] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Change
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemove}
                                            disabled={avatarUploading}
                                            className="flex items-center gap-1 text-sm text-[#BA1A1A] hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={12} />
                                            <span className="font-bold">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                id="first_name"
                                value={formik.values.first_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter first name"
                                error={err('first_name')}
                            />
                            <Input
                                label="Last Name"
                                id="last_name"
                                value={formik.values.last_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter last name"
                                error={err('last_name')}
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            id="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="name@university.edu"
                            leftIcon={<Mail size={14} />}
                            error={err('email')}
                            disabled={isEdit}
                            readOnly={isEdit}
                            className={isEdit ? 'opacity-70 cursor-not-allowed' : ''}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                id="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="+91 98765 •••••"
                                leftIcon={<Phone size={14} />}
                                error={err('phone')}
                                disabled={isEdit}
                                readOnly={isEdit}
                                className={isEdit ? 'opacity-70 cursor-not-allowed' : ''}
                            />
                            <DateInput
                                label="Date of Birth"
                                value={formik.values.date_of_birth}
                                onChange={(val) => formik.setFieldValue('date_of_birth', val)}
                                onBlur={() => formik.setFieldTouched('date_of_birth', true)}
                                error={err('date_of_birth')}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <Textarea
                            label="Bio"
                            id="bio"
                            value={formik.values.bio}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Say Something About You"
                            rows={3}
                            error={err('bio')}
                            className="min-h-[200px]"
                        />

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={avatarUploading} loading={avatarUploading}>
                                Continue <IoMdArrowForward />
                            </Button>
                        </div>

                    </div>
                </div>
            </form>

            <ImageCropperModal
                open={cropperOpen}
                image={rawImage}
                onClose={handleCancelCrop}
                onSave={handleSaveCrop}
                title="Crop your profile photo"
            />
        </OnboardingLayout>
    )
}

export default IdentityStep
