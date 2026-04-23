import { useRef, useState } from 'react'
import { ImageSquare, X, Plus } from '@phosphor-icons/react'
import { Input, Textarea, Select, Button } from '@/components/ui'
import type { CourseFormData } from './index'

interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  onNext: () => void
}

const categoryOptions = [
  { value: 'cma', label: 'CMA' },
  { value: 'ca', label: 'CA' },
  { value: 'cfa', label: 'CFA' },
  { value: 'mba', label: 'MBA' },
]

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const languageOptions = [
  'English', 'Malayalam', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Arabic',
]

const Step1BasicDetails = ({ form, update, onNext }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [langInput, setLangInput] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleImageFile = (file: File) => {
    update({ coverImage: file })
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleImageFile(file)
  }

  const toggleLanguage = (lang: string) => {
    const langs = form.languages.includes(lang)
      ? form.languages.filter((l) => l !== lang)
      : [...form.languages, lang]
    update({ languages: langs })
  }

  const addCustomLang = () => {
    const trimmed = langInput.trim()
    if (trimmed && !form.languages.includes(trimmed)) {
      update({ languages: [...form.languages, trimmed] })
    }
    setLangInput('')
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Form (8 cols) */}
      <div className="col-span-8 flex flex-col gap-5">
        <Input
          label="Course Name"
          placeholder="e.g. Cost Accounting"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          maxLength={120}
          showCount
        />

        <Textarea
          label="Description"
          placeholder="Provide a comprehensive summary of what students will achieve..."
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={5}
          maxLength={500}
          showCount
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            placeholder="Select category"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => update({ category: e.target.value })}
          />
          <Select
            label="Level"
            placeholder="Select level"
            options={levelOptions}
            value={form.level}
            onChange={(e) => update({ level: e.target.value })}
          />
        </div>

        {/* Instruction Language */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Instruction Language</label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((lang) => {
              const active = form.languages.includes(lang)
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? 'border-[#000B60] bg-[#000B60] text-white'
                      : 'border-gray-200 bg-[#F2F4F6] text-gray-600 hover:border-[#000B60]'
                  }`}
                >
                  {lang}
                </button>
              )
            })}
          </div>

          {form.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {form.languages.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1 px-3 py-1 bg-[#BCC2FF] text-[#000B60] rounded-full text-xs font-semibold"
                >
                  {lang}
                  <button onClick={() => toggleLanguage(lang)} type="button">
                    <X size={10} weight="bold" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <input
              className="flex-1 px-3 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm outline-none"
              placeholder="Add other language..."
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomLang()}
            />
            <button
              type="button"
              onClick={addCustomLang}
              className="px-3 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-gray-500 hover:text-[#000B60]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Cover image + Actions (4 cols) */}
      <div className="col-span-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Cover Image</label>
          <div
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer aspect-video overflow-hidden ${
              dragOver ? 'border-[#000B60] bg-[#eef0ff]' : 'border-gray-200 bg-[#F2F4F6]'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <>
                <img src={preview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreview(null); update({ coverImage: null }) }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
                  <ImageSquare size={20} className="text-[#000B60]" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">High resolution JPEG or PNG (16:9)</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageFile(file)
            }}
          />
        </div>

        <div className="p-4 rounded-xl bg-[#F2F4F6] border border-gray-100 flex justify-between text-xs text-gray-500">
          <div>
            <div className="font-bold text-gray-700">Last Saved</div>
            <div>Just now</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-700">Completeness</div>
            <div>12% Finished</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="white" fullWidth type="button">
            Save as draft
          </Button>
          <Button variant="primary" fullWidth type="button" onClick={onNext}>
            Add Content
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Step1BasicDetails
