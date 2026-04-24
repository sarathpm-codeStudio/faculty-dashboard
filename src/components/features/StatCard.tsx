import type { ReactNode } from 'react'

type StatCardProps = {
  icon: ReactNode
  label: string
  value: string
  valueColor?: string
  prefix?: string
  children?: ReactNode
}

const StatCard = ({ icon, label, value, valueColor = '#191c1e', prefix, children }: StatCardProps) => (
  <div className="flex flex-col justify-between rounded-lg bg-white p-6 shadow-sm border border-gray-100 min-h-[120px]">
    {icon && <div>{icon}</div>}
    <div>
      <p className="text-sm font-medium text-[#767683]">{label}</p>
      <div className="mt-0.5 flex items-center">
        {prefix && (
          <span className="text-2xl font-extrabold" style={{ color: valueColor }}>
            {prefix}
          </span>
        )}
        <span className="text-2xl font-extrabold" style={{ color: valueColor }}>
          {value}
        </span>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  </div>
)

export default StatCard
