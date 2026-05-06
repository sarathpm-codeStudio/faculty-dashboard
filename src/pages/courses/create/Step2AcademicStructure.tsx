import { useRef, useState } from 'react'
import { FolderSimple, DotsSixVertical, ArrowLeft as PhArrowLeft } from '@phosphor-icons/react'
import { ArrowRight, Download, FileText as FilePdfIcon, Loader2, Upload, Video, X } from 'lucide-react'
import { tpstreamsUploadService } from '@/services/tpstreamsUploadService'
import { Button, Input, Modal, Paragraph, Spinner, Subheading, Textarea } from '@/components/ui'
import type { CourseFormData, TreeNode, FolderNode, ContentNode, ContentKind } from './index'
import { IoAddCircleOutline } from 'react-icons/io5'
import { FaFolder } from 'react-icons/fa'
import { MdVideoLibrary } from 'react-icons/md'
import { BsPencilSquare } from 'react-icons/bs'
import { HiDocumentDuplicate } from 'react-icons/hi'
import { FaRegImage } from 'react-icons/fa6'
import { CaretRight } from '@phosphor-icons/react'
import { useCreateFolder, useGetAllContent, useCreateMaterial } from '@/hooks/useCourse'
import { toast } from 'sonner'
import { generateUniqueId } from '@/utils/helper/numberGenarator'


interface Props {
  form: CourseFormData
  update: (fields: Partial<CourseFormData>) => void
  onNext: () => void,
  courseId: string
}

// ── Tree helpers ──────────────────────────────────────────────────────────────

function insertNode(nodes: TreeNode[], parentId: string | null, node: TreeNode): TreeNode[] {
  if (parentId === null) return [...nodes, node]
  return nodes.map(n => {
    if (n.kind !== 'folder') return n
    if (n.id === parentId) return { ...n, children: [...n.children, node] }
    return { ...n, children: insertNode(n.children, parentId, node) }
  })
}

function getChildrenAt(tree: TreeNode[], path: NavCrumb[]): TreeNode[] {
  if (path.length === 0) return tree
  const folder = tree.find(n => n.kind === 'folder' && n.id === path[0].id) as FolderNode | undefined
  if (!folder) return []
  return getChildrenAt(folder.children, path.slice(1))
}

// ── Constants ─────────────────────────────────────────────────────────────────

type NavCrumb = { id: string; title: string }

const CONTENT_ICONS: Record<ContentKind, React.ReactNode> = {
  video: <MdVideoLibrary size={15} />,
  test: <BsPencilSquare size={15} />,
  document: <HiDocumentDuplicate size={15} />,
  image: <FaRegImage size={15} />,
}

const CONTENT_TYPES: { kind: ContentKind; label: string }[] = [
  { kind: 'video', label: 'Video' },
  { kind: 'test', label: 'Online Test' },
  { kind: 'document', label: 'Document' },
  { kind: 'image', label: 'Image' },
]

// ── Upload box (mirrors Step1 intro-video uploader) ──────────────────────────

interface UploadBoxProps {
  accept: string
  preview: string | null
  icon: React.ReactNode
  title: string
  hint: string
  loading?: boolean
  onFile: (file: File) => void
  onClear: () => void
}

const UploadBox = ({ accept, preview, icon, title, hint, loading = false, onFile, onClear }: UploadBoxProps) => {
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
          {preview.includes('tpstreams.com') || preview.includes('/embed/') ? (
            <iframe
              src={preview}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video src={preview} className="w-full h-full object-cover" controls onClick={(e) => e.stopPropagation()} />
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 text-white text-[10px] font-semibold rounded-full">
              <Upload size={9} /> Click to change video
            </span>
          </div>
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

// ── Main component ────────────────────────────────────────────────────────────

const Step2AcademicStructure = ({ courseId, form, update, onNext }: Props) => {


  // mutation
  const { mutateAsync: createFolder } = useCreateFolder(courseId)
  const { mutateAsync: createMaterial } = useCreateMaterial(courseId)

  // Drill-down navigation path
  const [navPath, setNavPath] = useState<NavCrumb[]>([])

  // Folder modal
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folderName, setFolderName] = useState('')

  // Content modal
  const [showContentModal, setShowContentModal] = useState(false)
  const [contentTitle, setContentTitle] = useState('')
  const [contentDesc, setContentDesc] = useState('')
  const [contentKind, setContentKind] = useState<ContentKind>('video')
  const [videoAccess, setVideoAccess] = useState(true)
  const [hh, setHh] = useState('00')
  const [mm, setMm] = useState('00')
  const [ss, setSs] = useState('00')

  // Content video upload state (mirrors Step1 intro video flow)
  const [contentUniqueId, setContentUniqueId] = useState<string>('')
  const [contentVidPreview, setContentVidPreview] = useState<string | null>(null)
  const [contentAssetId, setContentAssetId] = useState<string | null>(null)
  const [contentUploadStatus, setContentUploadStatus] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'failed'>('idle')
  const [contentUploadProgress, setContentUploadProgress] = useState(0)

  // Current parent ID for insert operations (last crumb's id, or null for root)
  const currentParentId = navPath.length > 0 ? navPath[navPath.length - 1].id : null

  // Fetch folders + materials for the current level
  const { data: content, isLoading: contentLoading } = useGetAllContent(
    courseId,
    currentParentId ?? undefined,
  )
  const currentItems: any[] = content?.data ?? []

  // ── Navigation ──
  const drillInto = (folder: FolderNode) =>
    setNavPath(prev => [...prev, { id: folder.id, title: folder.title }])

  const goBack = () => setNavPath(prev => prev.slice(0, -1))

  const jumpTo = (idx: number) => setNavPath(prev => prev.slice(0, idx + 1))

  // ── Folder modal ──
  const openFolderModal = () => { setFolderName(''); setShowFolderModal(true) }

  const handleCreateFolder = async () => {
    const name = folderName.trim()
    if (!name) return

    try {
      const payload: { title: string; parent_id?: string } = { title: name }
      if (currentParentId) payload.parent_id = currentParentId

      const { data, error } = await createFolder(payload)

      if (data) {
        console.log(data)
        toast.success('Folder created successfully')
      }

      if (error) throw error

      // const folder: FolderNode = {
      //   id: created.id,
      //   kind: 'folder',
      //   title: created.title,
      //   children: [],
      // }
      // update({ tree: insertNode(form.tree, currentParentId, folder) })

      setShowFolderModal(false)
      setFolderName('')
    } catch (err) {
      console.error('Failed to create folder', err)
    }
  }

  // ── Content modal ──
  const openContentModal = (kind: ContentKind) => {
    setContentUniqueId(generateUniqueId())
    setContentTitle('')
    setContentDesc('')
    setContentKind(kind)
    setVideoAccess(true)
    setHh('00'); setMm('00'); setSs('00')
    setContentVidPreview(null)
    setContentAssetId(null)
    setContentUploadStatus('idle')
    setContentUploadProgress(0)
    setShowContentModal(true)
  }

  const handleContentVideoFile = (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setContentVidPreview(previewUrl)
    setContentUploadStatus('uploading')
    setContentUploadProgress(0)

    tpstreamsUploadService.upload(file, contentUniqueId, 'module', {
      onProgress: (percentage) => setContentUploadProgress(percentage),
      onStatus: (status) => setContentUploadStatus(status as any),
      onSuccess: (assetId) => {
        setContentAssetId(assetId)
        setContentUploadStatus('done')
        toast.success('Video uploaded successfully')
      },
      onError: () => {
        setContentUploadStatus('failed')
        toast.error('Video upload failed')
      },
    })
  }

  const MATERIAL_TYPE_MAP: Record<ContentKind, 'VIDEO' | 'PDF' | 'IMAGE' | 'NOTES'> = {
    video: 'VIDEO',
    document: 'PDF',
    image: 'IMAGE',
    test: 'NOTES',
  }

  const handleSaveContent = async () => {
    const title = contentTitle.trim() || 'Untitled'
    const type = MATERIAL_TYPE_MAP[contentKind]

    // if (contentKind === 'video' && !contentAssetId) {
    //   toast.error('Please wait for the video to finish uploading')
    //   return
    // }

    try {
      const payload: any = {
        title,
        type,
        unique_id: contentUniqueId,
      }
      if (currentParentId) payload.parent_id = currentParentId

      // if (contentKind === 'video' && contentAssetId) {
      //   payload.video_asset_id = contentAssetId
      // }

      const { data, error } = await createMaterial(payload)

      if (error) throw error
      if (data) toast.success('Material created successfully')

      setShowContentModal(false)
    } catch (err: any) {
      console.error('Failed to create material', err)
      toast.error(err?.message || 'Failed to create material')
    }
  }

  const toggle = (field: 'offlineDownload' | 'pdfPermissions') =>
    update({ [field]: !form[field] })

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* ── Left: Drill-down tree (8 cols) ── */}
      <div className="col-span-8 flex flex-col gap-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <Subheading className="text-black font-bold">Course Modules</Subheading>
          <span
            onClick={openFolderModal}
            className="flex items-center gap-2 px-4 py-2 text-[#000B60] text-sm font-semibold cursor-pointer"
          >
            <IoAddCircleOutline size={20} />
            Add New Folder
          </span>
        </div>

        {/* Breadcrumb + back */}
        {navPath.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-semibold text-[#000B60] hover:underline"
            >
              <PhArrowLeft size={15} />
              Back
            </button>
            <span className="text-gray-300">|</span>
            {/* Breadcrumb trail */}
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
              <button
                type="button"
                className="hover:text-[#000B60] font-medium"
                onClick={() => setNavPath([])}
              >
                Root
              </button>
              {navPath.map((crumb, idx) => (
                <span key={crumb.id} className="flex items-center gap-1">
                  <CaretRight size={11} />
                  <button
                    type="button"
                    className={`hover:text-[#000B60] font-medium ${idx === navPath.length - 1 ? 'text-[#000B60] font-bold' : ''}`}
                    onClick={() => jumpTo(idx)}
                  >
                    {crumb.title}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current folder header (when inside a folder) */}
        {navPath.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#000B60] rounded-xl">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FaFolder size={17} className="text-white" />
            </div>
            <div>
              <Paragraph className="text-white font-bold leading-tight">
                {navPath[navPath.length - 1].title}
              </Paragraph>
              <p className="text-xs text-white/70 mt-0.5">
                {currentItems.length} item{currentItems.length !== 1 ? 's' : ''}
                {currentItems.length === 0 ? ' • Empty' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {contentLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size={32} label="" />
          </div>
        )}

        {/* Empty state */}
        {!contentLoading && currentItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <FolderSimple size={40} className="mb-2 text-gray-300" />
            <p className="text-sm">
              {navPath.length === 0
                ? 'No content yet. Add a folder or use the content panel.'
                : 'This folder is empty. Add a folder or content using the panel.'}
            </p>
          </div>
        )}

        {/* Flat item list for current level */}
        <div className="flex flex-col gap-3">
          {currentItems?.map(node => {
            if (node.item_type === 'folder') {
              return (
                <div
                  key={node.id}
                  className="flex items-center justify-between px-4 py-3 bg-[#F2F4F6] rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => drillInto({ id: node.id, kind: 'folder', title: node.title, children: [] })}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                      <FaFolder size={17} className="text-[#000B60]" />
                    </div>
                    <div>
                      <Paragraph className="text-black font-bold leading-tight">{node.title}</Paragraph>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="p-1 cursor-grab" onClick={e => e.stopPropagation()}>
                      <DotsSixVertical size={22} />
                    </span>
                    <CaretRight size={16} />
                  </div>
                </div>
              )
            }

            // Material node (from course_materials)
            const kind: ContentKind = (node.kind as ContentKind) || 'document'
            return (
              <div key={node.id} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-lg">
                <span className="text-[#000B60] shrink-0">{CONTENT_ICONS[kind]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{node.title}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right sidebar (4 cols) ── */}
      <div className="col-span-4 flex flex-col gap-5">
        {/* Add Content */}
        <div className="bg-[#F2F4F6] rounded-xl p-4 flex flex-col gap-3">
          <div>
            <Paragraph className="text-[#000B60] font-bold">Add Content</Paragraph>
            <p className="text-xs text-gray-400 mt-0.5">
              {navPath.length > 0
                ? <>Into: <span className="font-semibold text-[#000B60]">{navPath[navPath.length - 1].title}</span></>
                : 'No folder open — adds to root'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_TYPES.map(({ kind, label }) => (
              <button
                key={kind}
                type="button"
                onClick={() => openContentModal(kind)}
                className="flex flex-col items-center gap-2 px-3 py-4 bg-white rounded-xl border border-gray-100 text-xs font-semibold text-[#000B60] hover:border-[#000B60] transition-colors"
              >
                <span className="text-[#000B60]">{CONTENT_ICONS[kind]}</span>
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
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="primary" fullWidth onClick={onNext}>
          Add Price <ArrowRight size={18} />
        </Button>
      </div>

      {/* ── Add Folder Modal ── */}
      <Modal
        open={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title={navPath.length > 0 ? 'New Sub-folder' : 'New Folder'}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="white" onClick={() => setShowFolderModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateFolder} disabled={!folderName.trim()}>
              Create Folder
            </Button>
          </>
        }
      >
        {navPath.length > 0 && (
          <p className="text-xs text-gray-500">
            Inside: <span className="font-semibold text-[#000B60]">{navPath[navPath.length - 1].title}</span>
          </p>
        )}
        <Input
          label="Folder Name"
          placeholder="e.g. Module 1: Introduction"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
          autoFocus
        />
      </Modal>

      {/* ── Add Content Modal ── */}
      <Modal
        open={showContentModal}
        onClose={() => setShowContentModal(false)}
        title={`Add ${CONTENT_TYPES.find(t => t.kind === contentKind)?.label ?? 'Content'}`}
        footer={
          <>
            <Button variant="white" onClick={() => setShowContentModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSaveContent}
            // disabled={contentKind === 'video' && contentUploadStatus === 'uploading'}
            >
              Save & Close
            </Button>
          </>
        }
      >
        {navPath.length > 0 && (
          <p className="text-xs text-gray-500">
            Into: <span className="font-semibold text-[#000B60]">{navPath[navPath.length - 1].title}</span>
          </p>
        )}

        <Input
          label="Title"
          placeholder="e.g. Introduction to Business Law"
          value={contentTitle}
          onChange={e => setContentTitle(e.target.value)}
        />

        {contentKind === 'video' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Video</label>
            <UploadBox
              accept="video/mp4,video/webm,video/mov"
              preview={contentVidPreview}
              icon={<Video size={20} />}
              title="Upload Video"
              hint="MP4, WebM or MOV — max 200 MB"
              loading={contentUploadStatus === 'uploading' || contentUploadStatus === 'saving'}
              onFile={handleContentVideoFile}
              onClear={() => {
                setContentVidPreview(null)
                setContentAssetId(null)
                setContentUploadStatus('idle')
                setContentUploadProgress(0)
              }}
            />

            {contentUploadStatus === 'uploading' && (
              <div className="mt-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading video...</span>
                  <span>{contentUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-lg h-1.5">
                  <div
                    className="h-1.5 rounded-lg bg-[#000B60] transition-all"
                    style={{ width: `${contentUploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            {contentUploadStatus === 'saving' && (
              <p className="text-xs text-gray-500">⚙️ Saving video info...</p>
            )}
            {contentUploadStatus === 'done' && (
              <p className="text-xs text-emerald-500">✅ Video uploaded! Processing in background.</p>
            )}
            {contentUploadStatus === 'failed' && (
              <p className="text-xs text-red-500">❌ Upload failed — please try again.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Step2AcademicStructure
