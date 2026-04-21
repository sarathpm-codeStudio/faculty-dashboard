// Reusable — used in: Dashboard
import type { ReactNode } from 'react'

type StatCardProps = {
  icon: ReactNode
  label: string
  value: string
  valueColor?: string
  prefix?: string
}

const StatCard = ({ icon, label, value, valueColor = '#191c1e', prefix }: StatCardProps) => (
  <div className="flex h-[172px] flex-col justify-between rounded-lg bg-white p-6 shadow-sm border border-gray-100">
    <div>{icon}</div>
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
    </div>
  </div>
)

export default StatCard
