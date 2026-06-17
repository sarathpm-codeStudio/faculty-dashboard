import { Landmark, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetBankDetails } from '@/hooks/bank'

const BankDetailsWidget = () => {
  const navigate = useNavigate()
  const { data: bankDetails, isLoading } = useGetBankDetails()

  // Don't show anything while loading or if bank details already exist
  if (isLoading || bankDetails?.data) return null

  return (
    <button
      onClick={() => navigate('/account/bank/add-bank-details')}
      className="group flex w-full items-center gap-3 rounded-lg border border-[#FFDAD6] bg-[#FFF4F2] px-4 py-3 text-left transition-colors hover:bg-[#FFEAE6]"
    >
      <Landmark className="shrink-0 text-[#BA1A1A]" size={20} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#2c1452]">
          Complete your payout setup
        </p>
        <p className="text-xs font-medium text-[#767683]">
          Add your verified bank account to start receiving course earnings securely.
        </p>
      </div>
      <span className="flex items-center gap-1 text-sm font-bold text-[#BA1A1A]">
        Set up now
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

export default BankDetailsWidget
