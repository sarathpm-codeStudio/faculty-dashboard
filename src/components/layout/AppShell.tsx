

import { Outlet } from 'react-router-dom'
import SideNavBar from './SideNavBar'
import TopNavBar from './TopNavBar'

const AppShell = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <SideNavBar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNavBar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppShell