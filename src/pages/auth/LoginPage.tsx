

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const LoginPage = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return setError('Please enter your email')

        // Mock login — no API needed for now
        login(
            { id: '1', name: 'Salsabeel', email },
            'mock-token-123'
        )
        navigate('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                        E
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your instructor account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Login
                        </button>

                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/auth/signup" className="text-indigo-600 font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default LoginPage