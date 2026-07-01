// `time_period` is stored in two formats across sources: the faculty app writes
// the slash form ("2026-07-01/2026-08-10"), while admin-created rows store a JSON
// string ({"start_date":"...","end_date":"..."}). Parse both into { start, end }.
export const parseTimePeriod = (
    value: any,
): { start: string; end: string } | null => {
    if (!value || typeof value !== 'string') return null

    const trimmed = value.trim()
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed)
            if (parsed?.start_date && parsed?.end_date) {
                return { start: parsed.start_date, end: parsed.end_date }
            }
        } catch {
            return null
        }
        return null
    }

    const [start, end] = trimmed.split('/')
    if (!start || !end) return null
    return { start, end }
}

// Local calendar date as an ISO yyyy-mm-dd string (no timezone shift). ISO date
// strings compare correctly lexicographically, so callers can string-compare.
export const getTodayDate = (): string => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

// True when `today` falls within the announcement's time_period. Rows without a
// parseable period are treated as always-active (no schedule set).
export const isActiveOn = (timePeriod: any, today: string): boolean => {
    const period = parseTimePeriod(timePeriod)
    if (!period) return true
    return period.start <= today && period.end >= today
}
