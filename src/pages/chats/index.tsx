import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { Search, Paperclip, Mic, Send, FileText, Download, Check } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { toast } from 'sonner'
import { Heading, Input, Paragraph, Skeleton } from '@/components/ui'
import courseImg from '@/assets/images/cou1.png'
import brandLogo from '@/assets/icons/brand_icon.svg'
import { RiAccountCircleLine, RiCustomerService2Line, RiChat3Line } from 'react-icons/ri'
import { useGetMyChatRooms, useGetAdminId, useStartAdminChat, useRoomMessages, useSendMessage, useMarkRoomRead, useMarkMessagesSeen, useActiveThreadRealtime } from '@/hooks/chat'
import { usePresenceHeartbeat, usePeerPresence } from '@/hooks/presence'
import type { ChatRoomSummary, ChatMessage } from '@/services/chatService'
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
const lastMessagePreview = (room: ChatRoomSummary): string => {
  const m = room.last_message
  if (!m) return 'No messages yet'
  if (m.message_type !== 'TEXT') {
    const label = m.message_type.charAt(0) + m.message_type.slice(1).toLowerCase()
    return `📎 ${label}`
  }
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
  return `${sizeLabel} • ${msg.message_type} Document`
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const msgVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const msgItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

const ChatsPage = () => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [text, setText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Scroll height captured just before prepending older messages, so we can
  // restore the viewport position and avoid a jump.
  const prevScrollHeightRef = useRef<number | null>(null)
  // The room we've already auto-scrolled to bottom for (one jump per open).
  const openedRoomRef = useRef<string | null>(null)

  const myId = useAuthStore(s => s.user?.id)

  const { data: rooms = [], isLoading: leftLoading } = useGetMyChatRooms()
  const { data: adminId } = useGetAdminId()
  const {
    data: messagePages,
    isLoading: chatLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRoomMessages(activeId)

  // Pages come newest-first, each page oldest→newest internally. Reverse the
  // page order and flatten to one oldest→newest list for top-to-bottom render.
  const messages = useMemo(
    () => (messagePages?.pages ?? []).slice().reverse().flatMap(p => p.items),
    [messagePages],
  )
  const startAdminChat = useStartAdminChat()
  const sendMessage = useSendMessage()
  const markRoomRead = useMarkRoomRead()
  const markMessagesSeen = useMarkMessagesSeen()

  // Live updates for the open conversation (room list + delivered are handled
  // app-wide by useChatRealtimeGlobal in the app shell).
  useActiveThreadRealtime(activeId)

  // Broadcast my own presence for as long as I'm on the chat page (online +
  // heartbeat now, offline on leave). Live presence of the open peer for the
  // header's active / last-seen indicator.
  usePresenceHeartbeat(!!myId)

  const handleSend = () => {
    const body = text.trim()
    if (!activeId || !body || sendMessage.isPending) return
    sendMessage.mutate(
      { roomId: activeId, content: body },
      {
        onSuccess: () => setText(''),
        onError: (err: any) => toast.error(err?.message ?? 'Could not send message'),
      },
    )
  }

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
      onSuccess: ({ roomId }) => setActiveId(roomId),
      onError: (err: any) => toast.error(err?.message ?? 'Could not start chat with admin'),
    })
  }

  const filtered = useMemo(
    () => rooms.filter(r => roomName(r).toLowerCase().includes(search.toLowerCase())),
    [rooms, search],
  )

  const active = rooms.find(r => r.id === activeId) ?? null
  const peerPresence = usePeerPresence(active?.peer?.id)

  // If the open room disappears from the list, fall back to the welcome screen.
  useEffect(() => {
    if (activeId && !rooms.some(r => r.id === activeId)) setActiveId(null)
  }, [rooms, activeId])

  // Load older messages when scrolled near the top of the thread.
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop <= 60 && hasNextPage && !isFetchingNextPage) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }

  // After the thread changes: restore position when prepending older history,
  // jump to the bottom when a room is first opened, and follow new messages
  // only when already near the bottom (don't yank the user out of history).
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (prevScrollHeightRef.current != null) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current
      prevScrollHeightRef.current = null
      return
    }

    if (activeId && openedRoomRef.current !== activeId) {
      if (!messages.length) return
      openedRoomRef.current = activeId
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      return
    }

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200
    if (nearBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeId])

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
                      <img src={avatarFor(conv)} alt={roomName(conv)} className={`w-15 h-15 rounded-xl shrink-0 mt-0.5 ${avatarClass(conv)}`} />
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
        ) : (
          <>
            {/* Chat Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`header-${activeId}`}
                className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-3">
                  <img src={active ? avatarFor(active) : courseImg} alt={active ? roomName(active) : ''} className={`w-15 h-15 rounded-xl ${active ? avatarClass(active) : 'object-cover'}`} />
                  <div>
                    <Paragraph className="text-sm font-bold text-[#2c1452]">{active ? roomName(active) : ''}</Paragraph>
                    {peerPresence.isOnline ? (
                      <Paragraph className="!text-[10px] text-green-500 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Active now
                      </Paragraph>
                    ) : (
                      <Paragraph className="!text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                        {peerPresence.lastSeen ? `last seen ${formatLastSeen(peerPresence.lastSeen)}` : 'Offline'}
                      </Paragraph>
                    )}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-[#2c1452] hover:underline">
                  <RiAccountCircleLine size={20} />
                  View Profile
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {chatLoading ? (
                  <motion.div
                    key="chat-skeleton"
                    className="flex flex-col gap-4 flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-3/5' : 'w-2/3'}`} />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`msgs-${activeId}`}
                    className="flex flex-col gap-4"
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-2">
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#2c1452] animate-spin" />
                      </div>
                    )}

                    {messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center py-10">
                        <Paragraph className="text-gray-400 !text-sm">No messages yet — say hello 👋</Paragraph>
                      </div>
                    ) : (
                      messages.map((msg: ChatMessage) => {
                        const mine = msg.sender_id === myId
                        return (
                          <motion.div
                            key={msg.id}
                            variants={msgItemVariants}
                            className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                          >
                            <div className={`max-w-[65%] rounded-2xl px-4 py-3 ${mine
                              ? 'bg-[#2c1452] text-white rounded-tr-sm'
                              : 'bg-white text-[#191c1e] rounded-tl-sm'
                              }`}>
                              {msg.content && (
                                <Paragraph className={`!text-sm leading-relaxed ${mine ? 'text-white' : 'text-[#191c1e]'}`}>
                                  {msg.content}
                                </Paragraph>
                              )}

                              {msg.message_type !== 'TEXT' && msg.file_url && (
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-3 ${msg.content ? 'mt-3' : ''} bg-white rounded-xl px-3 py-2`}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                    <FileText size={14} className="text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#191c1e] truncate">{msg.file_name ?? 'Attachment'}</p>
                                    <p className="text-[10px] text-gray-400">{formatAttachment(msg)}</p>
                                  </div>
                                  <span className="shrink-0 text-gray-400 hover:text-[#2c1452]">
                                    <Download size={14} />
                                  </span>
                                </a>
                              )}
                            </div>

                            <div className={`flex items-center gap-1 mt-1 ${mine ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] text-black">{formatMessageTime(msg.created_at)}</span>
                              {mine && (
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
                        )
                      })
                    )}

                    <div ref={messagesEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            <motion.div
              className="shrink-0 px-6 py-4 border-t border-gray-200"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3">
                {/* <button className="text-gray-400 hover:text-[#2c1452] transition-colors">
                  <Paperclip size={18} />
                </button> */}
                <button className="text-gray-400 hover:text-[#2c1452] transition-colors">😊</button>
                <input
                  type="text"
                  placeholder={active ? `Type your message to ${roomName(active)}...` : 'Type your message...'}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
                  className="flex-1 bg-transparent text-sm outline-none text-[#191c1e] placeholder-gray-400"
                />
                {/* <button className="text-gray-400 hover:text-[#2c1452] transition-colors">
                  <Mic size={18} />
                </button> */}
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sendMessage.isPending}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right, #2c1452, #2c1452)' }}
                >
                  <Send size={15} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>

    </div>
  )
}

export default ChatsPage
