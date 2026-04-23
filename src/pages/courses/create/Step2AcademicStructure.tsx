import { useState } from 'react'
import { Plus, FolderSimple, VideoCamera, DotsSixVertical } from '@phosphor-icons/react'
import { ArrowRight, Download, FileText as FilePdfIcon } from 'lucide-react'
import { Button, Input, Modal, Paragraph, Subheading, Textarea } from '@/components/ui'
import type { CourseFormData, Lesson } from './index'
import { IoAddCircleOutline } from "react-icons/io5";
import { FaFolder } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
import { HiDocumentDuplicate } from "react-icons/hi";
import { FaRegImage } from "react-icons/fa6";

interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  onNext: () => void
}

type ContentType = 'video' | 'test' | 'document' | 'image'

const CONTENT_TYPES: { type: ContentType; label: string; icon: React.ReactNode }[] = [
  { type: 'video', label: 'Video', icon: <MdVideoLibrary size={18} /> },
  { type: 'test', label: 'Online Test', icon: <BsPencilSquare size={18} /> },
  { type: 'document', label: 'Document', icon: <HiDocumentDuplicate size={18} /> },
  { type: 'image', label: 'Image', icon: <FaRegImage size={18} /> },
]

const Step2AcademicStructure = ({ form, update, onNext }: Props) => {
  const [showModal, setShowModal] = useState(false)
  const [activeFolderIdx, setActiveFolderIdx] = useState<number | null>(null)
  const [expandedFolder, setExpandedFolder] = useState<number | null>(null)

  // Video upload modal state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoAccess, setVideoAccess] = useState(true)
  const [hh, setHh] = useState('00')
  const [mm, setMm] = useState('00')
  const [ss, setSs] = useState('00')
  const [uploading, setUploading] = useState(true)
  const progress = 78

  const resetModalState = () => {
    setTitle('')
    setDescription('')
    setVideoAccess(true)
    setHh('00')
    setMm('00')
    setSs('00')
    setUploading(true)
  }

  const addFolder = () => {
    const idx = form.modules.length + 1
    update({
      modules: [
        ...form.modules,
        { id: crypto.randomUUID(), title: `Folder ${idx}: New Module`, lessons: [] },
      ],
    })
  }

  const handleOpenModal = (folderIdx: number) => {
    setActiveFolderIdx(folderIdx)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetModalState()
  }

  const handleSaveLesson = () => {
    if (activeFolderIdx === null) return
    const lesson: Omit<Lesson, 'id'> = {
      title: title || 'Untitled Lesson',
      description,
      type: 'video',
      videoAccess,
      watchTimeHH: hh,
      watchTimeMM: mm,
      watchTimeSS: ss,
    }
    const modules = form.modules.map((m, i) =>
      i === activeFolderIdx
        ? { ...m, lessons: [...m.lessons, { ...lesson, id: crypto.randomUUID() }] }
        : m
    )
    update({ modules })
    handleCloseModal()
  }

  const toggle = (field: 'offlineDownload' | 'pdfPermissions') =>
    update({ [field]: !form[field] })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Curriculum builder (8 cols) */}
      <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Subheading className='text-black font-bold'>Course Modules</Subheading>
          <span onClick={addFolder} className="flex items-center gap-2 px-4 py-2 text-[#000B60] text-sm font-semibold cursor-pointer">
            <IoAddCircleOutline size={20} />
            Add New Folder
          </span>
        </div>

        {form.modules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <FolderSimple size={40} className="mb-2 text-gray-300" />
            <p className="text-sm">No modules yet. Click "Add New Folder" to start.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {form.modules.map((mod, idx) => (
            <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 bg-[#F2F4F6] cursor-pointer"
                onClick={() => setExpandedFolder(expandedFolder === idx ? null : idx)}
              >
                <div className='flex items-center gap-2'>
                  <div className='h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center'>
                    <FaFolder size={20} className="text-[#000B60]" />
                  </div>
                  <div>
                    <Paragraph className='text-black font-bold'>{mod.title}</Paragraph>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {mod.lessons.length} Lesson{mod.lessons.length !== 1 ? 's' : ''}
                      {mod.lessons.length === 0 ? ' • Empty' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="p-2 text-gray-700 cursor-grab">
                    <DotsSixVertical size={30} />
                  </span>
                </div>
              </div>

              {expandedFolder === idx && mod.lessons.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                      <VideoCamera size={16} className="text-[#000B60] shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{lesson.title}</p>
                        {lesson.watchTimeHH !== '00' || lesson.watchTimeMM !== '00' ? (
                          <p className="text-xs text-gray-400">
                            {lesson.watchTimeHH}:{lesson.watchTimeMM}:{lesson.watchTimeSS}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar (4 cols) */}
      <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-5">
        {/* Add Content */}
        <div className="bg-[#F2F4F6] rounded-xl p-4 flex flex-col gap-3">
          <Paragraph className="text-[#000B60] font-bold">Add Content</Paragraph>
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (form.modules.length === 0) addFolder()
                  handleOpenModal(form.modules.length === 0 ? 0 : form.modules.length - 1)
                }}
                className="flex flex-col items-center gap-2 px-3 py-4 bg-white rounded-xl border border-gray-100 text-xs font-semibold text-[#000B60] hover:border-[#000B60] transition-colors"
              >
                <span className="text-[#000B60]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Advance Settings */}
        <div className="bg-[#F2F4F6] rounded-xl p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[#000B60] uppercase tracking-widest">Advance Settings</h3>
          {[
            { key: 'offlineDownload' as const, label: 'Offline Download', icon: <Download size={16} className="text-[#000B60]" /> },
            { key: 'pdfPermissions' as const, label: 'PDF Permissions', icon: <FilePdfIcon size={16} className="text-[#000B60]" /> },
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <button
                type="button"
                onClick={() => toggle(key)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form[key] ? 'bg-[#000B60]' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button variant="primary" fullWidth onClick={onNext}>
          Add Price <ArrowRight size={18} />
        </Button>
      </div>

      {/* Video Upload Modal — uses reusable Modal component */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title="Upload & Manage Video"
        footer={
          <>
            <Button variant="white" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLesson}>Save & Close</Button>
          </>
        }
      >
        {/* Upload status */}
        {uploading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Lecture_04_Intro.mp4</p>
                <p className="text-xs text-gray-400">Transcoding...</p>
              </div>
              <span className="text-sm font-bold text-[#000B60]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(to right, #000B60, #142283)' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setUploading(false)}
              className="text-xs text-[#000B60] underline self-start"
            >
              Mark as complete (demo)
            </button>
          </div>
        )}

        {/* Lesson details */}
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-gray-700">Lesson Details</h4>
        </div>
        <Input
          label="Lesson Title"
          placeholder="Business Laws"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          label="Description"
          placeholder="This session explores..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Access control */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-gray-700">Access Control</h4>
          <div className="p-3 bg-[#F2F4F6] rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Video Access</span>
              <button
                type="button"
                onClick={() => setVideoAccess(!videoAccess)}
                className={`w-10 h-5 rounded-full transition-colors relative ${videoAccess ? 'bg-[#000B60]' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${videoAccess ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Locking prevents students from viewing until unlocked manually or via schedule.
            </p>
          </div>
        </div>

        {/* Watch time */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-gray-700">Video time</h4>
          <div className="flex items-center gap-2">
            <input
              className="w-16 text-center px-2 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm font-mono outline-none"
              placeholder="HH"
              value={hh}
              onChange={(e) => setHh(e.target.value)}
              maxLength={2}
            />
            <span className="text-gray-400">:</span>
            <input
              className="w-16 text-center px-2 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm font-mono outline-none"
              placeholder="MM"
              value={mm}
              onChange={(e) => setMm(e.target.value)}
              maxLength={2}
            />
            <span className="text-gray-400">:</span>
            <input
              className="w-16 text-center px-2 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm font-mono outline-none"
              placeholder="SS"
              value={ss}
              onChange={(e) => setSs(e.target.value)}
              maxLength={2}
            />
            <span className="text-xs text-gray-400 ml-1">Set the watching time</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Step2AcademicStructure
