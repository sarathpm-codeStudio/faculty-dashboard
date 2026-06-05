import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Landmark, Zap } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import { Heading, Paragraph, Input } from '@/components/ui'
import Button from '@/components/ui/Button'
import img from '@/assets/images/sc.png'
import { saveBankDetailsSchema, type SaveBankDetailsInput } from '@/utils/validator/bank.validator'
import { useCreateBankDetails } from '@/hooks/bank'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const initialValues: SaveBankDetailsInput = {
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    confirm_account_number: '',
    ifsc_code: '',
    pan_number: '',
}

const UpdateBankDetails = () => {
    const navigate = useNavigate()


    // mutation
    const { mutateAsync: createBankDetails, isPending: isCreatingBankDetails } = useCreateBankDetails()

    const formik = useFormik<SaveBankDetailsInput>({
        initialValues,
        validationSchema: saveBankDetailsSchema,
        onSubmit: async (_values) => {
            try {

                const payload = {
                    bank_name: _values.bank_name,
                    account_holder_name: _values.account_holder_name,
                    account_number: _values.account_number,
                    confirm_account_number: _values.confirm_account_number,
                    ifsc_code: _values.ifsc_code,
                    pan_number: _values.pan_number,
                }
                await createBankDetails(payload)
                toast.success("Bank details created successfully")
                navigate('/account/bank')
            } catch (error: any) {
                toast.error("Could not create bank details")
                console.log("error", error)
            }
        },
    })

    const err = (field: keyof SaveBankDetailsInput) =>
        formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined

    const uppercaseOnChange = (field: 'bank_name' | 'account_holder_name' | 'ifsc_code' | 'pan_number') => (
        e: ChangeEvent<HTMLInputElement>,
    ) => {
        formik.setFieldValue(field, e.target.value.toUpperCase())
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide gap-5 pb-6">

            {/* Header */}
            <motion.div {...fadeUp(0.04)}>
                <Heading className="text-[#000B60]">Add Bank Details</Heading>
                <Paragraph className="text-[#767683] mt-1">
                    Manage your disbursement methods and secure financial information.
                </Paragraph>
            </motion.div>

            <div className="grid grid-cols-12 gap-5">

                {/* ── Left form ── */}
                <motion.div {...fadeUp(0.08)} className="col-span-8">
                    <form
                        onSubmit={formik.handleSubmit}
                        noValidate
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
                    >

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Bank Name"
                                name="bank_name"
                                placeholder="e.g. INTERNATIONAL FEDERAL BANK"
                                autoCapitalize="characters"
                                value={formik.values.bank_name}
                                onChange={uppercaseOnChange('bank_name')}
                                onBlur={formik.handleBlur}
                                error={err('bank_name')}
                            />
                            <Input
                                label="Account Holder Name"
                                name="account_holder_name"
                                placeholder="DR. ELENA VANCE"
                                autoCapitalize="characters"
                                value={formik.values.account_holder_name}
                                onChange={uppercaseOnChange('account_holder_name')}
                                onBlur={formik.handleBlur}
                                error={err('account_holder_name')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Account Number"
                                name="account_number"
                                placeholder="•••• •••• •••• 4590"
                                inputMode="numeric"
                                value={formik.values.account_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err('account_number')}
                            />
                            <Input
                                label="Confirm Account Number"
                                name="confirm_account_number"
                                placeholder="•••• •••• •••• 4590"
                                inputMode="numeric"
                                value={formik.values.confirm_account_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={err('confirm_account_number')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="IFSC Code"
                                name="ifsc_code"
                                placeholder="SBIN0001234"
                                autoCapitalize="characters"
                                value={formik.values.ifsc_code}
                                onChange={uppercaseOnChange('ifsc_code')}
                                onBlur={formik.handleBlur}
                                error={err('ifsc_code')}
                            />
                            <Input
                                label="PAN Number"
                                name="pan_number"
                                placeholder="ABCDE1234F"
                                autoCapitalize="characters"
                                value={formik.values.pan_number}
                                onChange={uppercaseOnChange('pan_number')}
                                onBlur={formik.handleBlur}
                                error={err('pan_number')}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="!h-11 !text-sm !px-6"
                                disabled={formik.isSubmitting || isCreatingBankDetails}
                            >
                                Save Changes
                            </Button>
                            <Button
                                type="button"
                                variant="white"
                                className="!h-11 !text-sm !px-6"
                                onClick={() => navigate('/account/bank')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
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
