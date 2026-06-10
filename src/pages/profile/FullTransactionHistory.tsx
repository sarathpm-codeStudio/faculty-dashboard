import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Upload, TrendingUp, Calendar } from 'lucide-react'
import { Heading, Paragraph, DataTable, Input, Select, Skeleton, SkeletonStatCard } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import Button from '@/components/ui/Button'
import { useGetTransactionAnalyticsWithTransactions } from '@/hooks/bank'
import { useAuthStore } from '@/store/authStore'

type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'all'
type DateFilter = 'last7' | 'last30' | 'thisMonth' | 'thisYear' | 'all'

type Transaction = {
    id: string
    transactionId: string
    amount: number
    amountDisplay: string
    type: string
    time: string
    date: string
    status: 'SUCCESS' | 'PENDING' | 'FAILED'
}

const DATE_RANGE_OPTIONS: { value: DateFilter; label: string }[] = [
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'all', label: 'All Time' },
]

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
]


const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const FullTransactionHistory = () => {
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dateRange, setDateRange] = useState<DateFilter>('last30')
    const [status, setStatus] = useState<TransactionStatus>('all')
    const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rangeLabel, setRangeLabel] = useState('')

    // query
    const authUser = useAuthStore((s) => s.user)
    const { data: transactionAnalyticsWithTransactions, isLoading: isLoadingTransactionAnalyticsWithTransactions } = useGetTransactionAnalyticsWithTransactions(authUser?.id, {
        page: page,
        limit: pageSize,
        search: search,
        status: status,
        dateFilter: dateRange,
    })

    const COLUMNS: TableColumn<Transaction>[] = [
        {
            key: 'transactionId',
            header: 'TRANSACTION ID',
            render: row => <span className="text-sm font-bold text-[#2c1452]">{row.transactionId}</span>,
        },
        {
            key: 'time',
            header: 'TIME',
            render: row => <span className="text-sm text-[#191c1e]">{row.time}</span>,
        },
        {
            key: 'amount',
            header: 'AMOUNT',
            render: row => <span className="text-sm font-bold text-[#191c1e]">{row.amountDisplay}</span>,
        },
        {
            key: 'date',
            header: 'DATE',
            render: row => <span className="text-sm text-[#191c1e]">{row.date}</span>,
        },
        {
            key: 'status',
            header: 'STATUS',
            render: row => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                    row.status === 'SUCCESS'
                        ? 'bg-[#E6FBF7] text-[#00875A]'
                        : row.status === 'PENDING'
                            ? 'bg-orange-50 text-orange-500'
                            : 'bg-red-50 text-red-500'
                }`}>
                    {row.status}
                </span>
            ),
        },
    ]
    

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col h-full overflow-hidden gap-5">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SkeletonStatCard showIcon />
                    <SkeletonStatCard showIcon showFooter={false} />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-44" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <Skeleton className="flex-1 min-h-[400px] rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden gap-5">

            {/* Header */}
            <motion.div {...fadeUp(0.04)} className="flex items-start justify-between shrink-0">
                <div>
                    <Heading className="text-[#2c1452]">Full Transaction History</Heading>
                    <Paragraph className="text-[#767683] mt-1">
                        Review all institutional disbursements and academic grants.
                    </Paragraph>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="white" className="!h-10 !text-sm !px-4">
                        <Upload size={15} />
                        Export
                    </Button>
                    <Button variant="primary" className="!h-10 !text-sm !px-4">
                        <Download size={15} />
                        Download CSV
                    </Button>
                </div>
            </motion.div>

            {/* Stats — two StatCards side by side */}
            <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 gap-4 shrink-0">
                <StatCard
                    icon={<TrendingUp size={22} className="text-[#2c1452]" />}
                    label="Total Earnings (YTD)"
                    value={transactionAnalyticsWithTransactions?.totalEarningsYTD?.display ?? "0"}
                    // prefix="₹"
                    valueColor="#2c1452"
                >
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E6FBF7] text-[#00875A]">
                       {transactionAnalyticsWithTransactions?.totalEarningsYTD?.growth?.display ?? "0"}
                    </span>
                </StatCard>
                <StatCard
                    icon={<Calendar size={22} className="text-[#2c1452]" />}
                    label="Last Payout"
                    value={transactionAnalyticsWithTransactions?.lastPayout?.display?? "N/A"}
                    valueColor="#2c1452"
                />
            </motion.div>

            {/* Filters — all on one line, no labels */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 shrink-0">
                <div className="flex-1">
                    <Input
                        placeholder="Transaction ID (e.g. TX-80210)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        leftIcon={<Search size={15} />}
                    />
                </div>
                <div className="w-44">
                    <Select
                        options={DATE_RANGE_OPTIONS}
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value as DateFilter)}
                    />
                </div>
                <div className="w-36">
                    <Select
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={e => setStatus(e.target.value as TransactionStatus)}
                    />
                </div>
            </motion.div>

            {/* Table — scrolls internally */}
            <motion.div {...fadeUp(0.12)} className="flex-1 min-h-0">
                <DataTable
                    columns={COLUMNS}
                    total={transactionAnalyticsWithTransactions?.pagination?.total ?? 0}
                    data={transactionAnalyticsWithTransactions?.transactions ?? []}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPage(1)
                    }}
                    loading={isLoadingTransactionAnalyticsWithTransactions}
                />
            </motion.div>
        </div>
    )
}

export default FullTransactionHistory
