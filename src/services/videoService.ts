

import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'


export const videoService = {

    createVideoUploadProgress: async (uniqueId: string, assetId: string, type: string,status: string) => {
        try {
            const { data } = await apiClient.post('/video/create-upload-progress', {
                unique_id: uniqueId,
                asset_id: assetId,
                type,
                status
            })
            return data
        } catch (error: any) {
            throw error.response.data
        }
    }

}