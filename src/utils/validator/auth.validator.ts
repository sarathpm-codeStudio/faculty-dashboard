
import * as Yup from 'yup'

export const identitySchema = Yup.object({
    first_name: Yup.string().trim().required('First name is required'),
    last_name: Yup.string().trim().required('Last name is required'),
    email: Yup.string().email('Enter a valid email address').required('Email is required'),
    phone: Yup.string()
        .matches(/^\+?[0-9\s\-()]{7,15}$/, 'Enter a valid phone number')
        .required('Phone number is required'),
    date_of_birth: Yup.string().required('Date of birth is required'),
    bio: Yup.string().trim().min(20, 'Bio must be at least 20 characters').required('Bio is required'),
    avatar_url: Yup.string(),
})

export const qualificationFormSchema = Yup.object({
    type: Yup.string().required('Qualification type is required'),
    fieldOfStudy: Yup.string().trim().required('Field of study is required'),
    graduationYear: Yup.string().required('Graduation date is required'),
    teachingExperience: Yup.string().trim(),
    document_url: Yup.string().required('Please upload your certificate'),
})

export const idVerificationSchema = Yup.object({
    document_type: Yup.string()
        .oneOf(['aadhar_card', 'license', 'passport', 'voter_id'], 'Select a valid document type')
        .required('Document type is required'),
    document_url: Yup.string().required('Please upload your ID document'),
})

// Country code is selected separately; `phone` holds only the local digits.
// They are combined into E.164 (e.g. +91 + 9876543210 -> +919876543210) before
// being sent to Supabase, so the format passed to Supabase stays unchanged.
export const validationSchema = Yup.object({
    countryCode: Yup.string()
        .matches(/^\+[1-9]\d{0,3}$/, 'Select a valid country code')
        .required('Select a country code'),
    phone: Yup.string()
        .matches(/^[0-9]{6,14}$/, 'Enter a valid phone number')
        .required('Please enter your phone number'),
})

// Country code is selected separately; `phone` holds only the local digits.
// They are combined into E.164 (e.g. +91 + 9876543210 -> +919876543210) before
// being sent to Supabase, so the format passed to Supabase stays unchanged.
export const signupValidationSchema = Yup.object({
    countryCode: Yup.string()
        .matches(/^\+[1-9]\d{0,3}$/, 'Select a valid country code')
        .required('Select a country code'),
    phone: Yup.string()
        .matches(/^[0-9]{6,14}$/, 'Enter a valid phone number')
        .required('Please enter your phone number'),
})

export const otpValidationSchema = Yup.object({
    token: Yup.string()
        .matches(/^\d{6}$/, 'Enter the 6-digit OTP')
        .required('Please enter the OTP'),
})