

import apiClient from '@/lib/apiClient'



export const studentServices = {

    getStudents: async (payload: any) => {
        try {
            const { data: response } = await apiClient.get('/students', { params: payload });
            return response;
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },

    getStudentCourses: async (id: string, payload: any) => {
        try {
            const { data: response } = await apiClient.get(`/students/${id}/courses`, { params: payload });
            return response;
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },

    getStudentAnalytics: async (id: string) => {
        try {
            const { data: response } = await apiClient.get(`/students/${id}/analytics`);
            return response;
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)

        }
    },
}