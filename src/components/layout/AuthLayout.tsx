import type { ReactNode } from 'react'
import { Heading, Paragraph } from '@/components/ui'
import brandIcon from '@/assets/icons/brand_icon.svg'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            E
          </div>
          <Heading as="h1" size="lg">{title}</Heading>
          <Paragraph size="sm" className="mt-1">{subtitle}</Paragraph>
        </div> */}

        <div className="bg-white min-h-[500px]  rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="mt-[20px] mb-[30px] flex items-center justify-center mx-auto mb-4">
              <img src={brandIcon} alt="logo" className="w-28 h-auto object-contain" />
            </div>
            <Heading className='text-gray-900' as="h1" size="lg">{title}  </Heading>
            <Paragraph size="sm" className="mt-1 ">{subtitle}</Paragraph>
          </div>
          {children}
        </div>

        <div className="text-center mt-6">
          <Paragraph size="sm" className="text-gray-500">
            Need help accessing your portal? <a href="#" className="text-brand-from font-medium">Contact IT Support</a>
          </Paragraph>
        </div>

      </div>
    </div>
  )
}

export default AuthLayout
