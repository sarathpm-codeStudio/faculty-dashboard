

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    name: string
    email: string
}

interface AuthState {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    isPending: boolean
    login: (user: User, token: string) => void
    logout: () => void
    setIsPending: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            token: null,
            isPending: false,
            login: (user, token) => set({ isAuthenticated: true, user, token }),
            logout: () => set({ isAuthenticated: false, user: null, token: null, isPending: false }),
            setIsPending: (value) => set({ isPending: value }),
        }),
        { name: 'auth-storage' }
    )
)
