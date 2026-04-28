import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Heading, Paragraph } from '@/components/ui'

const PendingScreen = () => {
    const user = useAuthStore((state) => state.user)
    const noProfile = useAuthStore((state) => state.noProfile)

    return (
        <div className="space-y-4">
            <Heading className="text-[#000b60]">Hi, {user?.name}</Heading>
            {noProfile ? (
                <Paragraph className="text-[#454652]">
                    Welcome! To get started,{' '}
                    <span className="font-bold">please complete your profile</span>{' '}
                    so our admin team can review and activate your faculty account.{' '}
                    <Link to="/onboarding" className="font-bold text-[#000b60] underline cursor-pointer">
                        Complete Your Profile
                    </Link>
                </Paragraph>
            ) : (
                <Paragraph className="text-[#454652]">
                    Thank you for submitting your details.{' '}
                    <span className="font-bold">Your account is under review</span>{' '}
                    Our admin team is currently reviewing your faculty profile.
                    You will gain access to the dashboard once your account is approved.{' '}
                    <span className="font-bold text-[#000b60] cursor-pointer">Check The Mail</span>
                </Paragraph>
            )}

            <div className="flex justify-center mt-6">
                <svg width="380" height="280" viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="190" cy="200" rx="160" ry="60" fill="#EEF0FF" />

                    <circle cx="90" cy="100" r="22" fill="#FFB74D" />
                    <rect x="68" y="122" width="44" height="60" rx="10" fill="#5C6BC0" />
                    <rect x="56" y="135" width="14" height="35" rx="7" fill="#5C6BC0" />
                    <rect x="110" y="135" width="14" height="35" rx="7" fill="#5C6BC0" />
                    <rect x="72" y="182" width="16" height="40" rx="8" fill="#3949AB" />
                    <rect x="102" y="182" width="16" height="40" rx="8" fill="#3949AB" />

                    <rect x="130" y="60" width="120" height="150" rx="12" fill="white" stroke="#C5CAE9" strokeWidth="1.5" />
                    <circle cx="190" cy="100" r="28" fill="#E8EAF6" />
                    <circle cx="190" cy="92" r="16" fill="#9FA8DA" />
                    <ellipse cx="190" cy="118" rx="22" ry="10" fill="#9FA8DA" />
                    <rect x="148" y="138" width="84" height="8" rx="4" fill="#E8EAF6" />
                    <rect x="158" y="152" width="64" height="6" rx="3" fill="#E8EAF6" />
                    {[0, 1, 2, 3, 4].map(i => (
                        <text key={i} x={150 + i * 14} y="178" fontSize="12" fill={i < 4 ? "#FFC107" : "#E0E0E0"}>★</text>
                    ))}
                    <circle cx="218" cy="68" r="14" fill="#4CAF50" />
                    <polyline points="212,68 217,73 225,63" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    <circle cx="300" cy="100" r="22" fill="#FFCCBC" />
                    <rect x="278" y="122" width="44" height="60" rx="10" fill="#26A69A" />
                    <rect x="264" y="135" width="14" height="35" rx="7" fill="#26A69A" />
                    <rect x="308" y="135" width="14" height="35" rx="7" fill="#26A69A" />
                    <rect x="282" y="182" width="16" height="40" rx="8" fill="#00897B" />
                    <rect x="312" y="182" width="16" height="40" rx="8" fill="#00897B" />

                    <rect x="268" y="152" width="60" height="38" rx="4" fill="#37474F" />
                    <rect x="272" y="156" width="52" height="28" rx="2" fill="#546E7A" />
                    <rect x="260" y="190" width="76" height="6" rx="3" fill="#37474F" />

                    <circle cx="60" cy="60" r="5" fill="#C5CAE9" />
                    <circle cx="330" cy="55" r="7" fill="#B2EBF2" />
                    <circle cx="350" cy="160" r="4" fill="#C8E6C9" />
                    <circle cx="40" cy="180" r="6" fill="#FFE0B2" />
                </svg>
            </div>
        </div>
    )
}

export default PendingScreen
