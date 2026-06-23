import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, OtpInput, Paragraph } from '@/components/ui'
import { ClockIcon } from "@phosphor-icons/react"
import { IoIosArrowRoundBack } from "react-icons/io"
import { authService } from '@/services/authService'

const maskPhone = (phone: string) => {
    if (!phone || phone.length < 4) return phone
    return `${phone.slice(0, 4)}●●●●${phone.slice(-3)}`
}

const OTP_DURATION = 10 * 60 // 10 minutes in seconds

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Supabase returns the SAME "Token has expired or is invalid" message for both a
// wrong OTP and an expired one, so we can't tell them apart from the message text.
// We use our own countdown (isExpired) to decide which message to show.
const friendlyOtpError = (message: string, isExpired: boolean) => {
    const msg = message.toLowerCase()
    if (msg.includes('expired') || msg.includes('invalid') || msg.includes('token')) {
        return isExpired
            ? 'OTP has expired. Please resend a new code.'
            : 'Invalid OTP. Please check the code and try again.'
    }
    return message
}

const OtpPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const phone: string = location.state?.phone ?? ''
    const mode: 'login' | 'signup' = location.state?.mode ?? 'login'
    const login = useAuthStore((state) => state.login)
    const queryClient = useQueryClient()

    const [otp, setOtp] = useState(Array(6).fill(''))
    const [error, setError] = useState('')
    const [resent, setResent] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION)

    // Countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
        }, 1000)
        return () => clearInterval(interval)
    }, [secondsLeft])

    const expired = secondsLeft <= 0

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const token = otp.join('')
        if (token.length < 6) return setError('Please enter the full 6-digit OTP')
        if (!phone) return setError('Phone number missing. Please go back and try again.')
        if (expired) return setError('OTP has expired. Please resend a new code.')

        try {
            setSubmitting(true)
            const data = await authService.verifyOtp(phone, token)
            const user = data.user

            const profile = await authService.getUserProfile(user?.id ?? '')

            // Only FACULTY accounts may sign in here. Block any other role.
            if (mode === 'login' && profile?.role !== 'FACULTY') {
                await authService.signOut()
                const msg = "You don't have access. This portal is for faculty accounts only."
                setError(msg)
                toast.error(msg)
                return
            }

            // Clear any cache left over from a previous session before loading
            // this user's data — guards against stale data when the prior logout
            // didn't run (e.g. session expiry redirect).
            queryClient.clear()

            login(
                {
                    id: user?.id ?? '',
                    name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || '',
                    email: user?.email ?? '',
                    phone: user?.phone ?? phone,
                    avatar_url: profile?.avatar_url || '',
                },
                data.session?.access_token ?? ''
            )

            toast.success('Verified successfully')
            navigate(mode === 'signup' ? '/onboarding' : '/dashboard')
        } catch (err: unknown) {
            const rawMessage = err instanceof Error ? err.message : 'OTP verification failed'
            const message = friendlyOtpError(rawMessage, expired)
            setError(message)
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleResend = useCallback(async () => {
        if (!phone) return setError('Phone number missing. Please go back and try again.')
        setOtp(Array(6).fill(''))
        setError('')
        try {
            if (mode === 'signup') {
                await authService.sendSignupOtp(phone)
            } else {
                await authService.sendLoginOtp(phone)
            }
            setSecondsLeft(OTP_DURATION) // restart the 10 minute timer
            setResent(true)
            toast.success('OTP resent')
            setTimeout(() => setResent(false), 3000)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to resend OTP'
            toast.error(message)
        }
    }, [phone, mode])

    return (
        <AuthLayout
            title="Faculty Sign in" subtitle="Access your dashboard and classrooms"
        >
            <div className='flex justify-center mb-[40px]'>
                <div className="w-[250px] text-center px-4 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm text-gray-600 font-medium">
                    OTP sent to <span className=' text-[#000B60] font-bold'>{maskPhone(phone)}</span>
                </div>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6">

                <OtpInput value={otp} onChange={setOtp} length={6} />

                {error && <Paragraph size="xs" className="text-red-500 text-center">{error}</Paragraph>}
                {resent && <Paragraph size="xs" className="text-green-600 text-center">OTP resent successfully!</Paragraph>}

                <div className='flex items-end justify-between gap-2'>
                    <div className='flex items-center gap-2 text-[12px] font-medium'>
                        <ClockIcon size={20} weight="fill" className="text-gray-500 " />
                        {formatTime(secondsLeft)}
                    </div>

                    <span
                        onClick={expired ? handleResend : undefined}
                        className={
                            expired
                                ? 'text-[#000B60] font-bold cursor-pointer'
                                : 'text-gray-400 font-bold cursor-not-allowed'
                        }
                    >
                        Resend
                    </span>
                </div>

                <Button type="submit" fullWidth disabled={submitting}>
                    {submitting ? 'Verifying…' : 'Continue'}
                </Button>
            </form>

            <div className='w-full mt-[40px] mb-[10px] flex items-center justify-center gap-2 text-[14px] font-bold'>
                <IoIosArrowRoundBack size={24} className="text-gray-500 cursor-pointer " />
                <Link to="/auth/login">
                    <span className=' text-gray-500 cursor-pointer'> Back to sign in</span>
                </Link>
            </div>
        </AuthLayout>
    )
}

export default OtpPage
