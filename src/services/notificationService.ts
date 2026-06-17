import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

// Read the user id on every call so it reflects the current user.
const getCurrentUserId = () => useAuthStore.getState().user?.id

export type NotificationGroup = 'Today' | 'Yesterday'

export interface NotificationItem {
    id: string
    user_id: string
    type: string
    title: string
    body: string
    data: Record<string, any> | null
    is_read: boolean
    sent_at: string | null
    created_at: string | null
    group: NotificationGroup
}

export const notificationService = {
    // Returns only Today and Yesterday notifications, tagged with their group.
    getRecentNotifications: async (): Promise<NotificationItem[]> => {
        const userId = getCurrentUserId()
        if (!userId) return []

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const yesterdayStart = new Date(todayStart)
        yesterdayStart.setDate(yesterdayStart.getDate() - 1)

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', yesterdayStart.toISOString())
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        const todayStartMs = todayStart.getTime()

        return (data ?? []).map((n: any): NotificationItem => ({
            ...n,
            group: new Date(n.created_at).getTime() >= todayStartMs ? 'Today' : 'Yesterday',
        }))
    },

    // Total unread notifications for the badge on the top bar bell.
    getUnreadCount: async (): Promise<number> => {
        const userId = getCurrentUserId()
        if (!userId) return 0

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) throw new Error(error.message)
        return count ?? 0
    },

    markAsRead: async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', getCurrentUserId())

        if (error) throw new Error(error.message)
        return { id }
    },

    markAllAsRead: async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', getCurrentUserId())
            .eq('is_read', false)

        if (error) throw new Error(error.message)
        return { success: true }
    },
}
