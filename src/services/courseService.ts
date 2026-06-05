import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'
import type {
  Course,
  CoursesResponse,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '@/types/course.types'

export const courseService = {

  getAll: async ({ filter, search }: { filter: any, search?: string }): Promise<CoursesResponse> => {

    try {
      const { data } = await apiClient.get('/courses', { params: { filter, search } })
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getById: async (id: string): Promise<any> => {
    try {

      const { data } = await apiClient.get(`/courses/${id}`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getAllCategories: async (): Promise<any> => {

    try {

      const data=await supabase.from('categories').select('*').eq('is_active', true)

      return data
      
    } catch (error:any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }

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

  addCoursePricing: async (courseId: string, payload: any): Promise<any> => {
    try {
      const { data } = await apiClient.patch(`/courses/${courseId}/pricing`, payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  delete: async (id: string): Promise<void> => {
    
    try {
      const { data } = await apiClient.delete(`/courses/${id}`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  publish: async (id: string): Promise<Course> => {
    const { data } = await apiClient.patch(`/courses/${id}/publish`)
    return data
  },

  saveDraft: async (id: string): Promise<Course> => {
    const { data } = await apiClient.patch(`/courses/${id}`, { status: 'draft' })
    return data
  },

  createFolder: async (courseId: string, payload: any): Promise<any> => {
    try {
      const { data } = await apiClient.post(`/courses/${courseId}/folders`, payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  updateFolder: async (courseId: string, folderId: string, payload: any): Promise<any> => {
    try {
      const { data } = await apiClient.patch(`/courses/${courseId}/folders/${folderId}`, payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  deleteFolder: async (courseId: string, folderId: string): Promise<void> => {

    try {
      const { data } = await apiClient.delete(`/courses/${courseId}/folders/${folderId}`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },
  getAllFolders: async (courseId: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/folders`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  




  createMaterial: async (courseId: string, payload: any): Promise<any> => {
    try {
      const { data } = await apiClient.post(`/courses/${courseId}/materials`, payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  updateMaterial: async (courseId: string, materialId: string, payload: any): Promise<any> => {
    try {
      const { data } = await apiClient.patch(`/courses/${courseId}/materials/${materialId}`, payload)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  deleteMaterial: async (courseId: string, materialId: string): Promise<void> => {
    try {
      const { data } = await apiClient.delete(`/courses/${courseId}/materials/${materialId}`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getAllContent: async (courseId: string, parentId?: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/content`, { params: { parentId } })
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getCoursePreview: async (courseId: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/preview`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  publishCourse: async (courseId: string): Promise<any> => {
    try {
      const { data } = await apiClient.patch(`/courses/${courseId}/publish`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },


  getAllContentInModule: async (moduleId: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/modules/${moduleId}/contents`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },


  getCourseReviews: async (courseId: string, payload: any): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/reviews`, { params: payload })
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  // get course analytics
  getCourseAnalytics: async (courseId: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/analytics`)
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getCourseEnrollmentCompletionChart: async (courseId: string,period: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/enrollment-vs-completion-chart`, { params: { period } })
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  getCourseRevenueTrend: async (courseId: string,period: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/revenue-trend`, { params: { period } })
      return data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  


}
