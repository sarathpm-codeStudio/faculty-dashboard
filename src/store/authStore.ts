

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    name: string
    email: string
    avatar_url: string
}

interface AuthState {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    isPending: boolean
    isSuspended: boolean
    noProfile: boolean
    profileStatus: string
    login: (user: User, token: string) => void
    logout: () => void
    setIsPending: (value: boolean) => void
    setIsSuspended: (value: boolean) => void
    setNoProfile: (value: boolean) => void
    setProfileStatus: (value: string) => void
    setProfile: (profile: User) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            token: null,
            isPending: false,
            isSuspended: false,
            noProfile: false,
            profileStatus: "",
            login: (user, token) => set({ isAuthenticated: true, user, token }),
            logout: () => set({ isAuthenticated: false, user: null, token: null, isPending: false, isSuspended: false, noProfile: false }),
            setIsPending: (value) => set({ isPending: value }),
            setIsSuspended: (value) => set({ isSuspended: value }),
            setNoProfile: (value) => set({ noProfile: value }),
            setProfile: (profile) => set({ user: profile }),
            setProfileStatus: (value) => set({ profileStatus: value }),

        }),
        { name: 'auth-storage' }
    )
)
