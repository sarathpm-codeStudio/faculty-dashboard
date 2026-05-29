import { Star } from 'lucide-react'

type StarRatingProps = {
  rating: number
  max?: number
  size?: number
}

const StarRating = ({ rating, max = 5, size = 14 }: StarRatingProps) => {
  const clampedRating = Math.min(max, Math.max(0, rating))

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const fillPercent = Math.min(100, Math.max(0, (clampedRating - i) * 100))

        return (
          <div
            key={i}
            className="relative shrink-0"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="text-gray-200 fill-gray-200"
            />
            {fillPercent > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  size={size}
                  className="text-orange-400 fill-orange-400"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StarRating
