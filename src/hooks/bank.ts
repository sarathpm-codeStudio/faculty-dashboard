

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bankServices } from '@/services/bankServices'

export const useCreateBankDetails = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['bank-details'],
        mutationFn: (payload: any) => bankServices.createBankDetails(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-details'] })
        },
    })
}

export const useGetBankDetails = () => {
    return useQuery({
        queryKey: ['bank-details'],
        queryFn: () => bankServices.getBankDetails(),
    })
}


export const useGetTransactionHistory = (facultyId: any, limit: number | null) => {
    return useQuery({
        queryKey: ['transaction-history', facultyId, limit],
        queryFn: () => bankServices.getTransactionHistory(facultyId, limit),
    })
}


export const useGetTransactionAnalyticsWithTransactions = (facultyId: any,{
    page = 1,
    limit = 5,
    search = '',
    status,
    dateFilter = 'all',
}: {
    page?: number
    limit?: number
    search?: string
    status?: 'SUCCESS' | 'PENDING' | 'FAILED' | 'all'
    dateFilter?: 'last7' | 'last30' | 'thisMonth' | 'thisYear' | 'all'
}) => {
    return useQuery({
        queryKey: ['transaction-analytics-with-transactions', facultyId, page, limit, search, status, dateFilter],
        queryFn: () => bankServices.getTransactionAnalyticsWithTransactions(facultyId, { page, limit, search, status, dateFilter }),
    })
}