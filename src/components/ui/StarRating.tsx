import { Star } from 'lucide-react'

type StarRatingProps = {
  rating: number
  max?: number
  size?: number
}

const StarRating = ({ rating, max = 5, size = 14 }: StarRatingProps) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
)

export default StarRating
