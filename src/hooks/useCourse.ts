import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/courseService'
import type { CreateCoursePayload, UpdateCoursePayload } from '@/types/course.types'

export const courseKeys = {
  all: ['courses'] as const,
  list: (page: number, limit: number) => ['courses', 'list', page, limit] as const,
  detail: (id: string) => ['courses', 'detail', id] as const,
}


export const useGetAllCourses = (filter: any, search?: string, enabled = true) =>
  useQuery({
    queryKey: ['my-courses', {  filter,  search }],
    queryFn: () => courseService.getAll({  filter,  search }),
    enabled,
  })

export const useGetCourseById = (id: string, enabled = true) =>
  useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getById(id),
    enabled: !!id && enabled,
  })


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

export const useAddCoursePricing = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesPricing', id],
    mutationFn: (payload: any) => courseService.addCoursePricing(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.detail(id) })
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
      qc.invalidateQueries({ queryKey: ['my-courses'] })
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
      qc.invalidateQueries({ queryKey: ['content', courseId] })
    },
  })
}


export const useUpdateFolder = (courseId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesFolderUpdate', courseId],
    mutationFn: ({ folderId, payload }: { folderId: string; payload: any }) =>
      courseService.updateFolder(courseId, folderId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', courseId] })
    },
  })
}


export const useDeleteFolder = (courseId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesFolderDelete', courseId],
    mutationFn: (folderId: string) => courseService.deleteFolder(courseId, folderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', courseId] })
    },
  })
}



export const useCreateMaterial = (courseId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesMaterial'],
    mutationFn: (payload: any) => courseService.createMaterial(courseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', courseId] })
      qc.invalidateQueries({ queryKey: ['content-in-module'] })
    },
  })
}


export const useUpdateMaterial = (courseId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesMaterialUpdate', courseId],
    mutationFn: ({ materialId, payload }: { materialId: string; payload: any }) =>
      courseService.updateMaterial(courseId, materialId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', courseId] })
    },
  })
}


export const useDeleteMaterial = (courseId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesMaterialDelete', courseId],
    mutationFn: (materialId: string) => courseService.deleteMaterial(courseId, materialId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', courseId] })
      qc.invalidateQueries({ queryKey: ['tests'] })

    },
  })
}


export const useGetAllCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.getAllCategories(), 
  })
}

export const useGetAllContent = (courseId: string, parentId?: string) => {
  return useQuery({
    queryKey: ['content', courseId, parentId],
    queryFn: () => courseService.getAllContent(courseId, parentId),
    enabled: true,
  })
}

export const useGetCoursePreview = (courseId: string) => {
  return useQuery({
    queryKey: ['course-preview', courseId],
    queryFn: () => courseService.getCoursePreview(courseId),
    enabled: !!courseId,
  })
}

export const usePublishCourse = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationKey: ['coursesPublish'],
    mutationFn: (courseId: string) => courseService.publishCourse(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })
}


export const useGetAllFoldersInCourse = (courseId: string, enabled = true) =>
  useQuery({
    queryKey: ['course-folders', courseId],
    queryFn: () => courseService.getAllFolders(courseId),
    enabled,
  })


export const useGetAllContentInModule = (moduleId: string, enabled = true) => {
  return useQuery({
    queryKey: ['content-in-module', moduleId],
    queryFn: () => courseService.getAllContentInModule(moduleId),
    enabled: !!moduleId,
  })
}


export const useGetCourseReviews = (courseId: string,payload: any, enabled = true) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => courseService.getCourseReviews(courseId, payload),
    enabled: !!courseId,
  })
}


export const useGetCourseAnalytics = (courseId: string, enabled = true) => {
  return useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: () => courseService.getCourseAnalytics(courseId),
    enabled: enabled && !!courseId,
  })
}

export const useGetCourseEnrollmentCompletionChart = (courseId: string, period: string, enabled = true) => {
  return useQuery({
    queryKey: ['course-enrollment-completion-chart', courseId, period],
    queryFn: () => courseService.getCourseEnrollmentCompletionChart(courseId, period),
    enabled: enabled && !!courseId,
  })
}


export const useGetCourseRevenueTrend = (courseId: string, period: string, enabled = true) => {
  return useQuery({
    queryKey: ['course-revenue-trend', courseId, period],
    queryFn: () => courseService.getCourseRevenueTrend(courseId, period),
    enabled: enabled && !!courseId,
  })
}
