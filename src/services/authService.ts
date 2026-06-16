
import { supabase } from "./supabase"

export const authService = {

    // Send OTP to phone for sign-in (do NOT auto-create user)
    sendLoginOtp: async (phone: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone,
                options: { shouldCreateUser: false },
            })
            if (error) throw error
            return data
        } catch (error: any) {
            throw error
        }
    },

    // Send OTP to phone for sign-up (auto-create user if not exists)
    sendSignupOtp: async (phone: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone,
                options: { shouldCreateUser: true },
            })
            if (error) throw error
            return data
        } catch (error: any) {
            throw error
        }
    },

    // Verify the SMS OTP
    verifyOtp: async (phone: string, token: string) => {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            })
            if (error) throw error
            return data
        } catch (error: any) {
            throw error
        }
    },

    // Sign out
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error: any) {
            throw error
        }
    },

    // Get current session
    getSession: async () => {
        try {
            const { data, error } = await supabase.auth.getSession()
            if (error) throw error
            return data.session
        } catch (error: any) {
            throw error.message
        }
    },

    // Get current user
    getUser: async () => {
        try {
            const { data, error } = await supabase.auth.getUser()
            if (error) throw error
            return data.user
        } catch (error: any) {
            throw error.message
        }
    },

    // get user profile
    getUserProfile: async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
            if (error) throw error
            return data
        } catch (error: any) {
            throw error.message
        }
    },


}
