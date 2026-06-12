import { useAuthStore } from '@/store/authStore'
import { Heading, Paragraph } from '@/components/ui'

const SUPPORT_EMAIL = 'support@gradflow.in'

const SuspendedScreen = () => {
    const user = useAuthStore((state) => state.user)

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-xl rounded-2xl border border-[#F0D2D2] bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEDED]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="#D14343" strokeWidth="1.8" />
                        <path d="M6 6l12 12" stroke="#D14343" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </div>

                <Heading className="mt-5 text-[#2c1452]">
                    Hi{user?.name ? `, ${user.name}` : ''} — your account is suspended
                </Heading>

                <Paragraph className="mt-3 text-[#454652]">
                    Your faculty account has been temporarily{' '}
                    <span className="font-bold">suspended</span> by our admin team, so
                    access to the dashboard is currently paused. This usually happens when
                    something on your account needs a closer review.
                </Paragraph>

                <Paragraph className="mt-3 text-[#454652]">
                    If you believe this is a mistake or would like more details, please
                    reach out to our support team and we'll help you get things sorted.
                </Paragraph>

                <div className="mt-6 flex justify-center">
                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="rounded-lg bg-[#2c1452] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a1d6b]"
                    >
                        Contact Support
                    </a>
                </div>

                <Paragraph className="mt-4 text-xs text-[#8a8b96]">
                    You can email us at{' '}
                    <span className="font-medium text-[#2c1452]">{SUPPORT_EMAIL}</span>
                </Paragraph>
            </div>
        </div>
    )
}

export default SuspendedScreen
