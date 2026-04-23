import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SideNavBar from './SideNavBar'
import TopNavBar from './TopNavBar'

const AppShell = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const location = useLocation()

    // Close the mobile nav on route change
    useEffect(() => { setMobileNavOpen(false) }, [location.pathname])

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* Sidebar — static on lg, overlay drawer on smaller screens */}
            <SideNavBar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            {/* Backdrop for mobile drawer */}
            {mobileNavOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNavBar onMenuClick={() => setMobileNavOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppShell
