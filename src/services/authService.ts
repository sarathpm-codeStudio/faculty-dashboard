
import { supabase } from "./supabase"

export const authService = {

    // Sign in with email + password
    signIn: async (email: string, password: string) => {

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            return data
        } catch (error: any) {
            throw error.message
        }
    },

    // Sign up with email + password
    signUp: async (email: string, password: string, name: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } },
            })
            if (error) throw error
            return data
        } catch (error: any) {
            throw error.message
        }
    },

    // Sign out
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error: any) {
            throw error.message
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
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
            if (error) throw error
            return data
        } catch (error: any) {
            throw error.message
        }
    },


}