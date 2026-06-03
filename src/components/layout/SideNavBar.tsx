
import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, Package, MessageCircle,
    Users, Megaphone,
    ClipboardList, HelpCircle, User, Landmark, LogOut, ChevronUp,
} from 'lucide-react'
import { RiCoupon2Line } from 'react-icons/ri'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
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

const COLLAPSED_WIDTH = 72
const EXPANDED_WIDTH = 280
const WIDTH_TRANSITION = 'width 0.4s cubic-bezier(0.33, 1, 0.68, 1)'
const LABEL_TRANSITION = 'opacity 0.35s cubic-bezier(0.33, 1, 0.68, 1), max-width 0.4s cubic-bezier(0.33, 1, 0.68, 1)'

const SideNavBar = () => {
    const [isHovered, setIsHovered] = useState(false)
    const [accountOpen, setAccountOpen] = useState(false)
    const accountRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const { user, logout, isPending } = useAuthStore()

    const expanded = isHovered || accountOpen
    const collapsed = !expanded

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setAccountOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        await authService.signOut()
        logout()
        navigate('/auth/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : 'FA'

    const navItemClass = (extra = '') =>
        `flex items-center rounded-lg text-sm transition-[padding,gap,background-color,color] duration-300 ease-out ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'} ${extra}`

    const labelClass = (extra = '') =>
        `overflow-hidden whitespace-nowrap shrink-0 ${extra} ${collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[200px] opacity-100'}`

    return (
        <div className="shrink-0 h-screen" style={{ width: COLLAPSED_WIDTH }}>
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
                    transition: WIDTH_TRANSITION,
                }}
                className={`fixed left-0 top-0 h-screen bg-input-bg border-r border-gray-100 flex flex-col py-6 overflow-hidden z-50 ${
                    expanded ? 'shadow-[4px_0_24px_rgba(0,11,96,0.1)]' : ''
                }`}
            >
            {/* Logo */}
            <div
                className={`flex items-center border-b border-gray-100 pb-6 transition-[padding,gap] duration-300 ease-out ${collapsed ? 'justify-center px-2' : 'gap-3 px-6'}`}
            >
                <div className="w-[50px] h-[40px] bg-[#000B60] rounded-xl flex items-center justify-center shrink-0">
                    <img src={logo} alt="logo" />
                </div>
                <Heading
                    className={`text-[#000B60] whitespace-nowrap ${labelClass()}`}
                    style={{ transition: LABEL_TRANSITION }}
                >
                    Learninough
                </Heading>
            </div>

            {/* Nav links */}
            <nav className={`flex-1 flex flex-col gap-1 pt-4 overflow-y-auto overflow-x-hidden transition-[padding] duration-300 ease-out ${collapsed ? 'px-2' : 'px-3'}`}>
                {navLinks.map(({ to, label, icon: Icon }) => (
                    isPending ? (
                        <div
                            key={to}
                            title={collapsed ? label : undefined}
                            className={navItemClass('text-gray-400 blur-[1.5px] cursor-not-allowed select-none')}
                        >
                            <Icon size={18} className="shrink-0" />
                            <Paragraph className={`font-bold ${labelClass()}`} style={{ transition: LABEL_TRANSITION }}>
                                {label}
                            </Paragraph>
                        </div>
                    ) : (
                        <NavLink
                            key={to}
                            to={to}
                            title={collapsed ? label : undefined}
                            className={({ isActive }) =>
                                navItemClass(
                                    isActive
                                        ? 'bg-[#000B60] text-white font-medium'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                )
                            }
                        >
                            <Icon size={18} className="shrink-0" />
                            <Paragraph className={`font-bold ${labelClass()}`} style={{ transition: LABEL_TRANSITION }}>
                                {label}
                            </Paragraph>
                        </NavLink>
                    )
                ))}
            </nav>

            {/* Bottom section */}
            <div className={`pt-4 border-t border-gray-100 flex flex-col gap-1 transition-[padding] duration-300 ease-out ${collapsed ? 'px-2' : 'px-3'}`}>
                <button
                    type="button"
                    disabled={isPending}
                    title={collapsed ? 'Help Center' : undefined}
                    className={navItemClass(
                        isPending ? 'text-gray-300 blur-[1.5px] cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    )}
                >
                    <HelpCircle size={18} className="shrink-0" />
                    <Paragraph className={labelClass()} style={{ transition: LABEL_TRANSITION }}>
                        Help Center
                    </Paragraph>
                </button>

                <div className="relative" ref={accountRef}>
                    {accountOpen && (
                        <div
                            className={`absolute bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50 min-w-[220px] ${
                                collapsed
                                    ? 'left-full bottom-0 ml-2'
                                    : 'bottom-full mb-2 left-0 right-0'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => { navigate('/account'); setAccountOpen(false) }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F2F4F6] transition-colors"
                            >
                                <User size={16} className="text-[#000B60]" />
                                <Paragraph className="font-bold text-[#000B60]">Personal Information</Paragraph>
                            </button>
                            <div className="h-px bg-gray-100 mx-3" />
                            <button
                                type="button"
                                onClick={() => { navigate('/account/bank'); setAccountOpen(false) }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F2F4F6] transition-colors"
                            >
                                <Landmark size={16} className="text-[#000B60]" />
                                <Paragraph className="font-bold text-[#000B60]">Bank Details</Paragraph>
                            </button>
                            <div className="h-px bg-gray-100 mx-3" />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} className="text-red-500" />
                                <Paragraph className="font-bold text-red-500">Logout</Paragraph>
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        title={collapsed ? (user?.name ?? 'Account') : undefined}
                        onClick={() => setAccountOpen(prev => !prev)}
                        className={`w-full ${navItemClass(accountOpen ? 'bg-[#000B60] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')}`}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${accountOpen ? 'bg-white text-[#000B60]' : 'bg-[#000B60] text-white'}`}>
                            {initials}
                        </div>
                        <Paragraph
                            className={`font-bold flex-1 text-left truncate ${labelClass(accountOpen ? 'text-white' : '')}`}
                            style={{ transition: LABEL_TRANSITION }}
                        >
                            {user?.name ?? 'Account'}
                        </Paragraph>
                        <ChevronUp
                            size={15}
                            className={`shrink-0 transition-all duration-300 ease-out ${collapsed ? 'max-w-0 opacity-0' : 'max-w-4 opacity-100'} ${accountOpen ? 'rotate-0 text-white' : 'rotate-180 text-gray-400'}`}
                        />
                    </button>
                </div>
            </div>
            </aside>
        </div>
    )
}

export default SideNavBar
