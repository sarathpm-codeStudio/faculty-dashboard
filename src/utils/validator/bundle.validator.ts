

import * as Yup from 'yup'



export const bundleValidator = Yup.object({
    title: Yup.string().required('Bundle name is required'),
    description: Yup.string().required('Description is required'),
    discount: Yup.number().required('Discount is required'),
    discountType: Yup.string().when('discount', {
        is: (value: number) => Number(value) > 0,
        then: (schema) => schema.required('Discount type is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    coverImage: Yup.mixed().required('Cover image is required'),
})