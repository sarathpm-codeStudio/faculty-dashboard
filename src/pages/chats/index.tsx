import { useState, useRef, useEffect } from 'react'
import { Search, Paperclip, Mic, Send, FileText, Download, Check } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Heading, Input, Paragraph, Skeleton } from '@/components/ui'
import courseImg from '@/assets/images/cou1.png'
import courseImg2 from '@/assets/images/cou2.png'
import courseImg3 from '@/assets/images/cou3.png'
import courseImg4 from '@/assets/images/cou4.png'
import { RiAccountCircleLine } from 'react-icons/ri'

type Conversation = {
  id: number
  name: string
  avatar: string
  course: string
  lastMessage: string
  time: string
  unread?: boolean
}

type Message = {
  id: number
  text: string
  sender: 'them' | 'me'
  time: string
  attachment?: { name: string; size: string }
  read?: boolean
}

const CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Sarah Jenkins',   avatar: courseImg,  course: 'Cost Accounting', lastMessage: 'Thank you for the resources, Professor.', time: '10:41 AM' },
  { id: 2, name: 'Linguistics',     avatar: courseImg2, course: 'Taxation',        lastMessage: 'Thank you for the resources, Professor.', time: 'YESTERDAY' },
  { id: 3, name: 'Julian Vance',    avatar: courseImg3, course: 'Business Laws',   lastMessage: 'The committee meeting is moved to Room...', time: 'TUESDAY' },
  { id: 4, name: 'Elena Rodriguez', avatar: courseImg4, course: 'Cost Accounting', lastMessage: 'Datasets have been uploaded to the portal...', time: 'MAR 12' },
]

const MESSAGES: Message[] = [
  { id: 1, sender: 'them', text: "Good morning. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since.", time: '10:12 AM' },
  { id: 2, sender: 'them', text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took.", time: '09:14 AM', attachment: { name: 'taxation_syllabus_reference.pdf', size: '2.4 MB • PDF Document' } },
  { id: 3, sender: 'me',   text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took.", time: '09:45 AM', read: true },
  { id: 4, sender: 'me',   text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', time: '09:48 AM', read: true },
]

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
  const [activeId, setActiveId]       = useState(1)
  const [search, setSearch]           = useState('')
  const [text, setText]               = useState('')
  const [leftLoading, setLeftLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const active   = CONVERSATIONS.find(c => c.id === activeId)!
  const filtered = CONVERSATIONS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  // initial load
  useEffect(() => {
    const t = setTimeout(() => setLeftLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  // reload chat when switching conversation
  useEffect(() => {
    setChatLoading(true)
    const t = setTimeout(() => {
      setChatLoading(false)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 600)
    return () => clearTimeout(t)
  }, [activeId])

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="w-[400px] shrink-0 flex flex-col bg-white">

        <motion.div
          className="px-5 pt-6 pb-4 shrink-0"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Heading className="text-[#000B60] mb-4">Messages</Heading>
          <Input
            placeholder="Search Students"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
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
                {filtered.map(conv => (
                  <motion.button
                    key={conv.id}
                    variants={listItemVariants}
                    onClick={() => setActiveId(conv.id)}
                    style={activeId === conv.id ? { boxShadow: '0 16px 32px rgba(0, 11, 96, 0.12)' } : {}}
                    className={`w-full text-left px-5 py-3.5 flex items-start gap-3 transition-colors border-l-2 ${
                      activeId === conv.id
                        ? 'border-l-4 border-[#000B60] rounded-xl'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <img src={conv.avatar} alt={conv.name} className="w-15 h-15 rounded-xl object-cover shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <Paragraph className="text-[#191c1e] truncate font-bold">{conv.name}</Paragraph>
                        <span className="text-[10px] text-black shrink-0 ml-2">{conv.time}</span>
                      </div>
                      <Paragraph className="text-gray-400 truncate !text-sm">{conv.lastMessage}</Paragraph>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100">

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
              <img src={active.avatar} alt={active.name} className="w-15 h-15 rounded-xl object-cover" />
              <div>
                <Paragraph className="text-sm font-bold text-[#000B60]">{active.name}</Paragraph>
                <Paragraph className="!text-[10px] text-green-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  ACTIVE
                </Paragraph>
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-[#000B60] hover:underline">
              <RiAccountCircleLine size={20} />
              View Profile
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col gap-4">
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
                {/* Date separator */}
                <motion.div
                  className="flex items-center gap-3 my-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Today, March 15th</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </motion.div>

                {MESSAGES.map(msg => (
                  <motion.div
                    key={msg.id}
                    variants={msgItemVariants}
                    className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[65%] rounded-2xl px-4 py-3 ${
                      msg.sender === 'me'
                        ? 'bg-[#000B60] text-white rounded-tr-sm'
                        : 'bg-white text-[#191c1e] rounded-tl-sm'
                    }`}>
                      <Paragraph className={`!text-sm leading-relaxed ${msg.sender === 'me' ? 'text-white' : 'text-[#191c1e]'}`}>
                        {msg.text}
                      </Paragraph>

                      {msg.attachment && (
                        <div className="flex items-center gap-3 mt-3 bg-white rounded-xl px-3 py-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#191c1e] truncate">{msg.attachment.name}</p>
                            <p className="text-[10px] text-gray-400">{msg.attachment.size}</p>
                          </div>
                          <button className="shrink-0 text-gray-400 hover:text-[#000B60]">
                            <Download size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-black">{msg.time}</span>
                      {msg.sender === 'me' && (
                        <span className="flex items-center">
                          <Check size={13} strokeWidth={3} className={msg.read ? 'text-[#53BDEB]' : 'text-gray-400'} />
                          <Check size={13} strokeWidth={3} className={`-ml-[7px] ${msg.read ? 'text-[#53BDEB]' : 'text-gray-400'}`} />
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}

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
            <button className="text-gray-400 hover:text-[#000B60] transition-colors">
              <Paperclip size={18} />
            </button>
            <button className="text-gray-400 hover:text-[#000B60] transition-colors">😊</button>
            <input
              type="text"
              placeholder="Type your message to Dr. Thorne..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && text.trim()) setText('') }}
              className="flex-1 bg-transparent text-sm outline-none text-[#191c1e] placeholder-gray-400"
            />
            <button className="text-gray-400 hover:text-[#000B60] transition-colors">
              <Mic size={18} />
            </button>
            <button
              onClick={() => setText('')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(to right, #000B60, #142283)' }}
            >
              <Send size={15} />
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

export default ChatsPage
