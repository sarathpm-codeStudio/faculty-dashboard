


import * as Yup from 'yup'


export const announcementSchema = Yup.object({
    title: Yup.string().required('Announcement name is required'),
    audience: Yup.string().required('Audience selection is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
        .required('End date is required')
        .min(Yup.ref('startDate'), 'End date cannot be before start date'),
    content: Yup.string().required('Announcement message is required'),
})

