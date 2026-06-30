


import { supabase } from "@/services/supabase"
import { useAuthStore } from "@/store/authStore"
import { parseTimePeriod } from "@/utils/timePeriod"

// Read the faculty id on every call so it reflects the current user.
// Reading once at module load captures a stale/undefined value that
// survives logout/login without a page reload.
const getCurrentFacultyId = () => useAuthStore.getState().user?.id;




export const announcementService = {

    createAnnouncement: async (data: any) => {
        // try {
        //     const { data: response } = await apiClient.post('/announcements', payload)
        //     return response
        // } catch (error: any) {
        //     throw error.message
        // }
        try {

            if (data?.audience !== "all") {
                const { data: course, error } = await supabase.from("courses")
                    .select("*")
                    .eq("id", data.audience)
                    .eq("faculty_id", getCurrentFacultyId())
                    .single();
                if (error) {
                    throw new Error(error.message)
                }
                if (!course) {
                    throw new Error("Course not found")
                }
            }

            const { data: announcement, error } = await supabase.from("announcements")
                .insert({
                    faculty_id: getCurrentFacultyId(),
                    admin_created: false,
                    audience: data.audience === "all" ? "students" : "course",
                    title: data.title,
                    content: data.content,
                    course_id: data.audience === "all" ? null : data.audience,
                    image_url: data.image_url ?? null,
                    time_period: data.timePeriod ?? null,
                    is_draft: data.isDraft ?? true,
                    published: !data.isDraft ? new Date() : null,
                })
                .select()
                .single();

            if (error) {
                throw new Error(error.message)
            }

            return announcement;

        } catch (error: any) {

            throw new Error(error.message)
        }
    },

    getAllAnnouncements: async (payload: any) => {
        // try {
        //     const { data: response } = await apiClient.get('/announcements', { params: payload })
        //     return response
        // } catch (error: any) {
        //     throw error.message
        // }

        const { page, limit, search, filter, start_date, end_date } = payload;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("announcements")
            .select("*, courses(id, title)", { count: "exact" })
            .eq("faculty_id", getCurrentFacultyId())
            .eq("is_deleted", false);

        if (filter !== "all") {
            // `is_draft` is a boolean column — map the string filter to a boolean.
            query = query.eq("is_draft", filter === "draft");
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        query = query.order("created_at", { ascending: false });

        // The date range is stored inside the `time_period` text column. PostgREST
        // can't range-query a substring of it, so when a range is requested we
        // fetch the (faculty-scoped) matches and filter by overlap in JS, then
        // paginate the result. ISO yyyy-mm-dd strings compare correctly as text,
        // so no Date parsing is needed.
        if (start_date && end_date) {
            const { data, error } = await query;
            if (error) throw new Error(error.message);

            const overlapping = (data ?? []).filter((a: any) => {
                const period = parseTimePeriod(a.time_period);
                if (!period) return false;
                return period.start <= end_date && period.end >= start_date;
            });

            return {
                data: overlapping.slice(from, to + 1),
                total: overlapping.length,
            };
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw new Error(error.message);

        return { data, total: count ?? 0 };
    },

    getAnnouncementById: async (announcementId: number) => {
        // try {
        //     const { data: response } = await apiClient.get(`/announcements/${id}`)
        //     return response
        // } catch (error: any) {
        //     throw error.message
        // }

        try {

            console.log("announcementId", announcementId);
            const { data, error } = await supabase.from("announcements")
                .select("*, courses(id, title)")
                .eq("id", announcementId)
                .single();

            if (error) {
                throw new Error(error.message)
            }

            return data;

        } catch (error: any) {

            throw new Error(error.message)
        }
    },

    updateAnnouncement: async (announcementId: any, data: any) => {
        // try {
        //     const { data: response } = await apiClient.patch(`/announcements/${id}`, payload)
        //     return response
        // } catch (error: any) {
        //     throw error.message
        // }

        try {

            const { data: announcement, error } = await supabase.from("announcements")
                .update({

                    audience: data.audience === "all" ? "students" : "course",
                    title: data.title,
                    content: data.content,
                    course_id: data.audience === "all" ? null : data.audience,
                    image_url: data.image_url ?? null,
                    time_period: data.timePeriod ?? null,
                    is_draft: data.isDraft ?? true,
                    published: !data.isDraft ? new Date() : null,

                })
                .eq("id", announcementId)
                .select()
                .single();

            if (error) {
                throw new Error(error.message)
            }

            return announcement;

        } catch (error: any) {

            throw new Error(error.message)
        }


    },

    deleteAnnouncement: async (announcementId: any) => {
        // try {
        //     const { data: response } = await apiClient.delete(`/announcements/${id}`)
        //     return response
        // } catch (error: any) {
        //     throw error.message
        // }

        try {

            const { error } = await supabase.from("announcements")
                .delete()
                .eq("id", announcementId)
                .eq("faculty_id", getCurrentFacultyId());

            if (error) {
                throw new Error(error.message)
            }

            return { message: "Announcement deleted successfully" };

        } catch (error: any) {

            throw new Error(error.message)
        }
    },
}
