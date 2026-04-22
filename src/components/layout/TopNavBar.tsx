

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, ChevronDown } from 'lucide-react'
import manAvatar from '@/assets/images/man.jpg'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Button, Button2, Input, Paragraph } from '@/components/ui'

const TopNavBar = () => {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
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
        <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 pt-7 bg-gray-50 z-20 sticky top-0">

            {/* Search */}
            <div className="w-[700px]">
                <Input
                    placeholder="Search by course and students..."
                    leftIcon={<Search size={16} />}
                />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">


                <Button
                    variant="primary"
                    className="!h-10 !text-sm !px-4 !font-semibold"
                    onClick={() => console.log('Create course')}
                >


                    Create course
                </Button>

                {/* Notification bell */}
                <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bell size={20} className="text-gray-500" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-medium">
                        3
                    </span>
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300" />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                    >

                        <Paragraph className="font-bold hidden md:block">{user?.name ?? 'Faculty'}</Paragraph>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
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
        </header>
    )
}

export default TopNavBar
