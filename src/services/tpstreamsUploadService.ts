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

type UploadMeta = {
    uniqueId: string
    type: string
    fileName: string
    tempId: string
    callbacks: UploadCallback
    assetId?: string
}

type QueuedUpload = {
    file: File
    meta: UploadMeta
}

class TPStreamsUploadService {
    private uploader: any = null
    private isReady = false
    private sdkProtectionType: 'disabled' | 'drm' | null = null
    private eventsBoundUploader: any = null

    private uploadQueue: QueuedUpload[] = []
    private isProcessing = false
    private activeMeta: UploadMeta | null = null
    private uploadMetaByAssetId = new Map<string, UploadMeta>()

    init() {
        if ((window as any).TpStreamsUploaderSDK) {
            this.ensureSDK('module')
            return
        }

        const existing = document.querySelector(
            'script[src*="tpstreams-uploader"]'
        ) as HTMLScriptElement | null

        if (existing) {
            existing.addEventListener('load', () => this.ensureSDK('module'))
            return
        }

        const script = document.createElement('script')
        script.src = 'https://static.testpress.in/static/js/tpstreams-uploader.min.js'
        script.async = true
        script.onload = () => this.ensureSDK('module')
        document.head.appendChild(script)
    }

    private getProtectionType(type: string): 'disabled' | 'drm' {
        return type === 'intro' ? 'disabled' : 'drm'
    }

    private createUploader(protection: 'disabled' | 'drm') {
        this.uploader = new (window as any).TpStreamsUploaderSDK(
            import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN,
            import.meta.env.VITE_TPSTREAMS_ORG_ID,
            {
                contentProtectionType: protection,
                resolutions: ['240p', '360p', '480p', '720p'],
                generateSubtitle: false,
            }
        )
        this.sdkProtectionType = protection
        this.eventsBoundUploader = null
        this._bindEvents()
        this.isReady = true
    }

    private async ensureSDK(type: string): Promise<void> {
        const protection = this.getProtectionType(type)

        if (this.uploader && this.sdkProtectionType === protection) {
            return
        }

        if (!(window as any).TpStreamsUploaderSDK) {
            await new Promise<void>((resolve) => {
                const check = () => {
                    if ((window as any).TpStreamsUploaderSDK) resolve()
                    else setTimeout(check, 100)
                }
                check()
            })
        }

        this.createUploader(protection)

        await new Promise<void>((resolve) => {
            if (this.uploader?.on) {
                this.uploader.on('ready', () => resolve())
            }
            setTimeout(resolve, 500)
        })
    }

    private linkAssetToMeta(assetId: string): UploadMeta | undefined {
        const existing = this.uploadMetaByAssetId.get(assetId)
        if (existing) return existing

        if (!this.activeMeta || this.activeMeta.assetId) return undefined

        this.activeMeta.assetId = assetId
        this.uploadMetaByAssetId.set(assetId, this.activeMeta)
        return this.activeMeta
    }

    private removeMeta(assetId: string) {
        const meta = this.uploadMetaByAssetId.get(assetId)
        if (meta) {
            this.uploadMetaByAssetId.delete(assetId)
        }
        if (this.activeMeta?.assetId === assetId) {
            this.activeMeta = null
        }
    }

    private finishActiveUpload() {
        this.activeMeta = null
        this.isProcessing = false
        void this.processQueue()
    }

    private async processQueue() {
        if (this.isProcessing || this.uploadQueue.length === 0) return

        const job = this.uploadQueue.shift()
        if (!job) return

        this.isProcessing = true
        this.activeMeta = job.meta

        try {
            await this.ensureSDK(job.meta.type)

            if (!this.uploader) {
                throw new Error('Uploader not ready')
            }

            job.meta.callbacks.onStatus?.('uploading')
            this.uploader.selectFiles([job.file])
            this.uploader.upload()
        } catch (err) {
            console.error('Failed to start upload:', err)
            const { removeUpload } = useUploadStore.getState()
            removeUpload(job.meta.tempId)
            job.meta.callbacks.onStatus?.('failed')
            job.meta.callbacks.onError?.()
            toast.error(
                err instanceof Error && err.message.includes('Cannot add more files')
                    ? 'Please wait for the current upload to finish'
                    : 'Failed to start video upload'
            )
            this.finishActiveUpload()
        }
    }

    private _bindEvents() {
        if (!this.uploader || this.eventsBoundUploader === this.uploader) return
        this.eventsBoundUploader = this.uploader

        const { updateUpload, removeUpload } = useUploadStore.getState()

        this.uploader.on('uploadProgress', (data: any) => {
            const assetId = data.asset_id
            if (!assetId) return

            const meta = this.linkAssetToMeta(assetId)
            if (!meta) return

            const { addUpload, removeUpload: remove } = useUploadStore.getState()
            if (useUploadStore.getState().uploads[meta.tempId]) {
                remove(meta.tempId)
                addUpload(assetId, {
                    id: assetId,
                    fileName: meta.fileName,
                    progress: data.progress_percentage,
                    status: 'uploading',
                })
            } else {
                updateUpload(assetId, {
                    progress: data.progress_percentage,
                    status: 'uploading',
                })
            }

            meta.callbacks.onProgress?.(data.progress_percentage)
            meta.callbacks.onStatus?.('uploading')
        })

        this.uploader.on('uploadSuccess', async (data: any) => {
            const assetId = data.asset_id
            const meta = this.uploadMetaByAssetId.get(assetId) ?? this.linkAssetToMeta(assetId)

            if (!meta) {
                console.error('No upload metadata for asset_id:', assetId)
                this.finishActiveUpload()
                return
            }

            updateUpload(assetId, { status: 'saving' })
            meta.callbacks.onStatus?.('saving')

            try {
                await videoService.createVideoUploadProgress(
                    meta.uniqueId,
                    assetId,
                    meta.type,
                    'uploaded'
                )

                updateUpload(assetId, { status: 'done', progress: 100 })
                meta.callbacks.onSuccess?.(assetId)
                meta.callbacks.onStatus?.('done')

                toast.success('Video uploaded successfully!')
                setTimeout(() => removeUpload(assetId), 3000)
            } catch (err) {
                try {
                    await videoService.createVideoUploadProgress(
                        meta.uniqueId,
                        assetId,
                        meta.type,
                        'FAILED'
                    )
                } catch (apiErr) {
                    console.error('Failed to record upload failure:', apiErr)
                }

                updateUpload(assetId, { status: 'failed' })
                meta.callbacks.onStatus?.('failed')
                toast.error('Failed to save video info')
            } finally {
                this.removeMeta(assetId)
                this.finishActiveUpload()
            }
        })

        this.uploader.on('uploadError', async (data: any) => {
            const assetId = data.asset_id
            console.error('Upload error:', data?.error)

            const meta = assetId
                ? (this.uploadMetaByAssetId.get(assetId) ?? this.linkAssetToMeta(assetId))
                : this.activeMeta

            if (assetId) {
                updateUpload(assetId, { status: 'failed' })
            } else if (meta) {
                useUploadStore.getState().removeUpload(meta.tempId)
            }

            if (meta && assetId) {
                try {
                    await videoService.createVideoUploadProgress(
                        meta.uniqueId,
                        assetId,
                        meta.type,
                        'FAILED'
                    )
                } catch (apiErr) {
                    console.error('Failed to record upload failure:', apiErr)
                }
                this.removeMeta(assetId)
            }

            meta?.callbacks.onStatus?.('failed')
            meta?.callbacks.onError?.()
            toast.error('Video upload failed')

            this.finishActiveUpload()
        })
    }

    async upload(
        file: File,
        uniqueId: string,
        type: string,
        callbacks: UploadCallback = {}
    ) {
        await this.ensureSDK(type)

        if (!this.uploader) {
            toast.error('Uploader not ready. Please try again.')
            return
        }

        const { addUpload } = useUploadStore.getState()
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`

        const meta: UploadMeta = {
            uniqueId,
            type,
            fileName: file.name,
            tempId,
            callbacks,
        }

        addUpload(tempId, {
            id: tempId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
        })

        const position = this.uploadQueue.length + (this.isProcessing ? 1 : 0)
        if (position > 0) {
            // toast.info(
            //     position === 1
            //         ? `"${file.name}" queued — waiting for current upload`
            //         : `"${file.name}" queued — ${position + 1} videos in line`
            // )
        }

        this.uploadQueue.push({ file, meta })
        void this.processQueue()
    }

    isUploaderReady() {
        return this.isReady
    }
}

export const tpstreamsUploadService = new TPStreamsUploadService()
