

export type ChartPeriod = 'week' | 'month' | 'year';

export const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export interface ChartPeriodSlot {
    label: string;
    group: string;
    /** Day of month (01–31) for week-period enrollment charts */
    dayOfMonth?: string;
}

export interface ChartPeriodBounds {
    today: Date;
    fromDate: Date;
    rangeEnd: Date;
}

export function startOfLocalDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfLocalDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function startOfLocalWeekMonday(d: Date): Date {
    const day = d.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysFromMonday);
}

export function toLocalDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function toLocalMonthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function weekdayLabel(d: Date): string {
    const index = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return WEEKDAY_LABELS[index]!;
}

export function isSameLocalMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function calendarMonthWeekNumber(dayOfMonth: number): number {
    if (dayOfMonth <= 7) return 1;
    if (dayOfMonth <= 14) return 2;
    if (dayOfMonth <= 21) return 3;
    return 4;
}

/** Whole days between two dates, counted at local-midnight granularity. */
export function diffInLocalDays(from: Date, to: Date): number {
    const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
    return Math.round(ms / 86_400_000);
}

/** Compact "5 Jun" style label used for rolling weekly buckets. */
export function weekStartLabel(d: Date): string {
    return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
}

function shortMonthUpper(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

// All periods are now ROLLING windows ending today (not calendar-aligned):
//   week  → Last 7 Days   (7 daily buckets)
//   month → Last 4 Weeks  (4 weekly buckets, 28 days)
//   year  → Last 12 Months (12 monthly buckets)
export function getChartPeriodBounds(period: ChartPeriod, ref = new Date()): ChartPeriodBounds {
    const today = startOfLocalDay(ref);
    let fromDate: Date;

    if (period === 'week') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    } else if (period === 'month') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 27);
    } else {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    }

    return { today, fromDate, rangeEnd: endOfLocalDay(today) };
}

/** Start/end of the window immediately preceding the current one (same length). */
export function getPreviousPeriodBounds(
    period: ChartPeriod,
    bounds: ChartPeriodBounds
): { previousStart: Date; previousEnd: Date } {
    const { fromDate } = bounds;
    const dayBeforeFrom = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() - 1);
    const previousEnd = endOfLocalDay(dayBeforeFrom);

    let previousStart: Date;
    if (period === 'week') {
        previousStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() - 7);
    } else if (period === 'month') {
        previousStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() - 28);
    } else {
        previousStart = new Date(fromDate.getFullYear() - 1, fromDate.getMonth(), 1);
    }

    return { previousStart, previousEnd };
}

/** Human label for the comparison window, e.g. "last 7 days". */
export function getPeriodTrendLabel(period: ChartPeriod): string {
    if (period === 'week') return 'last 7 days';
    if (period === 'month') return 'last 4 weeks';
    return 'last 12 months';
}

export function buildChartPeriodSlots(period: ChartPeriod, bounds: ChartPeriodBounds): ChartPeriodSlot[] {
    const { fromDate } = bounds;

    if (period === 'week') {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + i);
            return {
                label: weekdayLabel(d),
                group: toLocalDateKey(d),
                dayOfMonth: String(d.getDate()).padStart(2, '0'),
            };
        });
    }

    if (period === 'month') {
        return Array.from({ length: 4 }, (_, i) => {
            const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + i * 7);
            return {
                label: weekStartLabel(start),
                group: `week_${i + 1}`,
            };
        });
    }

    return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(fromDate.getFullYear(), fromDate.getMonth() + i, 1);
        return {
            label: shortMonthUpper(d),
            group: toLocalMonthKey(d),
        };
    });
}

export function groupTimestampForChartPeriod(
    dateStr: string,
    period: ChartPeriod,
    bounds: ChartPeriodBounds
): { label: string; group: string } | null {
    const { today, fromDate } = bounds;
    const local = startOfLocalDay(new Date(dateStr));

    if (local < fromDate || local > today) return null;

    if (period === 'week') {
        return { label: weekdayLabel(local), group: toLocalDateKey(local) };
    }

    if (period === 'month') {
        const idx = Math.min(3, Math.floor(diffInLocalDays(fromDate, local) / 7));
        const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + idx * 7);
        return { label: weekStartLabel(start), group: `week_${idx + 1}` };
    }

    return {
        label: shortMonthUpper(local),
        group: toLocalMonthKey(local),
    };
}
