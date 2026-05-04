import { useEffect, useRef, useState } from 'react'
import { X, ChevronDown, ArrowRight, Image, Video, Upload, Loader2 } from 'lucide-react'
import { Button, Input, Textarea, Select } from '@/components/ui'
import type { CourseFormData } from './index'
import { useFormik } from 'formik'
import { courseBasicDetailsSchema } from '@/utils/validator/course.validator'
import { storageService } from '@/services'
import { toast } from 'sonner'
import { useGetCourseById } from '@/hooks'
import { courseService } from "@/services/courseService"

interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  setIsDraft: (isDraft: boolean) => void
  isSubmitting?: boolean
  isEdit?: boolean
  courseId?: any
}

const categoryOptions = ['CMA', 'CA', 'CFA', 'MBA', 'CPA', 'ACCA']
const levelOptions = ['Beginner', 'Intermediate', 'Advanced']
const languageOptions = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Arabic']

interface UploadBoxProps {
  accept: string
  preview: string | null
  previewType: 'image' | 'video'
  icon: React.ReactNode
  title: string
  hint: string
  loading?: boolean
  onFile: (file: File) => void
  onClear: () => void
}

const UploadBox = ({ accept, preview, previewType, icon, title, hint, loading = false, onFile, onClear }: UploadBoxProps) => {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden h-[200px]
        ${drag ? 'border-[#000B60] bg-[#eef0ff]' : 'border-gray-200 bg-[#F8F9FB] hover:border-[#000B60]/40'}`}
    >
      {preview ? (
        <>
          {previewType === 'image' ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <video src={preview} className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 px-4 text-center select-none">
          <div className="w-9 h-9 rounded-xl bg-white shadow flex items-center justify-center text-[#000B60]">
            {icon}
          </div>
          <p className="text-xs font-semibold text-gray-600">{title}</p>
          <p className="text-[10px] text-gray-400 leading-snug">{hint}</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#000B60]">
            <Upload size={10} /> Click to upload or drag and drop
          </span>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2">
          <Loader2 size={22} className="text-[#000B60] animate-spin" />
          <p className="text-xs font-semibold text-[#000B60]">Uploading…</p>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        disabled={loading}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
    </div>
  )
}

const Step1BasicDetails = ({ form, update, setIsDraft, isSubmitting = false, isEdit, courseId }: Props) => {
  const [coverUploading, setCoverUploading] = useState(false)
  const [imgPreview, setImgPreview] = useState<string | null>(
    form.cover_image ? URL.createObjectURL(form.cover_image) : null
  )
  const [vidPreview, setVidPreview] = useState<string | null>(
    form.intro_video_url ? URL.createObjectURL(form.intro_video_url) : ""
  )
  const [langOpen, setLangOpen] = useState(false)
  const [activeBtn, setActiveBtn] = useState<'draft' | 'next' | null>(null)

  const uploaderRef = useRef<any>(null);

  // video setups
  // const [vidPreview, setVidPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus]: any = useState("");

  // ─── Load TPStreams SDK once ───────────────────────────
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.testpress.in/static/js/tpstreams-uploader.min.js';
    script.async = true;
    script.onload = () => initSDK();
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);


  // ─── Initialize SDK ───────────────────────────────────
  const initSDK = () => {
    const uploader = new (window as any).TpStreamsUploaderSDK(
      import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN,  // ← from .env ✅
      import.meta.env.VITE_TPSTREAMS_ORG_ID,
      {
        contentProtectionType: 'drm',
        resolutions: ['360p', '480p', '720p', '1080p'],
        generateSubtitle: false,
      }
    );

    // Track upload progress
    uploader.on('uploadProgress', (data: any) => {
      setUploadProgress(data.progress_percentage);
    });

    // Upload success
    uploader.on('uploadSuccess', async (data: any) => {
      console.log('Asset ID:', data.asset_id);
      setUploadStatus('saving');

      // try {
      //   // Save asset_id to DB via Lambda
      //   await apiClient.post('/courses/intro-video/save', {
      //     course_id: courseId,
      //     asset_id: data.asset_id,
      //   });

      //   formik.setFieldValue('intro_video_asset_id', data.asset_id);
      //   setUploadStatus('done');

      // } catch (err: any) {
      //   setUploadStatus('failed');
      // }
    });

    // Upload error
    uploader.on('uploadError', (data: any) => {
      console.error('Upload error:', data.error);
      setUploadStatus('failed');
    });

    uploaderRef.current = uploader;
  };


  const handleVideoFile = (file: File) => {
    if (!uploaderRef.current) {
      alert('Uploader not ready. Please try again.');
      return;
    }

    setVidPreview(URL.createObjectURL(file));
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Pass file to TPStreams SDK ✅
    uploaderRef.current.selectFiles([file]);
    uploaderRef.current.upload();
  };




  const formik = useFormik({
    initialValues: form,
    validationSchema: courseBasicDetailsSchema,
    onSubmit: (values) => {
      update(values)
      // onNext()
    },
  })


  // query for course details
  const { data: courseDetails, isLoading: isLoadingCourseDetails } = useGetCourseById(courseId, isEdit)


  useEffect(() => {
    if (courseDetails) {
      console.log("edit data", courseDetails)
      formik.setValues({
        ...form,
        title: courseDetails?.data?.title || "",
        description: courseDetails?.data?.description || "",
        category: courseDetails?.data?.category || "",
        level: courseDetails?.data?.level || "",
        languages: courseDetails?.data?.languages || [],
        cover_image_url: courseDetails?.data?.cover_image || null,
        intro_video_url: courseDetails?.data?.intro_video_url || null

      })
    }
  }, [courseDetails])



  if (isEdit && isLoadingCourseDetails) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 size={32} className="text-[#000B60] animate-spin" />
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
              maxLength={500}
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

          <UploadBox
            accept="image/jpeg,image/png,image/webp"
            preview={isEdit ? courseDetails?.data?.cover_image : imgPreview}
            previewType="image"
            icon={<Image size={20} />}
            title="Cover Image"
            hint="High resolution JPEG or PNG (16:9)"
            loading={coverUploading}
            onFile={async (f) => {
              setImgPreview(URL.createObjectURL(f))
              formik.setFieldValue('cover_image', f)
              setCoverUploading(true)
              try {
                const url = await storageService.uploadCourseCover(f)
                formik.setFieldValue('cover_image_url', url)
                toast.success('Cover image uploaded')
              } catch (error) {
                console.log(" file uploading error", error)
                toast.error('Failed to upload cover image')
                formik.setFieldValue('cover_image_url', null)
                setImgPreview(null)
              } finally {
                setCoverUploading(false)
              }
            }}
            onClear={() => {
              formik.setFieldValue('cover_image', null)
              formik.setFieldValue('cover_image_url', null)
              setImgPreview(null)
            }}
          />

          {/* <UploadBox
            accept="video/mp4,video/webm,video/mov"
            preview={vidPreview}
            previewType="video"
            icon={<Video size={20} />}
            title="Intro Video"
            hint="MP4, WebM or MOV — max 200 MB"
            onFile={(f) => {
              formik.setFieldValue('intro_video_url', f)
              setVidPreview(URL.createObjectURL(f))
            }}
            onClear={() => {
              formik.setFieldValue('intro_video_url', null)
              setVidPreview(null)
            }}
          /> */}


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
            onFile={handleVideoFile}
            onClear={() => {
              formik.setFieldValue('intro_video_asset_id', null);
              setVidPreview(null);
              setUploadStatus('idle');
              setUploadProgress(0);
            }}
          />

          {/* Progress bar */}
          {uploadStatus === 'uploading' && (
            <div style={{ marginTop: 8 }}>
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
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              ⚙️ Saving video info...
            </p>
          )}

          {/* Done */}
          {uploadStatus === 'done' && (
            <p style={{ fontSize: 12, color: '#10B981', marginTop: 6 }}>
              ✅ Video uploaded! Processing in background.
            </p>
          )}

          {/* Failed */}
          {uploadStatus === 'failed' && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>
              ❌ Upload failed — please try again.
            </p>
          )}






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
    </form>
  )
}

export default Step1BasicDetails
