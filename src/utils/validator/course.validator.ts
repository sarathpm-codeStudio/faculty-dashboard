
import * as Yup from 'yup'




export const courseBasicDetailsSchema = Yup.object({
    title: Yup.string().required('Course name is required'),
    description: Yup.string()
        .trim()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description cannot exceed 5000 characters')
        .required('Description is required'),
    category: Yup.string().required('Category is required'),
    level: Yup.string().required('Level is required'),
    languages: Yup.array().min(1, 'Select at least one language'),
    // The URL is what actually gets persisted, so validate that rather than the
    // picked File — otherwise a submit mid-upload passes and saves no cover.
    cover_image_url: Yup.string().nullable().required('Cover image is required'),
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