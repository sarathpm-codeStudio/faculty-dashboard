

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentServices } from '@/services/studentServices'


export const useGetStudents = (payload: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['students', payload],
        queryFn: () => studentServices.getStudents(payload),
        enabled,
    })
}