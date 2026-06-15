
import apiClient from '@/lib/apiClient'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/authStore'
import { buildChartPeriodSlots, ChartPeriod, getChartPeriodBounds, getPeriodTrendLabel, getPreviousPeriodBounds, groupTimestampForChartPeriod } from '@/utils/helper/chart'

const extractApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
    const data = error?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error?.message === 'string' && error.message.trim()) return error.message
    return fallback
}

// Read the faculty id on every call so it reflects the current user.
// Reading once at module load captures a stale/undefined value that
// survives logout/login without a page reload.
const getCurrentFacultyId = () => useAuthStore.getState().user?.id;

const DEFAULT_COMMISSION_PERCENT = 20;

// Commission rate to apply when estimating an unpaid enrollment's faculty share.
// Historical rows store their own commission_percent, but unpaid enrollments
// have no transaction yet, so we use the current platform default.
const getCommissionPercent = async (db: typeof supabase): Promise<number> => {
    const { data, error } = await db
        .from("platform_settings")
        .select("value")
        .eq("key", "default_commission_percent")
        .maybeSingle();

    if (error) throw new Error(error.message);

    const percent = Number(data?.value);
    return Number.isFinite(percent) ? percent : DEFAULT_COMMISSION_PERCENT;
};

// Pending payout = faculty share (after GST + commission) of enrollments and
// bundle enrollments that have not been settled in a payout yet.
//   - single enrollment is settled once a COURSE_SALE row references it
//   - bundle enrollment is settled once a BUNDLE_SALE row references it
const getPendingPayout = async (
    db: typeof supabase,
    facultyId: string | undefined,
    courseIds: string[],
    enrollments: { id: string; amount_paid?: number; gst_amount?: number; is_bundle_enrollment?: boolean }[]
): Promise<number> => {
    if (!facultyId) return 0;

    const commissionPercent = await getCommissionPercent(db);
    const facultyShareRatio = 1 - commissionPercent / 100;

    // Already-settled enrollment / bundle ids, from existing sale rows.
    const { data: saleRows, error: saleError } = await db
        .from("faculty_transactions")
        .select("type, enrollment_id, bundle_enrollment_id")
        .eq("faculty_id", facultyId)
        .in("type", ["COURSE_SALE", "BUNDLE_SALE"]);

    if (saleError) throw new Error(saleError.message);

    const settledEnrollmentIds = new Set<string>();
    const settledBundleIds = new Set<string>();
    for (const row of saleRows ?? []) {
        if (row.type === "COURSE_SALE" && row.enrollment_id) settledEnrollmentIds.add(row.enrollment_id);
        if (row.type === "BUNDLE_SALE" && row.bundle_enrollment_id) settledBundleIds.add(row.bundle_enrollment_id);
    }

    // Single (non-bundle) enrollments awaiting payout.
    // base = amount_paid - gst_amount, then apply the faculty share ratio.
    const singlePending = enrollments.reduce((sum, e) => {
        if (e.is_bundle_enrollment) return sum;
        if (settledEnrollmentIds.has(e.id)) return sum;
        const base = Number(e.amount_paid ?? 0) - Number(e.gst_amount ?? 0);
        if (base <= 0) return sum;
        return sum + base * facultyShareRatio;
    }, 0);

    // Bundle enrollments awaiting payout — the price lives on bundle_enrollments,
    // the per-course enrollment rows carry amount_paid = 0.
    let bundlePending = 0;
    if (courseIds.length > 0) {
        const { data: bundleRows, error: bundleError } = await db
            .from("bundle_enrollments")
            .select("id, amount_paid")
            .eq("faculty_id", facultyId);

        if (bundleError) throw new Error(bundleError.message);

        bundlePending = (bundleRows ?? []).reduce((sum, b) => {
            if (settledBundleIds.has(b.id)) return sum;
            const base = Number(b.amount_paid ?? 0);
            if (base <= 0) return sum;
            return sum + base * facultyShareRatio;
        }, 0);
    }

    return Math.round(singlePending + bundlePending);
};


export const dashboardService = {

    getDashboardCounters: async () => {
        // try {
        //     const { data: response } = await apiClient.get('/dashboard/counters')
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {
            const db = supabase;

            const facultyId = getCurrentFacultyId();
            const now = new Date().toISOString().replace("T", " ").replace("Z", "+00");

            // 1. Get all faculty courses (not deleted)
            const { data: courses, error: coursesError } = await db
                .from("courses")
                .select("id")
                .eq("faculty_id", facultyId)
                .eq("is_deleted", false)
                .eq("is_draft", false);

            if (coursesError) throw new Error(coursesError.message);

            const courseIds = courses.map((c) => c.id);

            // 2. Active courses count
            const activeCourses = courses.length;

            // 3. Total students (unique students enrolled in faculty courses)
            //    Pull the columns needed for pending-payout calculation too.
            let enrollments: {
                id: string;
                student_id: string;
                amount_paid?: number;
                gst_amount?: number;
                is_bundle_enrollment?: boolean;
            }[] = [];
            if (courseIds.length > 0) {
                const { data, error: enrollmentsError } = await db
                    .from("enrollments")
                    .select("id, student_id, amount_paid, gst_amount, is_bundle_enrollment")
                    .in("course_id", courseIds);

                if (enrollmentsError) throw new Error(enrollmentsError.message);
                enrollments = data ?? [];
            }

            const totalStudents = new Set(enrollments.map((e) => e.student_id)).size;

            // 4. Total revenue — money actually paid out to the faculty.
            //    Every monthly payout writes one PAYOUT row in faculty_transactions
            //    whose `amount` is the total transferred (faculty share after
            //    commission). Summing all SUCCESS PAYOUT rows = realized earnings.
            const { data: payoutRows, error: payoutError } = await db
                .from("faculty_transactions")
                .select("amount")
                .eq("faculty_id", facultyId)
                .eq("status", "SUCCESS")
                .eq("type", "PAYOUT");

            if (payoutError) throw new Error(payoutError.message);

            const totalRevenue = (payoutRows ?? []).reduce(
                (sum, t) => sum + Number(t.amount ?? 0),
                0
            );

            // 4b. Pending payout — faculty share (after GST + commission) of
            //     enrollments/bundles not yet settled in a payout.
            //     "Not yet settled" = no COURSE_SALE row for the single enrollment
            //     and no BUNDLE_SALE row for the bundle enrollment.
            const pendingPayout = await getPendingPayout(db, facultyId, courseIds, enrollments);

            // 5. Active coupons count
            const { count: activeCoupons, error: couponsError } = await db
                .from("coupons")
                .select("*", { count: "exact", head: true })
                .eq("faculty_id", facultyId)
                .eq("is_deleted", false)
                .eq("is_active", true)
                .eq("is_draft", false)
                .gt("expire_date", now);

            if (couponsError) throw new Error(couponsError.message);

            return {
                total_students: totalStudents,
                active_courses: activeCourses,
                active_coupons: activeCoupons ?? 0,
                total_revenue: totalRevenue,
                pending_payout: pendingPayout,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }


    },

    getEnrollmentTrend: async (period: ChartPeriod) => {
        // try {
        //     const { data: response } = await apiClient.get(`/dashboard/enrollment-trends`, { params: { period } })
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {
            const db = supabase;

            const { data: courses, error: coursesError } = await db
                .from("courses")
                .select("id")
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_draft", false)
                .eq("is_deleted", false);

            if (coursesError) throw new Error(coursesError.message);
            const courseIds = courses.map((c) => c.id);

            const bounds = getChartPeriodBounds(period);
            const slots = buildChartPeriodSlots(period, bounds);
            const counts = new Map(slots.map((s) => [s.group, 0]));

            if (courseIds.length > 0) {
                const { data, error: enrollmentsError } = await db
                    .from("enrollments")
                    .select("enrolled_at")
                    .in("course_id", courseIds)
                    .gte("enrolled_at", bounds.fromDate.toISOString())
                    .lte("enrolled_at", bounds.rangeEnd.toISOString());

                if (enrollmentsError) throw new Error(enrollmentsError.message);

                for (const e of data ?? []) {
                    if (!e.enrolled_at) continue;
                    const grouped = groupTimestampForChartPeriod(e.enrolled_at, period, bounds);
                    if (!grouped) continue;
                    counts.set(grouped.group, (counts.get(grouped.group) ?? 0) + 1);
                }
            }

            // Rolling windows: slot labels already carry the correct text for
            // every period (day name + date / week-start date / month name).
            return slots.map((s) => ({
                primary: s.label,
                ...(s.dayOfMonth ? { secondary: s.dayOfMonth } : {}),
                value: counts.get(s.group) ?? 0,
            }));
        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getRevenueTrend: async (period: ChartPeriod) => {
        // try {
        //     const { data: response } = await apiClient.get(`/dashboard/revenue-trends`, { params: { period } })
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {
            const db = supabase

            const { data: courses, error: coursesError } = await db
                .from("courses")
                .select("id")
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_deleted", false);

            if (coursesError) throw new Error(coursesError.message);
            const courseIds = courses.map((c) => c.id);

            const bounds = getChartPeriodBounds(period);
            const slots = buildChartPeriodSlots(period, bounds);

            // Compare against the immediately preceding rolling window of equal length.
            const { previousStart, previousEnd } = getPreviousPeriodBounds(period, bounds);

            // Faculty net revenue = (amount_paid - GST) after the platform commission.
            // Mirrors the payout calc in enrollment-payout-workflow.md §3.
            const commissionPercent = await getCommissionPercent(db);
            const facultyShareRatio = 1 - commissionPercent / 100;
            const facultyNet = (e: { amount_paid?: number; gst_amount?: number }) => {
                const base = Number(e.amount_paid ?? 0) - Number(e.gst_amount ?? 0);
                if (base <= 0) return 0;
                return base * facultyShareRatio;
            };

            let currentEnrollments: { enrolled_at?: string; amount_paid?: number; gst_amount?: number }[] = [];
            let previousEnrollments: { amount_paid?: number; gst_amount?: number }[] = [];
            if (courseIds.length > 0) {
                const { data: current, error: currentError } = await db
                    .from("enrollments")
                    .select("enrolled_at, amount_paid, gst_amount")
                    .in("course_id", courseIds)
                    .gte("enrolled_at", bounds.fromDate.toISOString())
                    .lte("enrolled_at", bounds.rangeEnd.toISOString());

                if (currentError) throw new Error(currentError.message);
                currentEnrollments = current ?? [];

                const { data: previous, error: previousError } = await db
                    .from("enrollments")
                    .select("amount_paid, gst_amount")
                    .in("course_id", courseIds)
                    .gte("enrolled_at", previousStart.toISOString())
                    .lte("enrolled_at", previousEnd.toISOString());

                if (previousError) throw new Error(previousError.message);
                previousEnrollments = previous ?? [];
            }

            const currentTotal = currentEnrollments.reduce((sum, e) => sum + facultyNet(e), 0);
            const previousTotal = previousEnrollments.reduce((sum, e) => sum + facultyNet(e), 0);

            let trendText = "0% no change";
            if (previousTotal > 0) {
                const change = ((currentTotal - previousTotal) / previousTotal) * 100;
                const direction = change >= 0 ? "increase" : "decrease";
                const periodLabel = getPeriodTrendLabel(period);
                trendText = `${Math.abs(change).toFixed(1)}% ${direction} from ${periodLabel}`;
            }

            const revenueByGroup = new Map(slots.map((s) => [s.group, 0]));

            for (const e of currentEnrollments) {
                if (!e.enrolled_at) continue;
                const grouped = groupTimestampForChartPeriod(e.enrolled_at, period, bounds);
                if (!grouped) continue;
                revenueByGroup.set(
                    grouped.group,
                    (revenueByGroup.get(grouped.group) ?? 0) + facultyNet(e)
                );
            }

            const chartData = slots.map((s) => ({
                label: s.label,
                value: Math.round(revenueByGroup.get(s.group) ?? 0),
            }));

            return { data: chartData, trend: trendText };

        } catch (error: any) {
            throw new Error(error.message);
        }


    },

    getTopCoursesPerformance: async (limit = 3) => {
        // try {
        //     const { data: response } = await apiClient.get(`/dashboard/top-courses-performances`)
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {
            const db = supabase

            // 1. Get all faculty courses
            const { data: courses, error: coursesError } = await db
                .from("courses")
                .select("id, title")
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_deleted", false)
                .eq("is_draft", false);

            if (coursesError) throw new Error(coursesError.message);
            const courseIds = courses.map((c) => c.id);
            if (courseIds.length === 0) return { has_data: false, data: [] };

            // 2. Get enrollments for all faculty courses
            const { data: enrollments, error: enrollmentsError } = await db
                .from("enrollments")
                .select("course_id, student_id, amount_paid")
                .in("course_id", courseIds);

            if (enrollmentsError) throw new Error(enrollmentsError.message);

            // 3. Group by course_id
            const courseMap: Record<string, { total_students: number; total_revenue: number }> = {};

            enrollments.forEach((e) => {
                const entry = courseMap[e.course_id] ?? { total_students: 0, total_revenue: 0 };
                entry.total_students += 1;
                entry.total_revenue += Number(e.amount_paid);
                courseMap[e.course_id] = entry;
            });

            // 4. Merge with course title — skip courses with 0 students and 0 revenue
            const result = courses
                .map((course) => ({
                    course_id: course.id,
                    title: course.title,
                    total_students: courseMap[course.id]?.total_students ?? 0,
                    total_revenue: courseMap[course.id]?.total_revenue ?? 0,
                }))
                .filter((course) => course.total_students > 0 && course.total_revenue > 0)
                .sort((a, b) => b.total_revenue - a.total_revenue)
                .slice(0, limit);

            return {
                has_data: result.length > 0,
                data: result,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },


}

