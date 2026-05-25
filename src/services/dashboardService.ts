
import apiClient from '@/lib/apiClient'

const extractApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
    const data = error?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error?.message === 'string' && error.message.trim()) return error.message
    return fallback
}


export const dashboardService = {
    getDashboardCounters: async () => {
        try {
            const { data: response } = await apiClient.get('/dashboard/counters')
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getEnrollmentTrend: async (period: string) => {
        try {
            const { data: response } = await apiClient.get(`/dashboard/enrollment-trends`, { params: {period} })
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getRevenueTrend: async (period: string) => {
        try {
            const { data: response } = await apiClient.get(`/dashboard/revenue-trends`, { params: {period} })
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getTopCoursesPerformance: async () => {
        try {
            const { data: response } = await apiClient.get(`/dashboard/top-courses-performances`)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },


}

