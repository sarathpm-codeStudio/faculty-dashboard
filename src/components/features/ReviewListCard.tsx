import { CornerDownLeft } from 'lucide-react'
import { Paragraph, StarRating } from '../ui'

export type ReviewListCardProps = {
  avatar?: string
  name: string
  course: string
  courseColor?: string
  date: string
  rating: number
  review: string
  onReply?: () => void
}

const COURSE_TAG_COLORS: Record<string, { bg: string; text: string }> = {
  default: { bg: '#EEF0FF', text: '#000B60' },
  taxation: { bg: '#E6F7FF', text: '#0078C8' },
  accounting: { bg: '#E6FFF6', text: '#00875A' },
  law: { bg: '#FFF7E6', text: '#B76E00' },
  management: { bg: '#F3E6FF', text: '#6B21A8' },
  finance: { bg: '#FFF0F0', text: '#C0392B' },
}

const getCourseTagColor = (course: string) => {
  const lower = course.toLowerCase()
  if (lower.includes('tax')) return COURSE_TAG_COLORS.taxation
  if (lower.includes('account')) return COURSE_TAG_COLORS.accounting
  if (lower.includes('law')) return COURSE_TAG_COLORS.law
  if (lower.includes('manage')) return COURSE_TAG_COLORS.management
  if (lower.includes('finance')) return COURSE_TAG_COLORS.finance
  return COURSE_TAG_COLORS.default
}

const ReviewListCard = ({ avatar, name, course, date, rating, review, onReply }: ReviewListCardProps) => {
  const tagColor = getCourseTagColor(course)

  return (
    <div className="bg-white w-full rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {avatar ? (
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#BCC2FF] flex items-center justify-center shrink-0">
              <span className="text-[#000B60] font-bold text-base">{name.charAt(0)}</span>
            </div>
          )}
          {/* Name + course tag */}
          <div>
            <Paragraph className='font-bold' > {name} </Paragraph>
            <span
              className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ background: tagColor.bg, color: tagColor.text }}
            >
              {course}
            </span>
          </div>
        </div>

        {/* Stars + date */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StarRating rating={rating} size={13} />
          <p className="text-[11px] text-[#767683]">{date}</p>
        </div>
      </div>

      {/* Review text */}
      <Paragraph className='text-gray-500'> {review} </Paragraph>

      {/* Reply */}
      <button
        onClick={onReply}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#000B60] hover:underline underline-offset-2 w-fit"
      >
        <CornerDownLeft size={14} />
        Reply to Student
      </button>
    </div>
  )
}

export default ReviewListCard
