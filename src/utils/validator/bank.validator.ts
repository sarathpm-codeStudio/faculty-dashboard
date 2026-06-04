import * as Yup from 'yup'

export const saveBankDetailsSchema = Yup.object({
    bank_name: Yup.string()
        .min(2, 'Bank name must be at least 2 characters')
        .max(100, 'Bank name too long')
        .required('Bank name is required'),

    account_holder_name: Yup.string()
        .min(2, 'Account holder name must be at least 2 characters')
        .max(100, 'Account holder name too long')
        .required('Account holder name is required'),

    account_number: Yup.string()
        .matches(/^[0-9]{9,18}$/, 'Account number must be 9-18 digits only')
        .required('Account number is required'),

    confirm_account_number: Yup.string()
        .matches(/^[0-9]{9,18}$/, 'Account number must be 9-18 digits only')
        .oneOf([Yup.ref('account_number')], 'Account numbers do not match')
        .required('Confirm account number is required'),

    ifsc_code: Yup.string()
        .transform((value) => (typeof value === 'string' ? value.toUpperCase() : value))
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g. SBIN0001234)')
        .required('IFSC code is required'),

    pan_number: Yup.string()
        .transform((value) => (typeof value === 'string' ? value.toUpperCase() : value))
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
        .required('PAN number is required'),
})

export type SaveBankDetailsInput = Yup.InferType<typeof saveBankDetailsSchema>
