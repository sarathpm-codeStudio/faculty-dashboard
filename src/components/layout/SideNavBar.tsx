import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, Package, MessageCircle,
    Users, Megaphone, Settings,
    ClipboardList, HelpCircle, X,
} from 'lucide-react'
import { RiCoupon2Line } from 'react-icons/ri'
import logo from '@/assets/icons/Icon.svg'
import { Heading, Paragraph } from '../ui'

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/bundles', label: 'Bundles', icon: Package },
    { to: '/chats', label: 'Chats', icon: MessageCircle },
    { to: '/tests', label: 'Tests', icon: ClipboardList },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/coupon-management', label: 'Coupon Management', icon: RiCoupon2Line },
    { to: '/account', label: 'Account', icon: Settings },
]

interface SideNavBarProps {
    open: boolean
    onClose: () => void
}

const SideNavBar = ({ open, onClose }: SideNavBarProps) => {
    return (
        <aside
            className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-70 h-screen bg-input-bg border-r border-gray-100
                flex flex-col py-6 flex-shrink-0
                transform transition-transform duration-300 ease-in-out
                ${open ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}
        >

            {/* Logo + mobile close */}
            <div className="flex items-center justify-between gap-3 px-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-[50px] h-[40px] bg-[#000B60] rounded-xl flex items-center justify-center">
                        <img src={logo} alt="logo" />
                    </div>
                    <Heading className="text-[#000B60]">Learninough</Heading>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    aria-label="Close navigation"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
                {navLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-[#000B60] text-white font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <Paragraph className="font-bold">{label}</Paragraph>
                    </NavLink>
                ))}
            </nav>

            {/* Help Center */}
            <div className="px-3 pt-4 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <HelpCircle size={18} />
                    <Paragraph>Help Center</Paragraph>
                </button>
            </div>

        </aside>
    )
}

export default SideNavBar
