import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import IdentityStep from '@/pages/onboarding/IdentityStep'
import QualificationStep from '@/pages/onboarding/QualificationStep'
import IdVerificationStep from '@/pages/onboarding/IdVerificationStep'
import type { IdentityData, Qualification, IdVerificationData } from '@/pages/onboarding'
import { profileService, type AcademicProfile } from '@/services/profileService'
import { onBoardingService } from '@/services/onBoardingService'
import { formatDate, graduationDateToInput } from '@/utils/helper/formatDate'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui'

const isoToInputDate = (iso?: string): string => {
    if (!iso) return ''
    if (iso.includes('T')) return iso.split('T')[0] ?? ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
}

const certificateFileName = (url?: string | null) => {
    if (!url) return ''
    return url.split('/').pop() ?? 'Certificate'
}

const mapAcademicToQualification = (a: AcademicProfile): Qualification => ({
    id: a.id,
    type: a.type ?? '',
    fieldOfStudy: a.field_of_study ?? '',
    graduationYear: graduationDateToInput(a.graduation_year),
    teachingExperience: a.teaching_experience != null ? String(a.teaching_experience) : '',
    document_url: a.document_url ?? undefined,
    fileName: certificateFileName(a.document_url),
    fileSize: '',
    isExisting: true,
})

const EditProfilePage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const authUser = useAuthStore((s) => s.user)
    const setAuthProfile = useAuthStore((s) => s.setProfile)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)
    const [direction, setDirection] = useState<'forward' | 'back'>('forward')
    const [initialExistingIds, setInitialExistingIds] = useState<string[]>([])
    const [accountVerified, setAccountVerified] = useState('')

    const [identity, setIdentity] = useState<IdentityData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        bio: '',
        avatar_url: '',
    })
    const [qualifications, setQualifications] = useState<Qualification[]>([])
    const [idVerification, setIdVerification] = useState<IdVerificationData>({
        document_type: '',
        document_url: '',
        fileName: '',
        fileSize: '',
    })

    const userId = authUser?.id
    const isRejected = accountVerified === 'REJECTED'

    useEffect(() => {
        const load = async () => {
            if (!userId) {
                setLoading(false)
                navigate('/account')
                return
            }
            try {
                const [profile, academics, idDoc] = await Promise.all([
                    profileService.getProfile(userId),
                    profileService.getAcademicProfiles(userId),
                    profileService.getIdVerification(userId),
                ])
                if (!profile) {
                    toast.error('Profile not found')
                    navigate('/account')
                    return
                }

                const verified = profile.account_verified ?? ''
                setAccountVerified(verified)

                const requestedStep = (location.state as { step?: number } | null)?.step
                if (requestedStep === 3 && verified === 'REJECTED') {
                    setStep(3)
                }

                setIdentity({
                    first_name: profile.first_name ?? '',
                    last_name: profile.last_name ?? '',
                    email: profile.email ?? authUser?.email ?? '',
                    phone: profile.phone ?? '',
                    date_of_birth: isoToInputDate(profile.date_of_birth),
                    bio: profile.bio ?? '',
                    avatar_url: profile.avatar_url ?? '',
                })

                const mapped = academics.map(mapAcademicToQualification)
                setQualifications(mapped)
                setInitialExistingIds(mapped.map((q) => q.id))

                if (idDoc) {
                    setIdVerification({
                        document_type: (idDoc.document_type as IdVerificationData['document_type']) ?? '',
                        document_url: idDoc.document_url ?? '',
                        fileName: certificateFileName(idDoc.document_url),
                        fileSize: '',
                    })
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to load profile'
                toast.error(message)
                navigate('/account')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [userId, navigate, authUser?.email, location.state])

    const goNext = () => {
        setDirection('forward')
        setStep(2)
    }

    const goToIdStep = () => {
        setDirection('forward')
        setStep(3)
    }

    const goBack = (to: number) => {
        setDirection('back')
        setStep(to)
    }

    const animClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

    const handleSave = async (latestId?: IdVerificationData) => {
        if (!userId) return
        if (qualifications.length === 0) {
            toast.error('Please keep or add at least one qualification')
            return
        }

        const idData = latestId ?? idVerification
        if (isRejected) {
            if (!idData.document_type || !idData.document_url) {
                toast.error('Please upload your ID document to resubmit verification')
                return
            }
        }

        setSaving(true)
        try {
            await profileService.updateProfile(userId, {
                first_name: identity.first_name,
                last_name: identity.last_name,
                date_of_birth: formatDate(identity.date_of_birth),
                bio: identity.bio,
                avatar_url: identity.avatar_url,
            })

            const keptExistingIds = qualifications.filter((q) => q.isExisting).map((q) => q.id)
            const toDelete = initialExistingIds.filter((id) => !keptExistingIds.includes(id))
            await profileService.deleteAcademicProfiles(toDelete)

            const newQualifications = qualifications.filter((q) => !q.isExisting)
            if (newQualifications.length > 0) {
                await onBoardingService.createAcademicProfiles(newQualifications, userId)
            }

            if (isRejected) {
                await profileService.updateIdVerification(userId, {
                    document_type: idData.document_type,
                    document_url: idData.document_url,
                })
            }

            const fullName = `${identity.first_name} ${identity.last_name}`.trim()
            if (authUser) {
                setAuthProfile({
                    ...authUser,
                    name: fullName || authUser.name,
                    email: identity.email || authUser.email,
                    avatar_url: identity.avatar_url || authUser.avatar_url,
                })
            }

            toast.success(
                isRejected
                    ? 'Profile updated and ID resubmitted for review'
                    : 'Profile updated successfully',
            )
            navigate('/account')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update profile'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    const handleQualificationsContinue = async () => {
        if (isRejected) {
            goToIdStep()
            return
        }
        await handleSave()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8F9FB]">
                <Spinner label="Loading profile..." />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {step === 1 && (
                <IdentityStep
                    key="edit-identity"
                    mode="edit"
                    data={identity}
                    onChange={setIdentity}
                    onNext={goNext}
                    onBack={() => navigate('/account')}
                    animClass={animClass}
                />
            )}
            {step === 2 && (
                <QualificationStep
                    key="edit-qualifications"
                    mode="edit"
                    qualifications={qualifications}
                    onChange={setQualifications}
                    onNext={handleQualificationsContinue}
                    onBack={() => goBack(1)}
                    animClass={animClass}
                    saving={saving && !isRejected}
                    showIdResubmitStep={isRejected}
                />
            )}
            {step === 3 && isRejected && (
                <IdVerificationStep
                    key="edit-id"
                    mode="edit"
                    data={idVerification}
                    onChange={setIdVerification}
                    onNext={handleSave}
                    onBack={() => goBack(2)}
                    animClass={animClass}
                    saving={saving}
                />
            )}
        </div>
    )
}

export default EditProfilePage
