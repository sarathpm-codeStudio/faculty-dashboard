

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, Input, Paragraph, Checkbox } from '@/components/ui'
import { ChevronDown } from 'lucide-react'
import { IoIosArrowRoundBack } from 'react-icons/io'


const countryCodes = [
    { code: '+91', flag: '🇮🇳', country: 'India' },
    { code: '+1', flag: '🇺🇸', country: 'USA' },
    { code: '+44', flag: '🇬🇧', country: 'UK' },
    { code: '+971', flag: '🇦🇪', country: 'UAE' },
]

const LoginPage = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const [phone, setPhone] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [selectedCode, setSelectedCode] = useState(countryCodes[0])
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone) return setError('Please enter your phone number')
        login(
            { id: '1', name: 'Salsabeel', email: `${selectedCode.code}${phone}` },
            'mock-token-123'
        )
        navigate('/dashboard')
    }

    return (
        <AuthLayout title="Faculty Sign up" subtitle="Access your dashboard and classrooms">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">

                {/* Phone Number field */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Phone Number
                    </label>

                    <div className="flex gap-2 items-start">

                        {/* Country code dropdown */}
                        <div className="relative flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 px-3 py-4 bg-gray-100 hover:bg-gray-200 border border-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                            >
                                <span>{selectedCode.code}</span>
                                <ChevronDown
                                    size={14}
                                    className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {/* Dropdown list */}
                            {dropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                    {countryCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCode(item)
                                                setDropdownOpen(false)
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-gray-50
                        ${selectedCode.code === item.code
                                                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                    : 'text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{item.flag}</span>
                                                <span>{item.country}</span>
                                            </div>
                                            <span className="text-gray-400 text-xs">{item.code}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Phone input */}
                        <div className="flex flex-col gap-1 flex-1">
                            <Input
                                // label="Phone Number"
                                type="number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="**********"
                                error={error}
                            />
                            {error && (
                                <p className="text-red-500 text-xs">{error}</p>
                            )}
                        </div>

                    </div>
                </div>

                {/* <Checkbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className='mt-[15px]'
                /> */}

                <Button type="submit" fullWidth className='mt-[15px]'>
                    Sign up
                </Button>

            </form>

            <div className='w-full mt-[40px]  flex items-center justify-center gap-2 text-[14px] font-bold'>
                <IoIosArrowRoundBack size={24} className="text-gray-500 cursor-pointer " />
                <span className=' text-gray-500 cursor-pointer'> Back to sign in</span>
            </div>
        </AuthLayout>
    )
}

export default LoginPage