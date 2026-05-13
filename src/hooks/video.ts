


// // hooks/useVideoUploadProgress.ts

// import { useEffect, useState } from 'react'
// import { supabase } from '@/services/supabase'
// import { videoService } from '@/services/videoService'

// export const useVideoUploadProgress = (facultyId: string) => {
//     const [uploads, setUploads] = useState<any[]>([])


//     useEffect(() => {
//         if (!facultyId) return

//         // 1. ONE initial API call to get current progress
//         fetchProgress()

//         // 2. Subscribe to Realtime — no more API calls needed ✅
//         const channel = supabase
//             .channel(`video_progress:${facultyId}`)
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'UPDATE',
//                     schema: 'public',
//                     table: 'video_upload_progress',
//                     filter: `faculty_id=eq.${facultyId}`,
//                 },
//                 (payload: any) => {
//                     const updated = payload.new

//                     setUploads(prev => prev.map(u =>
//                         u.unique_id === updated.unique_id
//                             ? { ...u, ...updated }
//                             : u
//                     ))
//                 }
//             )
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'INSERT',
//                     schema: 'public',
//                     table: 'video_upload_progress',
//                     filter: `faculty_id=eq.${facultyId}`,
//                 },
//                 (payload: any) => {
//                     setUploads(prev => [...prev, payload.new])
//                 }
//             )

//             .subscribe()

//         return () => {
//             channel.unsubscribe()
//         }

//     }, [facultyId])

//     const fetchProgress = async () => {
//         try {
//             const { data, error } = await supabase
//                 .from('video_upload_progress')
//                 .select('*')
//                 .eq('faculty_id', facultyId)
//                 .not('uploading_status', 'eq', 'ready')   // only active uploads
//                 .not('uploading_status', 'eq', 'failed')  // skip failed
//                 .order('created_at', { ascending: false })

//             if (error) throw error
//             setUploads(data ?? [])

//         } catch (err) {
//             console.error('fetchProgress error:', err)
//         }
//     }

//     return { uploads }
// }





// hooks/useVideoUploadProgress.ts

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/services/supabase'

// export const useVideoUploadProgress = (facultyId: string) => {
//     const [uploads, setUploads] = useState<any[]>([])
//     const timersRef = useRef<Record<string, NodeJS.Timeout>>({})

//     // ─── Start fake progress for one upload ──────────────
//     const startFakeProgress = (uniqueId: string) => {
//         if (timersRef.current[uniqueId]) {
//             clearInterval(timersRef.current[uniqueId])
//         }

//         timersRef.current[uniqueId] = setInterval(() => {
//             setUploads(prev => prev.map(u => {
//                 if (u.unique_id !== uniqueId) return u

//                 const current = u.transcoding_progress ?? 0

//                 if (current >= 90) {
//                     clearInterval(timersRef.current[uniqueId])
//                     return u
//                 }

//                 return {
//                     ...u,
//                     transcoding_progress: Math.min(
//                         90,
//                         Math.round(current + Math.random() * 3)
//                     )
//                 }
//             }))
//         }, 1000)
//     }

//     // ─── Stop fake progress ───────────────────────────────
//     const stopFakeProgress = (uniqueId: string) => {
//         if (timersRef.current[uniqueId]) {
//             clearInterval(timersRef.current[uniqueId])
//             delete timersRef.current[uniqueId]
//         }
//     }

//     useEffect(() => {
//         if (!facultyId) return

//         fetchProgress()

//         const channel = supabase
//             .channel(`video_progress:${facultyId}`)

//             // ─── UPDATE event ───────────────────────────────
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'UPDATE',
//                     schema: 'public',
//                     table: 'video_upload_progress',
//                     filter: `faculty_id=eq.${facultyId}`,
//                 },
//                 (payload: any) => {
//                     const updated = payload.new

//                     setUploads(prev => prev.map(u =>
//                         u.unique_id === updated.unique_id
//                             ? { ...u, ...updated }
//                             : u
//                     ))

//                     // ✅ Your exact status values
//                     if (updated.uploading_status === 'TRANSCODING') {
//                         startFakeProgress(updated.unique_id)
//                     }

//                     if (updated.uploading_status === 'COMPLETED') {
//                         stopFakeProgress(updated.unique_id)
//                         setUploads(prev => prev.map(u =>
//                             u.unique_id === updated.unique_id
//                                 ? { ...u, transcoding_progress: 100, uploading_status: 'COMPLETED' }
//                                 : u
//                         ))
//                     }

//                     if (updated.uploading_status === 'FAILED') {
//                         stopFakeProgress(updated.unique_id)
//                     }
//                 }
//             )

//             // ─── INSERT event ───────────────────────────────
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'INSERT',
//                     schema: 'public',
//                     table: 'video_upload_progress',
//                     filter: `faculty_id=eq.${facultyId}`,
//                 },
//                 (payload: any) => {
//                     setUploads(prev => [{
//                         ...payload.new,
//                         transcoding_progress: 0,
//                     }, ...prev])
//                 }
//             )

//             .subscribe()

//         return () => {
//             channel.unsubscribe()
//             Object.values(timersRef.current).forEach(clearInterval)
//         }

//     }, [facultyId])

//     // ─── Initial fetch ────────────────────────────────────
//     // const fetchProgress = async () => {
//     //     try {
//     //         const { data, error } = await supabase
//     //             .from('video_upload_progress')
//     //             .select('*')
//     //             .eq('faculty_id', facultyId)
//     //             .not('uploading_status', 'eq', 'COMPLETED')  // ✅ your status
//     //             .not('uploading_status', 'eq', 'FAILED')       // ✅ your status
//     //             .order('created_at', { ascending: false })

//     //         if (error) throw error



//     //         const withProgress = (data ?? []).map(u => ({
//     //             ...u,
//     //             transcoding_progress: u.transcoding_progress ?? 0,
//     //         }))

//     //         setUploads(withProgress)

//     //         // If already Transcoding → start fake progress
//     //         withProgress.forEach(u => {
//     //             if (u.uploading_status === 'TRANSCODING') {
//     //                 startFakeProgress(u.unique_id)
//     //             }
//     //         })

//     //     } catch (err) {
//     //         console.error('fetchProgress error:', err)
//     //     }
//     // }


//     const fetchProgress = async () => {
//         try {
//             // 1. Get all active uploads
//             const { data, error } = await supabase
//                 .from('video_upload_progress')
//                 .select('*')
//                 .eq('faculty_id', facultyId)
//                 .not('uploading_status', 'eq', 'COMPLETED')
//                 .not('uploading_status', 'eq', 'FAILED')
//                 .order('created_at', { ascending: false })

//             if (error) throw error
//             if (!data || data.length === 0) {
//                 setUploads([])
//                 return
//             }

//             // 2. Separate by type
//             const introItems = data.filter((u: any) => u.type === 'intro')
//             const moduleItems = data.filter((u: any) => u.type === 'module')

//             // 3. Fetch course details for intro videos
//             const introUniqueIds = introItems.map((u: any) => u.unique_id)
//             const { data: courses } = introUniqueIds.length > 0
//                 ? await supabase
//                     .from('courses')
//                     .select('id, title, cover_image, unique_id')
//                     .in('unique_id', introUniqueIds)
//                 : { data: [] }

//             // 4. Fetch material details for module videos
//             const moduleUniqueIds = moduleItems.map((u: any) => u.unique_id)
//             const { data: materials } = moduleUniqueIds.length > 0
//                 ? await supabase
//                     .from('course_materials')
//                     .select(`
//                     id,
//                     title,
//                     unique_id,
//                     courses (
//                         id,
//                         title,
//                         cover_image
//                     )
//                 `)
//                     .in('unique_id', moduleUniqueIds)
//                 : { data: [] }

//             // 5. Build lookup maps
//             const courseMap: Record<string, any> = {}
//             const materialMap: Record<string, any> = {}

//             courses?.forEach((c: any) => {
//                 courseMap[c.unique_id] = c
//             })

//             materials?.forEach((m: any) => {
//                 materialMap[m.unique_id] = m
//             })

//             // 6. Enrich uploads with details
//             const withProgress = data.map((u: any) => ({
//                 ...u,
//                 transcoding_progress: u.transcoding_progress ?? 0,
//                 details: u.type === 'intro'
//                     ? {
//                         course_id: courseMap[u.unique_id]?.id ?? null,
//                         course_title: courseMap[u.unique_id]?.title ?? 'Unknown Course',
//                         cover_image: courseMap[u.unique_id]?.cover_image ?? null,
//                         label: 'Intro Video',
//                     }
//                     : {
//                         course_id: materialMap[u.unique_id]?.courses?.id ?? null,
//                         course_title: materialMap[u.unique_id]?.courses?.title ?? 'Unknown Course',
//                         cover_image: materialMap[u.unique_id]?.courses?.cover_image ?? null,
//                         material_id: materialMap[u.unique_id]?.id ?? null,
//                         material_title: materialMap[u.unique_id]?.title ?? 'Unknown Video',
//                         label: materialMap[u.unique_id]?.title ?? 'Unknown Video',
//                     },
//             }))

//             setUploads(withProgress)

//             // 7. Start fake progress for transcoding
//             withProgress.forEach((u: any) => {
//                 if (u.uploading_status === 'Transcoding') {
//                     startFakeProgress(u.unique_id)
//                 }
//             })

//         } catch (err) {
//             console.error('fetchProgress error:', err)
//         }
//     }

//     return { uploads }
// }


import { useQueryClient } from '@tanstack/react-query'

// export const useVideoUploadProgress = (facultyId: any) => {
//     const [uploads, setUploads] = useState<any[]>([])
//     const timersRef = useRef<Record<string, NodeJS.Timeout>>({})
//     const queryClient = useQueryClient()  // ← added ✅

//     // ─── Start fake progress for one upload ──────────────
//     const startFakeProgress = (uniqueId: string) => {
//         if (timersRef.current[uniqueId]) {
//             clearInterval(timersRef.current[uniqueId])
//         }

//         timersRef.current[uniqueId] = setInterval(() => {
//             setUploads(prev => prev.map(u => {
//                 if (u.unique_id !== uniqueId) return u

//                 const current = u.transcoding_progress ?? 0

//                 if (current >= 90) {
//                     clearInterval(timersRef.current[uniqueId])
//                     return u
//                 }

//                 return {
//                     ...u,
//                     transcoding_progress: Math.min(
//                         90,
//                         Math.round(current + Math.random() * 3)
//                     )
//                 }
//             }))
//         }, 1000)
//     }

//     // ─── Stop fake progress ───────────────────────────────
//     const stopFakeProgress = (uniqueId: string) => {
//         if (timersRef.current[uniqueId]) {
//             clearInterval(timersRef.current[uniqueId])
//             delete timersRef.current[uniqueId]
//         }
//     }

//     useEffect(() => {
//         if (!facultyId) return

//         fetchProgress()

//         const channel = supabase
//             .channel(`video_progress:${facultyId}`)

//             // ─── UPDATE event ───────────────────────────────
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'UPDATE',
//                     schema: 'public',
//                     table: 'video_upload_progress',
//                     filter: `faculty_id=eq.${facultyId}`,
//                 },
//                 (payload: any) => {
//                     const updated = payload.new

//                     setUploads(prev => {

//                         // ✅ Get course_id from existing state
//                         const existing = prev.find(u => u.unique_id === updated.unique_id)
//                         const courseId = existing?.details?.course_id
//                         console.log('Invalidating content for course:', courseId)

//                         // ✅ Invalidate on EVERY update
//                         if (courseId) {
//                             queryClient.invalidateQueries({
//                                 queryKey: ['content', courseId]
//                             })
//                         }

//                         return prev.map(u =>
//                             u.unique_id === updated.unique_id
//                                 ? { ...u, ...updated }
//                                 : u
//                         )
//                     })

//                     if (updated.uploading_status === 'Transcoding') {
//                         startFakeProgress(updated.unique_id)
//                     }

//                     if (updated.uploading_status === 'COMPLETED') {
//                         stopFakeProgress(updated.unique_id)
//                         setUploads(prev => prev.map(u =>
//                             u.unique_id === updated.unique_id
//                                 ? { ...u, transcoding_progress: 100, uploading_status: 'COMPLETED' }
//                                 : u
//                         ))
//                     }

//                     if (updated.uploading_status === 'FAILED') {
//                         stopFakeProgress(updated.unique_id)
//                     }
//                 }
//             )

//             // ─── INSERT event ───────────────────────────────
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'INSERT',
//                     schema: 'public',
//                     table: 'video_upload_progress',
//                     filter: `faculty_id=eq.${facultyId}`,
//                 },
//                 (payload: any) => {
//                     setUploads(prev => [{
//                         ...payload.new,
//                         transcoding_progress: 0,
//                     }, ...prev])
//                 }
//             )

//             .subscribe()

//         return () => {
//             channel.unsubscribe()
//             Object.values(timersRef.current).forEach(clearInterval)
//         }

//     }, [facultyId])

//     // ─── Initial fetch ────────────────────────────────────
//     const fetchProgress = async () => {
//         try {
//             const { data, error } = await supabase
//                 .from('video_upload_progress')
//                 .select('*')
//                 .eq('faculty_id', facultyId)
//                 .not('uploading_status', 'eq', 'COMPLETED')
//                 .not('uploading_status', 'eq', 'FAILED')
//                 .order('created_at', { ascending: false })

//             if (error) throw error
//             if (!data || data.length === 0) {
//                 setUploads([])
//                 return
//             }

//             const introItems = data.filter((u: any) => u.type === 'intro')
//             const moduleItems = data.filter((u: any) => u.type === 'module')

//             const introUniqueIds = introItems.map((u: any) => u.unique_id)
//             const moduleUniqueIds = moduleItems.map((u: any) => u.unique_id)

//             const { data: courses } = introUniqueIds.length > 0
//                 ? await supabase
//                     .from('courses')
//                     .select('id, title, cover_image, intro_video_unique_id')
//                     .in('intro_video_unique_id', introUniqueIds)
//                 : { data: [] }

//             const { data: materials } = moduleUniqueIds.length > 0
//                 ? await supabase
//                     .from('course_materials')
//                     .select(`
//                         id,
//                         title,
//                         unique_id,
//                         courses (
//                             id,
//                             title,
//                             cover_image
//                         )
//                     `)
//                     .in('unique_id', moduleUniqueIds)
//                 : { data: [] }

//             const courseMap: Record<string, any> = {}
//             const materialMap: Record<string, any> = {}

//             courses?.forEach((c: any) => {
//                 courseMap[c.intro_video_unique_id] = c
//             })

//             materials?.forEach((m: any) => {
//                 materialMap[m.unique_id] = m
//             })

//             const withProgress = data.map((u: any) => ({
//                 ...u,
//                 transcoding_progress: u.transcoding_progress ?? 0,
//                 details: u.type === 'intro'
//                     ? {
//                         course_id: courseMap[u.unique_id]?.id ?? null,
//                         course_title: courseMap[u.unique_id]?.title ?? 'Unknown Course',
//                         cover_image: courseMap[u.unique_id]?.cover_image ?? null,
//                         label: 'Intro Video',
//                     }
//                     : {
//                         course_id: materialMap[u.unique_id]?.courses?.id ?? null,
//                         course_title: materialMap[u.unique_id]?.courses?.title ?? 'Unknown Course',
//                         cover_image: materialMap[u.unique_id]?.courses?.cover_image ?? null,
//                         material_id: materialMap[u.unique_id]?.id ?? null,
//                         material_title: materialMap[u.unique_id]?.title ?? 'Unknown Video',
//                         label: materialMap[u.unique_id]?.title ?? 'Unknown Video',
//                     },
//             }))

//             setUploads(withProgress)

//             withProgress.forEach((u: any) => {
//                 if (u.uploading_status === 'Transcoding') {
//                     startFakeProgress(u.unique_id)
//                 }
//             })

//         } catch (err) {
//             console.error('fetchProgress error:', err)
//         }
//     }

//     return { uploads }
// }


export const useVideoUploadProgress = (facultyId: any) => {
    const [uploads, setUploads] = useState<any[]>([])
    const timersRef = useRef<Record<string, NodeJS.Timeout>>({})
    const queryClient = useQueryClient()

    // ─── Start fake progress for one upload ──────────────
    const startFakeProgress = (uniqueId: string) => {
        if (timersRef.current[uniqueId]) {
            clearInterval(timersRef.current[uniqueId])
        }

        timersRef.current[uniqueId] = setInterval(() => {
            setUploads(prev => prev.map(u => {
                if (u.unique_id !== uniqueId) return u

                const current = u.transcoding_progress ?? 0

                if (current >= 90) {
                    clearInterval(timersRef.current[uniqueId])
                    return u
                }

                return {
                    ...u,
                    transcoding_progress: Math.min(
                        90,
                        Math.round(current + Math.random() * 3)
                    )
                }
            }))
        }, 1000)
    }

    // ─── Stop fake progress ───────────────────────────────
    const stopFakeProgress = (uniqueId: string) => {
        if (timersRef.current[uniqueId]) {
            clearInterval(timersRef.current[uniqueId])
            delete timersRef.current[uniqueId]
        }
    }

    // ─── Fetch details for a single row ──────────────────
    const fetchDetailsForRow = async (row: any) => {
        if (row.type === 'intro') {
            const { data: course } = await supabase
                .from('courses')
                .select('id, title, cover_image, intro_video_unique_id')
                .eq('intro_video_unique_id', row.unique_id)
                .single()

            return {
                course_id: course?.id ?? null,
                course_title: course?.title ?? 'Unknown Course',
                cover_image: course?.cover_image ?? null,
                label: 'Intro Video',
            }

        } else {
            const { data: material }: any = await supabase
                .from('course_materials')
                .select(`
                    id,
                    title,
                    unique_id,
                    courses (
                        id,
                        title,
                        cover_image
                    )
                `)
                .eq('unique_id', row.unique_id)
                .single()

            return {
                course_id: material?.courses?.id ?? null,
                course_title: material?.courses?.title ?? 'Unknown Course',
                cover_image: material?.courses?.cover_image ?? null,
                material_id: material?.id ?? null,
                material_title: material?.title ?? 'Unknown Video',
                label: material?.title ?? 'Unknown Video',
            }
        }
    }

    useEffect(() => {
        if (!facultyId) return

        fetchProgress()

        const channel = supabase
            .channel(`video_progress:${facultyId}`)

            // ─── UPDATE event ───────────────────────────────
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'video_upload_progress',
                    filter: `faculty_id=eq.${facultyId}`,
                },
                (payload: any) => {
                    const updated = payload.new

                    setUploads(prev => {

                        // ✅ Get course_id from existing state
                        const existing = prev.find(u => u.unique_id === updated.unique_id)
                        const courseId = existing?.details?.course_id

                        // ✅ Invalidate on EVERY update
                        if (courseId) {
                            queryClient.invalidateQueries({
                                queryKey: ['content', courseId]
                            })
                        }

                        return prev.map(u =>
                            u.unique_id === updated.unique_id
                                ? { ...u, ...updated }
                                : u
                        )
                    })

                    if (updated.uploading_status === 'Transcoding') {
                        startFakeProgress(updated.unique_id)
                    }

                    if (updated.uploading_status === 'COMPLETED') {
                        stopFakeProgress(updated.unique_id)
                        setUploads(prev => prev.map(u =>
                            u.unique_id === updated.unique_id
                                ? { ...u, transcoding_progress: 100, uploading_status: 'COMPLETED' }
                                : u
                        ))
                    }

                    if (updated.uploading_status === 'FAILED') {
                        stopFakeProgress(updated.unique_id)
                    }
                }
            )

            // ─── INSERT event ───────────────────────────────
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'video_upload_progress',
                    filter: `faculty_id=eq.${facultyId}`,
                },
                async (payload: any) => {
                    const newRow = payload.new

                    // ✅ Fetch details for new row
                    const details = await fetchDetailsForRow(newRow)

                    setUploads(prev => [{
                        ...newRow,
                        transcoding_progress: 0,
                        details,  // ← details included ✅
                    }, ...prev])
                }
            )

            .subscribe()

        return () => {
            channel.unsubscribe()
            Object.values(timersRef.current).forEach(clearInterval)
        }

    }, [facultyId])

    // ─── Initial fetch ────────────────────────────────────
    const fetchProgress = async () => {
        try {
            const { data, error } = await supabase
                .from('video_upload_progress')
                .select('*')
                .eq('faculty_id', facultyId)
                .not('uploading_status', 'eq', 'COMPLETED')
                .not('uploading_status', 'eq', 'FAILED')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (!data || data.length === 0) {
                setUploads([])
                return
            }

            const introItems = data.filter((u: any) => u.type === 'intro')
            const moduleItems = data.filter((u: any) => u.type === 'module')

            const introUniqueIds = introItems.map((u: any) => u.unique_id)
            const moduleUniqueIds = moduleItems.map((u: any) => u.unique_id)

            console.log('introUniqueIds', introUniqueIds)


            const { data: courses } = introUniqueIds.length > 0
                ? await supabase
                    .from('courses')
                    .select('id, title, cover_image,unique_id')
                    .in('unique_id', introUniqueIds)
                : { data: [] }

            const { data: materials } = moduleUniqueIds.length > 0
                ? await supabase
                    .from('course_materials')
                    .select(`
                        id,
                        title,
                        unique_id,
                        courses (
                            id,
                            title,
                            cover_image
                        )
                    `)
                    .in('unique_id', moduleUniqueIds)
                : { data: [] }

            const courseMap: Record<string, any> = {}
            const materialMap: Record<string, any> = {}

            courses?.forEach((c: any) => {
                console.log('c>>>>>>>>>>>>>>>>>>>>', c)
                courseMap[c.unique_id] = c
            })

            materials?.forEach((m: any) => {
                materialMap[m.unique_id] = m
            })

            console.log('courseMap', courseMap)
            console.log('materialMap', materialMap)

            const withProgress = data.map((u: any) => ({
                ...u,
                transcoding_progress: u.transcoding_progress ?? 0,
                details: u.type === 'intro'
                    ? {
                        course_id: courseMap[u.unique_id]?.id ?? null,
                        course_title: courseMap[u.unique_id]?.title ?? 'Unknown Course',
                        cover_image: courseMap[u.unique_id]?.cover_image ?? null,
                        label: 'Intro Video',
                    }
                    : {
                        course_id: materialMap[u.unique_id]?.courses?.id ?? null,
                        course_title: materialMap[u.unique_id]?.courses?.title ?? 'Unknown Course',
                        cover_image: materialMap[u.unique_id]?.courses?.cover_image ?? null,
                        material_id: materialMap[u.unique_id]?.id ?? null,
                        material_title: materialMap[u.unique_id]?.title ?? 'Unknown Video',
                        label: materialMap[u.unique_id]?.title ?? 'Unknown Video',
                    },
            }))

            setUploads(withProgress)

            withProgress.forEach((u: any) => {
                if (u.uploading_status === 'Transcoding') {
                    startFakeProgress(u.unique_id)
                }
            })

        } catch (err) {
            console.error('fetchProgress error:', err)
        }
    }

    return { uploads }
}