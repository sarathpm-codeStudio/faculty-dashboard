

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, ChevronDown, UserCircle2 } from 'lucide-react'
import manAvatar from '@/assets/images/man.jpg'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { useNavigate } from 'react-router-dom'
import { Button, Button2, Input, Paragraph } from '@/components/ui'
import { useUnreadNotificationCount, useUnreadAnnouncementCount } from '@/hooks/notification'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
    onNotifClick: () => void
}

const TopNavBar = ({ onNotifClick }: Props) => {
    const { user, logout, isPending, isSuspended } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: unreadCount = 0 } = useUnreadNotificationCount()
    const { data: unreadAnnouncementCount = 0 } = useUnreadAnnouncementCount()

    // The bell shows a red dot when there's anything unread — either a personal
    // notification or an admin announcement.
    const hasUnread = unreadCount > 0 || unreadAnnouncementCount > 0

    // A suspended account is locked out just like a pending/rejected one, so the
    // top bar hides search, create-course and notifications in both cases.
    const locked = isPending || isSuspended
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await authService.signOut()
        logout()
        // Wipe the React Query cache so the next user who logs in (without a
        // page reload) never sees the previous user's cached data.
        queryClient.clear()
        navigate('/auth/login')
    }

    return (
        <header className="h-20 flex items-center justify-between px-6 flex-shrink-0 bg-gray-50 z-20 sticky top-0">

            {/* Search */}
            {!locked && (
                <div className="w-full max-w-[300px] lg:max-w-[700px] mr-4">
                    <Input
                        placeholder="Search by course and students..."
                        leftIcon={<Search size={16} />}
                        className="!py-2.5 lg:!py-4 !text-sm lg:!text-base"
                    />
                </div>
            )}
            {locked && <div />}

            {/* Right side */}
            <div className="flex items-center gap-4 shrink-0">

                {!locked && (
                    <Button
                        variant="primary"
                        className="!h-10 !text-sm !px-4 !font-semibold whitespace-nowrap"
                        onClick={() => navigate('/courses/create')}
                    >
                        Create course
                    </Button>
                )}

                {/* Notification bell — always visible regardless of account status */}
                <button onClick={onNotifClick} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bell size={20} className="text-gray-500" />
                    {hasUnread && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300" />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                    >

                        <Paragraph className="font-bold whitespace-nowrap hidden lg:block">{user?.name ?? 'Faculty'}</Paragraph>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            {
                                user?.avatar_url ? (
                                    <img src={user?.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle2 size={36} className="text-gray-300" />
                                )
                            }
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    )
}

export default TopNavBar
