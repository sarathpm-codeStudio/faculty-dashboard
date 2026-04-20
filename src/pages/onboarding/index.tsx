


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IdentityStep from './IdentityStep'
import QualificationStep from './QualificationStep'
import VerificationStep from './VerificationStep'

export interface IdentityData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  bio: string
}

export interface Qualification {
  id: string
  type: string
  fieldOfStudy: string
  graduationYear: string
  teachingExperience: string
  fileName?: string
  fileSize?: string
}

const OnboardingPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [identity, setIdentity] = useState<IdentityData>({
    firstName: '', lastName: '', email: '',
    phone: '', dob: '', bio: '',
  })

  const [qualifications, setQualifications] = useState<Qualification[]>([])

  const goNext = () => setStep((s) => s + 1)
  const goBack = () => setStep((s) => s - 1)

  const handleSubmit = () => {
    // Mock submit — go to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {step === 1 && (
        <IdentityStep
          data={identity}
          onChange={setIdentity}
          onNext={goNext}
          onBack={() => navigate('/auth')}
        />
      )}
      {step === 2 && (
        <QualificationStep
          qualifications={qualifications}
          onChange={setQualifications}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 3 && (
        <VerificationStep
          identity={identity}
          qualifications={qualifications}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default OnboardingPage