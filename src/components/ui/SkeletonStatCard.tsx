import Skeleton from './Skeleton'

type SkeletonStatCardProps = {
  showIcon?: boolean
  showFooter?: boolean
}

const SkeletonStatCard = ({ showIcon = false, showFooter = true }: SkeletonStatCardProps) => (
  <div className="flex flex-col justify-between rounded-lg bg-white p-6 shadow-sm border border-gray-100 min-h-[120px]">
    {showIcon && <Skeleton className="h-7 w-7 rounded-full mb-4" />}
    <div>
      <Skeleton className="h-4 w-28 mb-2" />
      <Skeleton className="h-8 w-24" />
      {showFooter && (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      )}
    </div>
  </div>
)

export default SkeletonStatCard
