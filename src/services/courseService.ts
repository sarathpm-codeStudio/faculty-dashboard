import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'
import {
  MaterialStatus,
  MaterialType,
  type Course,
  type CoursesResponse,
  type CreateCoursePayload,
  type UpdateCoursePayload,
} from '@/types/course.types'
import { useAuthStore } from '@/store/authStore'
import { notificationService } from './notificationService'
import { buildChartPeriodSlots, ChartPeriod, getChartPeriodBounds, getPeriodTrendLabel, getPreviousPeriodBounds, groupTimestampForChartPeriod } from '@/utils/helper/chart';


// Read the faculty id from the store on every call so it always reflects the
// currently logged-in user. Reading it once at module load captures a stale
// (often `undefined`) value that survives logout/login without a page reload.
const getCurrentFacultyId = () => useAuthStore.getState().user?.id;

// Commission % for the current faculty: their profiles.commission_rate,
// falling back to the platform default (workflow §7).
const resolveFacultyCommission = async (): Promise<number> => {
  const facultyId = getCurrentFacultyId();
  const [{ data: profile }, { data: setting }] = await Promise.all([
    facultyId
      ? supabase.from('profiles').select('commission_rate').eq('id', facultyId).maybeSingle()
      : Promise.resolve({ data: null } as any),
    supabase.from('platform_settings').select('value').eq('key', 'default_commission_percent').maybeSingle(),
  ]);
  const rate = profile?.commission_rate ?? Number(setting?.value);
  return Number.isFinite(rate) ? rate : 20;
};

// Faculty's net revenue for one enrollment = (amount_paid − GST) − commission.
const facultyRevenueOf = (amountPaid: number, gst: number, rate: number): number => {
  const base = (amountPaid ?? 0) - (gst ?? 0);
  return base - Math.round((base * rate) / 100);
};

// Actual settled faculty share (recorded COURSE_SALE.amount) per enrollment.
// Already-processed sales keep this amount even if commission later changes
// (enrollment-payout-workflow.md §7) — only unsettled enrollments recompute.
const settledSharesFor = async (enrollmentIds: string[]): Promise<Map<string, number>> => {
  if (enrollmentIds.length === 0) return new Map();
  const { data } = await supabase
    .from('faculty_transactions')
    .select('enrollment_id, amount')
    .eq('type', 'COURSE_SALE')
    .in('enrollment_id', enrollmentIds);
  return new Map((data ?? []).map((r) => [r.enrollment_id, Number(r.amount ?? 0)]));
};

export const courseService = {

  getAll: async ({ filter, search }: { filter: any, search?: string }): Promise<any> => {

    console.log(getCurrentFacultyId(), "fill", filter)

    // try {
    //   const { data } = await apiClient.get('/courses', { params: { filter, search } })
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      let query = supabase
        .from("courses")
        .select(`
                    id,
                    title,
                    category,
                    price,
                    is_free,
                    status,
                    rejection_reason,
                    final_price,
                    validity,
                    languages,
                    cover_image,
                  enrollments(count)
                `)
        .eq("faculty_id", getCurrentFacultyId())
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (filter === "rejected") {
        // Rejected tab shows both rejected and resubmitted (re-review) courses
        query = query.in("status", ["REJECTED", "RESUBMIT"]);
      } else if (filter !== "all") {
        const isDraft = filter
        query = query.eq("is_draft", isDraft);
        // Rejected / resubmitted courses are not drafts, so keep them out of the active list
        // (keep rows whose status is null or anything other than REJECTED/RESUBMIT)
        if (isDraft === false) {
          query = query.or("status.is.null,status.not.in.(REJECTED,RESUBMIT)");
        }
      }

      if (search?.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data: courses, error } = await query.order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      // ✅ Flatten enrollment count into each course
      let result = courses?.map(course => ({
        ...course,
        total_enrolled: course.enrollments[0]?.count ?? 0
      }));

      // In the rejected tab, surface resubmitted courses first
      if (filter === "rejected" && result) {
        result = [...result].sort((a, b) =>
          (a.status === "RESUBMIT" ? 0 : 1) - (b.status === "RESUBMIT" ? 0 : 1)
        );
      }

      return result;

    } catch (error: any) {
      throw new Error(error.message);
    }

  },

  getById: async (courseId: string): Promise<any> => {
    // try {

    //   const { data } = await apiClient.get(`/courses/${id}`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      const [
        { data: course, error },
        { data: enrollments },
      ] = await Promise.all([
        supabase
          .from("courses")
          .select(`
                        *,
                        enrollments(count),
                        course_folders(count),
                        course_materials(count)
                    `)
          .eq("id", courseId)
          .single(),

        // ✅ Separate query only for revenue calculation
        supabase
          .from("enrollments")
          .select("amount_paid")
          .eq("course_id", courseId),
      ]);

      if (error) throw new Error(error.message);
      if (!course) throw new Error("Course not found");

      // ✅ Calculate total revenue from separate query
      const totalRevenue = enrollments?.reduce(
        (sum, e: any) => sum + (e.amount_paid ?? 0), 0
      ) ?? 0;

      return {
        ...course,
        total_enrolled: course.enrollments[0]?.count ?? 0,
        total_revenue: totalRevenue,
        total_folders: course.course_folders[0]?.count ?? 0,
        total_materials: course.course_materials[0]?.count ?? 0,

        // cleanup raw nested data
        enrollments: undefined,
        course_folders: undefined,
        course_materials: undefined,
      };

    } catch (error: any) {
      throw new Error(error.message);
    }




  },

  getAllCategories: async (): Promise<any> => {

    try {

      const data = await supabase.from('categories').select('*').eq('is_active', true)

      return data

    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      throw new Error(message)
    }

  },

  createBasicDetails: async (data: CreateCoursePayload): Promise<Course> => {
    // try {
    //   const { data } = await apiClient.post('/courses', payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {


      console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>####", data);

      // check this course have intro video
      const { data: videoUploadProgress, error: videoUploadProgressError } = await supabase
        .from("video_upload_progress")
        .select("*")
        .eq("unique_id", data.unique_id)
        .eq("type", "intro")
        .single();




      const { data: course, error } = await supabase
        .from("courses")
        .insert({
          title: data.title,
          unique_id: data.unique_id,
          description: data.description,
          category: data.category,
          level: data.level,
          languages: data.languages,
          faculty_id: getCurrentFacultyId(),
          cover_image: data.cover_image,
          video_asset_id: videoUploadProgress?.asset_id,
          video_uploading_status: videoUploadProgress?.uploading_status,
          video_upload_progress: videoUploadProgress?.upload_progress,
          video_transcoding_progress: videoUploadProgress?.transcoding_progress,


        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return course;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },


  update: async (courseId: string, data: UpdateCoursePayload): Promise<Course> => {
    // try {
    //   const { data } = await apiClient.patch(`/courses/${id}`, payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      console.log("course id", courseId);
      console.log("faculty id", getCurrentFacultyId());
      console.log("data", data);

      // check this course have intro video
      const { data: videoUploadProgress, error: videoUploadProgressError } = await supabase
        .from("video_upload_progress")
        .select("*")
        .eq("unique_id", data.unique_id)
        .eq("type", "intro")
        .maybeSingle();

      console.log("videoUploadProgress", videoUploadProgress);

      const { data: course, error } = await supabase
        .from("courses")
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          languages: data.languages,
          cover_image: data.cover_image,
          video_asset_id: videoUploadProgress?.asset_id,
          video_uploading_status: videoUploadProgress?.uploading_status,
          video_upload_progress: videoUploadProgress?.upload_progress,
          video_transcoding_progress: videoUploadProgress?.transcoding_progress,
        })
        .eq("id", courseId)
        .eq("faculty_id", getCurrentFacultyId())
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!course) throw new Error("Course not found");
      return course;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Current GST % from platform_settings ('gst_percent', fallback 18).
   * Course prices are GST-inclusive: the faculty enters the base
   * (exclude_price) and price/final_price are derived with this rate.
   */
  getGstPercent: async (): Promise<number> => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'gst_percent')
      .maybeSingle()

    if (error) throw new Error(error.message)
    return parseFloat(data?.value ?? '18') || 18
  },

  /**
   * Validity (in DAYS) applied to every free course, from platform_settings
   * ('free_course_validity', fallback 7). Free courses don't let the faculty
   * pick a validity: the admin sets it platform-wide, and it's stored on the
   * course as '<n>d' (e.g. '7d') to keep it distinct from the month-based
   * values of paid courses.
   */
  getFreeCourseValidity: async (): Promise<number> => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'free_course_validity')
      .maybeSingle()

    if (error) throw new Error(error.message)
    return parseInt(data?.value ?? '7', 10) || 7
  },

  addCoursePricing: async (courseId: string, data: any): Promise<any> => {
    // try {
    //   const { data } = await apiClient.patch(`/courses/${courseId}/pricing`, payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      // ← add this to debug
      console.log("pricing data", data)

      const { data: course, error } = await supabase
        .from("courses")
        .update({
          validity: data.validity,
          exclude_price: data.exclude_price, // faculty's base price WITHOUT GST (source of truth)
          price: data.price,                 // exclude_price + GST
          discount: data.discount,
          discount_type: data.discount_type === "" ? null : data.discount_type,
          discount_mode: data.discount_mode ?? 'INCLUSIVE_GST', // INCLUSIVE_GST (default) | EXCLUSIVE_GST
          final_price: data.final_price,     // student pays (incl. GST), per discount_mode
          enableCoupons: data.enableCoupons,
          is_free: data.is_free,
          // Free courses upsell a paid "main" course when they expire.
          main_course_id: data.main_course_id ?? null,
        })
        .eq("id", courseId)
        .select()


      if (error) throw new Error(error.message);
      if (!course) throw new Error(`Course not found for id: ${courseId}`);

      return course;

    } catch (error: any) {
      throw new Error(error.message);
    }


  },

  delete: async (courseId: string): Promise<void> => {

    // try {
    //   const { data } = await apiClient.delete(`/courses/${id}`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      const { data: course, error } = await supabase
        .from("courses")
        .update({ is_deleted: true })
        .eq("id", courseId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!course) throw new Error("Course not found");
      return course;

    } catch (error: any) {
      throw new Error(error.message);
    }


  },

  publish: async (courseId: string): Promise<any> => {
    // const { data } = await apiClient.patch(`/courses/${id}/publish`)
    // return data

    try {

      // 1. Check course ownership
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, faculty_id, title, video_uploading_status")
        .eq("id", courseId)
        .eq("faculty_id", getCurrentFacultyId())
        .single()

      if (courseError) throw new Error(courseError.message)
      if (!course) throw new Error("Course not found")

      // 2. Get all material videos
      const { data: materials, error: matError } = await supabase
        .from("course_materials")
        .select("id, title, video_uploading_status")
        .eq("course_id", courseId)
        .eq("is_deleted", false)
        .eq("type", "VIDEO")

      if (matError) throw new Error(matError.message)

      // 3. Check intro video status from courses table ✅
      const introFailed = course.video_uploading_status === MaterialStatus.FAILED
      const introProcessing = course.video_uploading_status !== MaterialStatus.COMPLETED
        && course.video_uploading_status !== MaterialStatus.FAILED
        && course.video_uploading_status !== null
      // null = no intro video uploaded → skip check ✅

      // 4. Combine intro + material failed videos
      const failedVideos = [
        // Failed material videos
        ...(materials?.filter(
          (m: any) => m.video_uploading_status === MaterialStatus.FAILED
        ) ?? []),
        // Failed intro video ✅
        ...(introFailed ? [{
          id: courseId,
          title: 'Intro Video',
        }] : []),
      ]

      // 5. Combine intro + material processing videos
      const processingVideos = [
        // Processing material videos
        ...(materials?.filter(
          (m: any) =>
            m.video_uploading_status !== MaterialStatus.COMPLETED &&
            m.video_uploading_status !== MaterialStatus.FAILED
        ) ?? []),
        // Processing intro video ✅
        ...(introProcessing ? [{
          id: courseId,
          title: 'Intro Video',
        }] : []),
      ]

      // 6. Has FAILED videos → abort ❌
      if (failedVideos.length > 0) {
        return {
          course: null,
          status: 'failed',
          message: "Course cannot be published because some videos failed to process. Please re-upload them and try again.",

        }
      }


      console.log("processingVideos", processingVideos)

      // 7. Still processing → pending_publish ⏳
      if (processingVideos.length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from("courses")
          .update({ pending_publish: true })
          .eq("id", courseId)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)

        return {
          // course: updated,
          status: 'pending',
          message: "Course will publish automatically when all videos are ready.",
        }
      }

      // 8. All COMPLETED → publish now ✅
      const { data: updated, error: updateError } = await supabase
        .from("courses")
        .update({
          is_draft: false,
          pending_publish: false,
        })
        .eq("id", courseId)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)

      return {
        // course: updated,
        status: 'published',
        message: 'Course published successfully! 🎉',
      }

    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  saveDraft: async (id: string): Promise<Course> => {
    const { data } = await apiClient.patch(`/courses/${id}`, { status: 'draft' })
    return data
  },



  createFolder: async (courseId: string, data: any): Promise<any> => {
    // try {
    //   const { data } = await apiClient.post(`/courses/${courseId}/folders`, payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      // Check course is owned by this faculty
      console.log("folder data #######################################################################", data);
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .eq("faculty_id", getCurrentFacultyId())
        .single();

      if (courseError) throw new Error(courseError.message);
      if (!course) throw new Error("Course not found");

      const nextSortOrder = await getNextSortOrder(courseId, data.parent_id ?? null);

      const { data: folder, error } = await supabase
        .from("course_folders")
        .insert({
          course_id: courseId,
          parent_id: data.parent_id ?? null,
          sort_order: nextSortOrder,
          title: data.title || "Untitled Folder",
          description: data.description ?? "",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!folder) throw new Error("Folder not created");
      return folder;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  updateFolder: async (courseId: string, folderId: string, data: any): Promise<any> => {
    // try {
    //   const { data } = await apiClient.patch(`/courses/${courseId}/folders/${folderId}`, payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      const { data: folder, error } = await supabase
        .from("course_folders")
        .update({ title: data.title })
        .eq("id", folderId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!folder) throw new Error("Folder not found");
      return folder;

    } catch (error: any) {
      throw new Error(error.message);
    }

  },


  deleteFolder: async (courseId: string, folderId: string): Promise<void> => {

    // try {
    //   const { data } = await apiClient.delete(`/courses/${courseId}/folders/${folderId}`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      const { data: folder, error } = await supabase
        .from("course_folders")
        .update({ is_deleted: true })
        .eq("id", folderId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!folder) throw new Error("Folder not found");
      return folder;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },


  getAllFolders: async (courseId: string): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/folders`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      const { data: course } = await supabase
        .from('courses')
        .select("*")
        .eq('id', courseId)
        .eq('faculty_id', getCurrentFacultyId())
        .single();

      if (!course) throw new Error("Not your course");

      const { data: folders } = await supabase
        .from('course_folders')
        .select("*")
        .eq('course_id', courseId)
        .eq('is_deleted', false)

      if (!folders) throw new Error("No folders found");

      return folders;

    } catch (error: any) {

      throw new Error(error.message);
    }
  },






  createMaterial: async (courseId: string, data: any): Promise<any> => {
    // try {
    //   const { data } = await apiClient.post(`/courses/${courseId}/materials`, payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      // Check course ownership
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .eq("faculty_id", getCurrentFacultyId())
        .single();

      if (courseError) throw new Error(courseError.message);
      if (!course) throw new Error("Course not found");

      // Check folder exists in this course
      if (data.parent_id) {
        const { data: folder, error: folderError } = await supabase
          .from("course_folders")
          .select("id")
          .eq("id", data.parent_id)
          .eq("course_id", courseId)
          .single();

        if (folderError) throw new Error(folderError.message);
        if (!folder) throw new Error("Folder not found");
      }

      const nextSortOrder = await getNextSortOrder(courseId, data.parent_id ?? null);

      // check this material have video upload progress or not
      const { data: videoUploadProgress, error: videoUploadProgressError } = await supabase
        .from("video_upload_progress")
        .select("*")
        .eq("unique_id", data.unique_id)
        .eq("type", "module")
        .single();

      let materialStatus = "";
      if (data?.type === "VIDEO" || data?.type === "TEST") {
        materialStatus = MaterialStatus.PENDING;
      } else {
        materialStatus = MaterialStatus.READY;
      }

      const { data: material, error } = await supabase
        .from("course_materials")
        .insert({
          unique_id: data.unique_id,
          course_id: courseId,
          folder_id: data.parent_id ?? null,
          sort_order: nextSortOrder,
          material_status: materialStatus,
          title: data.title,
          type: data.type,
          file_url: data.file_url ?? null,
          external_url: data.external_url ?? null,
          file_size: data.file_size ?? null,
          total_page: data.total_page ?? null,
          video_asset_id: videoUploadProgress?.asset_id,
          video_uploading_status: videoUploadProgress?.uploading_status,
          video_upload_progress: videoUploadProgress?.upload_progress,
          video_transcoding_progress: videoUploadProgress?.transcoding_progress,
          video_cover_img: data.video_cover_img ?? null,

        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!material) throw new Error("Material not created");

      // update folder content counts
      if (data.parent_id) {
        const folderCountField =
          data.type === MaterialType.VIDEO ? "total_video" :
            data.type === MaterialType.TEST ? "total_test" :
              data.type === MaterialType.PDF ? "total_notes" :
                null;

        if (folderCountField) {
          const { data: existingFolder, error: fetchError } = await supabase
            .from("course_folders")
            .select("total_video, total_test, total_notes")
            .eq("id", data.parent_id)
            .single();

          if (fetchError) throw new Error(fetchError.message);

          const currentCount = Number(existingFolder[folderCountField] ?? 0);
          const { error: folderError } = await supabase
            .from("course_folders")
            .update({ [folderCountField]: currentCount + 1 })
            .eq("id", data.parent_id);

          if (folderError) throw new Error(folderError.message);
        }
      }

      return material;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  updateMaterial: async (courseId: string, materialId: string, data: any): Promise<any> => {
    // try {
    //   const { data } = await apiClient.patch(`/courses/${courseId}/materials/${materialId}`, payload)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      // check this material have video upload progress or not
      const { data: videoUploadProgress, error: videoUploadProgressError } = await supabase
        .from("video_upload_progress")
        .select("*")
        .eq("unique_id", data.unique_id)
        .eq("type", "module")
        .single();


      const { data: material, error } = await supabase
        .from("course_materials")
        .update({

          title: data.title,
          type: data.type,
          file_url: data.file_url ?? null,
          external_url: data.external_url ?? null,
          file_size: data.file_size ?? null,
          total_page: data.total_page ?? null,
          video_asset_id: videoUploadProgress?.asset_id,
          video_uploading_status: videoUploadProgress?.uploading_status,
          video_upload_progress: videoUploadProgress?.upload_progress,
          video_transcoding_progress: videoUploadProgress?.transcoding_progress,
          video_cover_img: data.video_cover_img ?? null,

        })
        .eq("id", materialId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!material) throw new Error("Material not created");

      return material;





    } catch (error: any) {
      throw new Error(error.message);
    }


  },

  deleteMaterial: async (courseId: string, materialId: string): Promise<void> => {
    // try {
    //   const { data } = await apiClient.delete(`/courses/${courseId}/materials/${materialId}`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      const { data: material, error } = await supabase
        .from("course_materials")
        .update({ is_deleted: true })
        .eq("id", materialId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!material) throw new Error("Material not found");

      if (material?.type === "TEST") {

        const { error: testError } = await supabase
          .from("tests")
          .update({ is_deleted: true })
          .eq("unique_id", material.unique_id)
          .select()
          .single();

        if (testError) throw new Error(testError.message);
      }

      if (material?.type === MaterialType.VIDEO && material?.unique_id) {
        const { error: uploadProgressError } = await supabase
          .from("video_upload_progress")
          .delete()
          .eq("unique_id", material.unique_id)
          .eq("type", "module");

        if (uploadProgressError) throw new Error(uploadProgressError.message);
      }

      if (material?.folder_id) {
        const folderCountField =
          material.type === MaterialType.VIDEO ? "total_video" :
            material.type === MaterialType.TEST ? "total_test" :
              material.type === MaterialType.PDF ? "total_notes" :
                null;

        if (folderCountField) {
          const { data: existingFolder, error: folderFetchError } = await supabase
            .from("course_folders")
            .select("total_video, total_test, total_notes")
            .eq("id", material.folder_id)
            .single();

          if (folderFetchError) throw new Error(folderFetchError.message);

          const currentCount = Number(existingFolder[folderCountField] ?? 0);
          const { error: folderUpdateError } = await supabase
            .from("course_folders")
            .update({ [folderCountField]: Math.max(0, currentCount - 1) })
            .eq("id", material.folder_id);

          if (folderUpdateError) throw new Error(folderUpdateError.message);
        }
      }

      return material;

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getAllContent: async (courseId: string, parentId: string | null = null): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/content`, { params: { parentId } })
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    console.log("content data $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", courseId, parentId)
    try {
      let folderQuery = supabase
        .from("course_folders")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_deleted", false)
        .order("sort_order", { ascending: true });

      let materialQuery = supabase
        .from("course_materials")
        .select("*")
        .eq("is_deleted", false)
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });

      if (parentId === null) {
        console.log("parent id is null")
        folderQuery = folderQuery.is("parent_id", null);
        materialQuery = materialQuery.is("folder_id", null);
      } else {
        folderQuery = folderQuery.eq("parent_id", parentId);
        materialQuery = materialQuery.eq("folder_id", parentId);
      }

      const [{ data: folders, error: folderError }, { data: materials, error: matError }] =
        await Promise.all([folderQuery, materialQuery]);

      if (folderError) throw new Error(folderError.message);
      if (matError) throw new Error(matError.message);

      const taggedFolders = (folders ?? []).map(f => ({ ...f, item_type: "folder" }));
      const taggedMaterials = (materials ?? []).map(m => ({ ...m, item_type: "material" }));

      console.log("folders", folders)
      console.log("materials", materials)

      return [...taggedFolders, ...taggedMaterials].sort((a, b) => a.sort_order - b.sort_order);

    } catch (error: any) {
      console.log("content data error $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", error)
      throw new Error(error.message);
    }
  },

  getCoursePreview: async (courseId: string): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/preview`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      // ─── Parallel fetch ───────────────────────────────────
      const [
        { data: course, error: courseError },
        { data: materials, error: matError },
        { count: testCount, error: testError },
      ] = await Promise.all([

        supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single(),

        supabase
          .from("course_materials")
          .select("type, duration_sec, material_status")
          .eq("course_id", courseId)
          .eq("is_deleted", false)
          .or("type.neq.VIDEO,material_status.neq.FAILED"), // ✅ exclude FAILED videos

        supabase
          .from("tests")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId)
          .eq("is_deleted", false),
      ])

      // ─── Error checks ─────────────────────────────────────
      if (courseError) throw new Error(courseError.message)
      if (!course) throw new Error("Course not found")
      if (matError) throw new Error(matError.message)
      if (testError) throw new Error(testError.message)

      // ─── Compute stats ─────────────────────────────────────
      let videoCount = 0
      let pdfCount = 0
      let imageCount = 0
      let totalDuration = 0

      materials?.forEach((item: any) => {
        switch (item.type) {
          case "VIDEO":
            videoCount++
            totalDuration += item.duration_sec || 0
            break
          case "PDF":
            pdfCount++
            break
          case "IMAGE":
            imageCount++
            break
        }
      })

      // ─── Format duration ───────────────────────────────────
      const hours = Math.floor(totalDuration / 3600)
      const minutes = Math.floor((totalDuration % 3600) / 60)
      const seconds = totalDuration % 60

      const formatted = hours > 0
        ? `${hours}h ${minutes}m`
        : minutes > 0
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`

      return {
        ...course,
        content_inventory: {
          video_lessons: videoCount,
          pdf_resources: pdfCount,
          images: imageCount,
          tests: testCount ?? 0,
          total_contents: videoCount + pdfCount +
            imageCount + (testCount ?? 0),
        },
        video_duration: {
          total_seconds: totalDuration,
          formatted,
        },
      }

    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  publishCourse: async (courseId: string): Promise<any> => {
    // try {
    //   const { data } = await apiClient.patch(`/courses/${courseId}/publish`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      // 1. Check course ownership
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, faculty_id, title, video_uploading_status")
        .eq("id", courseId)
        .eq("faculty_id", getCurrentFacultyId())
        .single()

      if (courseError) throw new Error(courseError.message)
      if (!course) throw new Error("Course not found")

      // 2. Get all material videos
      const { data: materials, error: matError } = await supabase
        .from("course_materials")
        .select("id, title, video_uploading_status")
        .eq("course_id", courseId)
        .eq("is_deleted", false)
        .eq("type", "VIDEO")

      if (matError) throw new Error(matError.message)

      // 3. Check intro video status from courses table ✅
      const introFailed = course.video_uploading_status === MaterialStatus.FAILED
      const introProcessing = course.video_uploading_status !== MaterialStatus.COMPLETED
        && course.video_uploading_status !== MaterialStatus.FAILED
        && course.video_uploading_status !== null
      // null = no intro video uploaded → skip check ✅

      // 4. Combine intro + material failed videos
      const failedVideos = [
        // Failed material videos
        ...(materials?.filter(
          (m: any) => m.video_uploading_status === MaterialStatus.FAILED
        ) ?? []),
        // Failed intro video ✅
        ...(introFailed ? [{
          id: courseId,
          title: 'Intro Video',
        }] : []),
      ]

      // 5. Combine intro + material processing videos
      const processingVideos = [
        // Processing material videos
        ...(materials?.filter(
          (m: any) =>
            m.video_uploading_status !== MaterialStatus.COMPLETED &&
            m.video_uploading_status !== MaterialStatus.FAILED
        ) ?? []),
        // Processing intro video ✅
        ...(introProcessing ? [{
          id: courseId,
          title: 'Intro Video',
        }] : []),
      ]

      // 6. Has FAILED videos → abort ❌
      if (failedVideos.length > 0) {
        return {
          course: null,
          status: 'failed',
          message: "Course cannot be published because some videos failed to process. Please re-upload them and try again.",

        }
      }


      console.log("processingVideos", processingVideos)

      // 7. Still processing → pending_publish ⏳
      if (processingVideos.length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from("courses")
          .update({ pending_publish: true })
          .eq("id", courseId)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)

        return {
          // course: updated,
          status: 'pending',
          message: "Course will publish automatically when all videos are ready.",
        }
      }

      // 8. All COMPLETED → publish now ✅
      const { data: updated, error: updateError } = await supabase
        .from("courses")
        .update({
          is_draft: false,
          pending_publish: false,
        })
        .eq("id", courseId)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)

      // Notify admins, but don't fail the publish if notifying fails.
      try {
        await notificationService.notifyAdminsCoursePublished(updated)
      } catch (notifyError) {
        console.error("Failed to notify admins of course publish:", notifyError)
      }

      return {
        // course: updated,
        status: 'published',
        message: 'Course published successfully! 🎉',
      }

    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // Re-submit a rejected course for admin review.
  resubmitCourse: async (courseId: string): Promise<any> => {
    try {
      const { data: updated, error } = await supabase
        .from("courses")
        .update({
          status: "RESUBMIT",
          rejection_reason: null,
        })
        .eq("id", courseId)
        .eq("faculty_id", getCurrentFacultyId())
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Notify admins, but don't fail the resubmit if notifying fails.
      try {
        await notificationService.notifyAdminsCourseResubmitted(updated)
      } catch (notifyError) {
        console.error("Failed to notify admins of course resubmission:", notifyError)
      }

      return {
        course: updated,
        status: "RESUBMIT",
        message: "Course resubmitted for review. We'll notify you once it's reviewed.",
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  },


  getAllContentInModule: async (moduleId: string): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/modules/${moduleId}/contents`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      const data = await supabase.from("course_materials")
        .select("id, title, type")
        .eq("folder_id", moduleId)   // module == a folder
        .eq("is_deleted", false)
        .neq("type", "TEST")         // excludes quizzes/tests
        .order("sort_order", { ascending: true })

      return data

    } catch (error: any) {
      throw new Error(error.message)
    }


  },


  // Number of live materials in the course, across every folder. Used to stop a
  // faculty leaving the academic step with an empty (or folders-only) course.
  countCourseMaterials: async (courseId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("course_materials")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("is_deleted", false)

    if (error) throw new Error(error.message)
    return count ?? 0
  },


  getCourseReviews: async (courseId: string, { page, limit }: any): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/reviews`, { params: payload })
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // 1. Get paginated reviews with student + reply details
      const { data: reviews, error, count } = await supabase
        .from("reviews")
        .select(`
                *,
                student:profiles!reviews_student_id_fkey (
                    id, first_name, last_name, avatar_url
                )
                )
            `, { count: "exact" })
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      // 2. Get ALL ratings for accurate average
      // (not just current page)
      const { data: allRatings, error: ratingError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("course_id", courseId)


      if (ratingError) throw new Error(ratingError.message);

      // 3. Calculate average rating from ALL reviews
      const averageRating = allRatings && allRatings.length > 0
        ? Math.round(
          (allRatings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / allRatings.length) * 10
        ) / 10
        : 0;

      // 4. Calculate rating breakdown (1-5 stars count)
      const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      (allRatings ?? []).forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingBreakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      // 5. Pagination meta
      const totalPages = Math.ceil((count ?? 0) / limit);

      return {
        reviews: reviews ?? [],
        average_rating: averageRating,
        total_reviews: allRatings?.length ?? 0,
        rating_breakdown: ratingBreakdown,
        pagination: {
          total: count ?? 0,
          total_pages: totalPages,
          current_page: page,
          limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        }
      };

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // get course analytics
  getCourseAnalytics: async (courseId: string): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/analytics`)
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }
    try {

      // 1. Total Revenue (faculty net = after GST + commission) + Active Students
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, amount_paid, gst_amount, student_id")
        .eq("course_id", courseId);

      if (enrollmentError) throw new Error(enrollmentError.message);

      const commissionRate = await resolveFacultyCommission();
      const settled = await settledSharesFor((enrollments ?? []).map((e) => e.id));
      const totalRevenue = enrollments?.reduce(
        (sum, e) => sum + (settled.has(e.id)
          ? settled.get(e.id)!
          : facultyRevenueOf(e.amount_paid ?? 0, e.gst_amount ?? 0, commissionRate)),
        0,
      ) ?? 0;
      const activeStudents = enrollments?.length ?? 0;

      // 2. Completion Rate — avg completion_pct across all students in this course
      const { data: progressData, error: progressError } = await supabase
        .from("course_progress")
        .select("completion_pct, is_completed")
        .eq("course_id", courseId);

      if (progressError) throw new Error(progressError.message);

      const completionRate =
        progressData && progressData.length > 0
          ? Math.round(
            progressData.reduce((sum, p) => sum + Number(p.completion_pct), 0) /
            progressData.length
          )
          : 0;

      // 3. Fully completed students count (optional — useful for future)
      const completedStudents = progressData?.filter((p) => p.is_completed).length ?? 0;

      return {
        totalRevenue,       // sum of amount_paid
        activeStudents,     // total enrolled students
        completionRate,     // average completion % (0-100)
        completedStudents,  // count of fully completed
        testScore: null,    // plug in your rating/quiz table later
      };

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getCourseEnrollmentCompletionChart: async (courseId: string, period: ChartPeriod): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/enrollment-vs-completion-chart`, { params: { period } })
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {
      const bounds = getChartPeriodBounds(period);
      const slots = buildChartPeriodSlots(period, bounds);

      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('enrolled_at')
        .eq('course_id', courseId)
        .gte('enrolled_at', bounds.fromDate.toISOString())
        .lte('enrolled_at', bounds.rangeEnd.toISOString());

      if (enrollmentError) throw new Error(enrollmentError.message);

      const { data: completions, error: completionError } = await supabase
        .from('course_progress')
        .select('completed_at')
        .eq('course_id', courseId)
        .eq('is_completed', true)
        .gte('completed_at', bounds.fromDate.toISOString())
        .lte('completed_at', bounds.rangeEnd.toISOString());

      if (completionError) throw new Error(completionError.message);

      const enrollmentMap = new Map<string, { label: string; count: number }>();
      const completionMap = new Map<string, number>();

      for (const e of enrollments ?? []) {
        if (!e.enrolled_at) continue;
        const grouped = groupTimestampForChartPeriod(e.enrolled_at, period, bounds);
        if (!grouped) continue;
        const { label, group } = grouped;
        const existing = enrollmentMap.get(group);
        enrollmentMap.set(group, { label, count: (existing?.count ?? 0) + 1 });
      }

      for (const c of completions ?? []) {
        if (!c.completed_at) continue;
        const grouped = groupTimestampForChartPeriod(c.completed_at, period, bounds);
        if (!grouped) continue;
        const { group } = grouped;
        completionMap.set(group, (completionMap.get(group) ?? 0) + 1);
      }

      return slots.map(({ label, group }) => ({
        label,
        enrollments: enrollmentMap.get(group)?.count ?? 0,
        completions: completionMap.get(group) ?? 0,
      }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getCourseRevenueTrend: async (courseId: string, period: ChartPeriod): Promise<any> => {
    // try {
    //   const { data } = await apiClient.get(`/courses/${courseId}/revenue-trend`, { params: { period } })
    //   return data
    // } catch (error: any) {
    //   const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    //   throw new Error(message)
    // }

    try {

      const bounds = getChartPeriodBounds(period);
      const slots = buildChartPeriodSlots(period, bounds);

      // Compare against the immediately preceding rolling window of equal length.
      const { previousStart, previousEnd } = getPreviousPeriodBounds(period, bounds);

      const { data: current, error: currentError } = await supabase
        .from("enrollments")
        .select("id, enrolled_at, amount_paid, gst_amount")
        .eq("course_id", courseId)
        .gte("enrolled_at", bounds.fromDate.toISOString())
        .lte("enrolled_at", bounds.rangeEnd.toISOString());

      if (currentError) throw new Error(currentError.message);
      const currentEnrollments = current ?? [];

      const { data: previous, error: previousError } = await supabase
        .from("enrollments")
        .select("id, amount_paid, gst_amount")
        .eq("course_id", courseId)
        .gte("enrolled_at", previousStart.toISOString())
        .lte("enrolled_at", previousEnd.toISOString());

      if (previousError) throw new Error(previousError.message);
      const previousEnrollments = previous ?? [];

      // Revenue = faculty net share. Settled sales keep their recorded amount
      // (unchanged by later commission edits); only unpaid recompute (§7).
      const commissionRate = await resolveFacultyCommission();
      const settled = await settledSharesFor(
        [...currentEnrollments, ...previousEnrollments].map((e) => e.id).filter(Boolean),
      );
      const netOf = (e: { id?: string; amount_paid?: number; gst_amount?: number }) =>
        e.id && settled.has(e.id)
          ? settled.get(e.id)!
          : facultyRevenueOf(Number(e.amount_paid), Number(e.gst_amount ?? 0), commissionRate);

      const currentTotal = currentEnrollments.reduce((sum, e) => sum + netOf(e), 0);
      const previousTotal = previousEnrollments.reduce((sum, e) => sum + netOf(e), 0);

      let trendText = "0% no change";
      if (previousTotal > 0) {
        const change = ((currentTotal - previousTotal) / previousTotal) * 100;
        const direction = change >= 0 ? "increase" : "decrease";
        const periodLabel = getPeriodTrendLabel(period);
        trendText = `${Math.abs(change).toFixed(1)}% ${direction} from ${periodLabel}`;
      }

      const revenueByGroup = new Map(slots.map((s) => [s.group, 0]));

      for (const e of currentEnrollments) {
        if (!e.enrolled_at) continue;
        const grouped = groupTimestampForChartPeriod(e.enrolled_at, period, bounds);
        if (!grouped) continue;
        revenueByGroup.set(
          grouped.group,
          (revenueByGroup.get(grouped.group) ?? 0) + netOf(e)
        );
      }

      const chartData = slots.map((s) => ({
        label: s.label,
        value: revenueByGroup.get(s.group) ?? 0,
      }));

      return { data: chartData, trend: trendText };

    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getCourseEnrollments: async (
    courseId: string,
    payload: { page: number; limit: number }
  ): Promise<any> => {
    try {
      const { page, limit } = payload;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("enrollments")
        .select(
          `
            id,
            enrolled_at,
            expires_at,
            amount_paid,
            student:profiles!enrollments_student_id_fkey (
              id,
              account_id,
              first_name,
              last_name,
              avatar_url
            )
          `,
          { count: "exact" }
        )
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);

      const rows = (data ?? []).map((item: any) => ({
        id: item.id,
        account_id: item.student?.account_id ?? null,
        first_name: item.student?.first_name ?? "",
        last_name: item.student?.last_name ?? "",
        avatar_url: item.student?.avatar_url ?? null,
        enrolled_at: item.enrolled_at,
        expires_at: item.expires_at,
        amount_paid: item.amount_paid,
      }));

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  exportCourseEnrollments: async (courseId: string): Promise<void> => {
    try {
      const { data, headers } = await apiClient.get(
        `/courses/${courseId}/enrollments/export`,
        { responseType: 'blob' }
      );

      const blob = new Blob([data], {
        type:
          (headers['content-type'] as string) ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Prefer server-provided filename from Content-Disposition, else fallback.
      const disposition = headers['content-disposition'] as string | undefined;
      const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      const fileName = match ? decodeURIComponent(match[1]) : `enrollments-${courseId}.xlsx`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to export enrollments';
      throw new Error(message);
    }
  },


}


// ── helpers ──────────────────────────────────────────────────────────────────

async function getNextSortOrder(courseId: string, parentId: string | null): Promise<number> {
  let folderQuery = supabase
    .from("course_folders")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let materialQuery = supabase
    .from("course_materials")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (parentId === null) {
    folderQuery = folderQuery.is("parent_id", null);
    materialQuery = materialQuery.is("folder_id", null);
  } else {
    folderQuery = folderQuery.eq("parent_id", parentId);
    materialQuery = materialQuery.eq("folder_id", parentId);
  }

  const [{ data: lastFolder }, { data: lastMaterial }] = await Promise.all([folderQuery, materialQuery]);

  const lastFolderOrder = lastFolder?.[0]?.sort_order ?? 0;
  const lastMaterialOrder = lastMaterial?.[0]?.sort_order ?? 0;
  return Math.max(lastFolderOrder, lastMaterialOrder) + 1;
}