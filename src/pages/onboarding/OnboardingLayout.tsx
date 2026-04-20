

import { ArrowLeft } from 'lucide-react'

interface Props {
    step: number
    total: number
    title: string
    subtitle: string
    backLabel: string
    onBack: () => void
    children: React.ReactNode
}

const OnboardingLayout = ({
    step, total, title, subtitle, backLabel, onBack, children
}: Props) => {
    const progress = (step / total) * 100

    return (
        <div className="min-h-screen bg-[#1a1a2e] flex items-start justify-center px-4 py-8">
            <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-xl">

                {/* Back link */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
                >
                    <ArrowLeft size={15} />
                    {backLabel}
                </button>

                {/* Subtitle */}
                <p className="text-sm text-gray-500 mb-4 max-w-md">{subtitle}</p>

                {/* Title + step counter + progress bar */}
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-xl font-bold text-indigo-900">{title}</h1>
                    <span className="text-sm text-gray-400">
                        <span className="text-indigo-900 font-bold text-lg">
                            {String(step).padStart(2, '0')}
                        </span>
                        {' '}/ {String(total).padStart(2, '0')}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mb-8">
                    <div
                        className="h-1 rounded-full bg-btn-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Content */}
                {children}

            </div>
        </div>
    )
}

export default OnboardingLayout