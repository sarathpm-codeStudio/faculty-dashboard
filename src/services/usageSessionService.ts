import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'

// Read the user id on every call so it reflects the current user.
const getCurrentUserId = () => useAuthStore.getState().user?.id

// This is the web client.
const PLATFORM = 'web'

// The usage_sessions row created for this browser tab. One session per app
// open: started on mount, its ended_at kept fresh by heartbeats, and marked
// completed on close. Admin reads the latest row as the faculty's
// "recent active" time.
let sessionId: string | null = null
let sessionStartedAt: number | null = null

/** Insert a new usage_sessions row marking "the faculty opened the app now". */
const startSession = async (): Promise<void> => {
    const userId = getCurrentUserId()
    if (!userId || sessionId) return

    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from('usage_sessions')
        .insert({
            user_id: userId,
            started_at: now,
            ended_at: now,
            duration_seconds: 0,
            session_type: 'app',
            platform: PLATFORM,
            is_completed: false,
        })
        .select('id')
        .single()

    if (error) throw new Error(error.message)
    sessionId = data.id
    sessionStartedAt = Date.now()
}

/** Refresh ended_at / duration so the session reflects "still active now". */
const touchSession = async (isCompleted = false): Promise<void> => {
    if (!sessionId || !sessionStartedAt) return

    const { error } = await supabase
        .from('usage_sessions')
        .update({
            ended_at: new Date().toISOString(),
            duration_seconds: Math.round((Date.now() - sessionStartedAt) / 1000),
            is_completed: isCompleted,
        })
        .eq('id', sessionId)

    if (error) throw new Error(error.message)
}

export const usageSessionService = {
    // App opened (or user logged in) — record a new session.
    start: startSession,
    // Still here — keep ended_at fresh.
    heartbeat: () => touchSession(false),
    // Tab closed / logged out — finalize the session. Best-effort: if it never
    // runs, the last heartbeat still gives a usable "recent active" time.
    end: async () => {
        await touchSession(true)
        sessionId = null
        sessionStartedAt = null
    },
}
