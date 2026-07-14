import { supabase } from "@/services/supabase"
import { useAuthStore } from "@/store/authStore"

// Read the faculty id on every call so it reflects the current user.
// Reading once at module load captures a stale/undefined value that
// survives logout/login without a page reload.
const getCurrentFacultyId = () => useAuthStore.getState().user?.id;

// How many of each type the suggestion dropdown shows.
const RESULT_LIMIT = 5;

// A student can be enrolled in several of the faculty's courses, so the
// enrollment query returns duplicate students. Over-fetch, then dedupe and
// narrow down to RESULT_LIMIT.
const ENROLLMENT_FETCH_LIMIT = 60;

export type SearchResultType = 'course' | 'student';

export interface SearchResult {
    type: SearchResultType;
    id: string;
    title: string;
    subtitle: string;
    image?: string | null;
}

export interface SearchResults {
    courses: SearchResult[];
    students: SearchResult[];
}

// The student `or(...)` filter is built by string interpolation, so commas,
// parens and quotes in the term would break out of the filter expression and
// make PostgREST reject the whole query. Strip them. LIKE wildcards (% and _)
// are left alone: they can only widen the match, never escape the expression.
const sanitize = (term: string) => term.replace(/[,()"']/g, ' ').trim();

export const searchService = {

    /**
     * Global search across the faculty's OWN courses and students.
     *
     * Ownership rules (mirroring the rest of the app):
     *  - a course is the faculty's if `courses.faculty_id` is theirs;
     *  - a student is the faculty's only by being enrolled in one of those
     *    courses — there is no `students.faculty_id`. The `!inner` joins below
     *    make the `course.faculty_id` filter drop non-owned enrollments rather
     *    than merely nulling the embedded course.
     */
    search: async (rawTerm: string): Promise<SearchResults> => {
        const facultyId = getCurrentFacultyId();
        const term = sanitize(rawTerm);

        if (!facultyId || !term) return { courses: [], students: [] };

        const [courses, students] = await Promise.all([
            searchCourses(facultyId, term),
            searchStudents(facultyId, term),
        ]);

        return { courses, students };
    },
};

const searchCourses = async (facultyId: string, term: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
        .from("courses")
        .select("id, title, category, cover_image, enrollments(count)")
        .eq("faculty_id", facultyId)
        .eq("is_deleted", false)
        .ilike("title", `%${term}%`)
        .order("created_at", { ascending: false })
        .limit(RESULT_LIMIT);

    if (error) throw new Error(error.message);

    return (data ?? []).map((course: any) => {
        const enrolled = course.enrollments?.[0]?.count ?? 0;
        return {
            type: 'course' as const,
            id: course.id,
            title: course.title ?? 'Untitled course',
            subtitle: [course.category, `${enrolled} enrolled`].filter(Boolean).join(' · '),
            image: course.cover_image,
        };
    });
};

const searchStudents = async (facultyId: string, term: string): Promise<SearchResult[]> => {
    const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    // Postgres can't match "sophy mathew" against first_name or last_name on its
    // own, so cast a wide OR net (any token against any field) and require ALL
    // tokens to be present once the rows are back.
    const orFilter = tokens
        .flatMap((t) => [`first_name.ilike.%${t}%`, `last_name.ilike.%${t}%`, `email.ilike.%${t}%`])
        .join(',');

    const { data, error } = await supabase
        .from("enrollments")
        .select(`
            student:profiles!enrollments_student_id_fkey!inner (
                id,
                first_name,
                last_name,
                email,
                avatar_url
            ),
            course:courses!enrollments_course_id_fkey!inner (
                faculty_id
            )
        `)
        .eq("course.faculty_id", facultyId)
        .or(orFilter, { referencedTable: "student" })
        .limit(ENROLLMENT_FETCH_LIMIT);

    if (error) throw new Error(error.message);

    const seen = new Set<string>();
    const results: SearchResult[] = [];

    for (const row of (data ?? []) as any[]) {
        const student = row.student;
        if (!student || seen.has(student.id)) continue;

        const fullName = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim();
        const haystack = `${fullName} ${student.email ?? ''}`.toLowerCase();
        if (!tokens.every((t) => haystack.includes(t))) continue;

        seen.add(student.id);
        results.push({
            type: 'student',
            id: student.id,
            title: fullName || 'Unnamed student',
            subtitle: student.email ?? '',
            image: student.avatar_url,
        });

        if (results.length === RESULT_LIMIT) break;
    }

    return results;
};
