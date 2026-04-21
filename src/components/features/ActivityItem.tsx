// Reusable — used in: Dashboard

type ActivityItemProps = {
  avatarSrc?: string
  avatarFallback: string
  avatarBg?: string
  name: string
  detail: string
  time: string
  showDivider?: boolean
}

const ActivityItem = ({
  avatarSrc,
  avatarFallback,
  avatarBg = '#C6C5D4',
  name,
  detail,
  time,
  showDivider = true,
}: ActivityItemProps) => (
  <div className="relative flex gap-4" style={{ minHeight: showDivider ? '87px' : undefined }}>
    {/* Avatar column */}
    <div className="relative shrink-0">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name}
          className="h-10 w-10 rounded-xl object-cover"
        />
      ) : (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
          style={{ backgroundColor: avatarBg }}
        >
          {avatarFallback}
        </div>
      )}
      {showDivider && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[rgba(198,197,212,0.2)]" />
      )}
    </div>

    {/* Text */}
    <div>
      <p className="text-sm font-bold text-[#191c1e]">{name}</p>
      <p className="text-xs text-[#454652]">{detail}</p>
      <p className="mt-1 text-[10px] text-[#767683]">{time}</p>
    </div>
  </div>
)

export default ActivityItem
