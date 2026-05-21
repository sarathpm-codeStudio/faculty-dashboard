

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

    getStudentById: async (id: string) => {
        try {
            const { data: response } = await apiClient.get(`/students/${id}`);
            return response;
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'
            throw new Error(message)
        }
    },

}