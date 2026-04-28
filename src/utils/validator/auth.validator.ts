
import * as Yup from 'yup'

export const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email address')
        .required('Please enter your email'),
    password: Yup.string()
        .required('Please enter your password'),
})

export const signupValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required('Please enter your name'),
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