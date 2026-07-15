import { useEffect } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/services/supabase'
import { uniqueChannel } from '@/utils/realtimeChannel'
import { notificationService, type NotificationItem } from '@/services/notificationService'
import { playNotificationSound, unlockNotificationSound } from '@/utils/notificationSound'

export const useGetRecentNotifications = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['notifications', 'recent'],
        queryFn: () => notificationService.getRecentNotifications(),
        enabled,
    })
}

export const useGetUnreadNotifications = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: () => notificationService.getUnreadNotifications(),
        enabled,
    })
}

// Paginated full history for the Read tab. Pages are loaded on demand via
// fetchNextPage() so we don't pull every notification on first open.
export const useInfiniteNotifications = (enabled: boolean = true) => {
    return useInfiniteQuery({
        queryKey: ['notifications', 'all', 'infinite'],
        queryFn: ({ pageParam }) => notificationService.getNotificationsPage(pageParam),
        initialPageParam: 0,
        getNextPageParam: lastPage => lastPage.nextPage,
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
            .channel(uniqueChannel(`notifications:${userId}`))
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

// --- Announcement feed (admin announcements, read-tracked) ---------------

export const useGetAnnouncements = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['announcement-feed'],
        queryFn: () => notificationService.getAnnouncements(),
        enabled,
    })
}

export const useUnreadAnnouncementCount = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['announcement-feed', 'unread-count'],
        queryFn: () => notificationService.getUnreadAnnouncementCount(),
        enabled,
    })
}

export const useMarkAllAnnouncementsAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => notificationService.markAllAnnouncementsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcement-feed'] })
        },
    })
}
