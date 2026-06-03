

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentServices } from '@/services/studentServices'


export const useGetStudents = (payload: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['students', payload],
        queryFn: () => studentServices.getStudents(payload),
        enabled,
    })
}

export const useGetStudentCourses = (id: any, payload: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['student-courses', id, payload],
        queryFn: () => studentServices.getStudentCourses(id, payload),
        enabled,
    })
}

export const useGetStudentAnalytics = (id: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['student-analytics', id],
        queryFn: () => studentServices.getStudentAnalytics(id),
        enabled,
    })
}

