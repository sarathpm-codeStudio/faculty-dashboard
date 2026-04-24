import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Upload, TrendingUp, Calendar } from 'lucide-react'
import { Heading, Paragraph, Spinner, DataTable, Input, Select } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import Button from '@/components/ui/Button'

type Transaction = {
    id: string
    txnId: string
    time: string
    amount: string
    date: string
    status: 'SUCCESS' | 'PENDING' | 'FAILED'
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
    txnId: '#TRX-99210-FB',
    time: '09:45 AM',
    amount: '₹8,450.00',
    date: 'Nov 01, 2023',
    status: 'SUCCESS',
}))

const DATE_RANGE_OPTIONS = [
    { value: '30', label: 'Last 30 Days' },
    { value: '60', label: 'Last 60 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'year', label: 'This Year' },
]

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
]

const COLUMNS: TableColumn<Transaction>[] = [
    {
        key: 'txnId',
        header: 'TRANSACTION ID',
        render: row => <span className="text-sm font-bold text-[#000B60]">{row.txnId}</span>,
    },
    {
        key: 'time',
        header: 'TIME',
        render: row => <span className="text-sm text-[#191c1e]">{row.time}</span>,
    },
    {
        key: 'amount',
        header: 'AMOUNT',
        render: row => <span className="text-sm font-bold text-[#191c1e]">{row.amount}</span>,
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

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const FullTransactionHistory = () => {
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dateRange, setDateRange] = useState('30')
    const [status, setStatus] = useState('')

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Spinner label="Loading transactions..." />
            </div>
        )
    }

    const filtered = MOCK_TRANSACTIONS.filter(t => {
        const matchSearch = t.txnId.toLowerCase().includes(search.toLowerCase())
        const matchStatus = !status || t.status.toLowerCase() === status
        return matchSearch && matchStatus
    })

    return (
        <div className="flex flex-col h-full overflow-hidden gap-5">

            {/* Header */}
            <motion.div {...fadeUp(0.04)} className="flex items-start justify-between shrink-0">
                <div>
                    <Heading className="text-[#000B60]">Full Transaction History</Heading>
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
                    icon={<TrendingUp size={22} className="text-[#000B60]" />}
                    label="Total Earnings (YTD)"
                    value="1,42,500.00"
                    prefix="₹"
                    valueColor="#000B60"
                >
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E6FBF7] text-[#00875A]">
                        +12.4%
                    </span>
                </StatCard>
                <StatCard
                    icon={<Calendar size={22} className="text-[#000B60]" />}
                    label="Last Payout"
                    value="Oct 14, 2023"
                    valueColor="#000B60"
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
                        onChange={e => setDateRange(e.target.value)}
                    />
                </div>
                <div className="w-36">
                    <Select
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    />
                </div>
            </motion.div>

            {/* Table — scrolls internally */}
            <motion.div {...fadeUp(0.12)} className="flex-1 min-h-0">
                <DataTable
                    columns={COLUMNS}
                    data={filtered}
                    defaultPageSize={8}
                />
            </motion.div>
        </div>
    )
}

export default FullTransactionHistory
