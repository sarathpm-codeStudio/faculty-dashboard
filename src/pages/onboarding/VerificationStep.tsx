import { CheckCircle2 } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { Button, Paragraph } from '@/components/ui'
import { IdentityData, Qualification } from './index'
import { IoMdArrowForward } from "react-icons/io";
import { HiOutlineBadgeCheck } from "react-icons/hi";

interface Props {
    identity: IdentityData
    qualifications: Qualification[]
    onBack: () => void
    onSubmit: () => void
    animClass?: string
}

const VerificationStep = ({ identity, qualifications, onBack, onSubmit, animClass = '' }: Props) => {
    const fullName = `${identity.first_name} ${identity.last_name}`.trim() || 'Salsabeel k'
    const department = qualifications[0]?.fieldOfStudy || 'CMA'
    const experience = qualifications[0]?.teachingExperience || '4 Years'
    const courses = qualifications.length > 0
        ? qualifications.map((q) => q.fieldOfStudy.slice(0, 3).toUpperCase())
        : ['CMA', 'CA', 'CS']
    const files = qualifications.filter((q) => q.fileName).length > 0
        ? qualifications.filter((q) => q.fileName)
        : [
            { id: '1', type: '', fieldOfStudy: '', graduationYear: '', teachingExperience: '', fileName: 'CMA_Certificate_2024.pdf', fileSize: '2.4 MB' },
            { id: '2', type: '', fieldOfStudy: '', graduationYear: '', teachingExperience: '', fileName: 'MBA_Certification.pdf', fileSize: '1.1 MB' },
        ] as Qualification[]

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
            <div className="flex flex-col gap-4 w-full">

                {/* Top row — two boxes */}
                <div className="flex gap-4 items-start">

                    {/* Left — Academic Identity */}
                    <div className="flex-1 bg-white rounded-xl border-2 border-dotted border-gray-200 p-5">
                        <div className="flex gap-4">

                            <div className="flex flex-col gap-3 flex-1">
                                <div>
                                    <Paragraph className="text-gray-400 uppercase tracking-wider">Full Name</Paragraph>
                                    <Paragraph className="font-semibold text-gray-800 mt-0.5">{fullName}</Paragraph>
                                </div>
                                <div>
                                    <Paragraph className="text-gray-400 uppercase tracking-wider">Department</Paragraph>
                                    <Paragraph className="font-semibold text-gray-800 mt-0.5">{department}</Paragraph>
                                </div>
                                <div>
                                    <Paragraph className="text-gray-400 uppercase tracking-wider">Job Experience</Paragraph>
                                    <Paragraph className="font-semibold text-gray-800 mt-0.5">{experience}</Paragraph>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 flex-1">
                                <div>
                                    <Paragraph className="text-gray-400 uppercase tracking-wider">FAC Code</Paragraph>
                                    <Paragraph className="font-semibold text-gray-800 mt-0.5">HFAC-2024-0001</Paragraph>
                                </div>
                                <div>
                                    <Paragraph className="text-gray-400 uppercase tracking-wider">Courses Done</Paragraph>
                                    <div className="flex gap-1 flex-wrap mt-0.5">
                                        {courses.map((c) => (
                                            <Paragraph key={c} className="px-2 py-0.5 bg-[#F2F4F6] text-[#000B60] text-xs rounded font-medium">
                                                {c}
                                            </Paragraph>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right — Submit card */}
                    <div
                        className="w-80 rounded-xl p-5 flex flex-col gap-4 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #000B60, #142283)' }}
                    >
                        <h3 className="text-white font-semibold text-base leading-snug">
                            Ready to Submit?
                        </h3>
                        <Button variant="white" fullWidth onClick={onSubmit}>
                            Submit for Verification <IoMdArrowForward />
                        </Button>
                        <p className="text-indigo-300 text-xs leading-relaxed">
                            Final step of the onboarding process
                        </p>
                    </div>

                </div>

                {/* Bottom — Uploaded Documents */}
                <div>
                    <Paragraph className="text-gray-400 uppercase tracking-wider mb-3">Uploaded Documents</Paragraph>
                    <div className="flex gap-3">
                        {files.map((q) => (
                            <div
                                key={q.id}
                                className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl w-[300px] h-[100px]"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[#49D7F2] rounded flex items-center justify-center border border-red-100">
                                        {/* <span className="text-[#49D7F4] text-[9px] font-bold">PDF</span> */}
                                        <HiOutlineBadgeCheck size={25} className="text-[#00A6BF] flex-shrink-0" />
                                    </div>
                                    <div>
                                        <Paragraph className='text-bold'> {q.fileName} </Paragraph>

                                        {/* <p className="text-xs font-medium text-gray-700 truncate max-w-[160px]">{q.fileName}</p> */}
                                        <p className="text-xs text-gray-400">{q.fileSize}</p>
                                    </div>
                                </div>
                                <CheckCircle2 size={25} className="text-[#00A6BF] flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </OnboardingLayout>
    )
}

export default VerificationStep
