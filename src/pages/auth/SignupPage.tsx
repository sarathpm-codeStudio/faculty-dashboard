import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, Input, Paragraph } from '@/components/ui'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { authService } from '@/services/authService'
import { signupValidationSchema } from '@/utils/validator/auth.validator'

const SignupPage = () => {
    const navigate = useNavigate()
    const [success, setSuccess] = useState(false)

    const formik = useFormik({
        initialValues: { name: '', email: '', password: '', confirmPassword: '' },
        validationSchema: signupValidationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await authService.signUp(values.email, values.password, values.name)
                toast.success('Account created! Check your email to confirm.')
                setSuccess(true)
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.'
                toast.error(message)
            } finally {
                setSubmitting(false)
            }
        },
    })

    if (success) {
        return (
            <AuthLayout title="Check your email" subtitle="We sent a confirmation link to your inbox">
                <div className="flex flex-col items-center gap-6 py-4">
                    <p className="text-sm text-gray-600 text-center">
                        Please click the link in your email to verify your account, then sign in.
                    </p>
                    <Button fullWidth onClick={() => navigate('/auth')}>
                        Go to Sign in
                    </Button>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout title="Faculty Sign up" subtitle="Create your faculty account">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

                <Input
                    label="Full Name"
                    type="text"
                    id="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Your full name"
                    error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
                />

                <Input
                    label="Email"
                    type="email"
                    id="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="you@example.com"
                    error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                />

                <Input
                    label="Password"
                    type="password"
                    id="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
                />

                <Button type="submit" fullWidth className="mt-4" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Creating account…' : 'Sign up'}
                </Button>

            </form>

            <div className="w-full mt-8 flex items-center justify-center gap-2 text-[14px] font-bold">
                <IoIosArrowRoundBack size={24} className="text-gray-500" />
                <Link to="/auth">
                    <span className="text-gray-500 cursor-pointer">Back to sign in</span>
                </Link>
            </div>

            <Paragraph size="sm" className="text-center mt-4 mb-[10px]">
                Already have an account?{' '}
                <Link to="/auth" className="text-[#000B60] font-bold">
                    Sign in
                </Link>
            </Paragraph>
        </AuthLayout>
    )
}

export default SignupPage
