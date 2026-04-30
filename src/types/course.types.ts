import type { TreeNode } from '@/pages/courses/create'

export type CourseStatus = 'draft' | 'published' | 'archived'

export interface Course {

  id: string
  faculty_id: string
  title: string
  description: string
  category: string
  level: string
  languages: string[]
  cover_image: File | null
  cover_image_url: string | null
  intro_video_url: string | null
  tree: TreeNode[]
  offline_download: boolean
  pdf_permissions: boolean
  duration: string
  price: number
  discount: number
  discount_type: 'percentage' | 'flat'
  enable_coupons: boolean
  status: CourseStatus
  created_at: string
  updated_at: string

}

export interface CreateCoursePayload {
  title: string
  description: string
  category: string
  level: string
  languages: string[]
  cover_image: string | null
  intro_video_url?: string | null
  tree?: TreeNode[]
  offline_download?: boolean
  pdf_permissions?: boolean
  duration?: string
  price?: number
  discount?: number
  discount_type?: 'percentage' | 'flat'
  enable_coupons?: boolean
  status?: CourseStatus
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> { }

export interface CoursesResponse {
  data: Course[]
  total: number
  page: number
  limit: number
}
