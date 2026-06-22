import { useState, useRef, useEffect } from 'react'
import { Clock, Users, MoreVertical, BarChart2, Pencil, Trash2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Paragraph, Subheading } from '../ui'
import { useNavigate } from 'react-router-dom'
import formatNumber from '@/utils/helper/numberFormating'

export type CourseCardProps = {
  id: any
  cover_image?: string
  title: string
  duration: string
  validity: string
  students: string
  price: string
  total_enrolled: number
  final_price: string
  originalPrice: string
  category?: string
  description?: string
  status?: string
  selectable?: boolean
  selected?: boolean
  onViewAnalytics?: (id: number | string) => void
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
  onClick?: (id: number | string) => void
}

const CourseCard = ({
  id,
  cover_image,
  title,
  duration,
  students,
  price,
  total_enrolled,
  validity,
  originalPrice,
  final_price,
  category,
  description,
  status,
  selectable = false,
  selected = false,
  onViewAnalytics,
  onEdit,
  onDelete,
  onClick,
}: CourseCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.div
      className={`h-full rounded-xl bg-white shadow-sm border overflow-hidden flex flex-col cursor-pointer transition-colors border-gray-100`}
      whileHover={{ y: -5, boxShadow: '0 16px 32px rgba(0, 11, 96, 0.12)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => onClick?.(id)}
    >
      <div className="relative">
        {cover_image ? (
          <img src={cover_image} alt={title} className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-[#BCC2FF] to-[#2c1452]" />
        )}
        {status === 'RESUBMIT' && (
          <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500 text-white shadow">
            Resubmitted
          </div>
        )}
        {selectable && selected && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#2c1452] flex items-center justify-center shadow">
            <Check size={14} color="white" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex flex-col flex-1">
        {category && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{category}</span>
            {/* {duration && <span className="text-[10px] text-gray-400 font-medium">{duration}</span>} */}
          </div>
        )}

        <Subheading className='text-[#2c1452] font-bold truncate'>{title}</Subheading>

        {/* {description ? (
          <Paragraph className="text-gray-400 !text-xs mb-2">
            {description.length > 30 ? description.slice(0, 30) + '...' : description}
          </Paragraph>
        ) : (
          <div className="flex items-center gap-3 text-[11px] text-gray-700 font-bold mb-3">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {students}
            </span>
          </div>
        )} */}

        {!selectable && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 mt-1.5'>
            <div className='flex items-center gap-1.5'>
              <Clock size={13} className="shrink-0 text-gray-400" />
              <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap">{
                validity === '1' ? '1 Month' : validity === '3' ? '3 Months' : validity === '6' ? '6 Months' : validity === '12' ? '1 Year' : 'Lifetime'
              }</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Users size={13} className="shrink-0 text-gray-400" />
              <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap">{formatNumber(total_enrolled || 0)} Students</span>
            </div>
          </div>
        )}

        <div className='w-full h-px bg-gray-100' />

        <div className="flex items-center justify-between gap-2 mt-auto pt-2.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <Paragraph className='text-[#2c1452] font-bold !text-[20px] whitespace-nowrap'>
              ₹{final_price}</Paragraph>
            <span className="text-[14px] text-[#767683] line-through font-bold whitespace-nowrap">₹{price}</span>
          </div>

          {!selectable && (
            <div className="relative shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1 rounded hover:bg-gray-100 text-[#2c1452] font-bold"
              >
                <MoreVertical size={20} />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1"
                >
                  <button
                    onClick={() => { onViewAnalytics?.(id); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-[#191c1e] hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BarChart2 size={14} />
                    View Analytics
                  </button>
                  <button
                    onClick={() => { navigate(`/courses/${id}/edit`); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-[#191c1e] hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil size={14} />
                    Edit Course
                  </button>
                  <button
                    onClick={() => { onDelete?.(id); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CourseCard
