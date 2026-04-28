

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