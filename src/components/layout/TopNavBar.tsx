

import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const TopNavBar = () => {
    const user = useAuthStore((state) => state.user)

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 w-72">
                <Search size={16} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
                />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">

                {/* Notification bell */}
                <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bell size={20} className="text-gray-500" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-medium">
                        3
                    </span>
                </button>

                {/* User avatar */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() ?? 'F'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name ?? 'Faculty'}</p>
                        <p className="text-xs text-gray-400">{user?.email ?? ''}</p>
                    </div>
                </div>

            </div>
        </header>
    )
}

export default TopNavBar