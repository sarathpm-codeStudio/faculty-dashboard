

import * as Yup from 'yup'



export const bundleValidator = Yup.object({
    title: Yup.string().required('Bundle name is required'),
    description: Yup.string().required('Description is required'),
    discount: Yup.number().required('Discount is required'),
    coverImage: Yup.mixed().required('Cover image is required'),
})