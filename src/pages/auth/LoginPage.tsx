import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, Paragraph } from '@/components/ui'
import { PhoneInput } from '@/components/features'
import { authService } from '@/services/authService'
import { validationSchema } from '@/utils/validator/auth.validator'



const LoginPage = () => {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    useEffect(() => {
        const checkSession = async () => {
            const session = await authService.getSession()
            if (session && isAuthenticated) {
                navigate('/dashboard')
            }
        }
        checkSession()
    }, [])



    const formik = useFormik({
        initialValues: { countryCode: '+91', phone: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            // Combine into E.164 (e.g. +919876543210) — format sent to Supabase is unchanged
            const fullPhone = `${values.countryCode}${values.phone}`
            try {
                await authService.sendLoginOtp(fullPhone)
                toast.success('OTP sent to your phone')
                navigate('/auth/otp', { state: { phone: fullPhone, mode: 'login' } })
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.'
                toast.error(message)
            } finally {
                setSubmitting(false)
            }
        },
    })

    return (
        <AuthLayout title="Faculty Sign in" subtitle="Access your dashboard and classrooms">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

                <PhoneInput
                    label="Phone Number"
                    name="phone"
                    countryCode={formik.values.countryCode}
                    onCountryCodeChange={(code) => formik.setFieldValue('countryCode', code)}
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your  number"
                    error={formik.touched.phone && formik.errors.phone ? formik.errors.phone : undefined}
                />

                <Button type="submit" fullWidth className="mt-4" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Sending OTP…' : 'Send OTP'}
                </Button>

            </form>

            <Paragraph size="sm" className="text-center mt-6 mb-[10px]">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-[#2c1452] font-bold">
                    Sign up
                </Link>
            </Paragraph>
        </AuthLayout>
    )
}

export default LoginPage
