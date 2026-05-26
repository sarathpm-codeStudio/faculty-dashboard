import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, ChevronRight, FileText, GraduationCap, Eye, Download, User } from 'lucide-react'
import { HiOutlineBadgeCheck } from 'react-icons/hi'
import { Heading, Paragraph, Spinner, Button2, Modal } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { profileService, type AcademicProfile, type FacultyProfile } from '@/services/profileService'
import { toast } from 'sonner'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const formatJoinedDate = (iso?: string) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const formatDisplayDob = (dob?: string) => {
    if (!dob) return '—'
    const d = new Date(dob)
    if (Number.isNaN(d.getTime())) return dob
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

type DetailFieldProps = { label: string; value: string }

const formatGraduationYear = (year?: number | null) => {
    if (year == null) return '—'
    return String(year)
}

const formatTeachingExperience = (years?: number | null) => {
    if (years == null) return '—'
    return `${years} ${years === 1 ? 'Year' : 'Years'}`
}

const certificateFileName = (url?: string | null) => {
    if (!url) return 'Certificate'
    return url.split('/').pop() ?? 'Certificate'
}

const DetailField = ({ label, value }: DetailFieldProps) => (
    <div>
        <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-1">
            {label}
        </Paragraph>
        <Paragraph className="!text-sm font-bold text-[#000B60]">{value}</Paragraph>
    </div>
)

const ProfilePage = () => {
    const authUser = useAuthStore((s) => s.user)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<FacultyProfile | null>(null)
    const [academics, setAcademics] = useState<AcademicProfile[]>([])
    const [selectedQualification, setSelectedQualification] = useState<AcademicProfile | null>(null)

    useEffect(() => {
        const load = async () => {
            if (!authUser?.id) {
                setLoading(false)
                return
            }
            try {
                const [p, a] = await Promise.all([
                    profileService.getProfile(authUser.id),
                    profileService.getAcademicProfiles(authUser.id),
                ])
                setProfile(p)
                setAcademics(a)
                console.log("profile", p)
                console.log("academics", a)
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to load profile'
                toast.error(message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [authUser?.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner label="Loading profile..." />
            </div>
        )
    }

    const fullName =
        `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() ||
        authUser?.name ||
        '—'
    const email = profile?.email || authUser?.email || '—'
    const phone = profile?.phone || '—'
    const dob = formatDisplayDob(profile?.date_of_birth)
    const avatar = profile?.avatar_url
    const bio =
        profile?.bio ||
        'Dedicated academic professional with over a decade of experience in financial management and corporate accounting. Passionate about mentoring the next generation of business leaders through practical, case-study based learning methodologies.'
    const certificatesWithDocs = academics.filter((a) => a.document_url)
    const certificates =
        certificatesWithDocs.length > 0
            ? certificatesWithDocs.map((a) => ({
                  name: certificateFileName(a.document_url),
                  meta: `Degree Verification - ${a.type ?? 'Document'}`,
                  document_url: a.document_url!,
              }))
            : [{ name: 'No certificates found', meta: 'Upload certificates during onboarding', document_url: '' }]

    return (
        <div className="flex flex-col gap-5 pb-6">
            {/* Page header */}
            <motion.div {...fadeUp(0.04)} className="flex items-start justify-between gap-4">
                <div>
                    <Heading className="text-[#000B60]">Personal Information</Heading>
                    <Paragraph className="text-[#767683] mt-1 max-w-2xl">
                        Manage your academic profile identity and contact details for the university directory.
                    </Paragraph>
                </div>
                <Button2
                    variant="primary"
                    className="!h-11 !text-sm !px-5 shrink-0"
                    onClick={() => toast.info('Profile editing will be available soon.')}
                >
                    <Pencil size={16} />
                    Edit Profile
                </Button2>
            </motion.div>

            <div className="grid grid-cols-12 gap-5">
                {/* Left column */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
                    {/* Profile summary card */}
                    <motion.div
                        {...fadeUp(0.08)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    >
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex flex-col items-start gap-2 shrink-0">
                                {
                                    avatar ? (
                                        <img
                                            src={avatar}
                                            alt={fullName}
                                            className="w-28 h-28 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center">
                                            <User size={28} className="text-[#000B60]" />
                                        </div>
                                    )
                                }
                                {/* <button
                                    type="button"
                                    className="w-8 h-8 rounded-lg bg-[#F2F4F6] flex items-center justify-center text-[#000B60] hover:bg-[#E8EBF5] transition-colors"
                                    aria-label="Social profile"
                                >
                                    <FaInstagram size={16} />
                                </button> */}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Paragraph className="!text-xl font-bold text-[#191c1e]">{fullName}</Paragraph>
                                    
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-[#A8EDFF] text-[#00A6BF] uppercase">
                                            {
                                              profile?.account_verified === 'PENDING' ? 'Verification Pending' : profile?.account_verified === 'REJECTED' ? 'Verification Rejected' : 'Verified'
                                            } <HiOutlineBadgeCheck size={16} className="text-[#00875A] shrink-0" />
                                        </span>
                                   
                                </div>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    <div className="rounded-lg bg-[#F2F4F6] px-4 py-2.5">
                                        <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest">
                                            Id Number
                                        </Paragraph>
                                        <Paragraph className="!text-xs font-bold text-[#191c1e] mt-0.5">
                                            {profile?.account_id}
                                        </Paragraph>
                                    </div>
                                    <div className="rounded-lg bg-[#F2F4F6] px-4 py-2.5">
                                        <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest">
                                            Joined
                                        </Paragraph>
                                        <Paragraph className="!text-xs font-bold text-[#191c1e] mt-0.5">
                                            {formatJoinedDate(profile?.created_at)}
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                            <DetailField label="Full Name" value={fullName} />
                            <DetailField label="Email" value={email} />
                            <DetailField label="Phone Number" value={phone} />
                            <DetailField label="Date of Birth" value={dob} />
                        </div>
                    </motion.div>

                    {/* Academic biography */}
                    <motion.div
                        {...fadeUp(0.12)}
                        className="rounded-2xl bg-[#F2F4F6] border border-gray-100 p-6"
                    >
                        <Paragraph className="!text-[13px] font-bold text-[#767683] uppercase tracking-widest mb-3">
                            Academic Biography
                        </Paragraph>
                        <Paragraph className="!text-sm text-[#454652] leading-relaxed">{bio}</Paragraph>
                    </motion.div>
                </div>

                {/* Right column */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                    {/* Qualifications */}
                    <motion.div
                        {...fadeUp(0.1)}
                        className="relative bg-gray-100 rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden"
                    >
                        {/* <Landmark
                            size={120}
                            className="absolute -top-2 -right-2 text-[#F2F4F6] pointer-events-none"
                            strokeWidth={1}
                        /> */}
                        <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-4 relative z-10">
                            Qualifications
                        </Paragraph>
                        <div className="flex flex-col gap-2 relative z-10">
                            {academics.length > 0 ? (
                                academics.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelectedQualification(item)}
                                            className="flex items-center justify-between w-full rounded-xl border border-gray-200 px-4 py-3.5 text-left bg-white"
                                        >
                                        <Paragraph className="!text-[15px] font-bold text-[#000B60]">
                                            {item.type || item.field_of_study || '—'}
                                        </Paragraph>
                                        <ChevronRight size={16} className="text-[#000B60] size-5 shrink-0 font-bold" />
                                    </button>
                                ))
                            ) : (
                                <Paragraph className="!text-sm text-[#767683]">No qualifications added yet.</Paragraph>
                            )}
                        </div>
                    </motion.div>

                    {/* Certificates */}
                    <motion.div
                        {...fadeUp(0.14)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    >
                        <Paragraph className="!text-[10px] font-bold text-[#767683] uppercase tracking-widest mb-4">
                            Certificates
                        </Paragraph>
                        <div className="flex flex-col gap-3">
                            {certificates.map((cert, i) => (
                                <div
                                    key={`${cert.name}-${i}`}
                                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#FAFBFF] px-3 py-3"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[#A8EDFF] flex items-center justify-center shrink-0">
                                        <FileText size={18} className="text-[#00A6BF]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Paragraph className="!text-sm font-bold text-[#191c1e] truncate">
                                            {cert.name.length > 18 ? `${cert.name.slice(0, 16)}..` : cert.name}
                                        </Paragraph>
                                        <Paragraph className="!text-xs text-[#767683] truncate">{cert.meta}</Paragraph>
                                    </div>
                                    <HiOutlineBadgeCheck size={22} className="text-[#00875A] shrink-0" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <Modal
                open={!!selectedQualification}
                onClose={() => setSelectedQualification(null)}
                title={'Qualification Details'}
                maxWidth="max-w-2xl"
            >
                {selectedQualification && (
                    <>
                        <div className="flex items-center gap-3 pb-1">
                            <div className="w-10 h-10 bg-[#DFE0FF] rounded-lg flex items-center justify-center shrink-0">
                                <GraduationCap size={18} className="text-[#000B60]" />
                            </div>
                            <div>
                                <Paragraph className="!text-base font-bold text-[#000B60]">
                                    {selectedQualification.field_of_study || '—'}
                                </Paragraph>
                                <Paragraph className="!text-sm text-[#767683]">
                                    {selectedQualification.type || '—'}
                                </Paragraph>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailField label="Degree Type" value={selectedQualification.type || '—'} />
                            <DetailField label="Field of Study" value={selectedQualification.field_of_study || '—'} />
                            <DetailField
                                label="Graduation Year"
                                value={formatGraduationYear(selectedQualification.graduation_year)}
                            />
                            <DetailField
                                label="Teaching Experience"
                                value={formatTeachingExperience(selectedQualification.teaching_experience)}
                            />
                        </div>

                        {selectedQualification.document_url ? (
                            <div className="flex items-center justify-between px-3 py-3 bg-[#F2F4F6] border border-gray-100 rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-[#A8EDFF] flex items-center justify-center shrink-0">
                                        <FileText size={18} className="text-[#00A6BF]" />
                                    </div>
                                    <div className="min-w-0">
                                        <Paragraph className="!text-sm font-bold text-[#191c1e] truncate">
                                            {certificateFileName(selectedQualification.document_url)}
                                        </Paragraph>
                                        <Paragraph className="!text-xs text-[#767683]">
                                            Degree Verification • {selectedQualification.type ?? 'Document'}
                                        </Paragraph>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <a
                                        href={selectedQualification.document_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#000B60]"
                                        aria-label="View certificate"
                                    >
                                        <Eye size={20} />
                                    </a>
                                    <a
                                        href={selectedQualification.document_url}
                                        download
                                        className="text-[#000B60]"
                                        aria-label="Download certificate"
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <Paragraph className="!text-sm text-[#767683]">No certificate uploaded for this qualification.</Paragraph>
                        )}
                    </>
                )}
            </Modal>
        </div>
    )
}

export default ProfilePage
