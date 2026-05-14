
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

export const useGetTestById = (id: any, isEnabled: boolean) => {
    return useQuery({
        queryKey: ['test', id],
        queryFn: () => testService.getTestById(id),
        enabled: isEnabled,
    })
}

export const useUpdateTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: any }) => testService.updateTest(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] })
        },
    })
}

