import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SideNavBar from './SideNavBar'
import TopNavBar from './TopNavBar'
import NotificationPanel from '@/components/features/NotificationPanel'
import PendingScreen from './PendingScreen'
import SuspendedScreen from './SuspendedScreen'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { toast } from 'sonner'
import GlobalUploadIndicator from '@/components/ui/GlobalUploadIndicator'
import ChatWidget from '@/components/features/ChatWidget'
import { useNotificationRealtime } from '@/hooks/notification'
import { useChatRealtimeGlobal } from '@/hooks/chat'
import { usePresenceHeartbeat } from '@/hooks/presence'
import { useUsageSession } from '@/hooks/usageSession'
// import { useVideoUploadProgress } from '@/hooks/video'


const AppShell = () => {
    const [notifOpen, setNotifOpen] = useState(false)
    const { user, isPending, isSuspended, setIsPending, setIsSuspended, setNoProfile ,setProfileStatus} = useAuthStore()
    const { pathname } = useLocation()
    const setProfile = useAuthStore((state) => state.setProfile)

    useEffect(() => {
        const getProfile = async () => {
            try {
                if (!user) return
                const profile = await authService.getUserProfile(user.id)
                console.log('user profile', profile)
                if (profile === null) {
                    setNoProfile(true)
                    setProfileStatus(profile?.account_verified ?? '')
                    setIsPending(true)
                    setIsSuspended(false)
                    return
                }
                setProfile({
                    id: profile.id,
                    name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || "",
                    email: user?.email ? user.email : " ",
                    avatar_url: profile?.avatar_url || "",
                })
                setNoProfile(false)
                setProfileStatus(profile?.account_verified ?? '')
                setIsPending(profile?.account_verified !== 'APPROVED')
                setIsSuspended(profile?.is_suspended === true)
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        getProfile()
    }, [user?.id])

    const showPending = isPending && !pathname.startsWith('/account')

    // Listen for incoming notifications: updates the bell count, plays a sound
    // and shows a toast as soon as the user lands in the app.
    useNotificationRealtime(user?.id)
    // Keep chat live on every page (not only the chat view): updates unread
    // counts/previews and marks incoming messages delivered app-wide.
    useChatRealtimeGlobal(user?.id)
    // Broadcast my presence for the whole session, not just the chat page, so
    // peers see me online as soon as I open the app.
    usePresenceHeartbeat(!!user?.id)
    // Record this visit in usage_sessions so the admin dashboard can show the
    // faculty's "recent active" time.
    useUsageSession(!!user?.id)
    // useVideoUploadProgress(user?.id)


    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <SideNavBar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNavBar onNotifClick={() => setNotifOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {isSuspended ? <SuspendedScreen /> : showPending ? <PendingScreen /> : <Outlet />}
                </main>
            </div>
            <GlobalUploadIndicator />
            <ChatWidget />
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
    )
}

export default AppShell
