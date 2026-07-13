

import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'

const extractApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
    const data = error?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error?.message === 'string' && error.message.trim()) return error.message
    return fallback
}


export const bankServices = {
    createBankDetails: async (payload: any) => {
        try {
            const { data: response } = await apiClient.post('/bank/details', payload)
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    getBankDetails: async () => {
        try {
            const { data: response } = await apiClient.get('/bank/details')
            return response
        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error))
        }
    },

    // getTransactionHistory: async (facultyId: string, limit: number | null) => {
    //     try {
    //         // 1. Base query
    //         let query = supabase
    //             .from('faculty_transactions')
    //             .select('*')
    //             .eq('faculty_id', facultyId)
    //             .eq('status', 'SUCCESS')
    //             .order('transacted_at', { ascending: false });

    //         // 2. Apply limit only if provided
    //         if (limit !== null) {
    //             query = query.limit(limit);
    //         }

    //         const { data: transactions, error } = await query;
    //         if (error) throw new Error(error.message);

    //         // 3. Annual revenue — current year total
    //         const currentYear      = new Date().getFullYear();
    //         const yearStart        = new Date(currentYear, 0, 1).toISOString();  // Jan 1
    //         const yearEnd          = new Date(currentYear, 11, 31, 23, 59, 59).toISOString(); // Dec 31

    //         const { data: annualData, error: annualError } = await supabase
    //             .from('faculty_transactions')
    //             .select('amount')
    //             .eq('faculty_id', facultyId)
    //             .eq('status', 'SUCCESS')
    //             .neq('type', 'PAYOUT')          // exclude payouts from revenue
    //             .neq('type', 'PLATFORM_FEE')    // exclude platform fees
    //             .gte('transacted_at', yearStart)
    //             .lte('transacted_at', yearEnd);

    //         if (annualError) throw new Error(annualError.message);

    //         const annualRevenue = annualData?.reduce(
    //             (sum, t) => sum + (t.amount ?? 0), 0
    //         ) ?? 0;

    //         // 4. Format transactions for UI
    //         const formatted = transactions?.map(t => ({
    //             id:             t.id,
    //             transactionId:  t.transaction_id,               // "#TRX-01112023-ST"
    //             amount:         t.amount,                        // 845000 (paise)
    //             amountDisplay:  `₹${(t.amount / 100).toFixed(2)}`, // "₹8,450.00"
    //             type:           t.type,
    //             status:         t.status,
    //             time:           new Date(t.transacted_at).toLocaleTimeString('en-US', {
    //                 hour:   '2-digit',
    //                 minute: '2-digit',
    //                 hour12: true,
    //             }),                                              // "09:45 AM"
    //             date:           new Date(t.transacted_at).toLocaleDateString('en-US', {
    //                 month: 'short',
    //                 day:   '2-digit',
    //                 year:  'numeric',
    //             }),                                              // "Nov 01, 2023"
    //         })) ?? [];

    //         return {
    //             transactions: formatted,
    //             annualRevenue: {
    //                 amount:  annualRevenue,
    //                 display: `₹${(annualRevenue / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    //                 year:    currentYear,
    //             },
    //         };

    //     } catch (error: any) {
    //         throw new Error(extractApiErrorMessage(error));
    //     }
    // },

    getTransactionHistory: async (facultyId: string, limit: number | null) => {
        try {
            // Faculty "Last Transactions" = their PAYOUT runs only.
            // PLATFORM_FEE / PLATFORM_EARNING are admin-side rows the faculty
            // must never see (see enrollment-payout-workflow.md §8). Individual
            // COURSE_SALE / BUNDLE_SALE rows are shown inside the payout's modal.
            let query = supabase
                .from('faculty_transactions')
                .select('id, transaction_id, payment_id, amount, type, status, payout_time_period, transacted_at')
                .eq('faculty_id', facultyId)
                .eq('status', 'SUCCESS')
                .eq('type', 'PAYOUT')
                .order('transacted_at', { ascending: false });

            // 2. Apply limit only if provided
            if (limit !== null) {
                query = query.limit(limit);
            }

            const { data: transactions, error } = await query;
            if (error) throw new Error(error.message);

            // 3. Total transferred amount — every PAYOUT (not just the page)
            const { data: payoutData, error: payoutError } = await supabase
                .from('faculty_transactions')
                .select('amount')
                .eq('faculty_id', facultyId)
                .eq('status', 'SUCCESS')
                .eq('type', 'PAYOUT');  // only actual transfers

            if (payoutError) throw new Error(payoutError.message);

            const totalTransferred = payoutData?.reduce(
                (sum, t) => sum + (t.amount ?? 0), 0
            ) ?? 0;

            // 4. Format transactions for UI (amounts are stored in rupees)
            const formatted = transactions?.map(t => ({
                id: t.id,
                transactionId: t.transaction_id,
                // PAYOUT row's transaction_id is the run id used to open its breakdown
                payoutId: t.transaction_id,
                paymentId: t.payment_id ?? '—',
                period: t.payout_time_period ?? '—',
                amount: t.amount,
                amountDisplay: `₹${(t.amount ?? 0).toLocaleString('en-IN')}`,
                type: t.type,
                status: t.status,
                time: new Date(t.transacted_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                date: new Date(t.transacted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                }),
            })) ?? [];

            return {
                transactions: formatted,
                totalTransferred: {
                    amount: totalTransferred,
                    display: `₹${totalTransferred.toLocaleString('en-IN')}`,
                },
            };

        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error));
        }
    },

    /**
     * Breakdown of one PAYOUT run for the faculty modal — only the faculty's own
     * COURSE_SALE / BUNDLE_SALE earning rows. PLATFORM_FEE and PLATFORM_EARNING
     * are deliberately excluded (admin-only rows, workflow §8).
     */
    getPayoutBreakdown: async (facultyId: string, payoutId: string) => {
        try {
            const [anchorRes, rowsRes] = await Promise.all([
                supabase
                    .from('faculty_transactions')
                    .select('transaction_id, payment_id, amount, payout_time_period, transacted_at')
                    .eq('faculty_id', facultyId)
                    .eq('transaction_id', payoutId)
                    .eq('type', 'PAYOUT')
                    .maybeSingle(),
                supabase
                    .from('faculty_transactions')
                    .select('id, transaction_id, type, amount, gross_amount, gst_amount, commission_percent, enrollment_id, bundle_enrollment_id')
                    .eq('faculty_id', facultyId)
                    .eq('payout_id', payoutId)
                    .in('type', ['COURSE_SALE', 'BUNDLE_SALE'])
                    .order('type', { ascending: true }),
            ]);

            if (anchorRes.error) throw new Error(anchorRes.error.message);
            if (rowsRes.error) throw new Error(rowsRes.error.message);

            const anchor = anchorRes.data;
            const saleRows = rowsRes.data ?? [];

            // Resolve course / bundle titles
            const enrollmentIds = [...new Set(saleRows.map(r => r.enrollment_id).filter(Boolean))];
            const bundleEnrollmentIds = [...new Set(saleRows.map(r => r.bundle_enrollment_id).filter(Boolean))];

            const [enrRes, bundleEnrRes] = await Promise.all([
                enrollmentIds.length > 0
                    ? supabase.from('enrollments').select('id, course_id').in('id', enrollmentIds)
                    : Promise.resolve({ data: [], error: null }),
                bundleEnrollmentIds.length > 0
                    ? supabase.from('bundle_enrollments').select('id, bundle_id').in('id', bundleEnrollmentIds)
                    : Promise.resolve({ data: [], error: null }),
            ]);

            const courseIdByEnrollment = new Map((enrRes.data ?? []).map(e => [e.id, e.course_id]));
            const bundleIdByEnrollment = new Map((bundleEnrRes.data ?? []).map(b => [b.id, b.bundle_id]));
            const courseIds = [...new Set([...courseIdByEnrollment.values()].filter(Boolean))];
            const bundleIds = [...new Set([...bundleIdByEnrollment.values()].filter(Boolean))];

            const [coursesRes, bundlesRes] = await Promise.all([
                courseIds.length > 0
                    ? supabase.from('courses').select('id, title').in('id', courseIds)
                    : Promise.resolve({ data: [], error: null }),
                bundleIds.length > 0
                    ? supabase.from('course_bundle').select('id, title').in('id', bundleIds)
                    : Promise.resolve({ data: [], error: null }),
            ]);

            const courseTitleById = new Map((coursesRes.data ?? []).map(c => [c.id, c.title ?? 'Course']));
            const bundleTitleById = new Map((bundlesRes.data ?? []).map(b => [b.id, b.title ?? 'Bundle']));

            const itemFor = (row: any): string => {
                if (row.enrollment_id) {
                    const cId = courseIdByEnrollment.get(row.enrollment_id);
                    return cId ? courseTitleById.get(cId) ?? 'Course' : 'Course';
                }
                if (row.bundle_enrollment_id) {
                    const bId = bundleIdByEnrollment.get(row.bundle_enrollment_id);
                    return bId ? bundleTitleById.get(bId) ?? 'Bundle' : 'Bundle';
                }
                return '—';
            };

            const rows = saleRows.map(r => ({
                id: r.id,
                transactionId: r.transaction_id ?? '—',
                type: r.type as 'COURSE_SALE' | 'BUNDLE_SALE',
                typeLabel: r.type === 'BUNDLE_SALE' ? 'Bundle Sale' : 'Course Sale',
                item: itemFor(r),
                grossAmount: r.gross_amount ?? 0,
                grossDisplay: `₹${(r.gross_amount ?? 0).toLocaleString('en-IN')}`,
                gstAmount: r.gst_amount ?? 0,
                gstDisplay: `₹${(r.gst_amount ?? 0).toLocaleString('en-IN')}`,
                commissionPercent: r.commission_percent,
                amount: r.amount ?? 0,
                amountDisplay: `₹${(r.amount ?? 0).toLocaleString('en-IN')}`,
            }));

            const totalGst = rows.reduce((sum, r) => sum + r.gstAmount, 0);
            const totalGross = rows.reduce((sum, r) => sum + r.grossAmount, 0);

            return {
                payoutId,
                paymentId: anchor?.payment_id ?? '—',
                period: anchor?.payout_time_period ?? '—',
                total: anchor?.amount ?? 0,
                totalDisplay: `₹${(anchor?.amount ?? 0).toLocaleString('en-IN')}`,
                totalGst,
                totalGstDisplay: `₹${totalGst.toLocaleString('en-IN')}`,
                totalGross,
                totalGrossDisplay: `₹${totalGross.toLocaleString('en-IN')}`,
                date: anchor?.transacted_at
                    ? new Date(anchor.transacted_at).toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit', year: 'numeric',
                    })
                    : '—',
                rows,
            };

        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error));
        }
    },

    getTransactionAnalyticsWithTransactions: async (
        facultyId: string,
        {
            page = 1,
            limit = 5,
            search = '',
            status,
            dateFilter = 'all',
        }: {
            page?: number;
            limit?: number;
            search?: string;
            status?: 'SUCCESS' | 'PENDING' | 'FAILED' | 'all';
            dateFilter?: 'last7' | 'last30' | 'thisMonth' | 'thisYear' | 'all';
        } = {}
    ) => {
        try {
            const now = new Date();
            const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // 1. Total Earnings YTD
            const { data: ytdData, error: ytdError } = await supabase
                .from('faculty_transactions')
                .select('amount')
                .eq('faculty_id', facultyId)
                .eq('status', 'SUCCESS')
                .not('type', 'in', '("PAYOUT","PLATFORM_FEE")')
                .gte('transacted_at', yearStart);

            if (ytdError) throw new Error(ytdError.message);

            const totalEarningsYTD = ytdData?.reduce(
                (sum, t) => sum + (t.amount ?? 0), 0
            ) ?? 0;

            // 2. Growth rate — this month vs last month
            const { data: thisMonthData } = await supabase
                .from('faculty_transactions')
                .select('amount')
                .eq('faculty_id', facultyId)
                .eq('status', 'SUCCESS')
                .not('type', 'in', '("PAYOUT","PLATFORM_FEE")')
                .gte('transacted_at', thisMonthStart);

            const { data: lastMonthData } = await supabase
                .from('faculty_transactions')
                .select('amount')
                .eq('faculty_id', facultyId)
                .eq('status', 'SUCCESS')
                .not('type', 'in', '("PAYOUT","PLATFORM_FEE")')
                .gte('transacted_at', lastMonthStart)
                .lt('transacted_at', lastMonthEnd);

            const thisMonthTotal = thisMonthData?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;
            const lastMonthTotal = lastMonthData?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;

            let growthRate = 0;
            let growthDisplay = 'No change';

            if (lastMonthTotal === 0 && thisMonthTotal > 0) {
                growthRate = 100;
                growthDisplay = '+100%';
            } else if (lastMonthTotal === 0 && thisMonthTotal === 0) {
                growthRate = 0;
                growthDisplay = 'No earnings yet';
            } else {
                const rate = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
                growthRate = parseFloat(rate.toFixed(1));
                growthDisplay = growthRate >= 0
                    ? `+${growthRate}%`
                    : `${growthRate}%`;
            }

            // 3. Last payout date
            const { data: lastPayout, error: payoutError } = await supabase
                .from('faculty_transactions')
                .select('transacted_at')
                .eq('faculty_id', facultyId)
                .eq('type', 'PAYOUT')
                .eq('status', 'SUCCESS')
                .order('transacted_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (payoutError) throw new Error(payoutError.message);

            const lastPayoutDisplay = lastPayout
                ? new Date(lastPayout.transacted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : 'No payout yet';

            // 4. Date filter range for transactions
            let dateFrom: string | null = null;

            if (dateFilter === 'last7') {
                const d = new Date(now);
                d.setDate(now.getDate() - 7);
                dateFrom = d.toISOString();
            } else if (dateFilter === 'last30') {
                const d = new Date(now);
                d.setDate(now.getDate() - 30);
                dateFrom = d.toISOString();
            } else if (dateFilter === 'thisMonth') {
                dateFrom = thisMonthStart;
            } else if (dateFilter === 'thisYear') {
                dateFrom = yearStart;
            }

            // 5. Paginated transactions
            let query = supabase
                .from('faculty_transactions')
                .select('*', { count: 'exact' })
                .eq('faculty_id', facultyId)
                .order('transacted_at', { ascending: false })
                .range(from, to);

            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            if (dateFrom) {
                query = query.gte('transacted_at', dateFrom);
            }

            if (search.trim()) {
                query = query.ilike('transaction_id', `%${search}%`);
            }

            const { data: transactions, error: txError, count } = await query;
            if (txError) throw new Error(txError.message);

            // 6. Format transactions
            const formatted = transactions?.map(t => ({
                id: t.id,
                transactionId: t.transaction_id,
                amount: t.amount,
                amountDisplay: `₹${(t.amount / 100).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                })}`,
                type: t.type,
                status: t.status,
                time: new Date(t.transacted_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                date: new Date(t.transacted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                }),
            })) ?? [];

            const totalPages = Math.ceil((count ?? 0) / limit);

            return {
                // Total Earnings card
                totalEarningsYTD: {
                    amount: totalEarningsYTD,
                    display: `₹${(totalEarningsYTD / 100).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                    })}`,
                    growth: {
                        rate: growthRate,
                        display: growthDisplay,
                    },
                },

                // Last Payout card
                lastPayout: {
                    date: lastPayout?.transacted_at ?? null,
                    display: lastPayoutDisplay,
                },

                // Transactions table
                transactions: formatted,

                // Pagination
                pagination: {
                    total: count ?? 0,
                    total_pages: totalPages,
                    current_page: page,
                    limit,
                    has_next: page < totalPages,
                    has_prev: page > 1,
                },
            };

        } catch (error: any) {
            throw new Error(extractApiErrorMessage(error));
        }
    },


}