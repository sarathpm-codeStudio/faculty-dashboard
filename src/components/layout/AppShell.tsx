import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SideNavBar from './SideNavBar'
import TopNavBar from './TopNavBar'
import NotificationPanel from '@/components/features/NotificationPanel'
import PendingScreen from './PendingScreen'
import { useAuthStore } from '@/store/authStore'

const AppShell = () => {
    const [notifOpen, setNotifOpen] = useState(false)
    const isPending = useAuthStore((state) => state.isPending)
    const { pathname } = useLocation()

    const showPending = isPending && !pathname.startsWith('/account')

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <SideNavBar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNavBar onNotifClick={() => setNotifOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6">
                    {showPending ? <PendingScreen /> : <Outlet />}
                </main>
            </div>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
    )
}

export default AppShell
