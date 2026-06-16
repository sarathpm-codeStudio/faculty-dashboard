import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, Paragraph } from '@/components/ui'
import { PhoneInput } from '@/components/features'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { HiArrowRight } from 'react-icons/hi'
import { authService } from '@/services/authService'
import { signupValidationSchema } from '@/utils/validator/auth.validator'

const SignupPage = () => {
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: { countryCode: '+91', phone: '' },
        validationSchema: signupValidationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            // Combine into E.164 (e.g. +919876543210) — format sent to Supabase is unchanged
            const fullPhone = `${values.countryCode}${values.phone}`
            try {
                await authService.sendSignupOtp(fullPhone)
                toast.success('OTP sent to your phone')
                navigate('/auth/otp', { state: { phone: fullPhone, mode: 'signup' } })
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.'
                toast.error(message)
            } finally {
                setSubmitting(false)
            }
        },
    })

    return (
        <AuthLayout title="Faculty Sign Up" subtitle="Access your dashboard and classrooms">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

                <PhoneInput
                    label="Phone Number"
                    name="phone"
                    countryCode={formik.values.countryCode}
                    onCountryCodeChange={(code: any) => formik.setFieldValue('countryCode', code)}
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your  number"
                    error={formik.touched.phone && formik.errors.phone ? formik.errors.phone : undefined}
                />

                <Button type="submit" fullWidth className="mt-4" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Sending OTP…' : (
                        <>
                            Continue <HiArrowRight size={18} />
                        </>
                    )}
                </Button>

            </form>

            <div className="w-full mt-8 flex items-center justify-center gap-2 text-[14px] font-bold">
                <IoIosArrowRoundBack size={24} className="text-gray-500" />
                <Link to="/auth">
                    <span className="text-gray-500 cursor-pointer">Back to Sign in</span>
                </Link>
            </div>

            <Paragraph size="sm" className="text-center mt-4 mb-[10px]">
                Already have an account?{' '}
                <Link to="/auth" className="text-[#2c1452] font-bold">
                    Sign in
                </Link>
            </Paragraph>
        </AuthLayout>
    )
}

export default SignupPage
