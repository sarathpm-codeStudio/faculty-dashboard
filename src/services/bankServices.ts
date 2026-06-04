

import apiClient from '@/lib/apiClient'

const extractApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
    const data = error?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error?.message === 'string' && error.message.trim()) return error.message
    return fallback
}


export const bankServices = {
    createBankDetails: async (payload: any) => {
        try {
            const { data: response } = await apiClient.post('/bank/details', payload)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },
}