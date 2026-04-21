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
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [identity, setIdentity] = useState<IdentityData>({
    firstName: '', lastName: '', email: '',
    phone: '', dob: '', bio: '',
  })
  const [qualifications, setQualifications] = useState<Qualification[]>([
    {
      id: '1',
      type: 'PhD',
      fieldOfStudy: 'Computer Science',
      graduationYear: '2018-06-15',
      teachingExperience: '6 Years',
      fileName: 'phd_certificate.pdf',
      fileSize: '2.4 MB',
    },
    {
      id: '2',
      type: 'Masters',
      fieldOfStudy: 'Artificial Intelligence',
      graduationYear: '2014-05-20',
      teachingExperience: '2 Years',
      fileName: 'masters_degree.pdf',
      fileSize: '1.8 MB',
    },
    {
      id: '3',
      type: 'Degree',
      fieldOfStudy: 'Mathematics',
      graduationYear: '2012-04-10',
      teachingExperience: '',
    },
  ])

  const goNext = (to: number) => { setDirection('forward'); setStep(to) }
  const goBack = (to: number | (() => void)) => {
    setDirection('back')
    typeof to === 'function' ? to() : setStep(to)
  }

  const animClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

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
        <VerificationStep
          key={step}
          identity={identity}
          qualifications={qualifications}
          onBack={() => goBack(2)}
          onSubmit={() => navigate('/dashboard')}
          animClass={animClass}
        />
      )}
    </div>
  )
}

export default OnboardingPage
