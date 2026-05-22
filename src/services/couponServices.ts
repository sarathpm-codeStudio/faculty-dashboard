
import apiClient from '@/lib/apiClient'




export const couponServices = {
    createCoupon: async (payload: any) => {
        try {
            const { data: response } = await apiClient.post('/coupon', payload)
            return response
        } catch (error: any) {
            throw error.message
        }
    },

    getAllCouponsEnabledCourses: async () => {
        try {
            const { data: response } = await apiClient.get('/coupons/enabled-courses')
            return response
        } catch (error: any) {
            throw error.message
        }
    },

    getAllCoupons: async (payload: any) => {
        try {
            const { data: response } = await apiClient.get('/coupons', { params: payload })
            return response
        } catch (error: any) {
            throw error.message
        }
    },
}