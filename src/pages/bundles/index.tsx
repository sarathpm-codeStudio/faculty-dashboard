import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { IoAddCircleOutline } from 'react-icons/io5'
import Button from '../../components/ui/Button'
import { BundleCard } from '../../components/features'
import type { BundleCardProps } from '../../components/features/BundleCard'
import { Heading, Spinner } from '@/components/ui'
import courseImg from '@/assets/images/cou1.png'
import courseImg2 from '@/assets/images/cou2.png'
import courseImg3 from '@/assets/images/cou3.png'
import { useGetAllBundles } from "@/hooks/useBundle"

type Bundle = Omit<BundleCardProps, 'onViewAnalytics' | 'onEdit' | 'onDelete'> & {
  status: 'published' | 'draft'
}



type Tab = 'published' | 'drafts'

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
}

const BundlesPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('published')
  const [isLoading, setIsLoading] = useState(true)



  // query for all bundles
  const { data: bundles, isLoading: bundlesLoading } = useGetAllBundles({ filter: activeTab === "published" ? false : true })

  console.log(bundles)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [activeTab])

  // const filtered = MOCK_BUNDLES.filter(b => b.status === (activeTab === 'published' ? 'published' : 'draft'))

  return (
    <div className="p-8">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Heading className="text-[#000b60]">
          Course Bundles ({String(bundles?.data?.length || 0).padStart(2, '0')})
        </Heading>

        <Button
          variant="primary"
          className="!h-10 !text-sm !px-4 !font-semibold"
          onClick={() => navigate('/bundles/create')}
        >
          <IoAddCircleOutline size={20} />
          Create New Bundle
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
      >
        {(['published', 'drafts'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${activeTab === tab
              ? 'bg-white text-[#000B60] shadow-sm'
              : 'text-[#767683] hover:text-[#191c1e]'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {bundlesLoading ? (
          <motion.div
            key="spinner"
            className="flex items-center justify-center min-h-[50vh] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Spinner size={44} label="Loading bundles..." />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {bundles?.data?.map((bundle: any) => (
              <motion.div key={bundle.id} variants={cardVariants}>
                <BundleCard
                  {...bundle}
                  onViewAnalytics={id => console.log('Analytics', id)}
                  onEdit={id => navigate(`/bundles/${id}/edit`)}
                  onDelete={id => console.log('Delete', id)}
                  onClick={id => console.log('Open bundle', id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BundlesPage
