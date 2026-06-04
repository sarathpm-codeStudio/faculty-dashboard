import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ArrowRight, Image, Video, Upload, Loader2 } from 'lucide-react'
import { Button, Input, Textarea, Select, ImageCropperModal, Skeleton } from '@/components/ui'
import type { CourseFormData } from './index'
import { useFormik } from 'formik'
import { courseBasicDetailsSchema } from '@/utils/validator/course.validator'
import { storageService } from '@/services'
import { toast } from 'sonner'
import { courseService } from "@/services/courseService"
import { tpstreamsUploadService } from '@/services/tpstreamsUploadService' // ← ADD THIS
import { UploadBox } from '@/components/features/UploadBox'
import {
  ASPECT_RATIO_16_9,
  dataUrlToFile,
  getImageDimensions,
  isAspectRatio16x9,
} from '@/utils/imageAspectRatio'

interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  setIsDraft: (isDraft: boolean) => void
  isSubmitting?: boolean
  isEdit?: boolean
  courseId?: any
  vidPreviewUrl?: string | null
  onVidPreviewChange?: (url: string | null) => void
  courseDetails?: any
  isLoadingCourseDetails?: boolean
}

const categoryOptions = ['CMA', 'CA', 'CFA', 'MBA', 'CPA', 'ACCA']
const levelOptions = ['Beginner', 'Intermediate', 'Advanced']
const languageOptions = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Arabic']


const Step1BasicDetails = ({ form, update, setIsDraft, isSubmitting = false, isEdit, courseId, vidPreviewUrl, onVidPreviewChange, courseDetails, isLoadingCourseDetails }: Props) => {
  const [coverUploading, setCoverUploading] = useState(false)
  const [imgPreview, setImgPreview] = useState<string | null>(
    form.cover_image ? URL.createObjectURL(form.cover_image) : null
  )
  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null)
  const [coverCropperOpen, setCoverCropperOpen] = useState(false)
  const [vidPreview, setVidPreview] = useState<string | null>(vidPreviewUrl ?? null)
  const [videoTranscodeStatus, setVideoTranscodeStatus] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [activeBtn, setActiveBtn] = useState<'draft' | 'next' | null>(null)

  // ─── Video upload states ──────────────────────────────
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(vidPreviewUrl ? 'done' : 'idle')

  // ✅ NO useEffect for SDK — already initialized in App.tsx
  // ✅ NO uploaderRef — managed by global service
  // ✅ NO initSDK function — managed by global service

  // ─── Handle video file selected ──────────────────────
  const handleVideoFile = (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setVidPreview(previewUrl)
    onVidPreviewChange?.(previewUrl)
    setUploadStatus('uploading')
    setUploadProgress(0)

    // ✅ Use global service — survives navigation
    tpstreamsUploadService.upload(file, formik.values.unique_Id, "intro", {
      onProgress: (percentage) => {
        setUploadProgress(percentage)
      },
      onStatus: (status) => {
        setUploadStatus(status)
      },
      onSuccess: (assetId) => {
        formik.setFieldValue('intro_video_asset_id', assetId)
        setUploadStatus('done')
        toast.success('Intro video uploaded successfully')
      },
      onError: () => {
        setUploadStatus('failed')
        toast.error('Video upload failed')
      },
    })
  }

  const formik = useFormik({
    initialValues: form,
    validationSchema: courseBasicDetailsSchema,
    onSubmit: (values) => {
      update(values)
    },
  })

  useEffect(() => {
    if (courseDetails) {
      console.log("edit data", courseDetails)
      const assetId = courseDetails?.data?.video_asset_id
      const transcodeStatus = courseDetails?.data?.video_uploading_status
      if (assetId) {
        const orgId = import.meta.env.VITE_TPSTREAMS_ORG_ID
        const accessToken = import.meta.env.VITE_TPSTREAMS_ACCESS_TOKEN
        const embedUrl = `https://app.tpstreams.com/embed/${orgId}/${assetId}/?access_token=${accessToken}`
        setVidPreview(embedUrl)
        onVidPreviewChange?.(embedUrl)
        setUploadStatus('done')
        setVideoTranscodeStatus(transcodeStatus || null)
      }
      formik.setValues({
        ...form,
        title: courseDetails?.data?.title || "",
        unique_Id: courseDetails?.data?.unique_id || "",
        description: courseDetails?.data?.description || "",
        category: courseDetails?.data?.category || "",
        level: courseDetails?.data?.level || "",
        languages: courseDetails?.data?.languages || [],
        cover_image_url: courseDetails?.data?.cover_image || null,
        intro_video_url: courseDetails?.data?.intro_video_url || null,
      })
      if (assetId) {
        formik.setFieldValue('intro_video_asset_id', assetId)
      }
      if (courseDetails?.data?.cover_image) {
        setImgPreview(courseDetails.data.cover_image)
      }
    }
  }, [courseDetails])

  const coverPreview =
    imgPreview ?? formik.values.cover_image_url ?? courseDetails?.data?.cover_image ?? null

  const handleCoverFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a JPEG, PNG, or WebP image')
      return
    }

    try {
      const { width, height } = await getImageDimensions(file)
      if (!isAspectRatio16x9(width, height)) {
        toast.info('Image is not 16:9. Crop it to fit the frame below.')
      }
    } catch {
      toast.error('Could not read image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setRawCoverImage(reader.result as string)
      setCoverCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCoverCropSave = async (cropped: string) => {
    setCoverCropperOpen(false)
    setRawCoverImage(null)
    setImgPreview(cropped)

    const file = dataUrlToFile(cropped, `cover-${Date.now()}.jpg`)
    formik.setFieldValue('cover_image', file)
    setCoverUploading(true)

    try {
      const url = await storageService.uploadCourseCover(file)
      formik.setFieldValue('cover_image_url', url)
      toast.success('Cover image uploaded')
    } catch (error) {
      console.log('file uploading error', error)
      toast.error('Failed to upload cover image')
      formik.setFieldValue('cover_image_url', null)
      formik.setFieldValue('cover_image', null)
      setImgPreview(null)
    } finally {
      setCoverUploading(false)
    }
  }

  const handleCoverCropCancel = () => {
    setCoverCropperOpen(false)
    setRawCoverImage(null)
  }

  const handleCoverClear = () => {
    formik.setFieldValue('cover_image', null)
    formik.setFieldValue('cover_image_url', null)
    setImgPreview(null)
  }

  if (isEdit && isLoadingCourseDetails) {
    return (
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="aspect-video w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-32 w-full max-w-xl" />
      </div>
    )
  }

  const toggleLang = (lang: string) => {
    const next = formik.values.languages.includes(lang)
      ? formik.values.languages.filter((l) => l !== lang)
      : [...formik.values.languages, lang]
    formik.setFieldValue('languages', next)
    formik.setFieldTouched('languages', true, false)
  }

  const getVideoBlockedMessage = () => {
    if (!videoTranscodeStatus) return null
    const status = String(videoTranscodeStatus).toUpperCase()
    if (status === 'COMPLETED') return null
    if (status === 'UPLOADED') return 'Waiting for transcoding'
    return `Can't play video — status: ${status}`
  }
  const videoBlockedMessage = getVideoBlockedMessage()

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="grid grid-cols-12 gap-6 items-stretch">

        {/* ── Left: form card (8 cols) ── */}
        <div className="col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col gap-5">

          <Input
            label="Course Name"
            name="title"
            placeholder="e.g. Cost Accounting"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && formik.errors.title ? formik.errors.title : undefined}
            maxLength={120}
            showCount
          />

          <div className="flex-1 flex flex-col">
            <Textarea
              label="Description"
              name="description"
              placeholder="Provide a comprehensive summary of what students will achieve..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description ? formik.errors.description : undefined}
              maxLength={5000}
              showCount
              className="flex-1 min-h-[90px] h-[calc(100%-32px)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              placeholder="Select category"
              options={categoryOptions.map((o) => ({ value: o, label: o }))}
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category && formik.errors.category ? formik.errors.category : undefined}
            />
            <Select
              label="Level"
              name="level"
              placeholder="Select level"
              options={levelOptions.map((o) => ({ value: o, label: o }))}
              value={formik.values.level}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.level && formik.errors.level ? formik.errors.level : undefined}
            />
          </div>

          {/* Instruction Language */}
          <div className="relative">
            <p className="text-sm font-bold text-gray-700 mb-1.5">Instruction Language</p>
            <div
              className={`flex flex-wrap items-center gap-2 min-h-[56px] px-3 py-2.5 bg-[#F2F4F6] border rounded-xl cursor-pointer transition-colors ${formik.touched.languages && formik.errors.languages
                ? 'border-red-400'
                : 'border-gray-100'
                }`}
              onClick={() => setLangOpen((o) => !o)}
            >
              {formik.values.languages.length === 0 && (
                <span className="text-base text-gray-400 font-medium">Select languages</span>
              )}
              {formik.values.languages.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#BCC2FF] text-[#000B60] text-xs font-semibold rounded-full"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleLang(lang) }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <ChevronDown
                size={16}
                className={`ml-auto text-gray-400 shrink-0 transition-transform ${langOpen ? 'rotate-180' : ''}`}
              />
            </div>
            {formik.touched.languages && formik.errors.languages && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.languages as string}</p>
            )}
            {langOpen && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg p-2 flex flex-wrap gap-2">
                {languageOptions.map((lang) => {
                  const active = formik.values.languages.includes(lang)
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLang(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${active
                        ? 'bg-[#000B60] text-white border-[#000B60]'
                        : 'bg-[#F2F4F6] text-gray-600 border-gray-100 hover:border-[#000B60]'
                        }`}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: uploads + actions (4 cols) ── */}
        <div className="col-span-4 flex flex-col gap-3">

          {/* Cover Image */}
          <UploadBox
            accept="image/jpeg,image/png,image/webp"
            preview={coverPreview}
            previewType="image"
            aspectRatio={ASPECT_RATIO_16_9}
            icon={<Image size={20} />}
            title="Cover Image"
            hint="JPEG or PNG — 16:9 required (e.g. 1920×1080)"
            loading={coverUploading}
            onFile={handleCoverFile}
            onClear={handleCoverClear}
          />

          {/* ── Intro Video Upload ── */}
          <UploadBox
            accept="video/mp4,video/webm,video/mov"
            preview={vidPreview}
            previewType="video"
            icon={<Video size={20} />}
            title="Intro Video"
            hint="MP4, WebM or MOV — max 200 MB"
            loading={
              uploadStatus === 'uploading' ||
              uploadStatus === 'saving'
            }
            videoBlockedMessage={videoBlockedMessage}
            onFile={handleVideoFile}
            onClear={() => {
              formik.setFieldValue('intro_video_asset_id', null)
              setVidPreview(null)
              onVidPreviewChange?.(null)
              setUploadStatus('idle')
              setUploadProgress(0)
              setVideoTranscodeStatus(null)
            }}
          />

          {/* Progress bar */}
          {uploadStatus === 'uploading' && (
            <div style={{ marginTop: 4 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: '#6B7280',
                marginBottom: 4,
              }}>
                <span>Uploading video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{
                width: '100%',
                background: '#E5E7EB',
                borderRadius: 8,
                height: 6,
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: 6,
                  background: '#000B60',
                  borderRadius: 8,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* Saving */}
          {uploadStatus === 'saving' && (
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
              ⚙️ Saving video info...
            </p>
          )}

          {/* Done */}
          {uploadStatus === 'done' && (
            <p style={{ fontSize: 12, color: '#10B981', marginTop: 4 }}>
              ✅ Video uploaded! Processing in background.
            </p>
          )}

          {/* Failed */}
          {uploadStatus === 'failed' && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>
              ❌ Upload failed — please try again.
            </p>
          )}

          {/* ── Action buttons ── */}
          <div className="flex flex-col gap-3 mt-auto pt-1">
            <Button
              variant="white"
              onClick={() => { setIsDraft(true); setActiveBtn('draft') }}
              fullWidth
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && activeBtn === 'draft'
                ? <Loader2 size={16} className="animate-spin" />
                : 'Save as draft'}
            </Button>
            <Button
              variant="primary"
              fullWidth
              type="submit"
              disabled={isSubmitting}
              onClick={() => setActiveBtn('next')}
            >
              {isSubmitting && activeBtn === 'next'
                ? <Loader2 size={16} className="animate-spin" />
                : <><span>Add Content</span><ArrowRight size={18} /></>}
            </Button>
          </div>
        </div>
      </div>

      <ImageCropperModal
        open={coverCropperOpen}
        image={rawCoverImage}
        onClose={handleCoverCropCancel}
        onSave={handleCoverCropSave}
        title="Crop cover image (16:9)"
        aspect={ASPECT_RATIO_16_9}
        cropShape="rect"
        outputType="image/jpeg"
        saveLabel="Use cover image"
        hint="Position and zoom your image. The frame is fixed to 16:9 — same as the course card preview."
      />
    </form>
  )
}

export default Step1BasicDetails