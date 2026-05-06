import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/courseService'
import type { CreateCoursePayload, UpdateCoursePayload } from '@/types/course.types'

export const courseKeys = {
  all: ['courses'] as const,
  list: (page: number, limit: number) => ['courses', 'list', page, limit] as const,
  detail: (id: string) => ['courses', 'detail', id] as const,
}

// ─── Queries ──────────────────────────────────────────

export const useGetAllCourses = (filter: any, enabled = true) =>
  useQuery({
    queryKey: ['my-courses', filter],
    queryFn: () => courseService.getAll(filter),
    enabled,
  })

export const useGetCourseById = (id: string, enabled = true) =>
  useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getById(id),
    enabled: !!id && enabled,
  })

// ─── Mutations ────────────────────────────────────────

export const useCreateCourseBasicDetails = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesBasicDetails'],
    mutationFn: (payload: CreateCoursePayload) => courseService.createBasicDetails(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })
}







export const useUpdateCourse = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesUpdate', id],
    mutationFn: (payload: UpdateCoursePayload) => courseService.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(courseKeys.detail(id), updated)
      qc.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })
}

export const useDeleteCourse = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

export const usePublishCourse = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => courseService.publish(id),
    onSuccess: (updated) => {
      qc.setQueryData(courseKeys.detail(updated.id), updated)
      qc.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

export const useSaveDraft = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => courseService.saveDraft(id),
    onSuccess: (updated) => {
      qc.setQueryData(courseKeys.detail(updated.id), updated)
      qc.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}


export const useCreateFolder = (courseId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesFolder'],
    mutationFn: (payload: any) => courseService.createFolder(courseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses', courseId] })
    },
  })
}


export const useGetAllContent = (courseId: string, parentId?: string) => {
  return useQuery({
    queryKey: ['courses', courseId, 'content', courseId, parentId],
    queryFn: () => courseService.getAllContent(courseId, parentId),
    enabled: !!courseId,
  })
}

