import { Pencil, CheckCircle2 } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { IdentityData, Qualification } from './index'

interface Props {
    identity: IdentityData
    qualifications: Qualification[]
    onBack: () => void
    onSubmit: () => void
    animClass?: string
}

const VerificationStep = ({ identity, qualifications, onBack, onSubmit, animClass = '' }: Props) => {
    const fullName = `${identity.firstName} ${identity.lastName}`.trim() || 'Salsabeel k'
    const department = qualifications[0]?.fieldOfStudy || 'CMA'
    const experience = qualifications[0]?.teachingExperience || '4 Years'
    const courses = qualifications.length > 0
        ? qualifications.map((q) => q.fieldOfStudy.slice(0, 3).toUpperCase())
        : ['CMA', 'CA', 'CS']
    const files = qualifications.filter((q) => q.fileName)

    return (
        <OnboardingLayout
            step={3}
            total={3}
            title="Review & Finalize"
            subtitle="Please ensure all academic credentials and personal details are accurate. Once submitted, your profile will be reviewed by the Admin."

            backLabel="Back to Academic"
            onBack={onBack}
            animClass={animClass}
        >
            <div className="flex gap-4 items-start">

                {/* Left — Academic Identity */}
                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5">

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 text-sm">Academic Identity</h3>
                        <button className="flex items-center gap-1 text-xs text-indigo-500 hover:underline">
                            <Pencil size={11} />
                            Edit
                        </button>
                    </div>

                    {/* Illustration + info row */}
                    <div className="flex gap-4 mb-4">

                        {/* Info */}
                        <div className="flex flex-col gap-3 flex-1">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Full Name</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Department</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{department}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Job Experience</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{experience}</p>
                            </div>
                        </div>

                        {/* Right side — FAC code + courses + illustration */}
                        <div className="flex flex-col gap-3 flex-1">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">FAC Code</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">HFAC-2024-0001</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Courses Done</p>
                                <div className="flex gap-1 flex-wrap mt-0.5">
                                    {courses.map((c) => (
                                        <span key={c} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Illustration placeholder */}
                        <div className="w-32 h-28 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <div className="text-center">
                                <div className="text-3xl mb-1">👨‍🎓</div>
                                <p className="text-xs text-indigo-400">Faculty</p>
                            </div>
                        </div>

                    </div>

                    {/* Certificate files */}
                    {(files.length > 0 ? files : [
                        { id: '1', fileName: 'CMA_Certificate_2...', fileSize: '2.4MB' },
                        { id: '2', fileName: 'MBA_Certificatio...', fileSize: '1.1MB' },
                    ] as Qualification[]).map((q) => (
                        <div
                            key={q.id}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg mb-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                                    <span className="text-indigo-500 text-[9px] font-bold">PDF</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700">{q.fileName}</p>
                                    <p className="text-xs text-gray-400">{q.fileSize}</p>
                                </div>
                            </div>
                            <CheckCircle2 size={16} className="text-indigo-500" />
                        </div>
                    ))}

                </div>

                {/* Right — Submit card */}
                <div
                    className="w-48 rounded-xl p-5 flex flex-col gap-4 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
                >
                    <h3 className="text-white font-semibold text-base leading-snug">
                        Ready to Submit?
                    </h3>
                    <button
                        onClick={onSubmit}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-[#000B60] text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Submit for Verification →
                    </button>
                    <p className="text-indigo-300 text-xs leading-relaxed">
                        Final step of the onboarding process
                    </p>
                </div>

            </div>
        </OnboardingLayout>
    )
}

export default VerificationStep