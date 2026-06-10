import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, OtpInput, Paragraph } from '@/components/ui'
import { ClockIcon } from "@phosphor-icons/react"
import { IoIosArrowRoundBack } from "react-icons/io";

const OtpPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email ?? 'your email'
    const login = useAuthStore((state) => state.login)

    const [otp, setOtp] = useState(Array(6).fill(''))
    const [error, setError] = useState('')
    const [resent, setResent] = useState(false)

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.join('').length < 4) return setError('Please enter the full 6-digit OTP')
        login({ id: '1', name: 'Salsabeel', email }, 'mock-token-123')
        navigate('/onboarding')
    }

    const handleResend = () => {
        setOtp(Array(6).fill(''))
        setError('')
        setResent(true)
        setTimeout(() => setResent(false), 3000)
    }

    return (
        <AuthLayout
            title="Faculty Sign in" subtitle="Access your dashboard and classrooms"

        >

            {/* Sent-to banner */}
            <div className='flex justify-center mb-[40px]'>
                <div className="w-[250px] text-center px-4 py-2 bg-[#F2F4F6] border border-gray-100 rounded-lg text-sm text-gray-600 font-medium">
                    OTP sent to <span className=' text-[#2c1452] font-bold'>+91 987●●●●937</span>
                </div>
            </div>


            <form onSubmit={handleVerify} className="flex flex-col gap-6">



                <OtpInput value={otp} onChange={setOtp} length={4} />

                {error && <Paragraph size="xs" className="text-red-500 text-center">{error}</Paragraph>}
                {resent && <Paragraph size="xs" className="text-green-600 text-center">OTP resent successfully!</Paragraph>}

                <div className='flex items-end justify-between gap-2'>
                    <div className='flex items-center gap-2 text-[12px] font-medium'>
                        <ClockIcon size={20} weight="fill" className="text-gray-500 " />
                        00:00

                    </div>

                    <span className="text-[#2c1452] font-bold cursor-pointer">
                        Resend
                    </span>


                </div>

                <Button type="submit" fullWidth>
                    Continue
                </Button>
            </form>


            <div className='w-full mt-[40px] mb-[10px] flex items-center justify-center gap-2 text-[14px] font-bold'>
                <IoIosArrowRoundBack size={24} className="text-gray-500 cursor-pointer " />
                <span className=' text-gray-500 cursor-pointer'> Back to sign in</span>
            </div>
        </AuthLayout>
    )
}

export default OtpPage
