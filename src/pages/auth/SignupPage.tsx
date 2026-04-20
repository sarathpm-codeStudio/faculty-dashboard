import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const SignupPage = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [form, setForm] = useState({ name: '', email: '', phone: '', country: '' })
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.phone) {
            return setError('Please fill all fields')
        }
        // Mock signup — straight to dashboard
        login({ id: '1', name: form.name, email: form.email }, 'mock-token-123')
        navigate('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                        E
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
                    <p className="text-gray-500 text-sm mt-1">Start teaching on EduPlatform</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {[
                            { name: 'name', label: 'Full name', type: 'text', placeholder: 'Salsabeel' },
                            { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
                            { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '+91 9876543210' },
                        ].map(({ name, label, type, placeholder }) => (
                            <div key={name} className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">{label}</label>
                                <input
                                    type={type}
                                    name={name}
                                    value={form[name as keyof typeof form]}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                        ))}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Country</label>
                            <select
                                name="country"
                                value={form.country}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                            >
                                <option value="">Select country</option>
                                <option value="IN">India</option>
                                <option value="US">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="AE">UAE</option>
                            </select>
                        </div>

                        {error && <p className="text-red-500 text-xs">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors mt-2"
                        >
                            Create account
                        </button>

                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/auth" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default SignupPage