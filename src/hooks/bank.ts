

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bankServices } from '@/services/bankServices'

export const useCreateBankDetails = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['bank-details'],
        mutationFn: (payload: any) => bankServices.createBankDetails(payload),
    })
}