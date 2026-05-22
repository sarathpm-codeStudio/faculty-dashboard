
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['coupons'] })
        queryClient.invalidateQueries({ queryKey: ['coupon-analytics'] })
      },
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

export const useUpdateCouponStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['coupon-status'],
      mutationFn: ({ id, status }: { id: any; status: boolean }) => couponServices.updateCouponStatus(id, status),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['coupons'] })
          queryClient.invalidateQueries({ queryKey: ['coupon-analytics'] })
        }
    })
  }


export const useDeleteCoupon = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['coupon'],
      mutationFn: (id: any) => couponServices.deleteCoupon(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
    })
  }

export type UpdateCouponPayload = Partial<Pick<CreateCouponPayload, 'expiryDate' | 'maxUsage' | 'usagePerPerson' | 'courses'>>

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['coupon-update'],
      mutationFn: ({ id, payload }: { id: any; payload: UpdateCouponPayload }) => couponServices.updateCoupon(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
    })
  }

export const useGetCouponById = (id: any, enabled: boolean = true) => {
    return useQuery({
      queryKey: ['coupon', id],
      queryFn: () => couponServices.getCouponById(id),
      enabled: enabled && !!id,
    })
  }


export const useGetCouponAnalytics = (enabled: boolean = true) => {
    return useQuery({
      queryKey: ['coupon-analytics'],
      queryFn: () => couponServices.getCouponAnalytics(),
      enabled: enabled,
    })
  }
  



