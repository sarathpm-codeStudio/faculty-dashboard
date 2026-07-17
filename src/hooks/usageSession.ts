import { useEffect } from 'react'
import { usageSessionService } from '@/services/usageSessionService'

// How often to refresh the session's ended_at while the app stays open, so the
// admin's "recent active" time tracks actual usage instead of only app opens.
const USAGE_HEARTBEAT_MS = 60_000

/**
 * Record this app visit in usage_sessions for as long as the hook is mounted.
 * Mount it once in AppShell: starts a session on mount, heartbeats every
 * minute, and finalizes the session on unmount or page unload. Pass
 * `enabled=false` (e.g. no user id yet) to stay dormant.
 */
export const useUsageSession = (enabled: boolean) => {
    useEffect(() => {
        if (!enabled) return

        void usageSessionService.start().catch(() => {
            // Non-fatal: activity tracking must never break the app.
        })

        const beat = setInterval(() => {
            void usageSessionService.heartbeat().catch(() => {})
        }, USAGE_HEARTBEAT_MS)

        // Best-effort finalize on tab close; the heartbeat is the safety net
        // when this doesn't get a chance to run.
        const onUnload = () => {
            void usageSessionService.end().catch(() => {})
        }
        window.addEventListener('beforeunload', onUnload)

        return () => {
            clearInterval(beat)
            window.removeEventListener('beforeunload', onUnload)
            void usageSessionService.end().catch(() => {})
        }
    }, [enabled])
}
