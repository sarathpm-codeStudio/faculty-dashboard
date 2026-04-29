
import * as Yup from 'yup'




export const courseBasicDetailsSchema = Yup.object({
    title: Yup.string().required('Course name is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    level: Yup.string().required('Level is required'),
    languages: Yup.array().min(1, 'Select at least one language'),
    cover_image: Yup.mixed().required('Cover image is required'),
    // introVideo: Yup.mixed().required('Intro video is required'),
})