import { Heading, Paragraph } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'

interface Props {
    step: number
    total: number
    title: string
    subtitle: string
    backLabel: string
    onBack: () => void
    children: React.ReactNode
    animClass?: string
}

const OnboardingLayout = ({
    step, total, title, subtitle, backLabel, onBack, children, animClass = ''
}: Props) => {
    const progress = (step / total) * 100

    return (
        <div className="min-h-screen bg-[#F8F9FB] px-4 sm:px-8 py-10 sm:py-20">
            <div className="w-full max-w-7xl mx-auto">

                {/* Back link */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm font-bold hover:text-gray-800 transition-colors mb-3 cursor-pointer"
                >
                    <ArrowLeft size={14} />
                    {backLabel}
                </button>

                {/* Subtitle */}
                <Paragraph className='mb-5 max-w-2xl text-gray-500'>
                    {subtitle}
                </Paragraph>

                {/* Title + step counter */}
                <div className="flex items-center justify-between mb-1">
                    <Heading as='h1' size='lg' className="font-bold text-[#0a0a4a]" > {title} </Heading>
                    {/* <h1 className="text-2xl font-bold text-[#0a0a4a]">{title}</h1> */}
                    <span className="text-sm text-gray-400">
                        <span className="text-[#0a0a4a] font-bold text-2xl">
                            {String(step).padStart(2, '0')}
                        </span>
                        <span className="text-gray-400 text-base"> / {String(total).padStart(2, '0')}</span>
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[3px] bg-gray-200 rounded-full mb-8">
                    <div
                        className="h-[3px] rounded-full transition-all duration-500"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(to right, #2c1452, #2c1452)'
                        }}
                    />
                </div>

                {/* Page content */}
                <div className={`flex justify-center ${animClass}`}>
                    {children}
                </div>

            </div>
        </div>
    )
}

export default OnboardingLayout
