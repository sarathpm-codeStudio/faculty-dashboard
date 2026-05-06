


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

export const useVideoUploadProgress = (facultyId: string) => {
    const [uploads, setUploads] = useState<any[]>([])
    const timersRef = useRef<Record<string, NodeJS.Timeout>>({})

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

                    setUploads(prev => prev.map(u =>
                        u.unique_id === updated.unique_id
                            ? { ...u, ...updated }
                            : u
                    ))

                    // ✅ Your exact status values
                    if (updated.uploading_status === 'TRANSCODING') {
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
                (payload: any) => {
                    setUploads(prev => [{
                        ...payload.new,
                        transcoding_progress: 0,
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
                .not('uploading_status', 'eq', 'COMPLETED')  // ✅ your status
                .not('uploading_status', 'eq', 'FAILED')       // ✅ your status
                .order('created_at', { ascending: false })

            if (error) throw error

            const withProgress = (data ?? []).map(u => ({
                ...u,
                transcoding_progress: u.transcoding_progress ?? 0,
            }))

            setUploads(withProgress)

            // If already Transcoding → start fake progress
            withProgress.forEach(u => {
                if (u.uploading_status === 'TRANSCODING') {
                    startFakeProgress(u.unique_id)
                }
            })

        } catch (err) {
            console.error('fetchProgress error:', err)
        }
    }

    return { uploads }
}