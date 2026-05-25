// Reusable — used in: Dashboard

type CoursePerformanceRowProps = {
  title: string
  students: string
  revenue: string
  label?: string
  isLoading?: boolean
}

const CoursePerformanceRow = ({
  title,
  students,
  revenue,
  label = 'TOTAL PURCHASED',
  isLoading = false,
}: CoursePerformanceRowProps) => (
  <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
    <div>
      <p className="text-base font-bold text-[#191c1e]">{title}</p>
      <p className="mt-0.5 text-sm font-medium text-[#454652]">{students} Students</p>
    </div>
    <div className="text-right">
      <p className="text-lg font-extrabold text-[#1a237e]">{revenue}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#767683]">{label}</p>
    </div>
  </div>
)

export default CoursePerformanceRow
