import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Landmark, Pencil, Mail, Phone, ChevronRight } from 'lucide-react'
import { Heading, Paragraph, DataTable, Subheading, Skeleton, SkeletonStatCard } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import Button from '@/components/ui/Button'
import { useGetBankDetails } from '@/hooks/bank'
import { useGetTransactionHistory } from '@/hooks/bank'
import { useAuthStore } from '@/store/authStore'
import PayoutBreakdownModal from './PayoutBreakdownModal'

type Transaction = {
    id: string
    transactionId: string
    payoutId: string
    paymentId: string
    period: string
    amount: number
    amountDisplay: string
    type: string
    status: 'SUCCESS' | 'PENDING' | 'FAILED'
    time: string
    date: string
}

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const BankDetailsAndTransaction = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)
    const [openPayoutId, setOpenPayoutId] = useState<string | null>(null)

    const authUser = useAuthStore((s) => s.user)


    // query
    const { data: bankDetails } = useGetBankDetails()
    const { data: transactionHistory, isLoading: isLoadingTransactionHistory } = useGetTransactionHistory(authUser?.id, 6)

    const COLUMNS: TableColumn<Transaction>[] = [
        {
            key: 'transactionId',
            header: 'TRANSACTION ID',
            render: row => <span className="text-sm font-bold text-[#2c1452]">{row.transactionId}</span>,
        },
        {
            key: 'period',
            header: 'PERIOD',
            render: row => <span className="text-sm text-[#191c1e]">{row.period}</span>,
        },
        {
            key: 'time',
            header: 'TIME',
            render: row => <span className="text-sm text-[#191c1e]">{row.time}</span>,
        },
        {
            key: 'amount',
            header: 'AMOUNT',
            render: row => <span className="text-sm font-bold text-[#191c1e]">{row.amountDisplay ?? "₹0"}</span>,
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
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${row.status === 'SUCCESS'
                    ? 'bg-[#E6FBF7] text-[#00875A]'
                    : row.status === 'PENDING'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-red-50 text-red-500'
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: row => (
                <button
                    onClick={() => setOpenPayoutId(row.payoutId)}
                    className="text-sm font-bold text-[#2c1452] hover:opacity-70 transition-opacity"
                >
                    View
                </button>
            ),
        },
    ]



    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col h-full overflow-y-auto scrollbar-hide gap-5 pb-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-8 space-y-5">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-80 w-full rounded-2xl" />
                    </div>
                    <div className="lg:col-span-4 space-y-4">
                        <Skeleton className="h-56 w-full rounded-2xl" />
                        <SkeletonStatCard showFooter={false} />
                    </div>
                </div>
            </div>
        )
    }

    const transactions = transactionHistory?.transactions ?? []
    const visibleTransactions = showAll ? transactions : transactions.slice(0, 6)

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide gap-5 pb-6">

            {/* Header */}
            <motion.div {...fadeUp(0.04)}>
                <Heading className="text-[#2c1452]">Bank &amp; Payment Details</Heading>
                <Paragraph className="text-[#767683] mt-1">
                    Manage your disbursement methods and view recent transaction history.
                </Paragraph>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* ── Left ── */}
                <div className="lg:col-span-8 flex flex-col gap-5">

                    {/* Active Disbursement Method */}
                    <motion.div
                        {...fadeUp(0.08)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#F2F4F6] flex items-center justify-center shrink-0">
                                    <Landmark size={26} className="text-[#2c1452]" />
                                </div>
                                <div>
                                    <Subheading className="font-bold" > Active Disbursement Method </Subheading>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                                        <Paragraph className=" text-gray-500">
                                            Personal Checking Account 

                                            {
                                                bankDetails?.data?.is_verified ? <span className="px-1.5 py-0.5 rounded ml-2 text-[10px] font-bold bg-[#E6FBF7] text-[#00875A]">
                                                VERIFIED
                                            </span> : <span className="px-1.5 py-0.5 rounded text-[10px] ml-2 font-bold bg-[#E6FBF7] text-[#00875A]">
                                                UNVERIFIED
                                            </span>
                                            }

                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                            {
                                bankDetails?.data === null && <Button variant="primary" className='!h-10 !text-sm !px-4' onClick={() => navigate('/account/bank/add-bank-details')}>
                                <Pencil size={20} />
                                Add Bank Details
                            </Button>
                            }
                        </div>

                        {/* Bank info row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
                            <div>
                                <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-1">
                                    Bank Name
                                </Paragraph>
                                <Paragraph className="!text-sm font-bold text-[#191c1e]">
                                    {bankDetails?.data?.bank_name }
                                </Paragraph>
                            </div>
                            <div>
                                <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-1">
                                    Account Holder Name
                                </Paragraph>
                                <Paragraph className="!text-sm font-bold text-[#191c1e]">
                                    {bankDetails?.data?.account_holder_name }
                                </Paragraph>
                            </div>
                            <div>
                                <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-1">
                                    Account Number
                                </Paragraph>
                                <Paragraph className="!text-sm font-bold text-[#191c1e]">
                                    {bankDetails?.data?.account_number}
                                </Paragraph>
                            </div>
                            <div>
                                <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-1">
                                    IFSC Code
                                </Paragraph>
                                <Paragraph className="!text-sm font-bold text-[#191c1e]">
                                {bankDetails?.data?.ifsc_code}
                                </Paragraph>
                            </div>
                            <div>
                                <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-1">
                                    PAN Number
                                </Paragraph>
                                <div className="flex items-center gap-2">
                                    <Paragraph className="!text-sm font-bold text-[#191c1e]"> 
                                        {bankDetails?.data?.pan_number}

                                    </Paragraph>
                                    {/* <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6FBF7] text-[#00875A]">
                                        VERIFIED
                                    </span> */}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Total Transferred — shown above the table on tablet */}
                    <motion.div {...fadeUp(0.1)} className="lg:hidden">
                        <StatCard
                            icon={null}
                            label="TOTAL TRANSFERRED AMOUNT"
                            value={transactionHistory?.totalTransferred?.display ?? "0"}
                            valueColor="#2c1452"
                        />
                    </motion.div>

                    {/* Last Transactions */}
                    <motion.div {...fadeUp(0.12)} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Subheading className="text-[#2c1452] font-bold">Last Transactions</Subheading>
                            {transactions.length > 6 && (
                                <button onClick={() => navigate('/account/bank/history')} className="flex items-center gap-1 text-sm font-bold text-[#2c1452] hover:opacity-75 transition-opacity">
                                    View Full History
                                    <ChevronRight size={15} />
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <DataTable
                                columns={COLUMNS}
                                data={visibleTransactions}
                                total={transactions.length}
                                page={1}
                                pageSize={6}
                                onPageChange={() => {}}
                                onPageSizeChange={() => {}}
                                hidePagination
                                loading={isLoadingTransactionHistory}
                            />
                            <div className="flex justify-center py-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowAll(prev => !prev)}
                                    className="text-xs font-bold text-[#767683] uppercase tracking-widest hover:text-[#2c1452] transition-colors"
                                >
                                    {showAll ? 'Show Less' : 'Show More Transactions'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Right sidebar ── */}
                <div className="lg:col-span-4 flex flex-col gap-4">

                    {/* Need Assistance card */}
                    <motion.div
                        {...fadeUp(0.1)}
                        className="bg-[#2c1452] rounded-2xl p-6 flex flex-col gap-4"
                    >
                        <div>
                            <Subheading className="text-white font-bold">Need Assistance?</Subheading>
                            <Paragraph className="!text-sm text-blue-200 mt-1 leading-relaxed">
                                Our dedicated Finance team is available to assist with any payment or banking inquiries.
                            </Paragraph>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button variant="secondary" fullWidth className="!bg-[#2c1452] !text-white ">
                                <Mail size={15} className="text-blue-300 shrink-0" />
                                finance-help@university.edu
                            </Button>
                            <Button variant="secondary" fullWidth className="!bg-[#2c1452] !text-white ">
                                <Phone size={15} className="text-blue-300 shrink-0" />
                                +1 (555) 092-4411
                            </Button>
                        </div>
                    </motion.div>

                    {/* Annual Income — sidebar position on laptop only */}
                    <motion.div {...fadeUp(0.14)} className="hidden lg:block">
                        <StatCard
                            icon={null}
                            label="TOTAL TRANSFERRED AMOUNT"
                            value={transactionHistory?.totalTransferred?.display ?? "0"}
                            // prefix="₹"
                            valueColor="#2c1452"
                        />
                    </motion.div>
                </div>
            </div>

            <PayoutBreakdownModal
                open={openPayoutId !== null}
                payoutId={openPayoutId}
                facultyId={authUser?.id}
                onClose={() => setOpenPayoutId(null)}
            />
        </div>
    )
}

export default BankDetailsAndTransaction
