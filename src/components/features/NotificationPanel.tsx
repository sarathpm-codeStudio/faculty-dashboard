import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, BookOpen, Users, Megaphone, CheckCheck, Bell, Loader2, Volume2, VolumeX } from 'lucide-react'
import { Paragraph } from '@/components/ui'
import {
    isNotificationSoundEnabled,
    setNotificationSoundEnabled,
    playNotificationSound,
} from '@/utils/notificationSound'
import {
    useGetRecentNotifications,
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
} from '@/hooks/notification'
import type { NotificationItem } from '@/services/notificationService'

const iconConfig: Record<string, { bg: string; color: string; Icon: typeof Bell }> = {
    course: { bg: 'bg-blue-50', color: 'text-[#2c1452]', Icon: BookOpen },
    student: { bg: 'bg-purple-50', color: 'text-purple-600', Icon: Users },
    announcement: { bg: 'bg-orange-50', color: 'text-orange-500', Icon: Megaphone },
    system: { bg: 'bg-green-50', color: 'text-green-600', Icon: Bell },
}

const defaultIcon = { bg: 'bg-gray-50', color: 'text-[#767683]', Icon: Bell }

// Map a notification to the page it should open, based on its type and data.
// Returns null when there's no meaningful destination (no redirect on click).
const resolveNotificationRoute = (notif: NotificationItem): string | null => {
    const data = notif.data ?? {}
    const type = (notif.type ?? '').toUpperCase()
    const courseId = data.courseId ?? data.course_id
    const facultyId = data.facultyId ?? data.faculty_id

    switch (type) {
        case 'COURSE':
        case 'COURSE_UPDATE':
            return courseId ? `/courses/${courseId}` : '/courses'
        case 'FACULTY_ONBOARDED':
        case 'ACCOUNT':
            return facultyId ? `/faculty/${facultyId}` : '/faculty'
        case 'EXAM_REMINDER':
            return courseId ? `/courses/${courseId}/reviews` : '/tests'
        case 'FRIEND_JOINED':
        case 'FRIEND_ENROLLED':
            return '/students'
        case 'BADGE_UNLOCKED':
        case 'COINS_EARNED':
        case 'STREAK_REMINDER':
            return '/dashboard'
        default:
            return courseId ? `/courses/${courseId}` : null
    }
}

// Relative "x min/hr ago" label from a timestamp.
const formatTime = (iso: string | null) => {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr ago`
    return new Date(iso).toLocaleDateString()
}

interface Props {
    open: boolean
    onClose: () => void
}

const NotificationPanel = ({ open, onClose }: Props) => {
    const navigate = useNavigate()
    const { data: notifications = [], isLoading } = useGetRecentNotifications(open)
    const markAllAsRead = useMarkAllNotificationsAsRead()
    const markAsRead = useMarkNotificationAsRead()

    const [soundOn, setSoundOn] = useState(isNotificationSoundEnabled)

    // Mark the notification read, then redirect to its target page (if any).
    const handleNotificationClick = (notif: NotificationItem) => {
        if (!notif.is_read) markAsRead.mutate(notif.id)
        const route = resolveNotificationRoute(notif)
        if (route) {
            onClose()
            navigate(route)
        }
    }

    const toggleSound = () => {
        const next = !soundOn
        setSoundOn(next)
        setNotificationSoundEnabled(next)
        if (next) playNotificationSound() // preview the chime when turning on
    }

    const unreadCount = notifications.filter(n => !n.is_read).length
    const groups: ('Today' | 'Yesterday')[] = ['Today', 'Yesterday']
    const hasNotifications = notifications.length > 0

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
                        initial={{ x: '100%', opacity: 0.6 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.6 }}
                        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                        className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <Paragraph className="font-bold text-[#2c1452] !text-base">Notifications</Paragraph>
                                {unreadCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={toggleSound}
                                    title={soundOn ? 'Turn notification sound off' : 'Turn notification sound on'}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {soundOn ? (
                                        <Volume2 size={16} className="text-[#2c1452]" />
                                    ) : (
                                        <VolumeX size={16} className="text-[#767683]" />
                                    )}
                                </button>
                                <button
                                    onClick={() => markAllAsRead.mutate()}
                                    disabled={unreadCount === 0 || markAllAsRead.isPending}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <CheckCheck size={14} className="text-[#2c1452]" />
                                    <Paragraph className="!text-xs font-bold text-[#2c1452]">Mark all read</Paragraph>
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
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 size={22} className="text-[#2c1452] animate-spin" />
                                </div>
                            ) : !hasNotifications ? (
                                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F2F4F6] flex items-center justify-center mb-3">
                                        <Bell size={20} className="text-[#767683]" />
                                    </div>
                                    <Paragraph className="!text-sm font-bold text-[#191c1e]">You're all caught up</Paragraph>
                                    <Paragraph className="!text-xs text-[#767683] mt-1">No new notifications today or yesterday.</Paragraph>
                                </div>
                            ) : (
                                groups.map(group => {
                                    const items = notifications.filter(n => n.group === group)
                                    if (items.length === 0) return null
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
                                                {items.map((notif: NotificationItem, i: number) => {
                                                    const { bg, color, Icon } = iconConfig[notif.type] ?? defaultIcon
                                                    return (
                                                        <motion.button
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.25, ease: 'easeOut', delay: 0.12 + i * 0.03 }}
                                                            className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                                                        >
                                                            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                                <Icon size={16} className={color} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <Paragraph className={`!text-sm ${!notif.is_read ? 'font-bold text-[#191c1e]' : 'font-medium text-[#191c1e]'}`}>
                                                                    {notif.title}
                                                                </Paragraph>
                                                                <Paragraph className="!text-xs text-[#767683] mt-0.5 leading-relaxed line-clamp-2">
                                                                    {notif.body}
                                                                </Paragraph>
                                                                <Paragraph className="!text-[10px] text-[#767683] mt-1.5 font-medium">
                                                                    {formatTime(notif.created_at)}
                                                                </Paragraph>
                                                            </div>
                                                            {!notif.is_read && (
                                                                <span className="w-2 h-2 rounded-full bg-[#2c1452] shrink-0 mt-1.5" />
                                                            )}
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100">
                            <button className="w-full py-2.5 rounded-xl bg-[#F2F4F6] hover:bg-gray-200 transition-colors">
                                <Paragraph className="!text-sm font-bold text-[#2c1452]">View All Notifications</Paragraph>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default NotificationPanel
