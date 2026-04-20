

import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, Package, MessageCircle,
    Users, BarChart2, Megaphone, Settings, LogOut,
    ClipboardList, Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/bundles', label: 'Bundles', icon: Package },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/tests', label: 'Tests', icon: ClipboardList },
    { to: '/chats', label: 'Chats', icon: MessageCircle },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/finance', label: 'Finance', icon: Wallet },
    { to: '/profile', label: 'Profile', icon: Settings },
]

const SideNavBar = () => {
    const logout = useAuthStore((state) => state.logout)

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col py-6 flex-shrink-0">

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    E
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-sm">EduPlatform</p>
                    <p className="text-xs text-gray-400">Instructor Portal</p>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
                {navLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pt-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

        </aside>
    )
}

export default SideNavBar