

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bundleService } from '@/services/bundleService'



export const useCreateBundle = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationKey: ['bundle'],
        mutationFn: (payload: any) => bundleService.createBundle(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-courses-bundles'] })
        },
    })
}

export const useGetAllBundles = (filter: any) => {
    return useQuery({
        queryKey: ['my-courses-bundles', filter],
        queryFn: () => bundleService.getAllBundles(filter),

    })
}


export const useGetBundleById = (id: any, enabled = true) => {
    return useQuery({
        queryKey: ['bundle-by-id', id],
        queryFn: () => bundleService.getBundleById(id),
        enabled: !!id && enabled,
    })
}

export const useUpdateBundle = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationKey: ['bundle'],
        mutationFn: ({ id, payload }: { id: any, payload: any }) => bundleService.updateBundle(id, payload),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['my-courses-bundles'] })
            qc.invalidateQueries({ queryKey: ['bundle-by-id', id] })
        },
    })
}







