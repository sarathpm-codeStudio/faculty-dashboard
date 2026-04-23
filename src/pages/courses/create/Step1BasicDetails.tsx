import { useRef, useState } from 'react'
import { X, ChevronDown, ArrowRight, Image, Video, Upload } from 'lucide-react'
import { Button, Input, Textarea, Select } from '@/components/ui'
import type { CourseFormData } from './index'

interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  onNext: () => void
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
  onFile: (file: File) => void
  onClear: () => void
}

const UploadBox = ({ accept, preview, previewType, icon, title, hint, onFile, onClear }: UploadBoxProps) => {
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
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
    </div>
  )
}

const Step1BasicDetails = ({ form, update, onNext }: Props) => {
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [vidPreview, setVidPreview] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)

  const toggleLang = (lang: string) => {
    const next = form.languages.includes(lang)
      ? form.languages.filter((l) => l !== lang)
      : [...form.languages, lang]
    update({ languages: next })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

      {/* ── Left: form card (8 cols) ─────────────────────────────── */}
      <div className="lg:col-span-8 order-2 lg:order-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-10 flex flex-col gap-5">

        {/* Course Name */}
        <Input
          label="Course Name"
          placeholder="e.g. Cost Accounting"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          maxLength={120}
        />

        {/* Description */}
        <div className="flex-1 flex flex-col">
          <Textarea
            label="Description"
            placeholder="Provide a comprehensive summary of what students will achieve..."
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            maxLength={500}
            className="flex-1 min-h-[90px] h-[calc(100%-32px)]"
          />
        </div>

        {/* Category + Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            placeholder="Select category"
            options={categoryOptions.map((o) => ({ value: o, label: o }))}
            value={form.category}
            onChange={(e) => update({ category: e.target.value })}
          />
          <Select
            label="Level"
            placeholder="Select level"
            options={levelOptions.map((o) => ({ value: o, label: o }))}
            value={form.level}
            onChange={(e) => update({ level: e.target.value })}
          />
        </div>

        {/* Instruction Language */}
        <div className="relative">
          <p className="text-sm font-bold text-gray-700 mb-5">Instruction Language</p>
          <div
            className="flex flex-wrap items-center gap-2 min-h-[60px] px-3 py-2.5 bg-[#F2F4F6] border border-gray-100 rounded-xl cursor-pointer"
            onClick={() => setLangOpen((o) => !o)}
          >
            {form.languages.length === 0 && (
              <span className="text-base text-black font-medium">Select languages</span>
            )}
            {form.languages.map((lang) => (
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
          {langOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg p-2 flex flex-wrap gap-2">
              {languageOptions.map((lang) => {
                const active = form.languages.includes(lang)
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

      {/* ── Right: uploads + actions (4 cols) ───────────────────── */}
      <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-3">

        {/* Cover Image */}
        <div>
          {/* <FieldLabel>Cover Image</FieldLabel> */}
          <UploadBox
            accept="image/jpeg,image/png,image/webp"
            preview={imgPreview}
            previewType="image"
            icon={<Image size={20} />}
            title="Cover Image"
            hint="High resolution JPEG or PNG (16:9)"
            onFile={(f) => { update({ coverImage: f }); setImgPreview(URL.createObjectURL(f)) }}
            onClear={() => { update({ coverImage: null }); setImgPreview(null) }}
          />
        </div>

        {/* Intro Video */}
        <div>
          {/* <FieldLabel>Intro Video</FieldLabel> */}
          <UploadBox
            accept="video/mp4,video/webm,video/mov"
            preview={vidPreview}
            previewType="video"
            icon={<Video size={20} />}
            title="Intro Video"
            hint="MP4, WebM or MOV — max 200 MB"
            onFile={(f) => { update({ introVideo: f }); setVidPreview(URL.createObjectURL(f)) }}
            onClear={() => { update({ introVideo: null }); setVidPreview(null) }}
          />
        </div>

        {/* Actions — pushed to bottom */}
        <div className="flex flex-col gap-3 mt-auto pt-1">
          <Button variant="white" fullWidth type="button">
            Save as draft
          </Button>
          <Button variant="primary" fullWidth type="button" onClick={onNext}>
            Add Content <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Step1BasicDetails
