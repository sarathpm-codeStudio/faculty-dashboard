
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponServices } from '@/services/couponServices'
import { CreateCouponPayload } from '@/types/coupons.type'

export const useGetAllCouponsEnabledCourses = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['coupons-enabled-courses'],
        queryFn: () => couponServices.getAllCouponsEnabledCourses(),
        enabled,
    })
}


export const useCreateCoupon = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['coupon'],
      mutationFn: (payload: CreateCouponPayload) => couponServices.createCoupon(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
    })
  }

export const useGetAllCoupons = (payload: any, enabled: boolean = true) => {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ['coupons', payload],
        queryFn: () => couponServices.getAllCoupons(payload),
        enabled,
    })
}
  
  



