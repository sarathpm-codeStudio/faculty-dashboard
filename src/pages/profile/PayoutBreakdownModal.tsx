import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Wallet } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { useGetPayoutBreakdown } from '@/hooks/bank'

type PayoutBreakdownModalProps = {
    open: boolean
    onClose: () => void
    payoutId: string | null
    facultyId: string | undefined
}

/**
 * Faculty view of one payout run — shows ONLY the faculty's own earning rows
 * (COURSE_SALE / BUNDLE_SALE). Platform fee / platform earning rows are never
 * fetched here (admin-only, see enrollment-payout-workflow.md §8).
 */
const PayoutBreakdownModal = ({ open, onClose, payoutId, facultyId }: PayoutBreakdownModalProps) => {
    const { data, isLoading, isError, error } = useGetPayoutBreakdown(
        facultyId,
        open ? payoutId : null,
    )

    useEffect(() => {
        if (!open) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open, onClose])

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Branded header */}
                <div className="flex items-center justify-between bg-[#2c1452] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                            <Wallet size={18} className="text-white" />
                        </div>
                        <h3 className="text-base font-bold text-white">Payout Details</h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Summary */}
                <div className="border-b border-gray-100 px-6 py-5">
                    {data ? (
                        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#F8FAFC] p-4 sm:grid-cols-3 lg:grid-cols-6">
                            <SummaryItem label="Payout ID" value={data.payoutId} mono />
                            <SummaryItem label="Payment Ref" value={data.paymentId} mono />
                            <SummaryItem label="Period" value={data.period} />
                            <SummaryItem label="Date" value={data.date} />
                            <SummaryItem label="Total GST" value={data.totalGstDisplay} />
                            <SummaryItem label="Total Received" value={data.totalDisplay} accent />
                        </div>
                    ) : (
                        <p className="text-sm text-[#767683]">
                            {isError
                                ? error instanceof Error ? error.message : 'Failed to load payout.'
                                : 'Loading payout…'}
                        </p>
                    )}
                </div>

                {/* Breakdown */}
                <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#767683]">
                        Earnings in this payout
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    ) : isError ? (
                        <p className="py-10 text-center text-sm text-red-500">
                            {error instanceof Error ? error.message : 'Failed to load payout.'}
                        </p>
                    ) : !data || data.rows.length === 0 ? (
                        <p className="py-10 text-center text-sm text-[#767683]">
                            No earnings found in this payout.
                        </p>
                    ) : (
                        <div className="scrollbar-thin overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full min-w-[640px] text-left">
                                <thead>
                                    <tr className="bg-[#F8FAFC]">
                                        <Th>Course / Bundle</Th>
                                        <Th>Type</Th>
                                        <Th className="text-right">Gross</Th>
                                        <Th className="text-right">GST</Th>
                                        <Th className="text-right">Comm. %</Th>
                                        <Th className="text-right">Your Earning</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map(row => (
                                        <tr
                                            key={row.id}
                                            className="border-t border-gray-100 transition-colors hover:bg-[#FAFAFB]"
                                        >
                                            <td className="px-4 py-3.5 align-top">
                                                <span className="text-sm font-medium leading-snug text-[#191c1e]">
                                                    {row.item}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <span className="inline-flex items-center rounded-md bg-[#EEF2FF] px-2 py-0.5 text-xs font-bold text-[#2c1452]">
                                                    {row.typeLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-top text-right">
                                                <span className="whitespace-nowrap text-sm text-[#767683]">
                                                    {row.grossDisplay}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-top text-right">
                                                <span className="whitespace-nowrap text-sm text-[#767683]">
                                                    {row.gstDisplay}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-top text-right">
                                                <span className="whitespace-nowrap text-sm text-[#767683]">
                                                    {row.commissionPercent != null ? `${row.commissionPercent}%` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-top text-right">
                                                <span className="whitespace-nowrap text-sm font-bold text-[#00875A]">
                                                    {row.amountDisplay}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-100 bg-[#F8FAFC]">
                                        <td className="px-4 py-3.5 text-sm font-bold text-[#2c1452]">
                                            Totals ({data.rows.length})
                                        </td>
                                        <td className="px-4 py-3.5" />
                                        <td className="px-4 py-3.5 text-right text-sm font-bold text-[#2c1452]">
                                            {data.totalGrossDisplay}
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-sm font-bold text-[#2c1452]">
                                            {data.totalGstDisplay}
                                        </td>
                                        <td className="px-4 py-3.5" />
                                        <td className="px-4 py-3.5 text-right text-base font-extrabold text-[#00875A]">
                                            {data.totalDisplay}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    <p className="mt-4 text-xs leading-relaxed text-[#94A3B8]">
                        Amounts are your share after the platform commission shown above.
                    </p>
                </div>
            </div>
        </div>,
        document.body,
    )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#767683] ${className}`}>
            {children}
        </th>
    )
}

function SummaryItem({
    label,
    value,
    mono,
    accent,
}: {
    label: string
    value: string
    mono?: boolean
    accent?: boolean
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#767683]">{label}</p>
            <p
                className={[
                    'mt-1 break-all',
                    accent ? 'text-base font-extrabold text-[#00875A]' : 'text-sm font-semibold text-[#191c1e]',
                    mono ? 'font-mono !text-xs !font-semibold' : '',
                ].join(' ')}
                title={value}
            >
                {value}
            </p>
        </div>
    )
}

export default PayoutBreakdownModal
