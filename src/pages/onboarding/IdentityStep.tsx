


import { Mail, Phone, Calendar } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { IdentityData } from './index'

interface Props {
    data: IdentityData
    onChange: (data: IdentityData) => void
    onNext: () => void
    onBack: () => void
}

const IdentityStep = ({ data, onChange, onNext, onBack }: Props) => {
    const set = (field: keyof IdentityData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...data, [field]: e.target.value })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext()
    }

    const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300 bg-gray-50"

    return (
        <OnboardingLayout
            step={1}
            total={3}
            title="Basic Information"
            subtitle="Welcome to the Academic Curator. To begin your journey as a faculty member, please provide your fundamental identification details."
            backLabel="Back to Sign in"
            onBack={onBack}
        >
            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">

                    {/* First + Last name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Name</label>
                            <input
                                value={data.firstName}
                                onChange={set('firstName')}
                                placeholder="Enter first name"
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Name</label>
                            <input
                                value={data.lastName}
                                onChange={set('lastName')}
                                placeholder="Enter last name"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                        <div className="relative">
                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={set('email')}
                                placeholder="name@university.edu"
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </div>

                    {/* Phone + DOB */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                            <div className="relative">
                                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={set('phone')}
                                    placeholder="+91 98765 •••••"
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                            <div className="relative">
                                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={data.dob}
                                    onChange={set('dob')}
                                    placeholder="mm/dd/yyyy"
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</label>
                        <textarea
                            value={data.bio}
                            onChange={set('bio')}
                            placeholder="Say Something About You"
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                </div>

                {/* Continue button */}
                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 bg-btn-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Continue
                        <span>→</span>
                    </button>
                </div>

            </form>
        </OnboardingLayout>
    )
}

export default IdentityStep