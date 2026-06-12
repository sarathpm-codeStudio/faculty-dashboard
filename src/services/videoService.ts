

import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'
import { useAuthStore } from '@/store/authStore'


// Read the faculty id on every call so it reflects the current user.
// Reading once at module load captures a stale/undefined value that
// survives logout/login without a page reload.
const getCurrentFacultyId = () => useAuthStore.getState().user?.id;

export const videoService = {

    createVideoUploadProgress: async (uniqueId: string, assetId: string, type: string, status: string) => {
        // try {
        //     const { data } = await apiClient.post('/video/create-upload-progress', {
        //         unique_id: uniqueId,
        //         asset_id: assetId,
        //         type,
        //         status
        //     })
        //     return data
        // } catch (error: any) {
        //     throw error.response.data
        // }

        try {
            console.log(">>>>>>>>>>>>>>>>>>", uniqueId, getCurrentFacultyId(), assetId, type, status)

            // upsert = insert if not exists, update if exists ✅
            const { error } = await supabase
                .from("video_upload_progress")
                .upsert({
                    faculty_id: getCurrentFacultyId(),
                    unique_id: uniqueId,
                    type: type,
                    asset_id: assetId,
                    uploading_status: status,
                    upload_progress: 0,
                    transcoding_progress: 0,
                }, {
                    onConflict: 'unique_id'  // ← if unique_id exists → update ✅
                })

            if (type === "intro") {
                // check this unique_id use to have course add this video detisl in course table

                const { data: course } = await supabase
                    .from("courses")
                    .select("*")
                    .eq("unique_id", uniqueId)
                    .single();

                if (course) {
                    await supabase
                        .from("courses")
                        .update({
                            video_asset_id: assetId,
                            video_uploading_status: 'uploaded',
                            video_upload_progress: 0,
                            video_transcoding_progress: 0,


                        })
                        .eq("unique_id", uniqueId);
                }

                if (error) throw new Error(error.message)
            } else {

                // check this unique_id use to have course add this video detisl in course meterials table

                const { data: course } = await supabase
                    .from("course_materials")
                    .select("*")
                    .eq("unique_id", uniqueId)
                    .single();

                if (course) {
                    await supabase
                        .from("course_materials")
                        .update({
                            video_asset_id: assetId,
                            video_uploading_status: status,
                            video_upload_progress: 0,
                            video_transcoding_progress: 0,


                        })
                        .eq("unique_id", uniqueId);
                }

                if (error) throw new Error(error.message)
            }

            return true

        } catch (error: any) {
            console.log("error", error)
            throw new Error(error)
        }
    }

}