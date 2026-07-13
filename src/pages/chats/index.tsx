import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { Search, Paperclip, Mic, Send, FileText, Download, Check, Reply, X, Trash2, Clock, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { toast } from 'sonner'
import { Heading, Input, Paragraph, Skeleton, ConfirmDeleteModal } from '@/components/ui'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { formatDuration, pseudoPeaks } from '@/utils/audio'
import courseImg from '@/assets/images/cou1.png'
import brandLogo from '@/assets/icons/brand_icon.svg'
import { useNavigate, useLocation } from 'react-router-dom'
import { RiCustomerService2Line, RiChat3Line } from 'react-icons/ri'
import { useGetMyChatRooms, useGetAdminId, useStartAdminChat, useRoomMessages, useSendMessage, useSendAudioMessage, useSendFilesMessage, useDeleteMessage, useMarkRoomRead, useMarkMessagesSeen, useActiveThreadRealtime, useThreadCatchUp, useTyping } from '@/hooks/chat'
import { usePresenceHeartbeat, usePeerPresence } from '@/hooks/presence'
import { MessageAttachments } from '@/components/ui/MessageAttachments'
import { CHAT_ATTACHMENT_MAX_BYTES, type ChatRoomSummary, type ChatMessage, type ChatReplyPreview, type ChatAttachment } from '@/services/chatService'
import { useAuthStore } from '@/store/authStore'

// "last seen" label for an offline peer, e.g. "last seen 5m ago" / "yesterday".
const formatLastSeen = (iso: string): string => {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Display name for a room: the peer for DIRECT chats, falling back to the
// room's own name (admin rooms are labelled this way) then a generic label.
const roomName = (room: ChatRoomSummary): string =>
  (room.type === 'DIRECT' ? room.peer?.name || room.name : room.name) || 'Conversation'

// Avatar for a room (falls back to a placeholder when the peer has none).
const roomAvatar = (room: ChatRoomSummary): string =>
  room.peer?.avatar_url || courseImg

// One-line preview of the last message; non-text messages show their kind.
// Count of files in an attachment message's (decrypted) content, min 1.
const attachmentCount = (content: string | null): number => {
  if (!content) return 1
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed?.files) && parsed.files.length) return parsed.files.length
  } catch {
    /* not JSON */
  }
  return 1
}

// "📎"-prefixed label for a non-text message, count-aware for albums.
const attachmentLabel = (type: string, content: string | null): string => {
  if (type === 'IMAGE' || type === 'PDF') {
    const n = attachmentCount(content)
    const noun = type === 'IMAGE' ? 'Photo' : 'Document'
    return `📎 ${n > 1 ? `${n} ${noun}s` : noun}`
  }
  return `📎 ${type.charAt(0) + type.slice(1).toLowerCase()}`
}

const lastMessagePreview = (room: ChatRoomSummary): string => {
  const m = room.last_message
  if (!m) return 'No messages yet'
  if (m.is_deleted) return 'This message was deleted'
  if (m.message_type !== 'TEXT') return attachmentLabel(m.message_type, m.content)
  return m.content ?? ''
}

// WhatsApp-style timestamp for the list: time today, "Yesterday", weekday, else date.
const formatListTime = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(now) - startOf(date)) / 86_400_000)

  if (days === 0)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'long' }).toUpperCase()
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()
}

// Clock time for a message bubble, e.g. "9:48 AM".
const formatMessageTime = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''

// Midnight timestamp for a date, used to compare calendar days.
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

// Whether two ISO timestamps fall on the same calendar day.
const sameDay = (a: string | null, b: string | null): boolean =>
  !!a && !!b && startOfDay(new Date(a)) === startOfDay(new Date(b))

// Label for a day-separator: "Today", "Yesterday", a weekday within the last
// week, else a full date.
const dateSeparatorLabel = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return d.toLocaleDateString([], { weekday: 'long' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

// Human-readable attachment size + type, e.g. "2.4 MB • PDF Document".
const formatAttachment = (msg: ChatMessage): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = msg.file_size ?? 0
  let u = 0
  while (size >= 1024 && u < units.length - 1) {
    size /= 1024
    u++
  }
  const sizeLabel = `${size.toFixed(u === 0 ? 0 : 1)} ${units[u]}`
  const label = msg.message_type === 'PDF' ? 'PDF Document' : `${msg.message_type} Document`
  return `${sizeLabel} • ${label}`
}

// Initials avatar for a peer with no profile photo: first letter of the name on
// a deterministic background colour (same name → same colour every render).
const AVATAR_COLORS = ['#F97316', '#0EA5E9', '#8B5CF6', '#EC4899', '#10B981', '#6366F1', '#EF4444', '#F59E0B']
const colorForName = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
const initialOf = (name: string): string => name.trim().charAt(0).toUpperCase() || '?'

// Attachments of an IMAGE/PDF message: the album stored (as JSON) in decrypted
// `content`, falling back to the single file_url of older/legacy messages.
const parseAttachments = (msg: ChatMessage): ChatAttachment[] => {
  if (msg.content) {
    try {
      const parsed = JSON.parse(msg.content)
      if (Array.isArray(parsed?.files) && parsed.files.length)
        return parsed.files.map((f: any) => ({ url: f.url, name: f.name, size: f.size }))
    } catch {
      /* not JSON → fall through to the single-file path */
    }
  }
  if (msg.file_url) return [{ url: msg.file_url, name: msg.file_name ?? '', size: msg.file_size ?? 0 }]
  return []
}

// One-line text for a quoted (replied-to) message; non-text shows its kind.
const replyPreviewText = (r: ChatReplyPreview): string => {
  if (r.is_deleted) return 'This message was deleted'
  if (r.message_type !== 'TEXT') return attachmentLabel(r.message_type, r.content)
  return r.content ?? ''
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// WhatsApp-style thread background: the classic beige with a subtle repeating
// doodle pattern (inline SVG tile, no image asset needed).
const chatBgStyle: React.CSSProperties = {
  backgroundColor: '#efeae2',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23d9d1c3' stroke-width='1.3' stroke-linecap='round' opacity='0.55'%3E%3Ccircle cx='16' cy='18' r='5'/%3E%3Cpath d='M62 14l6 6m0-6l-6 6'/%3E%3Cpath d='M24 66q5-7 10 0'/%3E%3Ccircle cx='78' cy='72' r='3'/%3E%3Cpath d='M44 40l4 4m0-4l-4 4'/%3E%3Cpath d='M84 38q4-5 8 0'/%3E%3Ccircle cx='52' cy='86' r='4'/%3E%3Cpath d='M8 88l5 5m0-5l-5 5'/%3E%3C/g%3E%3C/svg%3E")`,
}

// An optimistic voice message that shows in the thread the moment you hit send,
// before its blob has finished uploading. It carries everything needed both to
// render the bubble locally (object-URL `src`, waveform `peaks`, `duration`)
// and to retry the upload (`blob`, `meta`, `replyToMessageId`). `status` flips
// 'uploading' → gone on success, or → 'error' (retryable) on failure.
interface PendingAudio {
  id: string
  roomId: string
  src: string
  duration: number
  peaks: number[]
  createdAt: string
  status: 'uploading' | 'error'
  blob: Blob
  meta: { duration: number; peaks: number[]; mimeType: string }
  replyToMessageId?: string | null
  replyTo: ChatReplyPreview | null
}

// An optimistic text message shown with a clock (⏱) tick the instant you hit
// send, until the server confirms it (then the real message replaces it) or the
// send fails (then it's removed and the text is restored to the input).
interface PendingText {
  id: string
  roomId: string
  content: string
  createdAt: string
  replyTo: ChatReplyPreview | null
}

// An optimistic attachment message (one or more images / PDFs) shown while the
// files upload. Images preview from local object URLs. `status` flips
// 'uploading' → gone on success, or → 'error' (retryable) on failure.
interface PendingFile {
  id: string
  roomId: string
  kind: 'IMAGE' | 'PDF'
  files: File[]
  // Local preview object URLs for images (empty for documents).
  previews: string[]
  createdAt: string
  status: 'uploading' | 'error'
  replyToMessageId?: string | null
  replyTo: ChatReplyPreview | null
}

const ChatsPage = () => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  // The message currently being replied to (null when composing a fresh one).
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  // The message briefly highlighted after jumping to it from a reply quote.
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightTimer = useRef<number | undefined>(undefined)
  // The message awaiting delete confirmation (null when the modal is closed).
  const [pendingDelete, setPendingDelete] = useState<ChatMessage | null>(null)
  // Voice messages currently uploading (or failed and awaiting retry), rendered
  // optimistically at the bottom of the open thread until the upload lands.
  const [pendingAudios, setPendingAudios] = useState<PendingAudio[]>([])
  // Text messages currently sending, shown optimistically with a clock tick.
  const [pendingTexts, setPendingTexts] = useState<PendingText[]>([])
  // Attachments currently uploading (or failed and awaiting retry).
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const pendingFilesRef = useRef<PendingFile[]>([])
  // In-app attachment viewer (image lightbox with album nav / PDF viewer).
  const [viewer, setViewer] = useState<
    | { kind: 'IMAGE'; images: { url: string; name: string }[]; index: number }
    | { kind: 'PDF'; url: string; name: string }
    | null
  >(null)
  // Attachment picker popover state + hidden file inputs (image / PDF).
  const [attachOpen, setAttachOpen] = useState(false)
  const attachWrapRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  // Latest pending-audio list, so the unmount cleanup can free object URLs.
  const pendingAudiosRef = useRef<PendingAudio[]>([])
  // Emoji picker open state, plus refs to place/close it and to insert at caret.
  const [emojiOpen, setEmojiOpen] = useState(false)
  const emojiWrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const myId = useAuthStore(s => s.user?.id)

  // A room we opened programmatically (a just-created one, or one handed over by
  // another page) isn't in the cached room list until ['chat-rooms'] refetches.
  // Remember it so the "room disappeared" guard below doesn't deselect it in the
  // meantime.
  const pendingOpenRef = useRef<string | null>(null)
  const openRoom = (roomId: string) => {
    pendingOpenRef.current = roomId
    setActiveId(roomId)
  }

  const { data: rooms = [], isLoading: leftLoading } = useGetMyChatRooms()
  const { data: adminId } = useGetAdminId()
  const {
    data: messagePages,
    isLoading: chatLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRoomMessages(activeId)

  // Pages come newest-first, each page oldest→newest internally. The thread
  // renders column-reverse (first item shown at the bottom), so flatten to one
  // newest→oldest list: newest message first → appears at the bottom.
  const messages = useMemo(
    () => (messagePages?.pages ?? []).flatMap(p => p.items.slice().reverse()),
    [messagePages],
  )
  const startAdminChat = useStartAdminChat()
  const sendMessage = useSendMessage()
  const sendAudioMessage = useSendAudioMessage()
  const sendFilesMessage = useSendFilesMessage()
  const deleteMessage = useDeleteMessage()
  const markRoomRead = useMarkRoomRead()
  const markMessagesSeen = useMarkMessagesSeen()

  // Voice-message recorder (mic → blob → upload).
  const recorder = useAudioRecorder()

  // Live updates for the open conversation (room list + delivered are handled
  // app-wide by useChatRealtimeGlobal in the app shell).
  useActiveThreadRealtime(activeId)

  // Self-heal the open thread on room open + window focus: quietly merges any
  // messages a missed realtime event left out, without reloading the view.
  useThreadCatchUp(activeId)

  // Ephemeral typing indicator for the open room (broadcast, no DB writes).
  const { peerTyping, notifyTyping, stopTyping } = useTyping(activeId, myId)

  // Broadcast my own presence for as long as I'm on the chat page (online +
  // heartbeat now, offline on leave). Live presence of the open peer for the
  // header's active / last-seen indicator.
  usePresenceHeartbeat(!!myId)

  const handleSend = () => {
    const body = text.trim()
    if (!activeId || !body) return
    const replyToMessageId = replyTo?.id
    const replyTarget = replyTo
    // Show the message immediately with a clock tick, then clear the composer.
    const id = `pending-${crypto.randomUUID()}`
    const pending: PendingText = {
      id,
      roomId: activeId,
      content: body,
      createdAt: new Date().toISOString(),
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            sender_id: replyTarget.sender_id,
            message_type: replyTarget.message_type,
            content: replyTarget.content,
            is_deleted: replyTarget.is_deleted,
          }
        : null,
    }
    setPendingTexts(list => [...list, pending])
    setText('')
    setReplyTo(null)
    stopTyping()
    sendMessage.mutate(
      { roomId: activeId, content: body, replyToMessageId },
      {
        onSuccess: () => setPendingTexts(list => list.filter(p => p.id !== id)),
        onError: (err: any) => {
          setPendingTexts(list => list.filter(p => p.id !== id))
          setText(body)
          toast.error(err?.message ?? 'Could not send message')
        },
      },
    )
  }

  // Start recording a voice message (asks for mic permission).
  const handleStartRecording = async () => {
    stopTyping()
    try {
      await recorder.start()
    } catch {
      toast.error('Microphone access is required to record a voice message')
    }
  }

  // Upload (or re-upload) a pending voice message. Flips it back to 'uploading'
  // while in flight; on success the real message arrives via the thread refresh,
  // so we drop the placeholder (and free its object URL); on failure we mark it
  // 'error' so its bubble offers a retry button.
  const uploadAudio = (pending: PendingAudio) => {
    setPendingAudios(list =>
      list.map(p => (p.id === pending.id ? { ...p, status: 'uploading' } : p)),
    )
    sendAudioMessage.mutate(
      {
        roomId: pending.roomId,
        blob: pending.blob,
        meta: pending.meta,
        replyToMessageId: pending.replyToMessageId,
      },
      {
        onSuccess: () => {
          URL.revokeObjectURL(pending.src)
          setPendingAudios(list => list.filter(p => p.id !== pending.id))
        },
        onError: (err: any) => {
          setPendingAudios(list =>
            list.map(p => (p.id === pending.id ? { ...p, status: 'error' } : p)),
          )
          toast.error(err?.message ?? 'Could not send voice message')
        },
      },
    )
  }

  // Stop recording and show the voice bubble immediately (spinner on play) while
  // it uploads in the background. The waveform was captured live during
  // recording, so there's no decode step — even a long clip shows instantly.
  const handleSendAudio = async () => {
    const result = await recorder.stop()
    if (!result || !activeId) return
    const id = `pending-${crypto.randomUUID()}`
    const peaks = result.peaks.length ? result.peaks : pseudoPeaks(id)
    const duration = result.duration
    const replyToMessageId = replyTo?.id
    const replyTarget = replyTo
    setReplyTo(null)

    const pending: PendingAudio = {
      id,
      roomId: activeId,
      src: URL.createObjectURL(result.blob),
      duration,
      peaks,
      createdAt: new Date().toISOString(),
      status: 'uploading',
      blob: result.blob,
      meta: { duration, peaks, mimeType: result.mimeType },
      replyToMessageId,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            sender_id: replyTarget.sender_id,
            message_type: replyTarget.message_type,
            content: replyTarget.content,
            is_deleted: replyTarget.is_deleted,
          }
        : null,
    }
    setPendingAudios(list => [...list, pending])
    uploadAudio(pending)
  }

  // Retry a voice message whose upload failed.
  const retryAudio = (id: string) => {
    const pending = pendingAudios.find(p => p.id === id)
    if (pending) uploadAudio(pending)
  }

  // Upload (or re-upload) a pending attachment message; mirrors uploadAudio.
  const uploadFiles = (pending: PendingFile) => {
    setPendingFiles(list =>
      list.map(p => (p.id === pending.id ? { ...p, status: 'uploading' } : p)),
    )
    sendFilesMessage.mutate(
      {
        roomId: pending.roomId,
        files: pending.files,
        kind: pending.kind,
        replyToMessageId: pending.replyToMessageId,
      },
      {
        onSuccess: () => {
          pending.previews.forEach(u => u && URL.revokeObjectURL(u))
          setPendingFiles(list => list.filter(p => p.id !== pending.id))
        },
        onError: (err: any) => {
          setPendingFiles(list =>
            list.map(p => (p.id === pending.id ? { ...p, status: 'error' } : p)),
          )
          toast.error(err?.message ?? 'Could not send attachment')
        },
      },
    )
  }

  // Retry an attachment message whose upload failed.
  const retryFile = (id: string) => {
    const pending = pendingFiles.find(p => p.id === id)
    if (pending) uploadFiles(pending)
  }

  // Open the hidden file input for the picked attachment kind.
  const pickAttachment = (kind: 'IMAGE' | 'PDF') => {
    setAttachOpen(false)
    ;(kind === 'IMAGE' ? imageInputRef : docInputRef).current?.click()
  }

  // Validate the chosen files (type + 5 MB cap each), then show them as one
  // optimistic album message and upload in the background.
  const handleFileSelected = (kind: 'IMAGE' | 'PDF', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    // Reset so picking the same file again still fires onChange.
    e.target.value = ''
    if (!files.length || !activeId) return

    for (const file of files) {
      const validType =
        kind === 'IMAGE' ? file.type.startsWith('image/') : file.type === 'application/pdf'
      if (!validType) {
        toast.error(kind === 'IMAGE' ? 'Only images can be attached' : 'Only PDF documents can be attached')
        return
      }
      if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
        toast.error(`"${file.name}" is too large — maximum size is 5 MB`)
        return
      }
    }

    const replyTarget = replyTo
    setReplyTo(null)
    const pending: PendingFile = {
      id: `pending-${crypto.randomUUID()}`,
      roomId: activeId,
      kind,
      files,
      previews: kind === 'IMAGE' ? files.map(f => URL.createObjectURL(f)) : [],
      createdAt: new Date().toISOString(),
      status: 'uploading',
      replyToMessageId: replyTarget?.id,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            sender_id: replyTarget.sender_id,
            message_type: replyTarget.message_type,
            content: replyTarget.content,
            is_deleted: replyTarget.is_deleted,
          }
        : null,
    }
    setPendingFiles(list => [...list, pending])
    uploadFiles(pending)
  }

  // Open the image lightbox / PDF viewer for an attachment.
  const openImageViewer = (images: { url: string; name: string }[], index: number) =>
    setViewer({ kind: 'IMAGE', images, index })
  const openPdfViewer = (url: string, name: string) => setViewer({ kind: 'PDF', url, name })

  // Open the confirm modal for one of my own messages.
  const handleDelete = (msg: ChatMessage) => setPendingDelete(msg)

  // Confirmed delete: soft-delete the message (leaving a tombstone) and drop it
  // as the reply target if it was being quoted.
  const confirmDelete = () => {
    const msg = pendingDelete
    if (!msg || !activeId) return
    if (replyTo?.id === msg.id) setReplyTo(null)
    deleteMessage.mutate(
      { messageId: msg.id, roomId: activeId },
      {
        onSuccess: () => setPendingDelete(null),
        onError: (err: any) => {
          setPendingDelete(null)
          toast.error(err?.message ?? 'Could not delete message')
        },
      },
    )
  }

  // Label for who authored a quoted message ("You" for the current user).
  const replyAuthor = (senderId: string): string =>
    senderId === myId ? 'You' : active ? roomName(active) : ''

  // Hide the "Chat with admin" button once a room with the admin already exists.
  const hasAdminRoom = !!adminId && rooms.some(r => r.peer?.id === adminId)

  // The admin has no profile picture → use the brand logo for its conversation.
  const isAdminRoom = (room: ChatRoomSummary): boolean =>
    !!adminId && room.peer?.id === adminId
  const avatarFor = (room: ChatRoomSummary): string =>
    isAdminRoom(room) ? brandLogo : roomAvatar(room)
  // Logo needs centering/padding; real photos should fill the tile.
  const avatarClass = (room: ChatRoomSummary): string =>
    isAdminRoom(room) ? 'object-contain p-2.5 bg-gray-100' : 'object-cover'

  const handleChatWithAdmin = () => {
    startAdminChat.mutate(undefined, {
      onSuccess: ({ roomId }) => openRoom(roomId),
      onError: (err: any) => toast.error(err?.message ?? 'Could not start chat with admin'),
    })
  }

  // Open the room another page sent us to (e.g. "Message Student" on a student's
  // profile), then clear it from history state so a refresh doesn't reopen it.
  const incomingRoomId = (location.state as { roomId?: string } | null)?.roomId
  useEffect(() => {
    if (!incomingRoomId) return
    openRoom(incomingRoomId)
    navigate('/chats', { replace: true, state: null })
  }, [incomingRoomId, navigate])

  const filtered = useMemo(
    () => rooms.filter(r => roomName(r).toLowerCase().includes(search.toLowerCase())),
    [rooms, search],
  )

  const active = rooms.find(r => r.id === activeId) ?? null
  const peerPresence = usePeerPresence(active?.peer?.id)

  // Optimistic bubbles for the open room only (uploading / sending), merged and
  // ordered by time so they sit at the bottom in the right sequence.
  const roomPendingAudios = pendingAudios.filter(p => p.roomId === activeId)
  const roomPendingTexts = pendingTexts.filter(p => p.roomId === activeId)
  const roomPendingFiles = pendingFiles.filter(p => p.roomId === activeId)
  const roomPending = [
    ...roomPendingAudios.map(p => ({ kind: 'audio' as const, id: p.id, createdAt: p.createdAt, audio: p })),
    ...roomPendingTexts.map(p => ({ kind: 'text' as const, id: p.id, createdAt: p.createdAt, text: p })),
    ...roomPendingFiles.map(p => ({ kind: 'file' as const, id: p.id, createdAt: p.createdAt, file: p })),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  // A room has a real photo when it's the admin room (brand logo) or the peer
  // has an avatar; otherwise the list shows an initials avatar instead.
  const roomPhoto = (room: ChatRoomSummary): string | undefined =>
    isAdminRoom(room) ? brandLogo : room.peer?.avatar_url || undefined

  // If the open room disappears from the list, fall back to the welcome screen —
  // unless it's one we just opened and the list hasn't caught up with it yet.
  useEffect(() => {
    if (!activeId) return
    if (rooms.some(r => r.id === activeId)) {
      pendingOpenRef.current = null
      return
    }
    if (pendingOpenRef.current !== activeId) setActiveId(null)
  }, [rooms, activeId])

  // Drop any in-progress reply when switching conversations.
  useEffect(() => {
    setReplyTo(null)
  }, [activeId])

  // Clear the highlight timer on unmount.
  useEffect(() => () => window.clearTimeout(highlightTimer.current), [])

  // Keep refs to the pending audios/files and free their object URLs on unmount
  // so in-flight/failed uploads don't leak blob memory when leaving the page.
  pendingAudiosRef.current = pendingAudios
  pendingFilesRef.current = pendingFiles
  useEffect(
    () => () => {
      pendingAudiosRef.current.forEach(p => URL.revokeObjectURL(p.src))
      pendingFilesRef.current.forEach(p => p.previews.forEach(u => u && URL.revokeObjectURL(u)))
    },
    [],
  )

  // Close the attachment picker on any click outside it.
  useEffect(() => {
    if (!attachOpen) return
    const onDown = (e: MouseEvent) => {
      if (attachWrapRef.current && !attachWrapRef.current.contains(e.target as Node))
        setAttachOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [attachOpen])

  // Close the attachment viewer with Escape.
  useEffect(() => {
    if (!viewer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewer(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [viewer])

  // Download an attachment without opening a tab: fetch it as a blob and click
  // a same-origin object URL (a plain `download` attr is ignored cross-origin).
  const downloadAttachment = async (url: string, name: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = name || 'attachment'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast.error('Could not download file')
    }
  }

  // Close the emoji picker on any click outside it (the trigger lives inside the
  // wrapper too, so tapping it just toggles rather than close-then-reopen).
  useEffect(() => {
    if (!emojiOpen) return
    const onDown = (e: MouseEvent) => {
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target as Node))
        setEmojiOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [emojiOpen])

  // Insert a picked emoji at the caret (falling back to the end), keeping focus.
  const insertEmoji = (emoji: string) => {
    const el = inputRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    setText(text.slice(0, start) + emoji + text.slice(end))
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  // The thread renders bottom-up (CSS column-reverse): the newest message sits
  // at the bottom and is visible the moment a room opens, with no scroll
  // scripting. The browser also keeps the view pinned to the bottom for new
  // messages and preserves position when older history is prepended above.
  //
  // We only need to load older pages as the user scrolls UP to the very top.
  // In a column-reverse scroller the top is reached as the (negative) scrollTop
  // magnitude approaches its max, so measure the remaining distance to the top.
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromTop = el.scrollHeight - el.clientHeight - Math.abs(el.scrollTop)
    if (distanceFromTop <= 80 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  // Jump to a quoted message when its reply preview is clicked. If the target
  // isn't loaded yet, keep pulling older pages until it appears (or we run out),
  // then smooth-scroll to it and flash a highlight.
  const scrollToMessage = async (id: string) => {
    const find = () =>
      scrollRef.current?.querySelector<HTMLElement>(`[data-msg-id="${id}"]`) ?? null

    let el = find()
    for (let i = 0; !el && hasNextPage && i < 20; i++) {
      await fetchNextPage()
      await new Promise(r => requestAnimationFrame(() => r(null)))
      el = find()
    }
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightId(id)
    window.clearTimeout(highlightTimer.current)
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1600)
  }

  // Keep the open room marked as read/seen — on open, and whenever a new
  // message arrives while it's open (so its unread badge never shows for the
  // active room, and the sender's ticks turn blue).
  useEffect(() => {
    if (activeId && !chatLoading) {
      markRoomRead.mutate(activeId)
      markMessagesSeen.mutate(activeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, chatLoading, messages.length])

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="w-[300px] lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col bg-white">

        <motion.div
          className="px-5 pt-6 pb-4 shrink-0"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Heading className="text-[#2c1452] mb-4">Messages</Heading>
          <Input
            placeholder="Search Students"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />

          {!hasAdminRoom && (
            <button
              onClick={handleChatWithAdmin}
              disabled={startAdminChat.isPending}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#2c1452] text-white text-sm font-semibold py-2.5 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <RiCustomerService2Line size={18} />
              {startAdminChat.isPending ? 'Starting…' : 'Chat with admin'}
            </button>
          )}
        </motion.div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
          <AnimatePresence mode="wait">
            {leftLoading ? (
              <motion.div
                key="left-skeleton"
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <Skeleton className="h-15 w-15 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="conv-list"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2"
              >
                {filtered.length === 0 ? (
                  <Paragraph className="text-gray-400 text-center !text-sm py-10">
                    No conversations yet
                  </Paragraph>
                ) : (
                  filtered.map(conv => (
                    <motion.button
                      key={conv.id}
                      variants={listItemVariants}
                      onClick={() => setActiveId(conv.id)}
                      style={activeId === conv.id ? { boxShadow: '0 16px 32px rgba(0, 11, 96, 0.12)' } : {}}
                      className={`w-full text-left px-5 py-3.5 flex items-start gap-3 transition-colors border-l-2 ${activeId === conv.id
                        ? 'border-l-4 border-[#2c1452] rounded-xl'
                        : activeId === null
                          ? 'border-transparent bg-gray-50 rounded-xl hover:bg-gray-100'
                          : 'border-transparent hover:bg-gray-50'
                        }`}
                    >
                      {roomPhoto(conv) ? (
                        <img src={roomPhoto(conv)} alt={roomName(conv)} className={`w-15 h-15 rounded-xl shrink-0 mt-0.5 ${avatarClass(conv)}`} />
                      ) : (
                        <div
                          className="w-15 h-15 rounded-xl shrink-0 mt-0.5 flex items-center justify-center text-white text-xl font-bold"
                          style={{ backgroundColor: colorForName(roomName(conv)) }}
                        >
                          {initialOf(roomName(conv))}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <Paragraph className="text-[#191c1e] truncate font-bold">{roomName(conv)}</Paragraph>
                          <span className="text-[10px] text-black shrink-0 ml-2">{formatListTime(conv.last_message_at)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Paragraph className="text-gray-400 truncate !text-sm">{lastMessagePreview(conv)}</Paragraph>
                          {conv.unread_count > 0 && (
                            <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#2c1452] text-white text-[10px] font-bold flex items-center justify-center">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100">

        {!active ? (
          activeId ? (
            /* A room we just opened, still waiting on the room list to load it. */
            <div className="flex-1 flex items-center justify-center">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#2c1452] border-t-transparent" />
            </div>
          ) : (
            /* Welcome screen — shown until the user opens a conversation. */
            <motion.div
              className="flex-1 flex flex-col items-center justify-center text-center px-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="w-20 h-20 rounded-2xl bg-[#2c1452]/10 flex items-center justify-center mb-4">
                <RiChat3Line size={40} className="text-[#2c1452]" />
              </div>
              <Heading className="text-[#2c1452] mb-1">Welcome to Chat</Heading>
              <Paragraph className="text-gray-400 !text-sm max-w-xs">
                {rooms.length === 0
                  ? 'You have no conversations yet. Start one with the admin to get going.'
                  : 'Select a conversation from the left to start chatting.'}
              </Paragraph>
            </motion.div>
          )
        ) : (
          <>
            {/* Chat Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`header-${activeId}`}
                className="flex items-center justify-between px-6 py-2.5 border-b border-gray-200 shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3">
                  {/* Admin room → brand logo; peer with a photo → photo; no
                      photo → initials avatar (same look as the room list). */}
                  {active && isAdminRoom(active) ? (
                    <img src={brandLogo} alt={roomName(active)} className="w-10 h-10 rounded-lg object-contain p-1.5 bg-gray-100" />
                  ) : active?.peer?.avatar_url ? (
                    <img src={active.peer.avatar_url} alt={roomName(active)} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white"
                      style={{ backgroundColor: colorForName(active ? roomName(active) : '?') }}
                    >
                      {initialOf(active ? roomName(active) : '')}
                    </div>
                  )}
                  <div>
                    {/* Clicking the name opens the student's profile — except for
                        the admin conversation, which has no profile page here. */}
                    {active && !isAdminRoom(active) && active.peer?.id ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/students/${active.peer!.id}`)}
                        title="View profile"
                        className="block text-left"
                      >
                        <Paragraph className="text-sm font-bold text-[#2c1452]">{roomName(active)}</Paragraph>
                      </button>
                    ) : (
                      <Paragraph className="text-sm font-bold text-[#2c1452]">{active ? roomName(active) : ''}</Paragraph>
                    )}
                    {peerPresence.isOnline ? (
                      <Paragraph className="!text-[10px] text-green-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Online
                      </Paragraph>
                    ) : (
                      <Paragraph className="!text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                        {peerPresence.lastSeen ? `last seen ${formatLastSeen(peerPresence.lastSeen)}` : 'Offline'}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Messages — rendered column-reverse so the newest message sits at
                the bottom and is visible the instant a room opens. Scrolling up
                loads older history (older pages prepend above without a jump). */}
            <div ref={scrollRef} onScroll={handleScroll} style={chatBgStyle} className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col-reverse gap-4">
              {/* Typing indicator — first child so it pins to the bottom (newest). */}
              {peerTyping && !chatLoading && (
                <div className="flex items-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                  </div>
                </div>
              )}

              {/* Optimistic bubbles (voice / text / attachments): shown the
                  instant you hit send, with a clock tick while in flight.
                  Removed once the real message lands. Newest first (column-
                  reverse places the first child at the bottom). */}
              {roomPending.slice().reverse().map(p => {
                const quote = p.kind === 'audio' ? p.audio.replyTo : p.kind === 'text' ? p.text.replyTo : p.file.replyTo
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="group flex flex-col items-end"
                  >
                    <div className="flex max-w-[75%] items-center gap-2 flex-row-reverse">
                      <div className="min-w-0 rounded-2xl rounded-tr-sm bg-[#2c1452] px-3 py-2 text-white">
                        {quote && (
                          <div className="mb-2 w-full rounded-lg border-l-2 border-white/60 bg-white/15 px-2.5 py-1.5 text-left">
                            <p className="text-[11px] font-bold text-white">{replyAuthor(quote.sender_id)}</p>
                            <p className="truncate text-[11px] text-white/80">{replyPreviewText(quote)}</p>
                          </div>
                        )}
                        {p.kind === 'audio' ? (
                          <AudioPlayer
                            src={p.audio.src}
                            meta={{ d: p.audio.duration, w: p.audio.peaks }}
                            seed={p.audio.id}
                            mine
                            uploadState={p.audio.status}
                            onRetry={() => retryAudio(p.audio.id)}
                          />
                        ) : p.kind === 'text' ? (
                          <Paragraph className="!text-sm leading-relaxed text-white">{p.text.content}</Paragraph>
                        ) : p.file.kind === 'IMAGE' ? (
                          // Optimistic image album: local previews + spinner overlay.
                          p.file.previews.length === 1 ? (
                            <div className="relative">
                              <img src={p.file.previews[0]} alt="" className="max-h-[280px] max-w-[230px] rounded-lg object-cover opacity-80" />
                              {p.file.status === 'uploading' && (
                                <span className="absolute inset-0 m-auto h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              )}
                            </div>
                          ) : (
                            <div className="grid w-[230px] grid-cols-2 gap-1">
                              {p.file.previews.slice(0, 4).map((u, i) => {
                                const wide = p.file.previews.length === 3 && i === 0
                                const extra = p.file.previews.length - 4
                                return (
                                  <div key={i} className={`relative overflow-hidden rounded-lg ${wide ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                    <img src={u} alt="" className="h-full w-full object-cover opacity-80" />
                                    {i === 3 && extra > 0 && (
                                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">+{extra}</span>
                                    )}
                                    {p.file.status === 'uploading' && i === 0 && (
                                      <span className="absolute inset-0 m-auto h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        ) : (
                          // Optimistic PDF card list.
                          <div className="flex flex-col gap-2">
                            {p.file.files.map((f, i) => (
                              <div key={i} className="flex min-w-[200px] items-center gap-3 rounded-xl bg-white px-3 py-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                  {p.file.status === 'uploading' ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                                  ) : (
                                    <FileText size={14} className="text-blue-600" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-[#191c1e]">{f.name}</p>
                                  <p className="text-[10px] text-gray-400">
                                    {p.file.status === 'uploading' ? 'Uploading…' : 'Failed'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-1 flex-row-reverse">
                      <span className="text-[10px] text-black">{formatMessageTime(p.createdAt)}</span>
                      {p.kind === 'audio' && p.audio.status === 'error' ? (
                        <span className="text-[10px] font-semibold text-red-500">Not sent</span>
                      ) : p.kind === 'file' && p.file.status === 'error' ? (
                        <button
                          onClick={() => retryFile(p.file.id)}
                          className="text-[10px] font-semibold text-red-500 hover:underline"
                        >
                          Not sent — Retry
                        </button>
                      ) : (
                        // Clock tick while the message is still being sent (WhatsApp-style).
                        <Clock size={12} className="text-gray-400" />
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {chatLoading ? (
                <div className="flex flex-col gap-4 flex-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-3/5' : 'w-2/3'}`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 && roomPending.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10">
                  <Paragraph className="text-gray-400 !text-sm">No messages yet — say hello 👋</Paragraph>
                </div>
              ) : (
                <>
                  {messages.map((msg: ChatMessage, i: number) => {
                    const mine = msg.sender_id === myId
                    // Messages are newest→oldest here; a day-separator sits above
                    // (i.e. after, in this reversed list) the oldest message of a
                    // day.
                    const older = messages[i + 1]
                    const showSeparator = !sameDay(older?.created_at ?? null, msg.created_at)
                    return (
                      <Fragment key={msg.id}>
                        <motion.div
                          // Own messages already appeared as the optimistic clock
                          // bubble — re-animating the confirmed one would flicker,
                          // so only peer messages get the entrance animation.
                          initial={mine ? false : { opacity: 0, y: 16, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                          data-msg-id={msg.id}
                          className={`group flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`flex items-center gap-2 max-w-[75%] ${mine ? 'flex-row-reverse' : ''}`}>
                            <div className={`min-w-0 rounded-2xl px-3 py-2 transition-shadow ${mine
                              ? 'bg-[#2c1452] text-white rounded-tr-sm'
                              : 'bg-white text-[#191c1e] rounded-tl-sm'
                              } ${highlightId === msg.id ? 'ring-2 ring-offset-2 ring-[#2c1452]' : ''}`}>
                              {msg.is_deleted ? (
                                <Paragraph className={`!text-sm italic flex items-center gap-1.5 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                                  <Trash2 size={13} /> This message was deleted
                                </Paragraph>
                              ) : (
                                <>
                                  {msg.reply_to && (
                                    <button
                                      type="button"
                                      onClick={() => msg.reply_to && scrollToMessage(msg.reply_to.id)}
                                      className={`mb-2 w-full text-left rounded-lg border-l-2 px-2.5 py-1.5 transition-opacity hover:opacity-80 ${mine ? 'border-white/60 bg-white/15' : 'border-[#2c1452] bg-gray-100'}`}
                                    >
                                      <p className={`text-[11px] font-bold ${mine ? 'text-white' : 'text-[#2c1452]'}`}>{replyAuthor(msg.reply_to.sender_id)}</p>
                                      <p className={`text-[11px] truncate ${mine ? 'text-white/80' : 'text-gray-500'}`}>{replyPreviewText(msg.reply_to)}</p>
                                    </button>
                                  )}
                                  {msg.message_type === 'AUDIO' && msg.file_url ? (
                                    <AudioPlayer src={msg.file_url} content={msg.content} seed={msg.id} mine={mine} />
                                  ) : msg.message_type === 'IMAGE' ? (
                                    <MessageAttachments
                                      kind="IMAGE"
                                      items={parseAttachments(msg)}
                                      onOpenImage={openImageViewer}
                                      onOpenPdf={openPdfViewer}
                                      onDownload={downloadAttachment}
                                    />
                                  ) : msg.message_type === 'PDF' ? (
                                    <MessageAttachments
                                      kind="PDF"
                                      items={parseAttachments(msg)}
                                      onOpenImage={openImageViewer}
                                      onOpenPdf={openPdfViewer}
                                      onDownload={downloadAttachment}
                                    />
                                  ) : (
                                    <>
                                      {msg.content && (
                                        <Paragraph className={`!text-sm leading-relaxed ${mine ? 'text-white' : 'text-[#191c1e]'}`}>
                                          {msg.content}
                                        </Paragraph>
                                      )}

                                      {/* Legacy non-text types (VIDEO / FILE). */}
                                      {msg.message_type !== 'TEXT' && msg.file_url && (
                                        <div className={`flex items-center gap-3 ${msg.content ? 'mt-3' : ''} bg-white rounded-xl px-3 py-2`}>
                                          <button
                                            type="button"
                                            onClick={() => downloadAttachment(msg.file_url!, msg.file_name ?? 'Attachment')}
                                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                            title="Download"
                                          >
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                              <FileText size={14} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-semibold text-[#191c1e] truncate">{msg.file_name ?? 'Attachment'}</p>
                                              <p className="text-[10px] text-gray-400">{formatAttachment(msg)}</p>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => downloadAttachment(msg.file_url!, msg.file_name ?? 'Attachment')}
                                            title="Download"
                                            className="shrink-0 text-gray-400 hover:text-[#2c1452]"
                                          >
                                            <Download size={14} />
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            {!msg.is_deleted && (
                              <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  title="Reply"
                                  className="text-gray-400 hover:text-[#2c1452]"
                                >
                                  <Reply size={15} />
                                </button>
                                {mine && (
                                  <button
                                    onClick={() => handleDelete(msg)}
                                    title="Delete"
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className={`flex items-center gap-1 mt-1 ${mine ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-black">{formatMessageTime(msg.created_at)}</span>
                            {mine && !msg.is_deleted && (
                              <span className="flex items-center">
                                {/* sent → 1 tick, delivered → 2 grey, seen → 2 blue */}
                                <Check size={13} strokeWidth={3} className={msg.status === 'seen' ? 'text-[#53BDEB]' : 'text-gray-400'} />
                                {msg.status !== 'sent' && (
                                  <Check size={13} strokeWidth={3} className={`-ml-[7px] ${msg.status === 'seen' ? 'text-[#53BDEB]' : 'text-gray-400'}`} />
                                )}
                              </span>
                            )}
                          </div>
                        </motion.div>

                        {showSeparator && (
                          <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="shrink-0 rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-gray-500 shadow-sm">
                              {dateSeparatorLabel(msg.created_at)}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                      </Fragment>
                    )
                  })}

                  {/* Loading older history — sits at the top in column-reverse. */}
                  {isFetchingNextPage && (
                    <div className="flex flex-col gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <Skeleton className={`h-14 rounded-2xl ${i % 2 === 0 ? 'w-3/5' : 'w-2/3'}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Bar */}
            <motion.div
              className="shrink-0 px-6 py-4 border-t border-gray-200"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            >
              {replyTo && (
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-white border-l-4 border-[#2c1452] px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#2c1452]">
                      Replying to {replyAuthor(replyTo.sender_id)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {replyPreviewText(replyTo)}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    title="Cancel reply"
                    className="shrink-0 text-gray-400 hover:text-[#2c1452]"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3">
                {recorder.isRecording ? (
                  <>
                    <button
                      onClick={recorder.cancel}
                      title="Cancel recording"
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex flex-1 items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm tabular-nums text-[#191c1e]">{formatDuration(recorder.elapsed)}</span>
                      {/* Live waveform: bars rise and fall with your voice. */}
                      <div className="flex h-8 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden">
                        {recorder.waveform.length === 0 ? (
                          <span className="text-xs text-gray-400">Recording…</span>
                        ) : (
                          recorder.waveform.map((h, i) => (
                            <span
                              key={i}
                              className="w-[3px] shrink-0 rounded-full bg-[#2c1452]/70"
                              style={{ height: `${Math.max(10, h)}%` }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSendAudio}
                      disabled={sendAudioMessage.isPending}
                      title="Send voice message"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-50"
                      style={{ background: '#2c1452' }}
                    >
                      <Send size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative shrink-0" ref={emojiWrapRef}>
                      {emojiOpen && <EmojiPicker onSelect={insertEmoji} />}
                      <button
                        type="button"
                        onClick={() => setEmojiOpen(o => !o)}
                        title="Emoji"
                        className={`transition-colors ${emojiOpen ? 'text-[#2c1452]' : 'text-gray-400 hover:text-[#2c1452]'}`}
                      >
                        😊
                      </button>
                    </div>
                    <div className="relative shrink-0" ref={attachWrapRef}>
                      {attachOpen && (
                        <div className="absolute bottom-full left-0 z-50 mb-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => pickAttachment('IMAGE')}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#191c1e] hover:bg-gray-50"
                          >
                            <ImageIcon size={16} className="text-[#2c1452]" />
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => pickAttachment('PDF')}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#191c1e] hover:bg-gray-50"
                          >
                            <FileText size={16} className="text-red-500" />
                            Document (PDF)
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setAttachOpen(o => !o)}
                        title="Attach (image or PDF, max 5 MB)"
                        className={`transition-colors ${attachOpen ? 'text-[#2c1452]' : 'text-gray-400 hover:text-[#2c1452]'}`}
                      >
                        <Paperclip size={18} />
                      </button>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handleFileSelected('IMAGE', e)}
                    />
                    <input
                      ref={docInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      multiple
                      className="hidden"
                      onChange={e => handleFileSelected('PDF', e)}
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={active ? `Type your message to ${roomName(active)}...` : 'Type your message...'}
                      value={text}
                      onChange={e => { setText(e.target.value); notifyTyping() }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
                      className="flex-1 bg-transparent text-sm outline-none text-[#191c1e] placeholder-gray-400"
                    />
                    {text.trim() ? (
                      <button
                        onClick={handleSend}
                        disabled={sendMessage.isPending}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-50"
                        style={{ background: 'linear-gradient(to right, #2c1452, #2c1452)' }}
                      >
                        <Send size={15} />
                      </button>
                    ) : (
                      /* Voice message send option — commented out per request
                      <button
                        onClick={handleStartRecording}
                        title="Record voice message"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: '#2c1452' }}
                      >
                        <Mic size={16} />
                      </button>
                      */
                      null
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete message"
        message="This message will be deleted for everyone in this chat."
        confirmText="Delete"
        loading={deleteMessage.isPending}
      />

      {/* In-app attachment viewer: image lightbox (with album nav) / embedded
          PDF viewer with a working download — never opens a new tab. */}
      {viewer && (() => {
        const current = viewer.kind === 'IMAGE' ? viewer.images[viewer.index]! : { url: viewer.url, name: viewer.name }
        const many = viewer.kind === 'IMAGE' && viewer.images.length > 1
        const step = (d: number) =>
          setViewer(v =>
            v && v.kind === 'IMAGE'
              ? { ...v, index: (v.index + d + v.images.length) % v.images.length }
              : v,
          )
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewer(null)}>
            <div className="absolute inset-0 bg-black/70" />
            <div
              className="relative z-10 flex max-h-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
                <p className="truncate text-sm font-semibold text-[#191c1e]">
                  {current.name}
                  {many ? ` · ${viewer.index + 1}/${viewer.images.length}` : ''}
                </p>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => downloadAttachment(current.url, current.name)}
                    title="Download"
                    className="text-gray-400 hover:text-[#2c1452]"
                  >
                    <Download size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewer(null)}
                    title="Close"
                    className="text-gray-400 hover:text-[#2c1452]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                {viewer.kind === 'IMAGE' ? (
                  <img src={current.url} alt={current.name} className="max-h-[78vh] w-auto object-contain" />
                ) : (
                  <iframe src={viewer.url} title={viewer.name} className="h-[78vh] w-[72vw] max-w-full" />
                )}
                {many && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      title="Previous"
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      title="Next"
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default ChatsPage
