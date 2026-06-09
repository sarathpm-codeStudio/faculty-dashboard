

import * as Yup from 'yup'


export const testSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    course: Yup.string().required('Course is required'),
    module: Yup.string().optional(),
    material: Yup.string().optional(),
    testType: Yup.string().required('Test type is required'),
    duration: Yup.string().required('Duration is required'),
    instructions: Yup.string().optional(),
})
