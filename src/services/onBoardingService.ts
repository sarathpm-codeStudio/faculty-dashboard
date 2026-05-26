


import { supabase } from "./supabase"




export const onBoardingService = {

    // create profile

    createProfile: async (data: any, id: any) => {
        try {
            const { data: result, error } = await supabase.from('profiles').insert([{ ...data, id }])
            if (error) throw error
            return true
        } catch (error: any) {
            console.log("profile", error)
            throw error.message
        }
    },

    // create academic profiles

    createAcademicProfiles: async (data: any[], faculty_id: any) => {
        try {

            // Map array — add faculty_id to each row
            const rows = data.map(item => ({
                faculty_id,
                type: item.type,
                field_of_study: item.fieldOfStudy,
                graduation_year: item.graduationYear ? parseInt(item.graduationYear) : null,
                teaching_experience: item.teachingExperience ? parseInt(item.teachingExperience) : null,
                document_url: item.document_url ?? null,
            }));

            const { data: result, error } = await supabase
                .from('academic_profiles')
                .insert(rows)   // ← insert array of rows ✅


            if (error) {
                console.log("academic profiles", error)
                throw error;
            }
            return result;

        } catch (error: any) {
            throw error.message;
        }
    },

    // create id verification
    createIdVerification: async (data: any, faculty_id: any) => {
        try {
            const { data: result, error } = await supabase
            .from('document_verifications')
            .insert([{ 
                 user_id: faculty_id,
                 document_type: data.document_type,
                 document_url: data.document_url,
                 }])
            if (error) throw error
            return true
        } catch (error: any) {
            throw error.message;
        }
    }
}
