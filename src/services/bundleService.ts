

import apiClient from '@/lib/apiClient'
import { supabase } from './supabase'
import { useAuthStore } from '@/store/authStore'


const facultyId = useAuthStore.getState().user?.id;


export const bundleService = {


    createBundle: async (data: any) => {
        // try {
        //     const { data: response } = await apiClient.post('/bundle', data)
        //     return response

        // } catch (error: any) {
        //     const message = error?.response?.data?.message || error?.message || 'Something went wrong'
        //     throw new Error(message)
        // }

        try {

            // create new bundle

            console.log("BCD", data);


            const { data: bundle, error } = await supabase.from("course_bundle").insert({

                faculty_id: facultyId,
                title: data.title,
                description: data.description,
                price: Math.round(Number(data.price)),
                final_price: Math.round(Number(data.finalPrice)),
                discount: data?.discount != null ? Math.round(Number(data.discount)) : null,
                discount_type: "percentage",
                image_url: data.coverImage ?? null,
                enable_coupons: data.enableCoupons ?? false,
                total_courses_count: data.courses.length,
                is_draft: data.isDraft ?? false,
            })
                .select()
                .single();

            if (error) {
                throw new Error(error.message)
            }

            const bundleId = bundle?.id;

            const courseBundleMapping = data.courses.map((courseId: string) => ({
                bundle_id: bundleId,
                course_id: courseId,
            }));

            const { data: courseBundleMappingData, error: courseBundleMappingError } = await supabase.from("course_bundle_courses").insert(courseBundleMapping);

            if (courseBundleMappingError) {
                throw new Error(courseBundleMappingError.message)
            }

            return { bundle };
        } catch (error: any) {


            throw new Error(error.message)
        }

    },

    getAllBundles: async (filter: any) => {

        console.log("filter", filter);
        // try {
        //     const { data } = await apiClient.get('/bundle', { params: filter })
        //     return data
        // } catch (error: any) {
        //     const message = error?.response?.data?.message || error?.message || 'Something went wrong'
        //     throw new Error(message)
        // }

        try {
            const { data: bundles, error } = await supabase
                .from("course_bundle")
                .select(`
        id,
        title,
        description,
        price,
        discount_price,
        image_url,
        is_active,
        is_draft,
        created_at,
        final_price,
        total_courses_count,

            course_bundle_courses(count),
            bundle_enrollments(count)

      `)
                .eq("faculty_id", facultyId)
                .eq("is_draft", filter?.filter);

            if (error) {
                throw new Error(error.message);
            }

            const bundleIds = (bundles ?? []).map((bundle: any) => bundle.id);

            // Aggregate total revenue per bundle from enrollment payments.
            const revenueByBundle: Record<string, number> = {};

            if (bundleIds.length > 0) {
                const { data: enrollments, error: enrollmentsError } = await supabase
                    .from("bundle_enrollments")
                    .select("bundle_id, amount_paid")
                    .in("bundle_id", bundleIds);

                if (enrollmentsError) {
                    throw new Error(enrollmentsError.message);
                }

                for (const enrollment of enrollments ?? []) {
                    revenueByBundle[enrollment.bundle_id] =
                        (revenueByBundle[enrollment.bundle_id] ?? 0) +
                        (enrollment.amount_paid ?? 0);
                }
            }

            const bundlesWithStats = (bundles ?? []).map((bundle: any) => ({
                ...bundle,
                totalStudents: bundle.bundle_enrollments?.[0]?.count ?? 0,
                totalRevenue: revenueByBundle[bundle.id] ?? 0,
            }));

            return bundlesWithStats;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getBundleById: async (bundleId: string) => {
        // try {
        //     const { data } = await apiClient.get(`/bundle/${id}`)
        //     return data
        // } catch (error: any) {
        //     const message = error?.response?.data?.message || error?.message || 'Something went wrong'
        //     throw new Error(message)
        // }

        try {
            console.log("bundleId", bundleId);
            const { data: bundle, error } = await supabase
                .from("course_bundle")
                .select(`
        id,
        title,
        description,
        price,
        discount,
        image_url,
        is_active,
        is_draft,
        created_at,
        final_price,
        enable_coupons,
        total_courses_count,
        course_bundle_courses (
            courses (
                id,
                title
            )
        ),
        course_bundle_courses_count:course_bundle_courses(count)
    `)
                .eq("id", bundleId)
                .eq("faculty_id", facultyId)
                .single();
            if (error) {
                throw new Error(error.message);
            }

            return bundle;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    updateBundle: async (bundleId: string, data: any) => {
        // try {
        //     const { data: response } = await apiClient.patch(`/bundle/${id}`, data)
        //     return response
        // } catch (error: any) {
        //     const message = error?.response?.data?.message || error?.message || 'Something went wrong'
        //     throw new Error(message)
        // }

        try {
            // Fix: proper discount handling
            const discount = data.discount != null ? Number(data.discount) : null;
            console.log("bd", data)

            const [{ data: bundle, error: bundleError }] = await Promise.all([
                supabase
                    .from("course_bundle")
                    .update({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        final_price: data.finalPrice,
                        discount: Number(data.discount),
                        discount_type: "percentage",
                        image_url: data.coverImage ?? null,
                        enable_coupons: data.enableCoupons ?? false,
                        total_courses_count: data.courses.length,
                        is_draft: data.isDraft,
                    })
                    .eq("id", bundleId)
                    .eq("faculty_id", facultyId)
                    .select()
                    .single(),
            ]);

            // Fix: check bundle update error
            if (bundleError) throw new Error(bundleError.message);

            // Fix: delete + insert is cleaner than delete + upsert
            const { error: deleteError } = await supabase
                .from("course_bundle_courses")
                .delete()
                .eq("bundle_id", bundleId);

            if (deleteError) throw new Error(deleteError.message);

            // Only insert if courses exist
            if (data.courses.length > 0) {
                const courseBundleMapping = data.courses.map((courseId: string) => ({
                    bundle_id: bundleId,
                    course_id: courseId,
                }));

                const { error: insertError } = await supabase
                    .from("course_bundle_courses")
                    .insert(courseBundleMapping);

                if (insertError) throw new Error(insertError.message);
            }

            return { bundle };
        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    deleteBundle: async (bundleId: string) => {
        // try {
        //     const { data } = await apiClient.delete(`/bundle/${id}`)
        //     return data
        // } catch (error: any) {
        //     const message = error?.response?.data?.message || error?.message || 'Something went wrong'
        //     throw new Error(message)
        // }

        try {
            const { error } = await supabase
                .from("course_bundle")
                .delete()
                .eq("id", bundleId)
                .eq("faculty_id", facultyId);

            if (error) {
                throw new Error(error.message);
            }
            return { success: true };

        } catch (error: any) {

            throw new Error(error.message);
        }


    },
}