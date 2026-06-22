import { useState, useRef, useEffect } from 'react'
import { MoreVertical, BarChart2, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Paragraph, Subheading } from '../ui'
import { PiStackFill } from 'react-icons/pi'
import formatNumber from '@/utils/helper/numberFormating'

export type BundleCardProps = {
  id: number | string
  image_url?: string
  title: string
  coursesCount: number
  students: string
  revenue: string
  price: string
  final_price: string
  originalPrice: string
  totalStudents: number
  totalRevenue: number
  total_courses_count: number
  onViewAnalytics?: (id: number | string) => void
  onEdit?: (id: number | string) => void
  onDelete?: (id: number | string) => void
  onClick?: (id: number | string) => void
}

const BundleCard = ({
  id,
  image_url,
  title,
  coursesCount,
  students,
  revenue,
  price,
  final_price,
  total_courses_count,
  totalStudents,
  totalRevenue,
  originalPrice,
  onViewAnalytics,
  onEdit,
  onDelete,
  onClick,
}: BundleCardProps) => {
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
      className="h-full rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
      whileHover={{ y: -5, boxShadow: '0 16px 32px rgba(0, 11, 96, 0.12)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => onClick?.(id)}
    >
      <div className="relative">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-[#BCC2FF] to-[#2c1452]" />
        )}
      </div>

      <div className="px-3.5 py-2.5 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-[#00A6BF] text-xs font-semibold mb-1">
          <PiStackFill size={13} className="shrink-0" />
          <Paragraph className='text-[#00A6BF] font-semibold whitespace-nowrap'>{total_courses_count || 0} Courses Included</Paragraph>
        </div>

        <Subheading className="text-[#2c1452] font-bold mb-1.5 truncate">{title}</Subheading>

        <div className="flex items-center gap-3 mb-2 bg-[#F2F4F6] rounded-lg px-3 py-1">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-[#767683] font-semibold uppercase tracking-wide">Students</p>
            <Paragraph className="!text-xs font-bold text-[#2c1452] whitespace-nowrap">{formatNumber(totalStudents)}</Paragraph>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-[#767683] font-semibold uppercase tracking-wide">Revenue</p>
            <Paragraph className="!text-xs font-bold text-[#2c1452] whitespace-nowrap">₹{formatNumber(totalRevenue)}</Paragraph>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 mt-auto pt-0.5">
          <div className="min-w-0 leading-tight">
            <Paragraph className="text-[11px] text-[#767683] line-through font-bold whitespace-nowrap">₹{price}</Paragraph>
            <Subheading className="text-[#2c1452] font-bold whitespace-nowrap">₹{final_price}</Subheading>
          </div>

          <div className="relative shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1 rounded hover:bg-gray-100 text-[#2c1452]"
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
                {/* <button
                  onClick={() => { onViewAnalytics?.(id); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-[#191c1e] hover:bg-gray-50 flex items-center gap-2"
                >
                  <BarChart2 size={14} />
                  View Analytics
                </button> */}
                <button
                  onClick={() => { onEdit?.(id); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-[#191c1e] hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil size={14} />
                  Edit Bundle
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

export default BundleCard
