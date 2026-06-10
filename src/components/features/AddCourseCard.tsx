import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

type AddCourseCardProps = {
  onClick?: () => void
}

const AddCourseCard = ({ onClick }: AddCourseCardProps) => (
  <motion.button
    onClick={onClick}
    className="rounded-xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-2 min-h-[220px] w-full"
    whileHover={{
      borderColor: '#2c1452',
      backgroundColor: '#f5f6ff',
      y: -5,
      boxShadow: '0 16px 32px rgba(0, 11, 96, 0.08)',
    }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
  >
    <motion.div
      className="w-10 h-10 rounded-full bg-[#eef0ff] flex items-center justify-center"
      whileHover={{ scale: 1.15, backgroundColor: '#dde0ff' }}
      transition={{ duration: 0.18 }}
    >
      <Plus size={20} color="#2c1452" strokeWidth={2.5} />
    </motion.div>
    <p className="font-bold text-[#191c1e] text-sm">Add New Course</p>
    <p className="text-xs text-[#767683]">Start a new curriculum</p>
  </motion.button>
)

export default AddCourseCard
