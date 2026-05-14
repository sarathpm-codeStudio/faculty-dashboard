
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testService } from '@/services/testService'


export const useCreateTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: any) => testService.createTest(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] })
        },
    })
}

export const useGetAllTests = (payload: any) => {
    return useQuery({
        queryKey: ['tests', payload],
        queryFn: () => testService.getAllTests(payload),
    })
}

