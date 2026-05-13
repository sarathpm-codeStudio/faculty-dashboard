

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
    noProfile: boolean
    login: (user: User, token: string) => void
    logout: () => void
    setIsPending: (value: boolean) => void
    setNoProfile: (value: boolean) => void
    setProfile: (profile: User) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            token: null,
            isPending: false,
            noProfile: false,
            login: (user, token) => set({ isAuthenticated: true, user, token }),
            logout: () => set({ isAuthenticated: false, user: null, token: null, isPending: false, noProfile: false }),
            setIsPending: (value) => set({ isPending: value }),
            setNoProfile: (value) => set({ noProfile: value }),
            setProfile: (profile) => set({ user: profile }),
        }),
        { name: 'auth-storage' }
    )
)
