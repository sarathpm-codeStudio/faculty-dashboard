import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { FolderSimple, DotsSixVertical, ArrowLeft as PhArrowLeft, ExamIcon } from '@phosphor-icons/react'
import { ArrowRight, ChevronRight, Download, FileText as FilePdfIcon, Home, Image as LucideImage, Link as LinkIcon, Loader2, MoreVertical, Pencil, StickyNote, Trash2, Upload, Video, Video as VideoIcon, X } from 'lucide-react'
import { tpstreamsUploadService } from '@/services/tpstreamsUploadService'
import { storageService } from '@/services'
import { Button, ConfirmDeleteModal, Input, Modal, Paragraph, Spinner, Subheading, Textarea } from '@/components/ui'
import type { CourseFormData, TreeNode, FolderNode, ContentNode, ContentKind } from './index'
import { IoAddCircleOutline, } from 'react-icons/io5'
import { FaFolder } from 'react-icons/fa'
import { MdVideoLibrary } from 'react-icons/md'
import { BsPencilSquare } from 'react-icons/bs'
import { HiDocumentDuplicate } from 'react-icons/hi'
import { FaRegImage } from 'react-icons/fa6'
import { CaretRight } from '@phosphor-icons/react'
import { useCreateFolder, useGetAllContent, useCreateMaterial, useUpdateFolder, useUpdateMaterial, useDeleteFolder, useDeleteMaterial } from '@/hooks/useCourse'
import { VideoPlayer } from '@/components/features'
import { toast } from 'sonner'
import { generateUniqueId } from '@/utils/helper/numberGenarator'
import { useNavigate } from 'react-router-dom'


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

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
}

type MaterialDbType = 'VIDEO' | 'PDF' | 'IMAGE' | 'NOTES' | 'LINK' | 'TEST'

const MATERIAL_TYPE_META: Record<MaterialDbType, { label: string; icon: React.ReactNode; iconBg: string; iconColor: string }> = {
  VIDEO: { label: 'Video', icon: <VideoIcon size={16} />, iconBg: 'bg-[#E8EBFF]', iconColor: 'text-[#000B60]' },
  PDF: { label: 'Document', icon: <FilePdfIcon size={16} />, iconBg: 'bg-[#FEE7E7]', iconColor: 'text-[#D63B3B]' },
  IMAGE: { label: 'Image', icon: <LucideImage size={16} />, iconBg: 'bg-[#E5F6EA]', iconColor: 'text-[#1F9D55]' },
  NOTES: { label: 'Notes', icon: <StickyNote size={16} />, iconBg: 'bg-[#FFF6DC]', iconColor: 'text-[#B7791F]' },
  LINK: { label: 'Link', icon: <LinkIcon size={16} />, iconBg: 'bg-[#E0F1FB]', iconColor: 'text-[#1A7EBE]' },
  TEST: { label: 'Test', icon: <ExamIcon size={16} />, iconBg: 'bg-[#FFF6DC]', iconColor: 'text-[#B7791F]' },
}

// ── Upload box (mirrors Step1 intro-video uploader) ──────────────────────────

interface UploadBoxProps {
  accept: string
  preview: string | null
  previewType?: 'video' | 'image' | 'document'
  fileName?: string | null
  icon: React.ReactNode
  title: string
  hint: string
  loading?: boolean
  videoBlockedMessage?: string | null
  onFile: (file: File) => void
  onClear: () => void
}

const UploadBox = ({ accept, preview, previewType = 'video', fileName, icon, title, hint, loading = false, videoBlockedMessage = null, onFile, onClear }: UploadBoxProps) => {
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
          ) : previewType === 'document' ? (
            <div className="flex flex-col items-center gap-2 px-4 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-xl bg-[#FEE7E7] text-[#D63B3B] flex items-center justify-center">
                <FilePdfIcon size={22} />
              </div>
              <p className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">{fileName ?? 'Document uploaded'}</p>
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-semibold text-[#000B60] underline"
                onClick={(e) => e.stopPropagation()}
              >
                View file
              </a>
            </div>
          ) : previewType === 'video' && videoBlockedMessage ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F8F9FB] px-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Loader2 size={22} className="text-[#000B60] animate-spin" />
              <p className="text-xs font-semibold text-[#000B60]">{videoBlockedMessage}</p>
            </div>
          ) : preview.includes('tpstreams.com') || preview.includes('/embed/') ? (
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
          {previewType === 'video' && (
            <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 text-white text-[10px] font-semibold rounded-full">
                <Upload size={9} /> Click to change video
              </span>
            </div>
          )}
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

  const navigate = useNavigate()

  // mutation
  const { mutateAsync: createFolder, isPending: isCreatingFolder } = useCreateFolder(courseId)
  const { mutateAsync: createMaterial, isPending: isCreatingMaterial } = useCreateMaterial(courseId)
  const { mutateAsync: updateFolder, isPending: isUpdatingFolder } = useUpdateFolder(courseId)
  const { mutateAsync: updateMaterial, isPending: isUpdatingMaterial } = useUpdateMaterial(courseId)
  const { mutateAsync: deleteFolder, isPending: isDeletingFolder } = useDeleteFolder(courseId)
  const { mutateAsync: deleteMaterial, isPending: isDeletingMaterial } = useDeleteMaterial(courseId)
  const isFolderSaving = isCreatingFolder || isUpdatingFolder
  const isMaterialSaving = isCreatingMaterial || isUpdatingMaterial

  // Drill-down navigation path
  const [navPath, setNavPath] = useState<NavCrumb[]>([])

  // Folder modal (create + edit)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)

  // Content modal
  const [showContentModal, setShowContentModal] = useState(false)
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
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
  const [videoTranscodeStatus, setVideoTranscodeStatus] = useState<string | null>(null)

  const getVideoBlockedMessage = (status: string | null | undefined) => {
    if (!status) return null
    const s = String(status).toUpperCase()
    if (s === 'COMPLETED') return null
    if (s === 'UPLOADED') return 'Waiting for transcoding'
    if (s === 'TRANSCODING') return 'Transcoding…'
    if (s === 'FAILED') return "Can't play video — status: FAILED"
    return `Can't play video — status: ${s}`
  }

  // Content file upload state (image / document — Supabase, mirrors Step1 cover image)
  const [contentFileUrl, setContentFileUrl] = useState<string | null>(null)
  const [contentFileName, setContentFileName] = useState<string | null>(null)
  const [contentFileUploading, setContentFileUploading] = useState(false)

  // Material preview modal
  const [previewItem, setPreviewItem] = useState<any | null>(null)

  // Row action menu (Edit / Delete)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const isDeleting = isDeletingFolder || isDeletingMaterial

  useEffect(() => {
    if (!menuOpenId) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpenId])

  const handleEditItem = (item: any) => {
    setMenuOpenId(null)
    if (item.item_type === 'folder') {
      openEditFolderModal(item)
      return
    }
    openEditMaterialModal(item)
  }

  const handleDeleteItem = (item: any) => {
    setMenuOpenId(null)
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const isFolder = deleteTarget.item_type === 'folder'
    try {
      if (isFolder) {
        await deleteFolder(deleteTarget.id)
      } else {
        await deleteMaterial(deleteTarget.id)
      }
      toast.success(`${isFolder ? 'Folder' : 'Material'} "${deleteTarget.title}" deleted`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(`Failed to delete ${isFolder ? 'folder' : 'material'}`)
    }
  }

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
  const openFolderModal = () => {
    setEditingFolderId(null)
    setFolderName('')
    setShowFolderModal(true)
  }

  const openEditFolderModal = (folder: any) => {
    setEditingFolderId(folder.id)
    setFolderName(folder.title ?? '')
    setShowFolderModal(true)
  }

  const closeFolderModal = () => {
    setShowFolderModal(false)
    setFolderName('')
    setEditingFolderId(null)
  }

  const handleSubmitFolder = async () => {
    const name = folderName.trim()
    if (!name) return

    try {
      if (editingFolderId) {
        const { data, error } = await updateFolder({
          folderId: editingFolderId,
          payload: { title: name },
        })
        if (error) throw error
        if (data) toast.success('Folder updated')
      } else {
        const payload: { title: string; parent_id?: string } = { title: name }
        if (currentParentId) payload.parent_id = currentParentId

        const { data, error } = await createFolder(payload)
        if (error) throw error
        if (data) toast.success('Folder created successfully')
      }
      closeFolderModal()
    } catch (err: any) {
      console.error('Failed to save folder', err)
      toast.error(err?.message || 'Failed to save folder')
    }
  }

  // ── Content modal ──
  const openContentModal = (kind: ContentKind) => {
    setEditingMaterialId(null)
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
    setVideoTranscodeStatus(null)
    setContentFileUrl(null)
    setContentFileName(null)
    setContentFileUploading(false)
    setShowContentModal(true)
  }

  const DB_TO_CONTENT_KIND: Record<MaterialDbType, ContentKind> = {
    VIDEO: 'video',
    PDF: 'document',
    IMAGE: 'image',
    NOTES: 'test',
    LINK: 'document',
    TEST: 'test',
  }

  const openEditMaterialModal = (material: any) => {
    const dbType = (material.type as MaterialDbType) || 'PDF'
    const kind = DB_TO_CONTENT_KIND[dbType] ?? 'document'

    setEditingMaterialId(material.id)
    setContentUniqueId(material.unique_id || generateUniqueId())
    setContentTitle(material.title ?? '')
    setContentDesc(material.description ?? '')
    setContentKind(kind)
    setVideoAccess(true)
    setHh('00'); setMm('00'); setSs('00')

    // Video preview from existing asset
    const assetId: string | undefined = material.video_asset_id
    if (assetId) {
      const orgId = import.meta.env.VITE_TPSTREAMS_ORG_ID
      const accessToken = import.meta.env.VITE_TPSTREAMS_ACCESS_TOKEN
      setContentVidPreview(`https://app.tpstreams.com/embed/${orgId}/${assetId}/?access_token=${accessToken}`)
      setContentAssetId(assetId)
      setContentUploadStatus('done')
      setVideoTranscodeStatus(material.video_uploading_status || null)
    } else {
      setContentVidPreview(null)
      setContentAssetId(null)
      setContentUploadStatus('idle')
      setVideoTranscodeStatus(null)
    }
    setContentUploadProgress(0)

    // File preview for image / document
    const fileUrl: string | null = material.file_url ?? null
    setContentFileUrl(fileUrl)
    setContentFileName(fileUrl ? fileUrl.split('/').pop() ?? null : null)
    setContentFileUploading(false)

    setShowContentModal(true)
  }

  const handleContentFileUpload = async (file: File) => {
    setContentFileUploading(true)
    setContentFileName(file.name)
    try {
      const url = await storageService.uploadCourseCover(file)
      setContentFileUrl(url)
      toast.success('File uploaded')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload file')
      setContentFileUrl(null)
      setContentFileName(null)
    } finally {
      setContentFileUploading(false)
    }
  }

  const handleContentVideoFile = (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setContentVidPreview(previewUrl)
    setContentUploadStatus('uploading')
    setContentUploadProgress(0)
    setVideoTranscodeStatus(null)

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

    if ((contentKind === 'image' || contentKind === 'document') && !contentFileUrl) {
      toast.error('Please upload a file first')
      return
    }
    if ((contentKind === 'image' || contentKind === 'document') && contentFileUploading) {
      toast.error('Please wait for the file upload to finish')
      return
    }

    try {
      if (editingMaterialId) {
        const payload: any = { title, type }
        if (contentKind === 'video' && contentAssetId) {
          payload.video_asset_id = contentAssetId
        }
        if ((contentKind === 'image' || contentKind === 'document') && contentFileUrl) {
          payload.file_url = contentFileUrl
        }

        const { data, error } = await updateMaterial({
          materialId: editingMaterialId,
          payload,
        })
        if (error) throw error
        if (data) toast.success('Material updated')
      } else {
        const payload: any = {
          title,
          type,
          unique_id: contentUniqueId,
        }
        if (currentParentId) payload.parent_id = currentParentId

        if (contentKind === 'video' && contentAssetId) {
          payload.video_asset_id = contentAssetId
        }
        if ((contentKind === 'image' || contentKind === 'document') && contentFileUrl) {
          payload.file_url = contentFileUrl
        }

        const { data, error } = await createMaterial(payload)
        if (error) throw error
        if (data) toast.success('Material created successfully')
      }

      setShowContentModal(false)
      setEditingMaterialId(null)
    } catch (err: any) {
      console.error('Failed to save material', err)
      toast.error(err?.message || 'Failed to save material')
    }
  }

  // const toggle = (field: 'offlineDownload' | 'pdfPermissions') =>
  //   update({ [field]: !form[field] })

  return (
    <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
      {/* ── Left: Drill-down tree (8 cols) ── */}
      <div className="col-span-8 flex flex-col gap-4 min-h-0">

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
          <div className="flex items-center gap-3 px-3 py-2 bg-[#F2F4F6] rounded-xl">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#000B60] text-xs font-bold shadow-sm hover:bg-[#000B60] hover:text-white transition-colors shrink-0"
            >
              <PhArrowLeft size={14} weight="bold" />
              Back
            </button>

            <div className="h-6 w-px bg-gray-200" />

            {/* Breadcrumb trail */}
            <div className="flex items-center gap-1.5 text-xs flex-wrap min-w-0">
              <button
                type="button"
                onClick={() => setNavPath([])}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 font-semibold hover:text-[#000B60] hover:bg-white transition-colors"
              >
                <Home size={12} />
                Root
              </button>
              {navPath.map((crumb, idx) => {
                const isLast = idx === navPath.length - 1
                return (
                  <span key={crumb.id} className="flex items-center gap-1 min-w-0">
                    <ChevronRight size={12} className="text-gray-300 shrink-0" />
                    <button
                      type="button"
                      onClick={() => jumpTo(idx)}
                      className={`px-2 py-1 rounded-md font-semibold truncate max-w-[180px] transition-colors ${isLast
                        ? 'text-[#000B60] bg-white shadow-sm cursor-default'
                        : 'text-gray-500 hover:text-[#000B60] hover:bg-white'}`}
                    >
                      {crumb.title}
                    </button>
                  </span>
                )
              })}
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

        {/* Scrollable module section */}
        <div
          className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >

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
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentParentId ?? 'root'}-${contentLoading ? 'loading' : 'loaded'}`}
              className="flex flex-col gap-3"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {currentItems?.map(node => {
                if (node.item_type === 'folder') {
                  return (
                    <motion.div
                      key={node.id}
                      variants={rowVariants}
                      layout
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
                        <div className="relative" ref={menuOpenId === node.id ? menuRef : undefined}>
                          <button
                            type="button"
                            className="p-1 rounded-md text-[#000B60] hover:bg-[#000B60]/10"
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === node.id ? null : node.id) }}
                          >
                            <MoreVertical size={20} />
                          </button>
                          {menuOpenId === node.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30"
                            >
                              <button
                                type="button"
                                onClick={() => handleEditItem(node)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F2F4F6]"
                              >
                                <Pencil size={14} className="text-[#000B60]" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(node)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <CaretRight size={16} />
                      </div>
                    </motion.div>
                  )
                }

                // Material node (from course_materials)
                const dbType = (node.type as MaterialDbType) || 'PDF'
                const meta = MATERIAL_TYPE_META[dbType] ?? MATERIAL_TYPE_META.PDF
                return (
                  <motion.div
                    key={node.id}
                    variants={rowVariants}
                    layout
                    onClick={node?.type === "TEST" ? () => { } : () => setPreviewItem(node)}
                    className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-[#000B60]/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconColor}`}>
                        {meta.icon}
                      </div>
                      <div className="min-w-0">
                        <Paragraph className="text-black font-bold leading-tight truncate">{node.title}</Paragraph>
                        <p className="text-xs text-gray-500 mt-0.5">{meta.label}

                          {
                            node?.type === "VIDEO" && (
                              <span className="text-xs text-gray-500 mt-0.5 ml-1">
                                {
                                  node?.video_uploading_status === "uploaded" ? "waiting for transcoding" :
                                    node?.video_uploading_status === "TRANSCODING" ? "transcoding" :
                                      node?.video_uploading_status === "COMPLETED" ? "ready to play" :
                                        node?.video_uploading_status === "FAILED" ? "failed" :
                                          "Uploading..."

                                }
                              </span>
                            )
                          }

                          {
                            node?.type === "TEST" && (
                              <span className="text-xs text-gray-500 mt-0.5 ml-1">
                                {
                                  node?.material_status === "READY" ? "" : <span className="text-red-500">Draft</span>

                                }
                              </span>
                            )
                          }

                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <div className="relative" ref={menuOpenId === node.id ? menuRef : undefined}>
                        <button
                          type="button"
                          className="p-1 rounded-md text-[#000B60] hover:bg-[#000B60]/10"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === node.id ? null : node.id) }}
                        >
                          <MoreVertical size={20} />
                        </button>
                        {menuOpenId === node.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30"
                          >
                            <button
                              type="button"
                              onClick={node?.type === "TEST" ? () => navigate("/tests") : () => handleEditItem(node)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F2F4F6]"
                            >
                              <Pencil size={14} className="text-[#000B60]" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(node)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
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
                onClick={kind === "test" ? () => navigate("/tests/create") : () => openContentModal(kind)}
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
                // onClick={() => toggle(key)}
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

      {/* ── Folder Modal (create + edit) ── */}
      <Modal
        open={showFolderModal}
        onClose={closeFolderModal}
        title={editingFolderId ? 'Edit Folder' : (navPath.length > 0 ? 'New Sub-folder' : 'New Folder')}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="white" className='!h-10'
              onClick={closeFolderModal} disabled={isFolderSaving}>Cancel</Button>
            <Button
              variant="primary"
              className='!h-10'

              onClick={handleSubmitFolder}
              disabled={!folderName.trim() || isFolderSaving}
            >
              {isFolderSaving
                ? <Loader2 size={16} className="animate-spin" />
                : (editingFolderId ? 'Save Changes' : 'Create Folder')}
            </Button>
          </>
        }
      >
        {!editingFolderId && navPath.length > 0 && (
          <p className="text-xs text-gray-500">
            Inside: <span className="font-semibold text-[#000B60]">{navPath[navPath.length - 1].title}</span>
          </p>
        )}
        <Input
          label="Folder Name"
          placeholder="e.g. Module 1: Introduction"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmitFolder()}
          autoFocus
        />
      </Modal>

      {/* ── Add Content Modal ── */}
      <Modal
        open={showContentModal}
        onClose={() => { setShowContentModal(false); setEditingMaterialId(null) }}
        title={`${editingMaterialId ? 'Edit' : 'Add'} ${CONTENT_TYPES.find(t => t.kind === contentKind)?.label ?? 'Content'}`}
        footer={
          <>
            <Button variant="white" className='!h-10'
              onClick={() => {
                setShowContentModal(false);
                setEditingMaterialId(null)
              }}
              disabled={isMaterialSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className='!h-10'

              onClick={handleSaveContent}
            // disabled={isMaterialSaving || (contentKind === 'video' && contentUploadStatus === 'uploading') || contentFileUploading}
            >
              {isMaterialSaving
                ? <Loader2 size={16} className="animate-spin" />
                : (editingMaterialId ? 'Save Changes' : 'Save & Close')}
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
              videoBlockedMessage={getVideoBlockedMessage(videoTranscodeStatus)}
              onFile={handleContentVideoFile}
              onClear={() => {
                setContentVidPreview(null)
                setContentAssetId(null)
                setContentUploadStatus('idle')
                setContentUploadProgress(0)
                setVideoTranscodeStatus(null)
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

        {contentKind === 'image' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Image</label>
            <UploadBox
              accept="image/jpeg,image/png,image/webp"
              preview={contentFileUrl}
              previewType="image"
              icon={<LucideImage size={20} />}
              title="Upload Image"
              hint="JPEG, PNG or WebP"
              loading={contentFileUploading}
              onFile={handleContentFileUpload}
              onClear={() => {
                setContentFileUrl(null)
                setContentFileName(null)
              }}
            />
          </div>
        )}

        {contentKind === 'document' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Document</label>
            <UploadBox
              accept="application/pdf"
              preview={contentFileUrl}
              previewType="document"
              fileName={contentFileName}
              icon={<FilePdfIcon size={20} />}
              title="Upload Document"
              hint="PDF only"
              loading={contentFileUploading}
              onFile={handleContentFileUpload}
              onClear={() => {
                setContentFileUrl(null)
                setContentFileName(null)
              }}
            />
          </div>
        )}
      </Modal>

      {/* ── Material Preview Modal ── */}
      {
        previewItem && (() => {
          const dbType = (previewItem.type as MaterialDbType) || 'PDF'
          const meta = MATERIAL_TYPE_META[dbType] ?? MATERIAL_TYPE_META.PDF
          const fileUrl: string | undefined = previewItem.file_url
          const assetId: string | undefined = previewItem.video_asset_id
          const orgId = import.meta.env.VITE_TPSTREAMS_ORG_ID
          const accessToken = import.meta.env.VITE_TPSTREAMS_ACCESS_TOKEN
          const videoEmbed = assetId
            ? `https://app.tpstreams.com/embed/${orgId}/${assetId}/?access_token=${accessToken}`
            : null

          return (
            <Modal
              open={!!previewItem}
              onClose={() => setPreviewItem(null)}
              title={previewItem.title || meta.label}
              maxWidth="max-w-4xl"
              footer={
                <>
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#000B60] hover:underline"
                    >
                      <Download size={14} /> Open in new tab
                    </a>
                  )}
                  <Button variant="primary" className='!h-10'
                    onClick={() => setPreviewItem(null)}>Close</Button>
                </>
              }
            >
              <div className="flex items-center gap-3 -mt-1 mb-2">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconColor}`}>
                  {meta.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{previewItem.title}</p>
                  <p className="text-xs text-gray-400">{meta.label}</p>
                </div>
              </div>
              <div className="bg-[#F8F9FB] rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: 480 }}>
                {dbType === 'IMAGE' && fileUrl && (
                  <img src={fileUrl} alt={previewItem.title} className="max-h-[70vh] w-auto object-contain" />
                )}

                {dbType === 'PDF' && fileUrl && (
                  <iframe
                    src={fileUrl}
                    title={previewItem.title}
                    className="w-full h-[70vh] border-0 bg-white"
                  />
                )}

                {dbType === 'VIDEO' && videoEmbed && (() => {
                  const blocked = getVideoBlockedMessage(previewItem.video_uploading_status)
                  if (blocked) {
                    return (
                      <div className="flex flex-col items-center gap-2 py-12 px-6 text-center">
                        <Loader2 size={22} className="text-[#000B60] animate-spin" />
                        <p className="text-sm font-semibold text-[#000B60]">{blocked}</p>
                      </div>
                    )
                  }
                  return (
                    <div className="w-full">
                      <VideoPlayer src={videoEmbed} />
                    </div>
                  )
                })()}

                {dbType === 'LINK' && fileUrl && (
                  <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                    <LinkIcon size={32} className="text-[#1A7EBE]" />
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[#000B60] hover:underline break-all"
                    >
                      {fileUrl}
                    </a>
                  </div>
                )}

                {(dbType === 'NOTES' || (!fileUrl && !videoEmbed)) && (
                  <div className="flex flex-col items-center gap-2 py-12 px-6 text-center">
                    <StickyNote size={28} className="text-gray-300" />
                    <p className="text-sm text-gray-500">No preview available for this material.</p>
                  </div>
                )}
              </div>
            </Modal>
          )
        })()
      }

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title={`Delete ${deleteTarget?.item_type === 'folder' ? 'Folder' : 'Material'}`}
        itemName={deleteTarget?.title}
      />
    </div >
  )
}

export default Step2AcademicStructure
