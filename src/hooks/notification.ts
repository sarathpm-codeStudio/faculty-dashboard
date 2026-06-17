import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/services/supabase'
import { notificationService, type NotificationItem } from '@/services/notificationService'
import { playNotificationSound, unlockNotificationSound } from '@/utils/notificationSound'

export const useGetRecentNotifications = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['notifications', 'recent'],
        queryFn: () => notificationService.getRecentNotifications(),
        enabled,
    })
}

export const useUnreadNotificationCount = () => {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => notificationService.getUnreadCount(),
    })
}

// Subscribes to new notification rows for the signed-in user. On each insert it
// refreshes the badge count + recent list, plays a chime, and shows a toast.
export const useNotificationRealtime = (userId?: string) => {
    const queryClient = useQueryClient()

    // Unlock audio on first user interaction so later chimes aren't blocked.
    useEffect(() => unlockNotificationSound(), [])

    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                ({ new: row }) => {
                    const notif = row as NotificationItem

                    // Keep the badge count and the open panel list in sync.
                    queryClient.invalidateQueries({ queryKey: ['notifications'] })

                    playNotificationSound()
                    toast(notif.title, { description: notif.body })
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, queryClient])
}

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}
