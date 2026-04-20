import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const OtpPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email ?? 'your email'
    const login = useAuthStore((state) => state.login)

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [resent, setResent] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Auto move to next box when typing
    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    // Move back when pressing backspace on empty box
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    // Paste handler — pastes all 6 digits at once
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setOtp(pasted.split(''))
            inputRefs.current[5]?.focus()
        }
    }

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault()
        const otpString = otp.join('')
        if (otpString.length < 6) {
            return setError('Please enter the full 6-digit OTP')
        }

        // Mock verify — any 6 digits works for now
        login(
            { id: '1', name: 'Salsabeel', email },
            'mock-token-123'
        )
        navigate('/dashboard')
    }

    const handleResend = () => {
        setOtp(['', '', '', '', '', ''])
        setError('')
        setResent(true)
        inputRefs.current[0]?.focus()
        setTimeout(() => setResent(false), 3000)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                        E
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        We sent a 6-digit code to{' '}
                        <span className="font-medium text-gray-700">{email}</span>
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleVerify} className="flex flex-col gap-6">

                        {/* OTP boxes */}
                        <div className="flex gap-3 justify-center">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg outline-none transition-all
                    ${digit
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-900'
                                        }
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
                                />
                            ))}
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-red-500 text-xs text-center">{error}</p>
                        )}

                        {/* Resent success message */}
                        {resent && (
                            <p className="text-green-600 text-xs text-center">
                                OTP resent successfully!
                            </p>
                        )}

                        {/* Verify button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Verify OTP
                        </button>

                    </form>

                    {/* Resend + back */}
                    <div className="flex items-center justify-between mt-6 text-sm">
                        <button
                            onClick={handleResend}
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            Resend OTP
                        </button>
                        <Link
                            to="/auth"
                            className="text-gray-500 hover:text-gray-700 hover:underline"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>

                {/* Helper hint for mock mode */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    Enter any 6 digits to continue
                </p>

            </div>
        </div>
    )
}

export default OtpPage