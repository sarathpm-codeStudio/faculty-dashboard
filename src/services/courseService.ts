import apiClient from '@/lib/apiClient'
import type {
  Course,
  CoursesResponse,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '@/types/course.types'

export const courseService = {

  getAll: async (filter: any): Promise<CoursesResponse> => {

    try {
      const { data } = await apiClient.get('/courses', { params: filter })
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getById: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get(`/courses/${id}`)
    return data
  },

  createBasicDetails: async (payload: CreateCoursePayload): Promise<Course> => {
    try {
      const { data } = await apiClient.post('/courses', payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  update: async (id: string, payload: UpdateCoursePayload): Promise<Course> => {
    try {
      const { data } = await apiClient.patch(`/courses/${id}`, payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`)
  },

  publish: async (id: string): Promise<Course> => {
    const { data } = await apiClient.patch(`/courses/${id}/publish`)
    return data
  },

  saveDraft: async (id: string): Promise<Course> => {
    const { data } = await apiClient.patch(`/courses/${id}`, { status: 'draft' })
    return data
  },

}
