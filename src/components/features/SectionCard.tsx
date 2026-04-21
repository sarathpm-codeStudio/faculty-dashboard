// Reusable — used in: Dashboard
import type { ReactNode } from 'react'
import { Paragraph, Subheading } from '../ui'

type SectionCardProps = {
  title: string
  title_color?: string
  subtitle?: string
  rightContent?: ReactNode
  children: ReactNode
  className?: string
}

const SectionCard = ({ title, title_color, subtitle, rightContent, children, className = '' }: SectionCardProps) => (
  <div className={`rounded-lg bg-white p-8 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <Subheading className={`font-bold ${title_color}`}> {title} </Subheading>
        {/* <h2 className="text-lg font-bold text-[#191c1e]">{title}</h2> */}
        {subtitle && <Paragraph className='text-[#767683] '> {subtitle} </Paragraph>
          //  <p className="mt-1 text-sm text-[#767683]">{subtitle}</p>
        }
      </div>
      {rightContent && <div className="ml-4 shrink-0">{rightContent}</div>}
    </div>
    <div className="mt-6">{children}</div>
  </div>
)

export default SectionCard
