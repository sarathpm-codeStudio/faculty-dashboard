

export const formatDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    const cleaned = dateStr.replace(/\s/g, '');
    const parts = cleaned.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year || year.length !== 4) return null;
    const yearNum = parseInt(year);
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};


// utils/timeAgo.ts

export function timeAgo(isoString: string): string {
    const now = new Date()
    const past = new Date(isoString)
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (seconds < 60) return `Updated ${seconds}s ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Updated ${minutes} min ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `Updated ${days} day${days > 1 ? 's' : ''} ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `Updated ${weeks} week${weeks > 1 ? 's' : ''} ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `Updated ${months} month${months > 1 ? 's' : ''} ago`

    const years = Math.floor(days / 365)
    return `Updated ${years} year${years > 1 ? 's' : ''} ago`
}

export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year}`
}


export const calculateDays = (dateStr: string): number => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
}



