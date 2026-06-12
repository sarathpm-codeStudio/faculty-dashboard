
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { ChartPeriod } from '@/utils/helper/chart'

export const useGetDashboardCounters = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['dashboard-counters'],
        queryFn: () => dashboardService.getDashboardCounters(),
        enabled,
    })
}


export const useGetEnrollmentTrend = (period: ChartPeriod, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['enrollment-trend', period],
        queryFn: () => dashboardService.getEnrollmentTrend(period),
        enabled,
    })
}


export const useGetRevenueTrend = (period: ChartPeriod, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['revenue-trend', period],
        queryFn: () => dashboardService.getRevenueTrend(period),
        enabled,
    })
}


export const useGetTopCoursesPerformance = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['top-courses-performance'],
        queryFn: () => dashboardService.getTopCoursesPerformance(),
        enabled,
    })
}


