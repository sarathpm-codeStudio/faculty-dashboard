
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testService } from '@/services/testService'


export const useCreateTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: any) => testService.createTest(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] })
            queryClient.invalidateQueries({ queryKey: ['content'] })

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
            queryClient.invalidateQueries({ queryKey: ['content'] })

        },
    })
}

export const useDeleteTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => testService.deleteTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] })
            queryClient.invalidateQueries({ queryKey: ['content'] })

        },
    })
}

export const useAddQuestion = (test_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: any) => testService.addQuestion(test_id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', test_id] })
        },
    })
}

export const useGetQuestionsByTestId = (test_id: string, isEnabled: boolean) => {
    return useQuery({
        queryKey: ['questions', test_id],
        queryFn: () => testService.getQuestionsByTestId(test_id),
        enabled: isEnabled,
    })
}


export const useUpdateQuestion = (test_id: string, question_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: any) => testService.updateQuestion(test_id, question_id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', test_id] })
        },
    })
}


export const useDeleteQuestion = (test_id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (question_id: string) => testService.deleteQuestion(test_id, question_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', test_id] })
        },
    })
}

export const usePublishTest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (test_id: string) => testService.publishTest(test_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] })
            queryClient.invalidateQueries({ queryKey: ['content'] })

        },
    })
}











