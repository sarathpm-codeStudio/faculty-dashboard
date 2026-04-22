import { useState, useRef, useEffect } from 'react'
import { Clock, Users, MoreVertical, BarChart2, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Paragraph, Subheading } from '../ui'

export type CourseCardProps = {
  id: number | string
  image?: string
  title: string
  duration: string
  students: string
  price: string
  originalPrice: string
  onViewAnalytics?: (id: number | string) => void
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
  onClick?: (id: number | string) => void
}

const CourseCard = ({
  id,
  image,
  title,
  duration,
  students,
  price,
  originalPrice,
  onViewAnalytics,
  onEdit,
  onDelete,
  onClick,
}: CourseCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
      className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
      whileHover={{ y: -5, boxShadow: '0 16px 32px rgba(0, 11, 96, 0.12)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => onClick?.(id)}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-50 object-cover" />
      ) : (
        <div className="w-full h-50 bg-gradient-to-br from-[#BCC2FF] to-[#142283]" />
      )}

      <div className="p-4 flex flex-col flex-1">
        <Subheading className='text-[#000b60] font-bold' > {title} </Subheading>
        {/* <p className="font-bold text-[#191c1e] text-xs leading-snug mb-2">{title}</p> */}

        <div className="flex items-center gap-3 text-[11px] text-gray-700 font-bold mb-3">
          <span className="flex items-center gap-1 ">
            <Clock size={11} />
            {duration}
          </span>
          <span className="flex items-center gap-1 ">
            <Users size={11} />
            {students}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <Paragraph className='text-[#000b60] font-bold !text-[20px]' > {price} </Paragraph>
            {/* <span className="font-bold text-[#191c1e] text-xs">{price}</span> */}
            <span className="text-[11px] text-[#767683] line-through font-bold">{originalPrice}</span>
          </div>

          <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1 rounded hover:bg-gray-100 text-[#000b60] font-bold"
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
                  onClick={() => { onEdit?.(id); setMenuOpen(false) }}
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
        </div>
      </div>
    </motion.div>
  )
}

export default CourseCard
