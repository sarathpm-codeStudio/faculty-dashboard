import { ShieldCheck, FileText, Lock, Scale } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { Button, Checkbox, Subheading, Paragraph } from '@/components/ui'
import { IoMdArrowForward } from 'react-icons/io'

export interface PolicyAcceptance {
    accepted: boolean
}

interface Props {
    data: PolicyAcceptance
    onChange: (data: PolicyAcceptance) => void
    onNext: () => void
    onBack: () => void
    animClass?: string
}

const policies = [
    {
        icon: <FileText size={18} />,
        title: 'Terms of Service',
        description:
            'Abide by the platform\'s terms governing faculty conduct, course delivery, and engagement with students.',
    },
    {
        icon: <Lock size={18} />,
        title: 'Privacy Policy',
        description:
            'Understand how your personal information is collected, stored, and used in accordance with the privacy policy.',
    },
    {
        icon: <Scale size={18} />,
        title: 'Faculty Code of Conduct',
        description:
            'Maintain academic integrity, professional behavior, and respectful communication at all times.',
    },
    {
        icon: <ShieldCheck size={18} />,
        title: 'Data Usage & Verification',
        description:
            'Consent to the verification of your submitted credentials and documents by the platform administration.',
    },
]

const PolicyStep = ({ data, onChange, onNext, onBack, animClass = '' }: Props) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (data.accepted) onNext()
    }

    return (
        <OnboardingLayout
            step={4}
            total={5}
            title="Policies & Agreements"
            subtitle="Please review and accept our platform policies before proceeding. These ensure a safe, fair, and professional environment for everyone."
            backLabel="Back to ID Verification"
            onBack={onBack}
            animClass={animClass}
        >
            <form onSubmit={handleSubmit} className="w-full max-w-4xl">
                <div className="bg-white rounded-xl border-2 border-dotted border-gray-200 p-5">
                    <Subheading className="text-[#2c1452] font-bold">
                        Platform Policies
                    </Subheading>
                    <Paragraph className="mb-4 text-gray-500">
                        Review the policies below, then confirm your acceptance to continue.
                    </Paragraph>

                    <div className="flex flex-col gap-3">
                        {policies.map((p) => (
                            <div
                                key={p.title}
                                className="flex items-start gap-4 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-white"
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#DFE0FF] text-[#2c1452]">
                                    {p.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#2c1452]">{p.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {p.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                        <Checkbox
                            id="policy-accept-all"
                            label="I have read and agree to all the policies above"
                            checked={data.accepted}
                            onChange={() => onChange({ accepted: !data.accepted })}
                        />

                        <Button type="submit" disabled={!data.accepted}>
                            Continue <IoMdArrowForward />
                        </Button>
                    </div>
                </div>
            </form>
        </OnboardingLayout>
    )
}

export default PolicyStep
