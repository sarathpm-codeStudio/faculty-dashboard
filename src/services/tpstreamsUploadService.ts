


// import { videoService } from '@/services/videoService'
// import { useUploadStore } from '@/store/uploadStore'
// import { toast } from 'sonner'

// type UploadStatus = 'uploading' | 'saving' | 'done' | 'failed'

// type UploadCallback = {
//     onProgress?: (percentage: number) => void
//     onStatus?: (status: UploadStatus) => void
//     onSuccess?: (assetId: string) => void
//     onError?: () => void
// }

// class TPStreamsUploadService {
//     private uploader: any = null
//     private isReady: boolean = false
//     private courseUniqueId: string = ''
//     private type: string = ''

//     // ─── Load SDK once ──────────────────────────────────
//     init() {
//         if ((window as any).TpStreamsUploaderSDK) {
//             this._initSDK()
//             return
//         }

//         const existing = document.querySelector(
//             'script[src*="tpstreams-uploader"]'
//         ) as HTMLScriptElement | null

//         if (existing) {
//             existing.addEventListener('load', () => this._initSDK())
//             return
//         }

//         const script = document.createElement('script')
//         script.src = 'https://static.testpress.in/static/js/tpstreams-uploader.min.js'
//         script.async = true
//         script.onload = () => this._initSDK()
//         document.head.appendChild(script)
//     }

//     // ─── Initialize SDK ─────────────────────────────────
//     private _initSDK() {
//         this.uploader = new (window as any).TpStreamsUploaderSDK(
//             import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN,
//             import.meta.env.VITE_TPSTREAMS_ORG_ID,
//             {
//                 contentProtectionType: "drm",
//                 resolutions: ['240p', '360p', '480p', '720p'],
//                 generateSubtitle: false,
//             }
//         )

//         const { addUpload, updateUpload, removeUpload } = useUploadStore.getState()

//         // ─── Progress ────────────────────────────────────
//         this.uploader.on('uploadProgress', (data: any) => {
//             updateUpload(data.asset_id, {
//                 progress: data.progress_percentage,
//                 status: 'uploading',
//             })
//         })

//         // ─── Success ─────────────────────────────────────
//         this.uploader.on('uploadSuccess', async (data: any) => {
//             console.log('Upload success, asset_id:', data.asset_id)

//             updateUpload(data.asset_id, { status: 'saving' })

//             try {
//                 // ✅ Auto calls API even if user navigated away
//                 await videoService.createVideoUploadProgress(
//                     this.courseUniqueId,
//                     data.asset_id,
//                     this.type

//                 )

//                 updateUpload(data.asset_id, {
//                     status: 'done',
//                     progress: 100,
//                 })

//                 toast.success('Video uploaded successfully!')

//                 // Remove from indicator after 3s
//                 setTimeout(() => removeUpload(data.asset_id), 3000)

//             } catch (err) {
//                 updateUpload(data.asset_id, { status: 'failed' })
//                 toast.error('Failed to save video info')
//             }
//         })

//         // ─── Error ───────────────────────────────────────
//         this.uploader.on('uploadError', (data: any) => {
//             console.error('Upload error:', data.error)
//             const { updateUpload } = useUploadStore.getState()
//             updateUpload(data.asset_id, { status: 'failed' })
//             toast.error('Video upload failed')
//         })

//         this.isReady = true
//     }

//     // ─── Start upload ────────────────────────────────────
//     upload(
//         file: File,
//         uniqueId: string,
//         type: string,
//         callbacks: UploadCallback = {}
//     ) {
//         if (!this.uploader) {
//             toast.error('Uploader not ready. Please try again.')
//             return
//         }

        

//         const { addUpload, updateUpload } = useUploadStore.getState()

//         // Save courseId for uploadSuccess callback
//         this.courseUniqueId = uniqueId
//         this.type = type

//         // Add to global indicator
//         const tempId = `temp_${Date.now()}`
//         addUpload(tempId, {
//             id: tempId,
//             fileName: file.name,
//             progress: 0,
//             status: 'uploading',
//         })

//         // Update tempId to real asset_id on first progress
//         this.uploader.on('uploadProgress', (data: any) => {
//             // Move from tempId to real asset_id
//             const { uploads, removeUpload } = useUploadStore.getState()
//             if (uploads[tempId]) {
//                 removeUpload(tempId)
//                 addUpload(data.asset_id, {
//                     id: data.asset_id,
//                     fileName: file.name,
//                     progress: data.progress_percentage,
//                     status: 'uploading',
//                 })
//             }
//             callbacks.onProgress?.(data.progress_percentage)
//             callbacks.onStatus?.('uploading')
//         })

//         this.uploader.on('uploadSuccess', (data: any) => {
//             callbacks.onSuccess?.(data.asset_id)
//             callbacks.onStatus?.('done')
//         })

//         this.uploader.on('uploadError', () => {
//             callbacks.onStatus?.('failed')
//             callbacks.onError?.()
//         })

//         // ✅ Correct SDK usage
//         this.uploader.selectFiles([file])
//         this.uploader.upload()
//     }

//     isUploaderReady() {
//         return this.isReady
//     }
// }

// // ✅ Single global instance
// export const tpstreamsUploadService = new TPStreamsUploadService()









import { videoService } from '@/services/videoService'
import { useUploadStore } from '@/store/uploadStore'
import { toast } from 'sonner'

type UploadStatus = 'uploading' | 'saving' | 'done' | 'failed'

type UploadCallback = {
    onProgress?: (percentage: number) => void
    onStatus?: (status: UploadStatus) => void
    onSuccess?: (assetId: string) => void
    onError?: () => void
}

class TPStreamsUploadService {
    private uploader: any = null
    private isReady: boolean = false
    private courseUniqueId: string = ''
    private type: string = ''

    // ─── Load SDK once ──────────────────────────────────
    init() {
        if ((window as any).TpStreamsUploaderSDK) {
            this._initSDK()
            return
        }

        const existing = document.querySelector(
            'script[src*="tpstreams-uploader"]'
        ) as HTMLScriptElement | null

        if (existing) {
            existing.addEventListener('load', () => this._initSDK())
            return
        }

        const script = document.createElement('script')
        script.src = 'https://static.testpress.in/static/js/tpstreams-uploader.min.js'
        script.async = true
        script.onload = () => this._initSDK()
        document.head.appendChild(script)
    }

    // ─── Initialize SDK (default DRM) ───────────────────
    private _initSDK() {
        this.uploader = new (window as any).TpStreamsUploaderSDK(
            import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN,
            import.meta.env.VITE_TPSTREAMS_ORG_ID,
            {
                contentProtectionType: 'drm',
                resolutions: ['240p', '360p', '480p', '720p'],
                generateSubtitle: false,
            }
        )

        this._bindEvents()
        this.isReady = true
    }

    // ─── Reinitialise SDK with type and wait until ready ─
    private _initSDKWithType(type: string): Promise<void> {
        return new Promise((resolve) => {
            // ✅ Log env vars to catch undefined early
            console.log('TPSTREAMS token:', import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN)
            console.log('TPSTREAMS orgId:', import.meta.env.VITE_TPSTREAMS_ORG_ID)

            this.uploader = new (window as any).TpStreamsUploaderSDK(
                import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN,
                import.meta.env.VITE_TPSTREAMS_ORG_ID,
                {
                    contentProtectionType: type === 'intro' ? 'disabled' : 'drm', // ✅ fixed
                    resolutions: ['240p', '360p', '480p', '720p'],
                    generateSubtitle: false,
                }
            )

            this._bindEvents()

            // ✅ Wait for SDK ready event, fallback to 1000ms
            if (this.uploader?.on) {
                this.uploader.on('ready', () => resolve())
            }

            // Fallback — resolve after 1s regardless
            setTimeout(() => resolve(), 1000)
        })
    }

    // ─── Bind all SDK global store events ───────────────
    private _bindEvents() {
        const { addUpload, updateUpload, removeUpload } = useUploadStore.getState()

        this.uploader.on('uploadProgress', (data: any) => {
            updateUpload(data.asset_id, {
                progress: data.progress_percentage,
                status: 'uploading',
            })
        })

        this.uploader.on('uploadSuccess', async (data: any) => {
            console.log('Upload success, asset_id:', data.asset_id)

            updateUpload(data.asset_id, { status: 'saving' })

            try {
                await videoService.createVideoUploadProgress(
                    this.courseUniqueId,
                    data.asset_id,
                    this.type,
                    "uploaded"
                )

                updateUpload(data.asset_id, {
                    status: 'done',
                    progress: 100,
                })

                toast.success('Video uploaded successfully!')

                setTimeout(() => removeUpload(data.asset_id), 3000)

            } catch (err) {
                if (data.asset_id && this.courseUniqueId) {
                    try {
                        await videoService.createVideoUploadProgress(
                            this.courseUniqueId,
                            data.asset_id,
                            this.type,
                            'FAILED'
                        )
                    } catch (apiErr) {
                        console.error('Failed to record upload failure:', apiErr)
                    }
                }

                updateUpload(data.asset_id, { status: 'failed' })
                toast.error('Failed to save video info')
            }
        })

        this.uploader.on('uploadError', async (data: any) => {
            console.error('Upload error:', data.error)
            const { updateUpload } = useUploadStore.getState()
            updateUpload(data.asset_id, { status: 'failed' })
            toast.error('Video upload failed')

            if (data.asset_id && this.courseUniqueId) {
                try {
                    await videoService.createVideoUploadProgress(
                        this.courseUniqueId,
                        data.asset_id,
                        this.type,
                        'FAILED'
                    )
                } catch (apiErr) {
                    console.error('Failed to record upload failure:', apiErr)
                }
            }
        })

        this.isReady = true
    }

    // ─── Start upload ────────────────────────────────────
    async upload(
        file: File,
        uniqueId: string,
        type: string,
        callbacks: UploadCallback = {}
    ) {
        // Save for uploadSuccess callback
        this.courseUniqueId = uniqueId
        this.type = type

        // ✅ Reinitialise SDK and wait until fully ready
        await this._initSDKWithType(type)

        const { addUpload, removeUpload } = useUploadStore.getState()

        // Add to global indicator with temp id
        const tempId = `temp_${Date.now()}`
        addUpload(tempId, {
            id: tempId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
        })

        // ─── Per-upload callback events ──────────────────
        this.uploader.on('uploadProgress', (data: any) => {
            const { uploads } = useUploadStore.getState()
            if (uploads[tempId]) {
                removeUpload(tempId)
                addUpload(data.asset_id, {
                    id: data.asset_id,
                    fileName: file.name,
                    progress: data.progress_percentage,
                    status: 'uploading',
                })
            }
            callbacks.onProgress?.(data.progress_percentage)
            callbacks.onStatus?.('uploading')
        })

        this.uploader.on('uploadSuccess', (data: any) => {
            callbacks.onSuccess?.(data.asset_id)
            callbacks.onStatus?.('done')
        })

        this.uploader.on('uploadError', () => {
            callbacks.onStatus?.('failed')
            callbacks.onError?.()
        })

        // ✅ SDK is ready — safe to upload now
        this.uploader.selectFiles([file])
        this.uploader.upload()
    }

    isUploaderReady() {
        return this.isReady
    }
}

// ✅ Single global instance
export const tpstreamsUploadService = new TPStreamsUploadService()