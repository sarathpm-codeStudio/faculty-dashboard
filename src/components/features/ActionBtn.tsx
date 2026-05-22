

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, BarChart2, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

type ActionsMenuProps = {
    id: number
    editPath: string
    onEdit?: (id: number) => void
    onViewAnalytics?: (id: number) => void
    onDelete?: (id: number) => void
    isAnalytic?: boolean
}

const ActionsMenu = ({ id, editPath, onEdit, onViewAnalytics, onDelete, isAnalytic = true }: ActionsMenuProps) => {
    const [open, setOpen] = useState(false)
    const [openUpward, setOpenUpward] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!open && ref.current) {
            // Check space below vs above
            const rect = ref.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const menuHeight = 120 // approximate menu height in px
            setOpenUpward(spaceBelow < menuHeight)
        }

        setOpen(prev => !prev)
    }

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={handleToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <MoreVertical size={16} className="text-[#767683]" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: openUpward ? 6 : -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: openUpward ? 6 : -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute right-0 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                            }`}
                    >
                        {
                            isAnalytic && (
                                <button
                                    onClick={e => { e.stopPropagation(); onViewAnalytics?.(id); setOpen(false) }}
                                    className="w-full text-left px-4 py-2 text-sm text-[#191c1e] hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <BarChart2 size={14} />
                                    View Analytics
                                </button>
                            )
                        }
                        <button
                            onClick={e => {
                                e.stopPropagation()
                                if (onEdit) {
                                    onEdit(id)
                                } else {
                                    navigate(editPath)
                                }
                                setOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-[#191c1e] hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Pencil size={14} />
                            Edit
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); onDelete?.(id); setOpen(false) }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ActionsMenu