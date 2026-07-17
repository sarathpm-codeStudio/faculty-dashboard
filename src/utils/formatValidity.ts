/**
 * Human label for courses.validity. Paid courses store a month count
 * ('1', '3', '6', '12') or 'lifetime'; free courses store DAYS as '<n>d'
 * (e.g. '7d'), fixed platform-wide by platform_settings.free_course_validity.
 */
export const formatValidity = (raw: string | null | undefined): string => {
    const value = (raw ?? '').trim()
    if (!value) return '—'
    if (value.toLowerCase() === 'lifetime') return 'Lifetime'

    const daysMatch = /^(\d+)d$/i.exec(value)
    if (daysMatch) {
        const days = Number(daysMatch[1])
        return `${days} ${days === 1 ? 'Day' : 'Days'}`
    }

    const months = Number(value)
    if (!Number.isFinite(months)) return value
    if (months === 12) return '1 Year'
    return `${months} ${months === 1 ? 'Month' : 'Months'}`
}
