import { useState } from 'react'
import { FolderSimple, DotsSixVertical, ArrowLeft as PhArrowLeft } from '@phosphor-icons/react'
import { ArrowRight, Download, FileText as FilePdfIcon } from 'lucide-react'
import { Button, Input, Modal, Paragraph, Subheading, Textarea } from '@/components/ui'
import type { CourseFormData, TreeNode, FolderNode, ContentNode, ContentKind } from './index'
import { IoAddCircleOutline } from 'react-icons/io5'
import { FaFolder } from 'react-icons/fa'
import { MdVideoLibrary } from 'react-icons/md'
import { BsPencilSquare } from 'react-icons/bs'
import { HiDocumentDuplicate } from 'react-icons/hi'
import { FaRegImage } from 'react-icons/fa6'
import { CaretRight } from '@phosphor-icons/react'

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

// ── Main component ────────────────────────────────────────────────────────────

const Step2AcademicStructure = ({ form, update, onNext, courseId }: Props) => {
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

  // Current parent ID for insert operations (last crumb's id, or null for root)
  const currentParentId = navPath.length > 0 ? navPath[navPath.length - 1].id : null
  const currentItems = getChildrenAt(form.tree, navPath)

  // ── Navigation ──
  const drillInto = (folder: FolderNode) =>
    setNavPath(prev => [...prev, { id: folder.id, title: folder.title }])

  const goBack = () => setNavPath(prev => prev.slice(0, -1))

  const jumpTo = (idx: number) => setNavPath(prev => prev.slice(0, idx + 1))

  // ── Folder modal ──
  const openFolderModal = () => { setFolderName(''); setShowFolderModal(true) }

  const handleCreateFolder = () => {
    const name = folderName.trim()
    if (!name) return
    const folder: FolderNode = { id: crypto.randomUUID(), kind: 'folder', title: name, children: [] }
    update({ tree: insertNode(form.tree, currentParentId, folder) })
    setShowFolderModal(false)
    setFolderName('')
  }

  // ── Content modal ──
  const openContentModal = () => {
    setContentTitle(''); setContentDesc(''); setContentKind('video')
    setVideoAccess(true); setHh('00'); setMm('00'); setSs('00')
    setShowContentModal(true)
  }

  const handleSaveContent = () => {
    const node: ContentNode = {
      id: crypto.randomUUID(),
      kind: contentKind,
      title: contentTitle || 'Untitled',
      description: contentDesc,
      videoAccess,
      watchTimeHH: hh,
      watchTimeMM: mm,
      watchTimeSS: ss,
    }
    update({ tree: insertNode(form.tree, currentParentId, node) })
    setShowContentModal(false)
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

        {/* Empty state */}
        {currentItems.length === 0 && (
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
          {currentItems.map(node => {
            if (node.kind === 'folder') {
              return (
                <div
                  key={node.id}
                  className="flex items-center justify-between px-4 py-3 bg-[#F2F4F6] rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => drillInto(node)}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                      <FaFolder size={17} className="text-[#000B60]" />
                    </div>
                    <div>
                      <Paragraph className="text-black font-bold leading-tight">{node.title}</Paragraph>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {node.children.length} item{node.children.length !== 1 ? 's' : ''}
                        {node.children.length === 0 ? ' • Empty' : ''}
                      </p>
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

            // Content node
            return (
              <div key={node.id} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-lg">
                <span className="text-[#000B60] shrink-0">{CONTENT_ICONS[node.kind]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{node.title}</p>
                  {node.kind === 'video' && (node.watchTimeHH !== '00' || node.watchTimeMM !== '00') && (
                    <p className="text-xs text-gray-400">{node.watchTimeHH}:{node.watchTimeMM}:{node.watchTimeSS}</p>
                  )}
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
                onClick={openContentModal}
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
        title="Add Content"
        footer={
          <>
            <Button variant="white" onClick={() => setShowContentModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveContent}>Save & Close</Button>
          </>
        }
      >
        {navPath.length > 0 && (
          <p className="text-xs text-gray-500">
            Into: <span className="font-semibold text-[#000B60]">{navPath[navPath.length - 1].title}</span>
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-gray-700">Content Type</label>
          <div className="grid grid-cols-4 gap-2">
            {CONTENT_TYPES.map(({ kind, label }) => (
              <button
                key={kind}
                type="button"
                onClick={() => setContentKind(kind)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-colors ${contentKind === kind
                    ? 'border-[#000B60] bg-[#000B60] text-white'
                    : 'border-gray-100 bg-[#F2F4F6] text-[#000B60]'
                  }`}
              >
                {CONTENT_ICONS[kind]}
                {label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Title"
          placeholder="e.g. Introduction to Business Law"
          value={contentTitle}
          onChange={e => setContentTitle(e.target.value)}
        />
        <Textarea
          label="Description"
          placeholder="Brief description of this content..."
          value={contentDesc}
          onChange={e => setContentDesc(e.target.value)}
          rows={3}
        />

        {contentKind === 'video' && (
          <>
            <div className="p-3 bg-[#F2F4F6] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Video Access</p>
                <p className="text-xs text-gray-400 mt-0.5">Lock prevents student viewing until unlocked</p>
              </div>
              <button
                type="button"
                onClick={() => setVideoAccess(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${videoAccess ? 'bg-[#000B60]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${videoAccess ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Video Duration</label>
              <div className="flex items-center gap-2">
                {[
                  { val: hh, set: setHh, ph: 'HH' },
                  { val: mm, set: setMm, ph: 'MM' },
                  { val: ss, set: setSs, ph: 'SS' },
                ].map(({ val, set, ph }, i) => (
                  <>
                    <input
                      key={ph}
                      className="w-14 text-center px-2 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm font-mono outline-none"
                      placeholder={ph}
                      value={val}
                      onChange={e => set(e.target.value)}
                      maxLength={2}
                    />
                    {i < 2 && <span className="text-gray-400">:</span>}
                  </>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default Step2AcademicStructure
