

import * as Yup from 'yup'


export const couponValidator = Yup.object({
    code: Yup.string().required('Code is required'),
    discountType: Yup.string().required('Discount type is required'),
    discountValue: Yup.number().required('Discount value is required'),
    expiryDate: Yup.date().required('Expiry date is required'),
    maxUsage: Yup.number().required('Max usage is required'),
    usagePerPerson: Yup.number().required('Usage per person is required'),
    courses: Yup.array()
        .of(Yup.string())
        .min(1, 'Please select at least one course')
        .required('Please select at least one course'),
})