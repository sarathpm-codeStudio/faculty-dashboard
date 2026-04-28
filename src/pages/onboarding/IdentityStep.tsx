import { Mail, Phone } from 'lucide-react'
import { useFormik } from 'formik'
import OnboardingLayout from './OnboardingLayout'
import { Input, Textarea, Button, DateInput } from '@/components/ui'
import { IdentityData } from './index'
import { identitySchema } from '@/utils/validator/auth.validator'
import { IoMdArrowForward } from "react-icons/io";

interface Props {
    data: IdentityData
    onChange: (data: IdentityData) => void
    onNext: () => void
    onBack: () => void
    animClass?: string
}

const IdentityStep = ({ data, onChange, onNext, onBack, animClass = '' }: Props) => {
    const formik = useFormik<IdentityData>({
        initialValues: data,
        validationSchema: identitySchema,
        onSubmit: (values) => {
            onChange(values)
            onNext()
        },
    })

    const err = (field: keyof IdentityData) =>
        formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined

    return (
        <OnboardingLayout
            step={1}
            total={3}
            title="Basic Information"
            subtitle="Welcome to the Academic Curator. To begin your journey as a faculty member, please provide your fundamental identification details."
            backLabel="Back to Sign in"
            onBack={onBack}
            animClass={animClass}
        >
            <form onSubmit={formik.handleSubmit} className="w-full max-w-4xl">
                <div className="bg-white rounded-xl border-2 border-dotted border-gray-200 p-6">
                    <div className="flex flex-col gap-5">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                id="first_name"
                                value={formik.values.first_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter first name"
                                error={err('first_name')}
                            />
                            <Input
                                label="Last Name"
                                id="last_name"
                                value={formik.values.last_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter last name"
                                error={err('last_name')}
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            id="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="name@university.edu"
                            leftIcon={<Mail size={14} />}
                            error={err('email')}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                id="phone"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="+91 98765 •••••"
                                leftIcon={<Phone size={14} />}
                                error={err('phone')}
                            />
                            <DateInput
                                label="Date of Birth"
                                value={formik.values.date_of_birth}
                                onChange={(val) => formik.setFieldValue('date_of_birth', val)}
                                onBlur={() => formik.setFieldTouched('date_of_birth', true)}
                                error={err('date_of_birth')}
                            />
                        </div>

                        <Textarea
                            label="Bio"
                            id="bio"
                            value={formik.values.bio}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Say Something About You"
                            rows={3}
                            error={err('bio')}
                        />

                        <div className="flex justify-end pt-2">
                            <Button type="submit">Continue <IoMdArrowForward /></Button>
                        </div>

                    </div>
                </div>
            </form>
        </OnboardingLayout>
    )
}

export default IdentityStep
