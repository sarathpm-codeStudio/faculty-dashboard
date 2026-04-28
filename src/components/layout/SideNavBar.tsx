
import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, Package, MessageCircle,
    Users, Megaphone,
    ClipboardList, HelpCircle, User, Landmark, LogOut, ChevronUp,
} from 'lucide-react'
import { RiCoupon2Line } from 'react-icons/ri'
import { useAuthStore } from '@/store/authStore'
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
]

const SideNavBar = () => {
    const [accountOpen, setAccountOpen] = useState(false)
    const accountRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { user, logout, isPending } = useAuthStore()

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setAccountOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/auth/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'FA'

    return (
        <aside className="w-70 h-screen bg-input-bg border-r border-gray-100 flex flex-col py-6 flex-shrink-0">

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 pb-6 border-b border-gray-100">
                <div className="w-[50px] h-[40px] bg-[#000B60] rounded-xl flex items-center justify-center">
                    <img src={logo} alt="logo" />
                </div>
                <Heading className='text-[#000B60]'>Learninough</Heading>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
                {navLinks.map(({ to, label, icon: Icon }) => (
                    isPending ? (
                        <div
                            key={to}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 blur-[1.5px] cursor-not-allowed select-none"
                        >
                            <Icon size={18} />
                            <Paragraph className='font-bold'>{label}</Paragraph>
                        </div>
                    ) : (
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
                            <Paragraph className='font-bold'>{label}</Paragraph>
                        </NavLink>
                    )
                ))}
            </nav>

            {/* Bottom section */}
            <div className="px-3 pt-4 border-t border-gray-100 flex flex-col gap-1">
                {/* Help Center */}
                <button
                    disabled={isPending}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isPending ? 'text-gray-300 blur-[1.5px] cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <HelpCircle size={18} />
                    <Paragraph>Help Center</Paragraph>
                </button>

                {/* Account selector — always accessible */}
                <div className="relative" ref={accountRef}>
                    {accountOpen && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50">
                            <button
                                onClick={() => { navigate('/account'); setAccountOpen(false) }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F2F4F6] transition-colors"
                            >
                                <User size={16} className="text-[#000B60]" />
                                <Paragraph className="font-bold text-[#000B60]">Personal Information</Paragraph>
                            </button>
                            <div className="h-px bg-gray-100 mx-3" />
                            <button
                                onClick={() => { navigate('/account/bank'); setAccountOpen(false) }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F2F4F6] transition-colors"
                            >
                                <Landmark size={16} className="text-[#000B60]" />
                                <Paragraph className="font-bold text-[#000B60]">Bank Details</Paragraph>
                            </button>
                            <div className="h-px bg-gray-100 mx-3" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} className="text-red-500" />
                                <Paragraph className="font-bold text-red-500">Logout</Paragraph>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setAccountOpen(prev => !prev)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${accountOpen ? 'bg-[#000B60] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${accountOpen ? 'bg-white text-[#000B60]' : 'bg-[#000B60] text-white'}`}>
                            {initials}
                        </div>
                        <Paragraph className={`font-bold flex-1 text-left truncate ${accountOpen ? 'text-white' : ''}`}>
                            {user?.name ?? 'Account'}
                        </Paragraph>
                        <ChevronUp
                            size={15}
                            className={`shrink-0 transition-transform duration-200 ${accountOpen ? 'rotate-0 text-white' : 'rotate-180 text-gray-400'}`}
                        />
                    </button>
                </div>
            </div>

        </aside>
    )
}

export default SideNavBar
