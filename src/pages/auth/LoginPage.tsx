import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button, Input, Paragraph, Checkbox } from '@/components/ui'
import { authService } from '@/services/authService'
import { validationSchema } from '@/utils/validator/auth.validator'



const LoginPage = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [rememberMe, setRememberMe] = useState(false)

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const data = await authService.signIn(values.email, values.password)
                const user = data.user
                login(
                    {
                        id: user?.id ?? '',
                        name: `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}` || " ",
                        email: user?.email ? values.email : " ",
                    },
                    data.session?.access_token ?? ''
                )
                console.log(data)
                toast.success('Signed in successfully')
                navigate('/dashboard')
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.'
                toast.error(message)
            } finally {
                setSubmitting(false)
            }
        },
    })

    return (
        <AuthLayout title="Faculty Sign in" subtitle="Access your dashboard and classrooms">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

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

                <Checkbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-2"
                />

                <Button type="submit" fullWidth className="mt-4" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>

            </form>

            <Paragraph size="sm" className="text-center mt-6 mb-[10px]">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-[#000B60] font-bold">
                    Sign up
                </Link>
            </Paragraph>
        </AuthLayout>
    )
}

export default LoginPage
