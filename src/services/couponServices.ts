
import apiClient from '@/lib/apiClient'
import { supabase } from "@/services/supabase"
import { useAuthStore } from "@/store/authStore"

// Read the faculty id on every call so it reflects the current user.
// Reading once at module load captures a stale/undefined value that
// survives logout/login without a page reload.
const getCurrentFacultyId = () => useAuthStore.getState().user?.id;


const extractApiErrorMessage = (error: any, fallback = 'Something went wrong'): string => {
    const data = error?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (typeof error?.message === 'string' && error.message.trim()) return error.message
    return fallback
}

export const couponServices = {

    getCouponAnalytics: async () => {
        // try {
        //     const { data: response } = await apiClient.get('/coupons/analytics')
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {

            const now = new Date().toISOString().replace("T", " ").replace("Z", "+00");

            // 1. Active coupons count
            const { count: activeCoupons, error: activeCouponsError } = await supabase
                .from("coupons")
                .select("*", { count: "exact", head: true })
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_deleted", false)
                .eq("is_active", true)
                .eq("is_draft", false)
                .gt("expire_date", now);

            if (activeCouponsError) throw new Error(activeCouponsError.message);

            // 2. Total redeemed users (unique students) + save_amount
            const { data: redemptions, error: redemptionsError } = await supabase
                .from("coupon_redemptions")
                .select("student_id, save_amount")
                .eq("faculty_id", getCurrentFacultyId());

            if (redemptionsError) throw new Error(redemptionsError.message);

            // 3. Unique students using Set
            const totalRedeemedUsers = new Set(redemptions.map((r) => r.student_id)).size;

            // 4. Total savings generated
            const totalSavingsGenerated = redemptions.reduce(
                (sum, r) => sum + Number(r.save_amount),
                0
            );

            return {
                active_coupons: activeCoupons ?? 0,
                total_redeemed_users: totalRedeemedUsers,
                total_savings_generated: totalSavingsGenerated,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },


    createCoupon: async (couponData: any) => {
        // try {
        //     const { data: response } = await apiClient.post('/coupon', payload)
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        // Use authenticated client
        const db = supabase

        const isAllCourses = couponData.courses.includes("all");

        /**
         * Validate selected courses
         */
        if (!isAllCourses) {

            const { data: courses, error: coursesError } = await db
                .from("courses")
                .select("id")
                .in("id", couponData.courses)
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_deleted", false)
                .eq("enableCoupons", true);

            if (coursesError) {
                throw new Error(coursesError.message);
            }

            if (!courses || courses.length !== couponData.courses.length) {
                throw new Error(
                    "One or more selected courses are invalid or do not belong to you."
                );
            }
        }

        /**
         * Check coupon already exists
         */
        const { data: existingCoupon, error: couponCheckError } = await db
            .from("coupons")
            .select("id")
            .eq("code", couponData.code)
            .eq("is_deleted", false)
            .maybeSingle();

        if (couponCheckError) {
            throw new Error("Coupon code already exists. Please use a different code.");
        }

        if (existingCoupon) {
            throw new Error(
                "Coupon code already exists. Please use a different code."
            );
        }

        /**
         * Create coupon
         */
        const { data: coupon, error: couponError } = await db
            .from("coupons")
            .insert({
                code: couponData.code,
                discount_type: couponData.discountType,
                discount: couponData.discountValue,
                expire_date: couponData.expiryDate,
                max_usage: couponData.maxUsage,
                usage_per_person: couponData.usagePerPerson,
                faculty_id: getCurrentFacultyId(),
                is_active: true,
                is_all_courses: isAllCourses,
                is_draft: false,
            })
            .select()
            .single();

        if (couponError) {

            /**
             * PostgreSQL unique constraint error
             */
            if (couponError.code === "23505") {
                throw new Error(
                    "Coupon code already exists. Please use a different code."
                );
            }

            throw new Error(couponError.message);
        }

        /**
         * Insert coupon courses
         */
        if (!isAllCourses) {

            const couponCourseRows = couponData.courses.map((courseId: any) => ({
                coupon_id: coupon.id,
                course_id: courseId,
            }));

            const { error: couponCoursesError } = await db
                .from("coupon_courses")
                .insert(couponCourseRows);

            if (couponCoursesError) {
                throw new Error(couponCoursesError.message);
            }
        }

        return coupon;

    },

    getAllCouponsEnabledCourses: async () => {
        // try {
        //     const { data: response } = await apiClient.get('/coupons/enabled-courses')
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {




            const db = supabase
            const { data: courses, error } = await db
                .from("courses")
                .select("id, title")
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_draft", false)
                .eq("enableCoupons", true)
                .order("created_at", { ascending: false });

            if (error) throw new Error(error.message);
            return courses;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getAllCoupons: async (payload: any) => {
        // try {
        //     const { data: response } = await apiClient.get('/coupons', { params: payload })
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        const { page, limit, filter, search } = payload

        try {
            const db = supabase
            const now = new Date().toISOString();

            // 0. Auto-deactivate expired coupons for this faculty before fetching
            const { error: deactivateError } = await db
                .from("coupons")
                .update({ is_active: false })
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_active", true)
                .eq("is_deleted", false)
                .lt("expire_date", now);

            if (deactivateError) throw new Error(deactivateError.message);

            // Calculate offset
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // Base query
            let query = db
                .from("coupons")
                .select(`
                    *,
                    coupon_courses (
                        course_id,
                        courses (
                            id,
                            title
                        )
                    )
                `, { count: "exact" })
                .eq("faculty_id", getCurrentFacultyId())
                .eq("is_deleted", false)
                .order("created_at", { ascending: false })
                .range(from, to);

            // Apply filter
            if (filter === "active") {
                query = query
                    .eq("is_active", true)
                    .gt("expire_date", now);   // ✅ extra safety — not expired
            } else if (filter === "deactivate") {
                query = query.eq("is_active", false);
            } else if (filter === "expired") {
                query = query
                    .lt("expire_date", now)
                    .not("expire_date", "is", null);
            }

            // Apply search
            if (search.trim()) {
                query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
            }

            const { data: coupons, error, count } = await query;
            if (error) throw new Error(error.message);

            // Calculate pagination meta
            const totalPages = Math.ceil((count ?? 0) / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                coupons,
                pagination: {
                    total: count ?? 0,
                    total_pages: totalPages,
                    current_page: page,
                    limit,
                    has_next: hasNextPage,
                    has_prev: hasPrevPage,
                }
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    updateCouponStatus: async (couponId: any, status: boolean) => {
        // try {
        //     const { data: response } = await apiClient.patch(`/coupon/${id}/status`, { status })
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }

        try {

            console.log("getCurrentFacultyId()", getCurrentFacultyId());
            console.log("couponId", couponId);
            console.log("status", status);
            const db = supabase;
            const { data: coupon, error } = await db
                .from("coupons")
                .update({
                    is_active: status,
                })
                .eq("id", couponId)
                .eq("faculty_id", getCurrentFacultyId())
                .select()
                .single();
            if (error) throw new Error(error.message);

            return coupon;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    deleteCoupon: async (couponId: any) => {
        // try {
        //     const { data: response } = await apiClient.delete(`/coupon/${id}`)
        //     return response
        // } catch (error: any) {
        //     throw new Error(extractApiErrorMessage(error))
        // }


        try {

            const db = supabase;
            const { data: coupon, error } = await db
                .from("coupons")
                .update({
                    is_deleted: true,
                })
                .eq("id", couponId)
                .eq("faculty_id", getCurrentFacultyId())
                .select()
                .single();
            if (error) throw new Error(error.message);

            return coupon;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getCouponById: async (id: any) => {
        try {
            const response: any = await supabase
                .from("coupons")
                .select("*", { count: "exact" })
                .eq("id", id)
                .single();

            if (response && !response?.is_all_courses) {

                // get all coupon attached courses
                const { data: couponCourses, error: couponCoursesError } = await supabase
                    .from("coupon_courses")
                    .select("courses(id,title)")
                    .eq("coupon_id", id);
                if (couponCoursesError) throw new Error(couponCoursesError.message);

                response.data.attachedCourses = couponCourses;

            }

            return response

        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    updateCoupon: async (couponId: any, couponData: any) => {

        try {
            const db = supabase;

            const isAllCourses = couponData.courses.includes("all");

            /**
             * Validate selected courses
             */
            if (!isAllCourses) {

                const { data: courses, error: coursesError } = await db
                    .from("courses")
                    .select("id")
                    .in("id", couponData.courses)
                    .eq("faculty_id", getCurrentFacultyId())
                    .eq("is_deleted", false)
                    .eq("enableCoupons", true);

                if (coursesError) {
                    throw new Error(coursesError.message);
                }

                if (!courses || courses.length !== couponData.courses.length) {
                    throw new Error(
                        "One or more selected courses are invalid or do not belong to you."
                    );
                }
            }

            /**
             * Update coupon
             */
            const { data: coupon, error } = await db
                .from("coupons")
                .update({
                    expire_date: couponData.expiryDate,
                    max_usage: couponData.maxUsage,
                    usage_per_person: couponData.usagePerPerson,
                    is_all_courses: isAllCourses,
                })
                .eq("id", couponId)
                .eq("faculty_id", getCurrentFacultyId())
                .select()
                .single();
            if (error) throw new Error(error.message);

            /**
             * Sync coupon courses (diff-based: only remove deselected, only add newly selected)
             */
            const { data: existingCouponCourses, error: fetchExistingError } = await db
                .from("coupon_courses")
                .select("course_id")
                .eq("coupon_id", couponId);

            if (fetchExistingError) {
                throw new Error(fetchExistingError.message);
            }

            const existingCourseIds: string[] = (existingCouponCourses ?? []).map(
                (row: { course_id: string }) => row.course_id
            );

            if (isAllCourses) {

                /**
                 * Switched to "all courses" — remove any per-course mappings
                 */
                if (existingCourseIds.length > 0) {

                    const { error: deleteError } = await db
                        .from("coupon_courses")
                        .delete()
                        .eq("coupon_id", couponId);

                    if (deleteError) {
                        throw new Error(deleteError.message);
                    }
                }

            } else {

                const newCourseIds = couponData.courses;

                const toRemove = existingCourseIds.filter(
                    (id: any) => !newCourseIds.includes(id)
                );
                const toAdd = newCourseIds.filter(
                    (id: any) => !existingCourseIds.includes(id)
                );

                if (toRemove.length > 0) {

                    const { error: deleteError } = await db
                        .from("coupon_courses")
                        .delete()
                        .eq("coupon_id", couponId)
                        .in("course_id", toRemove);

                    if (deleteError) {
                        throw new Error(deleteError.message);
                    }
                }

                if (toAdd.length > 0) {

                    const couponCourseRows = toAdd.map((courseId: any) => ({
                        coupon_id: couponId,
                        course_id: courseId,
                    }));

                    const { error: couponCoursesError } = await db
                        .from("coupon_courses")
                        .insert(couponCourseRows);

                    if (couponCoursesError) {
                        throw new Error(couponCoursesError.message);
                    }
                }
            }

            return coupon;
        } catch (error: any) {
            throw new Error(error.message);
        }
    },
}