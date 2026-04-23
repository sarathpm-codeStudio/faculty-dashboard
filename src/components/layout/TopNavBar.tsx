import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, ChevronDown, Menu, Plus } from 'lucide-react'
import manAvatar from '@/assets/images/man.jpg'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Paragraph } from '@/components/ui'

interface TopNavBarProps {
    onMenuClick: () => void
}

const TopNavBar = ({ onMenuClick }: TopNavBarProps) => {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
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

    const handleLogout = () => {
        logout()
        navigate('/auth')
    }

    return (
        <header className="flex items-center justify-between gap-3 px-4 md:px-6 pt-4 md:pt-7 pb-3 flex-shrink-0 bg-gray-50 z-20 sticky top-0">

            {/* Left: hamburger (mobile) + search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                    aria-label="Open navigation"
                >
                    <Menu size={22} />
                </button>

                {/* Desktop search */}
                <div className="hidden md:block w-full max-w-[700px]">
                    <Input
                        placeholder="Search by course and students..."
                        leftIcon={<Search size={16} />}
                    />
                </div>

                {/* Mobile search toggle */}
                <button
                    onClick={() => setMobileSearchOpen(o => !o)}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Search"
                >
                    <Search size={20} />
                </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">

                {/* Create course — icon only on small screens */}
                <Button
                    variant="primary"
                    className="!h-10 !text-sm !px-3 md:!px-4 !font-semibold"
                    onClick={() => navigate('/courses/create')}
                >
                    <Plus size={16} className="md:hidden" />
                    <span className="hidden md:inline">Create course</span>
                </Button>

                {/* Notification bell */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell size={20} className="text-gray-500" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-medium">
                        3
                    </span>
                </button>

                {/* Divider — hide on mobile */}
                <div className="hidden md:block w-px h-8 bg-gray-300" />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-1 md:px-2 py-1 transition-colors"
                    >
                        <Paragraph className="font-bold hidden md:block">{user?.name ?? 'Faculty'}</Paragraph>
                        <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={manAvatar} alt="avatar" className="w-full h-full object-cover" />
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

            {/* Mobile search expanded row */}
            {mobileSearchOpen && (
                <div className="md:hidden absolute top-full inset-x-0 px-4 pb-3 bg-gray-50 border-b border-gray-100">
                    <Input
                        placeholder="Search..."
                        leftIcon={<Search size={16} />}
                        autoFocus
                    />
                </div>
            )}
        </header>
    )
}

export default TopNavBar
