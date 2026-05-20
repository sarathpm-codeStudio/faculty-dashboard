

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementService } from '@/services/announcementService'



export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: any) => announcementService.createAnnouncement(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] })
        },
    })
}

export const useGetAllAnnouncements = (payload: any) => {
    return useQuery({
        queryKey: ['announcements', payload],
        queryFn: () => announcementService.getAllAnnouncements(payload),
    })
}

export const useGetAnnouncementById = (id: any, enabled: boolean) => {
    return useQuery({
        queryKey: ['announcement', id],
        queryFn: () => announcementService.getAnnouncementById(id),
        enabled: enabled,
    })
}

export const useUpdateAnnouncement = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: any, payload: any }) => announcementService.updateAnnouncement(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] })
            queryClient.invalidateQueries({ queryKey: ['announcement', id] })
        },
    })
}


export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: any) => announcementService.deleteAnnouncement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] })
        },
    })
}



