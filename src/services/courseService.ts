import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'
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

  getById: async (id: string): Promise<any> => {
    try {

      const { data } = await apiClient.get(`/courses/${id}`)
      return data
    } catch (error: any) {
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

  CreateCourseIntrovideoSignedUrl: async (courseId: string) => {
    try {

      const { data } = await apiClient.post(`/courses/${courseId}/upload-intro-video`)
      return data

    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }
  },

  uploadCourseIntrovideoTOTpstreem: async (file: File, uploadUrl: string, onProgress: (percentage: number) => void) => {

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();

      // ─── Track upload progress ────────────────────────
      xhr.upload.addEventListener('progress', async (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round(
            (event.loaded / event.total) * 100
          );

          // 1. Update UI via callback
          onProgress(percentage);
        }
      });

      // ─── Upload complete ──────────────────────────────
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200 || xhr.status === 201) {

          onProgress(100);
          resolve(true);

        } else {
          // Upload failed
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // ─── Upload error ─────────────────────────────────
      xhr.addEventListener('error', async () => {

        reject(new Error('Network error during upload'));
      });

      // ─── Upload aborted ───────────────────────────────
      xhr.addEventListener('abort', async () => {

        reject(new Error('Upload cancelled'));
      });

      // ─── Start upload ─────────────────────────────────
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
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
