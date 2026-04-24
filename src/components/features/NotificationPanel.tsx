import { AnimatePresence, motion } from 'framer-motion'
import { X, BookOpen, Users, Megaphone, CheckCheck, Bell } from 'lucide-react'
import { Paragraph } from '@/components/ui'

type NotifType = 'course' | 'student' | 'announcement' | 'system'

type Notification = {
    id: number
    type: NotifType
    title: string
    description: string
    time: string
    read: boolean
    group: 'Today' | 'Yesterday'
}

const MOCK_NOTIFS: Notification[] = [
    { id: 1, type: 'student', title: 'New Assignment Submitted', description: 'Aisha Rahman submitted "Calculus – Week 4" assignment.', time: '2 min ago', read: false, group: 'Today' },
    { id: 2, type: 'course', title: 'Course Published', description: 'Your course "Advanced Taxation" is now live.', time: '45 min ago', read: false, group: 'Today' },
    { id: 3, type: 'announcement', title: 'Announcement Sent', description: 'Your announcement reached 284 students successfully.', time: '1 hr ago', read: false, group: 'Today' },
    { id: 4, type: 'student', title: 'New Enrollment', description: '12 new students enrolled in Business Laws.', time: '3 hrs ago', read: true, group: 'Today' },
    { id: 5, type: 'system', title: 'Payout Processed', description: '₹8,450.00 has been disbursed to your account.', time: '5 hrs ago', read: true, group: 'Today' },
    { id: 6, type: 'course', title: 'Course Review Received', description: 'You got a 5-star review on "Differential Equations".', time: 'Yesterday', read: true, group: 'Yesterday' },
    { id: 7, type: 'student', title: 'Test Completed', description: '38 students completed the Mid-Term MCQ test.', time: 'Yesterday', read: true, group: 'Yesterday' },
    { id: 8, type: 'system', title: 'Profile Verified', description: 'Your faculty profile has been verified by admin.', time: 'Yesterday', read: true, group: 'Yesterday' },
]

const iconConfig: Record<NotifType, { bg: string; color: string; Icon: typeof Bell }> = {
    course: { bg: 'bg-blue-50', color: 'text-[#000B60]', Icon: BookOpen },
    student: { bg: 'bg-purple-50', color: 'text-purple-600', Icon: Users },
    announcement: { bg: 'bg-orange-50', color: 'text-orange-500', Icon: Megaphone },
    system: { bg: 'bg-green-50', color: 'text-green-600', Icon: Bell },
}

interface Props {
    open: boolean
    onClose: () => void
}

const NotificationPanel = ({ open, onClose }: Props) => {
    const unreadCount = MOCK_NOTIFS.filter(n => !n.read).length
    const groups: ('Today' | 'Yesterday')[] = ['Today', 'Yesterday']

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <Paragraph className="font-bold text-[#000B60] !text-base">Notifications</Paragraph>
                                {unreadCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <CheckCheck size={14} className="text-[#000B60]" />
                                    <Paragraph className="!text-xs font-bold text-[#000B60]">Mark all read</Paragraph>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={18} className="text-[#767683]" />
                                </button>
                            </div>
                        </div>

                        {/* Notification list */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            {groups.map(group => {
                                const items = MOCK_NOTIFS.filter(n => n.group === group)
                                return (
                                    <div key={group}>
                                        {/* Group label */}
                                        <div className="px-5 py-3 bg-[#F2F4F6]">
                                            <Paragraph className="!text-[11px] font-bold text-[#767683] uppercase tracking-widest">
                                                {group}
                                            </Paragraph>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-gray-50">
                                            {items.map((notif, i) => {
                                                const { bg, color, Icon } = iconConfig[notif.type]
                                                return (
                                                    <motion.button
                                                        key={notif.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                            <Icon size={16} className={color} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <Paragraph className={`!text-sm ${!notif.read ? 'font-bold text-[#191c1e]' : 'font-medium text-[#191c1e]'}`}>
                                                                {notif.title}
                                                            </Paragraph>
                                                            <Paragraph className="!text-xs text-[#767683] mt-0.5 leading-relaxed line-clamp-2">
                                                                {notif.description}
                                                            </Paragraph>
                                                            <Paragraph className="!text-[10px] text-[#767683] mt-1.5 font-medium">
                                                                {notif.time}
                                                            </Paragraph>
                                                        </div>
                                                        {!notif.read && (
                                                            <span className="w-2 h-2 rounded-full bg-[#000B60] shrink-0 mt-1.5" />
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100">
                            <button className="w-full py-2.5 rounded-xl bg-[#F2F4F6] hover:bg-gray-200 transition-colors">
                                <Paragraph className="!text-sm font-bold text-[#000B60]">View All Notifications</Paragraph>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default NotificationPanel
