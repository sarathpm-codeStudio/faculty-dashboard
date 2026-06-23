import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

// Read the user id on every call so it reflects the current user.
const getCurrentUserId = () => useAuthStore.getState().user?.id

// How many notifications the Read tab loads per "Load more" page.
export const NOTIFICATIONS_PAGE_SIZE = 12

// Tag a raw row with its Today/Yesterday group (older rows fall under Yesterday).
const withGroup = (rows: any[]): NotificationItem[] => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartMs = todayStart.getTime()
    return rows.map((n: any): NotificationItem => ({
        ...n,
        group: new Date(n.created_at).getTime() >= todayStartMs ? 'Today' : 'Yesterday',
    }))
}

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

// Announcements are authored by admins and targeted by `audience`:
//  - 'all'     → shown to everyone
//  - 'faculty' → shown to every faculty
//  - 'course'  → shown only when course_id belongs to a course this faculty owns
export interface AnnouncementItem {
    id: string
    title: string
    content: string
    image_url: string | null
    audience: string | null
    course_id: string | null
    created_at: string | null
    is_read: boolean
}

// Course ids owned by the current faculty — used to resolve 'course' audience.
const getFacultyCourseIds = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select('id')
        .eq('faculty_id', userId)

    if (error) throw new Error(error.message)
    return (data ?? []).map((c: any) => c.id)
}

// PostgREST `.or()` filter: audience all/faculty, OR a course announcement
// whose course_id is one this faculty owns.
const buildAudienceFilter = (courseIds: string[]): string => {
    if (courseIds.length === 0) return 'audience.in.(all,faculty)'
    return `audience.in.(all,faculty),and(audience.eq.course,course_id.in.(${courseIds.join(',')}))`
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

    // Unread notifications only, newest first — used by the Unread tab.
    getUnreadNotifications: async (): Promise<NotificationItem[]> => {
        const userId = getCurrentUserId()
        if (!userId) return []

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_read', false)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return withGroup(data ?? [])
    },

    // One page of the full notification history (no date filter), newest first.
    // Powers the Read tab's "Load more" pagination so we don't fetch everything
    // up front. Returns the next page index, or null when there's nothing more.
    getNotificationsPage: async (
        page: number,
    ): Promise<{ items: NotificationItem[]; nextPage: number | null }> => {
        const userId = getCurrentUserId()
        if (!userId) return { items: [], nextPage: null }

        const from = page * NOTIFICATIONS_PAGE_SIZE
        const to = from + NOTIFICATIONS_PAGE_SIZE - 1

        const { data, error, count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw new Error(error.message)

        const items = withGroup(data ?? [])
        const loaded = from + items.length
        const nextPage = count != null && loaded < count ? page + 1 : null
        return { items, nextPage }
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

    // --- Announcement feed (read-tracked via announcement_reads) ----------
    // Admin announcements visible to this faculty, each tagged read/unread,
    // unread shown first then newest first.
    getAnnouncements: async (): Promise<AnnouncementItem[]> => {
        const userId = getCurrentUserId()
        if (!userId) return []

        const courseIds = await getFacultyCourseIds(userId)

        // Left-join announcement_reads filtered to this user → empty array means
        // unread. `.or()` applies the audience targeting rules.
        const { data, error } = await supabase
            .from('announcements')
            .select('id, title, content, image_url, audience, course_id, created_at, announcement_reads(read_at)')
            .eq('is_draft', false)
            .eq('is_deleted', false)
            .or(buildAudienceFilter(courseIds))
            .eq('announcement_reads.user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        const items: AnnouncementItem[] = (data ?? []).map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            image_url: a.image_url,
            audience: a.audience,
            course_id: a.course_id,
            created_at: a.created_at,
            is_read: (a.announcement_reads?.length ?? 0) > 0,
        }))

        // Unread first, then newest first within each group.
        return items.sort((a, b) => {
            if (a.is_read !== b.is_read) return a.is_read ? 1 : -1
            return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        })
    },

    // Count of visible announcements this faculty hasn't read — drives the
    // badge on the Announcement tab (NOT the notification bell).
    getUnreadAnnouncementCount: async (): Promise<number> => {
        const userId = getCurrentUserId()
        if (!userId) return 0

        const courseIds = await getFacultyCourseIds(userId)

        const { data, error } = await supabase
            .from('announcements')
            .select('id, announcement_reads(user_id)')
            .eq('is_draft', false)
            .eq('is_deleted', false)
            .or(buildAudienceFilter(courseIds))
            .eq('announcement_reads.user_id', userId)

        if (error) throw new Error(error.message)

        return (data ?? []).filter((a: any) => (a.announcement_reads?.length ?? 0) === 0).length
    },

    // Mark every visible announcement read for this faculty in one shot — called
    // when the Announcement tab is opened. Idempotent via the unique
    // (announcement_id, user_id) constraint.
    markAllAnnouncementsAsRead: async () => {
        const userId = getCurrentUserId()
        if (!userId) return { success: true }

        const courseIds = await getFacultyCourseIds(userId)

        const { data, error } = await supabase
            .from('announcements')
            .select('id, announcement_reads(user_id)')
            .eq('is_draft', false)
            .eq('is_deleted', false)
            .or(buildAudienceFilter(courseIds))
            .eq('announcement_reads.user_id', userId)

        if (error) throw new Error(error.message)

        const unreadIds = (data ?? [])
            .filter((a: any) => (a.announcement_reads?.length ?? 0) === 0)
            .map((a: any) => a.id)

        if (unreadIds.length === 0) return { success: true }

        const rows = unreadIds.map(id => ({ announcement_id: id, user_id: userId }))
        const { error: insertError } = await supabase
            .from('announcement_reads')
            .upsert(rows, { onConflict: 'announcement_id,user_id', ignoreDuplicates: true })

        if (insertError) throw new Error(insertError.message)
        return { success: true }
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
