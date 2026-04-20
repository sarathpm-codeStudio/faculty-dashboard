import { Mail, Phone } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { Input, Textarea, Button, DateInput } from '@/components/ui'
import { IdentityData } from './index'

interface Props {
    data: IdentityData
    onChange: (data: IdentityData) => void
    onNext: () => void
    onBack: () => void
    animClass?: string
}

const IdentityStep = ({ data, onChange, onNext, onBack, animClass = '' }: Props) => {
    const set = (field: keyof IdentityData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...data, [field]: e.target.value })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext()
    }

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
            <form onSubmit={handleSubmit} className="w-full max-w-4xl">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col gap-5">

                        {/* First + Last name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={data.firstName}
                                onChange={set('firstName')}
                                placeholder="Enter first name"
                            />
                            <Input
                                label="Last Name"
                                value={data.lastName}
                                onChange={set('lastName')}
                                placeholder="Enter last name"
                            />
                        </div>

                        {/* Email */}
                        <Input
                            label="Email Address"
                            type="email"
                            value={data.email}
                            onChange={set('email')}
                            placeholder="name@university.edu"
                            leftIcon={<Mail size={14} />}
                        />

                        {/* Phone + DOB */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                value={data.phone}
                                onChange={set('phone')}
                                placeholder="+91 98765 •••••"
                                leftIcon={<Phone size={14} />}
                            />
                            <DateInput
                                label="Date of Birth"
                                value={data.dob}
                                onChange={(val) => onChange({ ...data, dob: val })}
                            />
                        </div>

                        {/* Bio */}
                        <Textarea
                            label="Bio"
                            value={data.bio}
                            onChange={set('bio')}
                            placeholder="Say Something About You"
                            rows={3}
                        />


                        {/* Continue — inside card */}
                        <div className="flex justify-end pt-2">
                            <Button type="submit">Continue →</Button>
                        </div>

                    </div>
                </div>
            </form>
        </OnboardingLayout>
    )
}

export default IdentityStep
