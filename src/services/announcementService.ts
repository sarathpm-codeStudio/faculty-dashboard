


import apiClient from '@/lib/apiClient'



export const announcementService = {

    createAnnouncement: async (payload: any) => {
        try {
            const { data: response } = await apiClient.post('/announcements', payload)
            return response
        } catch (error: any) {
            throw error.message
        }
    },

    getAllAnnouncements: async (payload: any) => {
        try {
            const { data: response } = await apiClient.get('/announcements', { params: payload })
            return response
        } catch (error: any) {
            throw error.message
        }
    },

    getAnnouncementById: async (id: number) => {
        try {
            const { data: response } = await apiClient.get(`/announcements/${id}`)
            return response
        } catch (error: any) {
            throw error.message
        }
    },

    updateAnnouncement: async (id: any, payload: any) => {
        try {
            const { data: response } = await apiClient.patch(`/announcements/${id}`, payload)
            return response
        } catch (error: any) {
            throw error.message
        }
    },

    deleteAnnouncement: async (id: any) => {
        try {
            const { data: response } = await apiClient.delete(`/announcements/${id}`)
            return response
        } catch (error: any) {
            throw error.message
        }
    },
}
