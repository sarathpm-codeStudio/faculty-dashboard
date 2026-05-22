
import apiClient from '@/lib/apiClient'

const extractApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
    const data = error?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error?.message === 'string' && error.message.trim()) return error.message
    return fallback
}

export const couponServices = {

    getCouponAnalytics: async () => {
        try {
            const { data: response } = await apiClient.get('/coupons/analytics')
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },


    createCoupon: async (payload: any) => {
        try {
            const { data: response } = await apiClient.post('/coupon', payload)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getAllCouponsEnabledCourses: async () => {
        try {
            const { data: response } = await apiClient.get('/coupons/enabled-courses')
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getAllCoupons: async (payload: any) => {
        try {
            const { data: response } = await apiClient.get('/coupons', { params: payload })
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    updateCouponStatus: async (id: any, status: boolean) => {
        try {
            const { data: response } = await apiClient.patch(`/coupon/${id}/status`, { status })
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    deleteCoupon: async (id: any) => {
        try {
            const { data: response } = await apiClient.delete(`/coupon/${id}`)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getCouponById: async (id: any) => {
        try {
            const { data: response } = await apiClient.get(`/coupon/${id}`)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    updateCoupon: async (id: any, payload: any) => {
        try {
            const { data: response } = await apiClient.patch(`/coupon/${id}`, payload)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },
}