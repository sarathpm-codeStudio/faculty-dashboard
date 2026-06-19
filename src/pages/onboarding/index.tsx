import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IdentityStep from './IdentityStep'
import QualificationStep from './QualificationStep'
import IdVerificationStep from './IdVerificationStep'
import PolicyStep, { PolicyAcceptance } from './PolicyStep'
import VerificationStep from './VerificationStep'
import { onBoardingService } from '@/services/onBoardingService'
import { notificationService } from '@/services/notificationService'
import { toast } from 'sonner'
import { formatDate } from '@/utils/helper/formatDate'
import { useAuthStore } from '@/store/authStore'

export interface IdentityData {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  bio: string
  avatar_url: string
}

export interface Qualification {
  id: string
  type: string
  fieldOfStudy: string
  graduationYear: string
  teachingExperience: string
  document_url?: string
  fileName?: string
  fileSize?: string
  /** Set for qualifications loaded from the database (read-only; remove or keep only). */
  isExisting?: boolean
}

export type OnboardingStepMode = 'onboarding' | 'edit'

export type DocumentType = 'aadhar_card' | 'license' | 'passport' | 'voter_id' | ''

export interface IdVerificationData {
  document_type: DocumentType
  document_url: string
  fileName?: string
  fileSize?: string
}

const OnboardingPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  // Phone number the user signed in with — auto-filled and locked in the form.
  const loginPhone = useAuthStore((state) => state.user?.phone) ?? ''
  const normalizedPhone = loginPhone && !loginPhone.startsWith('+') ? `+${loginPhone}` : loginPhone

  const [identity, setIdentity] = useState<IdentityData>({
    first_name: '', last_name: '', email: '',
    phone: normalizedPhone, date_of_birth: '', bio: '', avatar_url: '',
  })
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [idVerification, setIdVerification] = useState<IdVerificationData>({
    document_type: '', document_url: '', fileName: '', fileSize: '',
  })
  const [policies, setPolicies] = useState<PolicyAcceptance>({
    accepted: false,
  })

  const goNext = (to: number) => { setDirection('forward'); setStep(to) }
  const goBack = (to: number | (() => void)) => {
    setDirection('back')
    typeof to === 'function' ? to() : setStep(to)
  }

  const animClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

  const id = useAuthStore((state) => state.user?.id)


  const handleVerificationSubmit = async () => {

    try {

      // creae profile


      const result = await onBoardingService.createProfile({
        ...identity,
        role: "FACULTY",
        account_verified: "PENDING",
        is_policies_accepted: policies.accepted,
        date_of_birth: formatDate(identity.date_of_birth),
      }, id)

      if (result) {
        // add qualifications
        await onBoardingService.createAcademicProfiles(qualifications, id)
        // add id verification
        await onBoardingService.createIdVerification(idVerification, id)

        // Notify admins of the new faculty, but don't block onboarding on it.
        try {
          await notificationService.notifyAdminsFacultyOnboarded({
            id,
            name: `${identity.first_name ?? ''} ${identity.last_name ?? ''}`.trim(),
          })
        } catch (notifyError) {
          console.error("Failed to notify admins of faculty onboarding:", notifyError)
        }

        toast.success("Profile created successfully")
        navigate("/dashboard")
      }


    } catch (error: any) {

      toast.error(error.message || "Something went wrong")

    }
  }



  return (
    <div className="min-h-screen">
      {step === 1 && (
        <IdentityStep
          key={step}
          data={identity}
          onChange={setIdentity}
          onNext={() => goNext(2)}
          onBack={() => goBack(() => navigate('/auth'))}
          animClass={animClass}
        />
      )}
      {step === 2 && (
        <QualificationStep
          key={step}
          qualifications={qualifications}
          onChange={setQualifications}
          onNext={() => goNext(3)}
          onBack={() => goBack(1)}
          animClass={animClass}
        />
      )}
      {step === 3 && (
        <IdVerificationStep
          key={step}
          data={idVerification}
          onChange={setIdVerification}
          onNext={() => goNext(4)}
          onBack={() => goBack(2)}
          animClass={animClass}
        />
      )}
      {step === 4 && (
        <PolicyStep
          key={step}
          data={policies}
          onChange={setPolicies}
          onNext={() => goNext(5)}
          onBack={() => goBack(3)}
          animClass={animClass}
        />
      )}
      {step === 5 && (
        <VerificationStep
          key={step}
          identity={identity}
          qualifications={qualifications}
          onBack={() => goBack(4)}
          onSubmit={handleVerificationSubmit}
          animClass={animClass}
        />
      )}
    </div>
  )
}

export default OnboardingPage
