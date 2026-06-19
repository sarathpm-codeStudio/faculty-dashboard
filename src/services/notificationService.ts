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

    // Notify admins that a course was resubmitted for review.
    // A single admin-targeted row is created (is_admin = true, no user_id);
    // the admin side reads notifications by is_admin rather than user_id.
    notifyAdminsCourseResubmitted: async (course: { id: string; title?: string | null }) => {
        const courseTitle = course.title ?? 'A course'

        const { error } = await supabase.from('notifications').insert({
            user_id: null,
            is_admin: true,
            type: 'COURSE',
            title: 'Course resubmitted for review',
            body: `"${courseTitle}" has been resubmitted and is awaiting your review.`,
            data: { courseId: course.id, action: 'RESUBMIT' },
        })

        if (error) throw new Error(error.message)
        return { inserted: 1 }
    },

    // Notify admins that a faculty has published a course.
    // Single admin-targeted row (is_admin = true, no user_id).
    notifyAdminsCoursePublished: async (course: { id: string; title?: string | null }) => {
        const courseTitle = course.title ?? 'A course'

        const { error } = await supabase.from('notifications').insert({
            user_id: null,
            is_admin: true,
            type: 'COURSE',
            title: 'Course published',
            body: `"${courseTitle}" has been published by a faculty.`,
            data: { courseId: course.id, action: 'PUBLISHED' },
        })

        if (error) throw new Error(error.message)
        return { inserted: 1 }
    },

    // Notify admins that a faculty has resubmitted their profile for review.
    // Single admin-targeted row (is_admin = true, no user_id).
    notifyAdminsProfileResubmitted: async (faculty: { id: string; name?: string | null }) => {
        const facultyName = faculty.name?.trim() || 'A faculty member'

        const { error } = await supabase.from('notifications').insert({
            user_id: null,
            is_admin: true,
            type: 'ACCOUNT',
            title: 'Profile resubmitted for review',
            body: `${facultyName} has resubmitted their profile details and is awaiting verification.`,
            data: { facultyId: faculty.id, action: 'PROFILE_RESUBMITTED' },
        })

        if (error) throw new Error(error.message)
        return { inserted: 1 }
    },

    // Notify admins that a new faculty member has completed onboarding and is
    // awaiting account verification. Single admin-targeted row (is_admin = true,
    // no user_id), read on the admin side by is_admin.
    notifyAdminsFacultyOnboarded: async (faculty: { id: any; name?: string | null }) => {
        const facultyName = faculty.name?.trim() || 'A new faculty member'

        const { error } = await supabase.from('notifications').insert({
            user_id: null,
            is_admin: true,
            type: 'FACULTY_ONBOARDED',
            title: 'New faculty onboarded',
            body: `${facultyName} has completed onboarding and is awaiting verification.`,
            data: { facultyId: faculty.id, action: 'FACULTY_ONBOARDED' },
        })

        if (error) throw new Error(error.message)
        return { inserted: 1 }
    },
}
