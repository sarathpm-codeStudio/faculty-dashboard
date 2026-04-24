import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideNavBar from './SideNavBar'
import TopNavBar from './TopNavBar'
import NotificationPanel from '@/components/features/NotificationPanel'

const AppShell = () => {
    const [notifOpen, setNotifOpen] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <SideNavBar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNavBar onNotifClick={() => setNotifOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
    )
}

export default AppShell
