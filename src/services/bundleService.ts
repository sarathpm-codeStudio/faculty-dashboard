

import apiClient from '@/lib/apiClient'


export const bundleService = {
    createBundle: async (data: any) => {
        try {
            const { data: response } = await apiClient.post('/bundle', data)
            return response

        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },

    getAllBundles: async (filter: any) => {
        try {
            const { data } = await apiClient.get('/bundle', { params: filter })
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },

    getBundleById: async (id: string) => {
        try {
            const { data } = await apiClient.get(`/bundle/${id}`)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },

    updateBundle: async (id: string, data: any) => {
        try {
            const { data: response } = await apiClient.patch(`/bundle/${id}`, data)
            return response
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },
}