import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreVertical, Download, SlidersHorizontal, Tag, Users, PiggyBank } from 'lucide-react'
import { IoAddCircleOutline } from 'react-icons/io5'
import { Button, Heading, Paragraph, DataTable, Spinner } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import { StatCard } from '@/components/features'
import { useGetAllCoupons } from '@/hooks/coupons'
import { formatDateTime } from '@/utils/helper/formatDate'

type CouponStatus = 'Active' | 'Draft' | 'Expired'

type Coupon = {
  id: number
  code: string
  discount_type: 'PERCENTAGE' | 'FLAT'
  discount: number
  is_all_courses: boolean
  max_usage: number
  usage_per_person: number
  used_count: number
  created_at: string
  expire_date: string
  is_active: boolean
}



const STATUS_STYLES: Record<CouponStatus, string> = {
  Active: 'text-[#00875A]',
  Expired: 'text-[#BA1A1A]',
  Draft: 'text-[#767683]',
}

type FilterTab = 'active' | 'deactivate' |'expired'
const FILTER_TABS: FilterTab[] = ['active', 'deactivate', 'expired']



const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay, ease: 'easeOut' as const },
})

const CouponsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab | null>("active")
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [rangeLabel, setRangeLabel] = useState('')


  const COLUMNS: TableColumn<Coupon>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      render: row => <span className="text-sm font-bold text-[#000B60]">{row.code}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: row => <span className="text-sm text-[#767683]">{row?.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Flat'}</span>,
    },
    {
      key: 'discountValue',
      header: 'Discount Value',
      render: row => <span className="text-sm font-semibold text-[#191c1e]">{row?.discount_type === 'PERCENTAGE' ? `${row.discount}%` : `₹${row.discount}`}</span>,
    },
    {
      key: 'applicableCourses',
      header: 'Applicable Courses',
      render: row => <span className="text-sm text-[#767683]">{row?.is_all_courses === true ? 'All' : "Selected"}</span>,
    },
    {
      key: 'usage',
      header: 'Max Usage',
      render: row => <span className="text-sm text-[#767683]">{row?.max_usage}</span>,
    },
    {
      key: 'usage',
      header: 'Usage Per Person',
      render: row => <span className="text-sm text-[#767683]">{row?.usage_per_person}</span>,
    },
    {
      key: 'usage',
      header: 'Used Count',
      render: row => <span className="text-sm text-[#767683]">{row?.used_count ?? 0}</span>,
    },
    {
      key: 'createdDate',
      header: 'Created Date',
      render: row => <span className="text-sm text-[#767683]">{formatDateTime(row?.created_at)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: row => <span className="text-sm text-[#767683]">{formatDateTime(row?.expire_date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <span className={`text-sm font-bold`}>{row?.is_active ? 'Active' : 'Inactive'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: () => (
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreVertical size={15} className="text-[#767683]" />
        </button>
      ),
    },
  ]


  // query
  const { data: coupons, isLoading: couponsLoading } = useGetAllCoupons(
    { filter:activeFilter,
      search:'', 
      page,
      limit: pageSize,
    }, true
  )



  const filtered = coupons?.data?.data ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <motion.div className="flex items-start justify-between mb-5 px-2 pt-2" {...fadeUp(0.04)}>
        <div>
          <Heading className="text-[#000B60]">Coupon Management</Heading>
          <Paragraph className="text-[#767683] mt-1">
            Create and manage academic promotion campaigns and discount codes.
          </Paragraph>
        </div>
        <Button variant="primary" className="!h-10 !text-sm !px-5 shrink-0" onClick={() => navigate('/coupon-management/create')}>
          <IoAddCircleOutline size={20} /> Create New Coupon
        </Button>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="grid grid-cols-3 gap-4 mb-5 px-2" {...fadeUp(0.08)}>
        <StatCard
          icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#BCC2FF]"><Tag className="text-[#000B60]" size={20} /></div>}
          label="Active Coupons"
          value="24"
        />
        <StatCard
          icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#CCE5FF]"><Users className="text-[#1565C0]" size={20} /></div>}
          label="Total Redeemed Users"
          value="1,482"
        />
        <StatCard
          icon={<div className="flex h-10 w-12 items-center justify-center rounded-[8px] bg-[#CCFFE8]"><PiggyBank className="text-[#00875A]" size={20} /></div>}
          label="Total Savings Generated"
          value="12,450.00"
          prefix="₹"
        // valueColor="#00875A"
        />
      </motion.div>

      {/* Filter bar */}
      <motion.div className="flex items-center justify-between mb-4 px-2" {...fadeUp(0.1)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#767683]">Filter by:</span>
          <div className="flex items-center gap-1 bg-[#F2F4F6] rounded-xl p-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(activeFilter === tab ? null : tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeFilter === tab ? 'bg-white text-[#000B60]' : 'text-[#767683] hover:text-[#000B60]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-[#767683] font-semibold hover:text-[#000B60] transition-colors">
            <SlidersHorizontal size={14} />
            Advanced
          </button>
          <button className="flex items-center gap-1.5 text-sm text-[#767683] font-semibold hover:text-[#000B60] transition-colors">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="flex-1 min-h-0 px-2" {...fadeUp(0.12)}>
        <DataTable
          columns={COLUMNS}
          data={coupons?.data?.coupons ?? []}
          total={coupons?.data?.pagination?.total ?? 0}
            page={page}
            loading={couponsLoading}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            onRangeChange={(s, e, t) => setRangeLabel(`Showing ${s} to ${e} of ${t}`)}
        />
      </motion.div>

      {rangeLabel && (
        <p className="text-xs text-[#767683] px-4 py-2 font-medium">{rangeLabel}</p>
      )}

    </div>
  )
}

export default CouponsPage
