
import apiClient from '@/lib/apiClient'



export const testService = {
    createTest: async (payload: any) => {

        try {

            const { data } = await apiClient.post('/test', payload)
            return data

        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    getAllTests: async (payload: any) => {
        try {
            const { data } = await apiClient.get('/test', { params: payload })
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    getTestById: async (id: string) => {
        try {
            const { data } = await apiClient.get(`/test/${id}`)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    updateTest: async (id: string, payload: any) => {
        try {
            const { data } = await apiClient.patch(`/test/${id}`, payload)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },
}