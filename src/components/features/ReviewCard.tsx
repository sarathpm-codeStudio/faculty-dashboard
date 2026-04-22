import { Star } from 'lucide-react'

export type ReviewCardProps = {
  avatar?: string
  name: string
  date: string
  rating: number
  review: string
}

const ReviewCard = ({ avatar, name, date, rating, review }: ReviewCardProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      {avatar ? (
        <img src={avatar} alt={name} className="w-12 h-12 rounded-xl  object-cover shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-[#BCC2FF] flex items-center justify-center shrink-0">
          <span className="text-[#000B60] font-bold text-sm">{name.charAt(0)}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="font-bold text-[#191c1e] text-sm truncate">{name}</p>
        <p className="text-[11px] text-[#767683]">{date}</p>
      </div>
      <div className="ml-auto flex items-center gap-0.5 shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
    </div>
    <p className="text-xs text-[#767683] leading-relaxed">{review}</p>
  </div>
)

export default ReviewCard
