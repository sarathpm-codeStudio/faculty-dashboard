
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

    getTestsPageAnalytics: async () => {
        try {
            const { data } = await apiClient.get('/test/analytics')
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

    getTestAnalytics: async (test_id: string) => {
        try {
            const { data } = await apiClient.get(`/test/${test_id}/analytics`)
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

    deleteTest: async (id: string) => {
        try {
            const { data } = await apiClient.delete(`/test/${id}`)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    addQuestion: async (test_id: string, payload: any) => {
        try {
            const { data } = await apiClient.post(`/test/${test_id}/questions`, payload)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    getQuestionsByTestId: async (test_id: string) => {
        try {
            const { data } = await apiClient.get(`/test/${test_id}/questions`)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    updateQuestion: async (test_id: string, question_id: string, payload: any) => {
        try {
            const { data } = await apiClient.patch(`/test/${test_id}/questions/${question_id}`, payload)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    deleteQuestion: async (test_id: string, question_id: string) => {
        try {
            const { data } = await apiClient.delete(`/test/${test_id}/questions/${question_id}`)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },

    publishTest: async (test_id: string) => {
        try {
            const { data } = await apiClient.patch(`/test/${test_id}/publish`)
            return data
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            console.log("error", error)
            throw new Error(message)
        }
    },
}