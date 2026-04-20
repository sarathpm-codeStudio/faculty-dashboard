

import { Pencil, CheckCircle2 } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { IdentityData, Qualification } from './index'

interface Props {
    identity: IdentityData
    qualifications: Qualification[]
    onBack: () => void
    onSubmit: () => void
}

const VerificationStep = ({ identity, qualifications, onBack, onSubmit }: Props) => {
    const fullName = `${identity.firstName} ${identity.lastName}`.trim() || 'Salsabeel K'
    const department = qualifications[0]?.fieldOfStudy || 'CMA'
    const experience = qualifications[0]?.teachingExperience || '4 Years'
    const courses = qualifications.map((q) => q.fieldOfStudy.slice(0, 3).toUpperCase()).filter(Boolean)

    return (
        <OnboardingLayout
            step={3}
            total={3}
            title="Review & Finalize"
            subtitle="Please ensure all academic credentials and personal details are accurate. Once submitted, your profile will be reviewed by the Admin."
            backLabel="Back to Academic"
            onBack={onBack}
        >
            <div className="flex gap-4">

                {/* Left — Academic Identity card */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Academic Identity</h3>
                        <button className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                            <Pencil size={12} />
                            Edit
                        </button>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                            { label: 'Full Name', value: fullName },
                            { label: 'FAC Code', value: 'HFAC-2024-0001' },
                            { label: 'Department', value: department },
                            { label: 'Courses Done', value: null },
                            { label: 'Job Experience', value: experience },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex flex-col gap-1">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                                {value ? (
                                    <p className="text-sm font-medium text-gray-800">{value}</p>
                                ) : (
                                    <div className="flex gap-1 flex-wrap">
                                        {(courses.length > 0 ? courses : ['CMA', 'CA', 'CS']).map((c) => (
                                            <span key={c} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-md font-medium">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Certificate files */}
                    <div className="flex flex-col gap-2 mt-4">
                        {qualifications.filter((q) => q.fileName).map((q) => (
                            <div
                                key={q.id}
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <span className="text-indigo-600 text-[9px] font-bold">PDF</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 max-w-[140px] truncate">{q.fileName}</p>
                                        <p className="text-xs text-gray-400">{q.fileSize}</p>
                                    </div>
                                </div>
                                <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0" />
                            </div>
                        ))}

                        {/* Fallback if no files */}
                        {qualifications.filter((q) => q.fileName).length === 0 && (
                            <>
                                {['CMA_Certificate_2...  2.4MB', 'MBA_Certificatio...  1.1MB'].map((f, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <span className="text-indigo-600 text-[9px] font-bold">PDF</span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-700">{f}</p>
                                        </div>
                                        <CheckCircle2 size={16} className="text-indigo-500" />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Right — Submit card */}
                <div
                    className="w-52 rounded-xl p-5 flex flex-col gap-3 justify-center"
                    style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
                >
                    <h3 className="text-white font-semibold text-base leading-tight">
                        Ready to Submit?
                    </h3>
                    <button
                        onClick={onSubmit}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Submit for Verification
                        <span>→</span>
                    </button>
                    <p className="text-indigo-200 text-xs">Final step of the onboarding process</p>
                </div>

            </div>
        </OnboardingLayout>
    )
}

export default VerificationStep