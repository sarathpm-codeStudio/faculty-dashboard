import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Landmark, Zap } from 'lucide-react'
import { Heading, Paragraph, Input, Subheading } from '@/components/ui'
import Button from '@/components/ui/Button'
import img from "@/assets/images/sc.png"

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const UpdateBankDetails = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        panNumber: '',
    })

    const update = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }))

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide gap-5 pb-6">

            {/* Header */}
            <motion.div {...fadeUp(0.04)}>
                <Heading className="text-[#000B60]">Update Bank Details</Heading>
                <Paragraph className="text-[#767683] mt-1">
                    Manage your disbursement methods and secure financial information.
                </Paragraph>
            </motion.div>

            <div className="grid grid-cols-12 gap-5">

                {/* ── Left form ── */}
                <motion.div {...fadeUp(0.08)} className="col-span-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Bank Name"
                                placeholder="e.g. International Federal Bank"
                                value={form.bankName}
                                onChange={e => update({ bankName: e.target.value })}
                            />
                            <Input
                                label="Account Holder Name"
                                placeholder="Dr. Elena Vance"
                                value={form.accountHolderName}
                                onChange={e => update({ accountHolderName: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Account Number"
                                placeholder="•••• •••• •••• 4590"
                                value={form.accountNumber}
                                onChange={e => update({ accountNumber: e.target.value })}
                            />
                            <Input
                                label="Confirm Account Number"
                                placeholder="•••• •••• •••• 4590"
                                value={form.confirmAccountNumber}
                                onChange={e => update({ confirmAccountNumber: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="IFSC Code"
                                placeholder="IFSC0001234"
                                value={form.ifscCode}
                                onChange={e => update({ ifscCode: e.target.value })}
                            />
                            <Input
                                label="PAN Number"
                                placeholder="ABCDE1234F"
                                value={form.panNumber}
                                onChange={e => update({ panNumber: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button variant="primary" className="!h-11 !text-sm !px-6">
                                Save Changes
                            </Button>
                            <Button variant="white" className="!h-11 !text-sm !px-6" onClick={() => navigate('/account/bank')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Right sidebar ── */}
                <div className="col-span-4 flex flex-col gap-4">

                    {/* Active Method */}
                    <motion.div
                        {...fadeUp(0.1)}
                        className="bg-[#000B60] rounded-2xl p-5 flex flex-col gap-3"
                    >
                        <Paragraph className="!text-gray-400 font-bold">Active Method</Paragraph>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#142283] flex items-center justify-center shrink-0">
                                <Landmark size={20} className="text-blue-300" />
                            </div>
                            <div>
                                <Paragraph className="font-bold text-white !text-sm">International Federal</Paragraph>
                                <Paragraph className="!text-xs text-blue-300">•••• 4590</Paragraph>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Tips */}
                    <motion.div
                        {...fadeUp(0.12)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
                    >
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-[#000B60]" />
                            <Paragraph className="font-bold text-[#000B60] !text-sm">Quick Tips</Paragraph>
                        </div>
                        <ul className="flex flex-col gap-2">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#000B60] mt-1.5 shrink-0" />
                                <Paragraph className="!text-xs text-black leading-relaxed">
                                    Ensure the IFSC code matches your local branch precisely.
                                </Paragraph>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#000B60] mt-1.5 shrink-0" />
                                <Paragraph className="!text-xs text-black leading-relaxed">
                                    Double check the PAN format (e.g. ABCDE1234F).
                                </Paragraph>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Need Help */}
                    <motion.div
                        {...fadeUp(0.14)}
                        className="bg-[#000B60] rounded-2xl p-5 flex flex-col justify-end gap-2 min-h-[200px] overflow-hidden relative"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <img src={img} alt="" className='w-full h-full object-cover' />
                        </div>
                        <div className="relative z-10">
                            <Paragraph className="font-bold text-white ">Need help?</Paragraph>
                            <Paragraph className="!text-xs text-blue-300">Contact Finance Support</Paragraph>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default UpdateBankDetails
