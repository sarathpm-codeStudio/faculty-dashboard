import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type UploadStatus = 'idle' | 'uploading' | 'done' | 'failed'

interface UseTpStreamsUpload {
  upload: (file: File) => void
  status: UploadStatus
  progress: number
  reset: () => void
}

const useTpStreamsUpload = (onSuccess: (assetId: string) => void): UseTpStreamsUpload => {
  const uploaderRef = useRef<any>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if ((window as any).TpStreamsUploaderSDK) {
      initSDK()
      return
    }

    const existing = document.querySelector(
      'script[src*="tpstreams-uploader"]'
    ) as HTMLScriptElement | null

    if (existing) {
      existing.addEventListener('load', initSDK)
      return () => existing.removeEventListener('load', initSDK)
    }

    const script = document.createElement('script')
    script.src = 'https://static.testpress.in/static/js/tpstreams-uploader.min.js'
    script.async = true
    script.onload = () => initSDK()
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initSDK = () => {
    const uploader = new (window as any).TpStreamsUploaderSDK(
      import.meta.env.VITE_TPSTREAMS_AUTH_TOKEN,
      import.meta.env.VITE_TPSTREAMS_ORG_ID,
      {
        contentProtectionType: 'drm',
        resolutions: ['240p', '360p', '480p', '720p'],
        generateSubtitle: false,
      }
    )

    uploader.on('uploadProgress', (data: any) => {
      setProgress(data.progress_percentage)
    })

    uploader.on('uploadSuccess', (data: any) => {
      setStatus('done')
      onSuccess(data.asset_id)
    })

    uploader.on('uploadError', (data: any) => {
      console.error('Upload error:', data.error)
      setStatus('failed')
      toast.error('Video upload failed')
    })

    uploaderRef.current = uploader
  }

  const upload = (file: File) => {
    if (!uploaderRef.current) {
      toast.error('Uploader not ready. Please try again.')
      return
    }
    setStatus('uploading')
    setProgress(0)
    uploaderRef.current.selectFiles([file])
    uploaderRef.current.upload()
  }

  const reset = () => {
    setStatus('idle')
    setProgress(0)
  }

  return { upload, status, progress, reset }
}

export default useTpStreamsUpload
