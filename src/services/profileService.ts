import { supabase } from './supabase'

export type FacultyProfile = {
    id: string
    account_id?: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    date_of_birth?: string
    bio?: string
    avatar_url?: string
    account_verified?: string
    created_at?: string
    faculty_code?: string
}

export type AcademicProfile = {
    id: string
    faculty_id: string
    type?: string
    field_of_study?: string
    graduation_year?: string | number | null
    teaching_experience?: number | null
    document_url?: string | null
}

export const profileService = {
    getProfile: async (userId: string): Promise<FacultyProfile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
        if (error) throw error
        return data
    },

    getAcademicProfiles: async (facultyId: string): Promise<AcademicProfile[]> => {
        const { data, error } = await supabase
            .from('academic_profiles')
            .select('*')
            .eq('faculty_id', facultyId)
        if (error) throw error
        return data ?? []
    },

    updateProfile: async (
        userId: string,
        data: {
            first_name?: string
            last_name?: string
            email?: string
            phone?: string
            date_of_birth?: string | null
            bio?: string
            avatar_url?: string
        },
    ) => {
        const { error } = await supabase.from('profiles').update(data).eq('id', userId)
        if (error) throw error
    },

    deleteAcademicProfiles: async (ids: string[]) => {
        if (ids.length === 0) return
        const { error } = await supabase.from('academic_profiles').delete().in('id', ids)
        if (error) throw error
    },
}
