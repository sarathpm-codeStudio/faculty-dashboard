
import * as Yup from 'yup'




export const courseBasicDetailsSchema = Yup.object({
    title: Yup.string().required('Course name is required'),
    description: Yup.string().min(10, 'Description must be at least 10 characters'),
    category: Yup.string().required('Category is required'),
    level: Yup.string().required('Level is required'),
    languages: Yup.array().min(1, 'Select at least one language'),
    cover_image: Yup.mixed().when('cover_image_url', {
        is: (val: any) => !val,
        then: (schema) => schema.required('Cover image is required'),
        otherwise: (schema) => schema.nullable(),
    }),
    // introVideo: Yup.mixed().required('Intro video is required'),
})



export const coursePricingSchema = Yup.object({
    isFree: Yup.boolean().optional(),
    validity: Yup.string().required('Validity is required'),
    price: Yup.string().when('isFree', {
        is: true,
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema
            .required('Price is required')
            .test('is-number', 'Price must be a valid number', (v) => v !== undefined && v !== '' && !isNaN(Number(v)))
            .test('is-positive', 'Price must be greater than 0', (v) => Number(v) > 0),
    }),
    discount: Yup.string().when('isFree', {
        is: true,
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema
            .test('is-number', 'Discount must be a valid number', (v) => !v || !isNaN(Number(v)))
            .test('non-negative', 'Discount cannot be negative', (v) => !v || Number(v) >= 0)
            .when('discountType', {
                is: 'percentage',
                then: (s) => s.test('max-percent', 'Discount cannot exceed 100%', (v) => !v || Number(v) <= 100),
            }),
    }),
    discountType: Yup.string().optional(),
    enableCoupons: Yup.boolean().optional(),
})