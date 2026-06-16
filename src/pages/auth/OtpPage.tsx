import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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

const OtpPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const phone: string = location.state?.phone ?? ''
    const mode: 'login' | 'signup' = location.state?.mode ?? 'login'
    const login = useAuthStore((state) => state.login)

    const [otp, setOtp] = useState(Array(6).fill(''))
    const [error, setError] = useState('')
    const [resent, setResent] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const token = otp.join('')
        if (token.length < 6) return setError('Please enter the full 6-digit OTP')
        if (!phone) return setError('Phone number missing. Please go back and try again.')

        try {
            setSubmitting(true)
            const data = await authService.verifyOtp(phone, token)
            const user = data.user

            const profile = await authService.getUserProfile(user?.id ?? '')

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
            const message = err instanceof Error ? err.message : 'OTP verification failed'
            setError(message)
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleResend = async () => {
        setOtp(Array(6).fill(''))
        setError('')
        try {
            if (mode === 'signup') {
                await authService.sendSignupOtp(phone)
            } else {
                await authService.sendLoginOtp(phone)
            }
            setResent(true)
            toast.success('OTP resent')
            setTimeout(() => setResent(false), 3000)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to resend OTP'
            toast.error(message)
        }
    }

    return (
        <AuthLayout
            title="Faculty Sign in" subtitle="Access your dashboard and classrooms"
        >
            <div className='flex justify-center mb-[40px]'>
                <div className="w-[250px] text-center px-4 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm text-gray-600 font-medium">
<<<<<<< HEAD
                    OTP sent to <span className=' text-[#2c1452] font-bold'>+91 987●●●●937</span>
=======
                    OTP sent to <span className=' text-[#000B60] font-bold'>{maskPhone(phone)}</span>
>>>>>>> otp_check
                </div>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6">

                <OtpInput value={otp} onChange={setOtp} length={6} />

                {error && <Paragraph size="xs" className="text-red-500 text-center">{error}</Paragraph>}
                {resent && <Paragraph size="xs" className="text-green-600 text-center">OTP resent successfully!</Paragraph>}

                <div className='flex items-end justify-between gap-2'>
                    <div className='flex items-center gap-2 text-[12px] font-medium'>
                        <ClockIcon size={20} weight="fill" className="text-gray-500 " />
                        00:00
                    </div>

<<<<<<< HEAD
                    <span className="text-[#2c1452] font-bold cursor-pointer">
=======
                    <span onClick={handleResend} className="text-[#000B60] font-bold cursor-pointer">
>>>>>>> otp_check
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
