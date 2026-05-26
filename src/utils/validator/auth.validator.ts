
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

export const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email address')
        .required('Please enter your email'),
    password: Yup.string()
        .required('Please enter your password'),
})

export const signupValidationSchema = Yup.object({
    // name: Yup.string()
    //     .trim()
    //     .required('Please enter your name'),
    email: Yup.string()
        .email('Enter a valid email address')
        .required('Please enter your email'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Please enter a password'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Please confirm your password'),
})