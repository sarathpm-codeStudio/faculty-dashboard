import { useRef, useState } from 'react'
import { X, Video, Upload, Loader2 } from 'lucide-react'
import { useTpStreamsUpload } from '@/hooks'

interface Props {
  onSuccess: (assetId: string) => void
  title?: string
  hint?: string
  initialPreview?: string | null
}

const TpStreamsVideoUploader = ({
  onSuccess,
  title = 'Intro Video',
  hint = 'MP4, WebM, MOV or MKV — max 200 MB',
  initialPreview = null,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [preview, setPreview] = useState<string | null>(initialPreview)

  const { upload, status, progress, reset } = useTpStreamsUpload(onSuccess)

  const handleFile = (file: File) => {
    setPreview(URL.createObjectURL(file))
    upload(file)
  }

  const handleClear = () => {
    setPreview(null)
    reset()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isLoading = status === 'uploading'

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden h-[200px]
          ${drag ? 'border-[#2c1452] bg-[#eef0ff]' : 'border-gray-200 bg-[#F8F9FB] hover:border-[#2c1452]/40'}`}
      >
        {preview ? (
          <>
            <video src={preview} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center select-none">
            <div className="w-9 h-9 rounded-xl bg-white shadow flex items-center justify-center text-[#2c1452]">
              <Video size={20} />
            </div>
            <p className="text-xs font-semibold text-gray-600">{title}</p>
            <p className="text-[10px] text-gray-400 leading-snug">{hint}</p>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2c1452]">
              <Upload size={10} /> Click to upload or drag and drop
            </span>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2">
            <Loader2 size={22} className="text-[#2c1452] animate-spin" />
            <p className="text-xs font-semibold text-[#2c1452]">Uploading…</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/mov,video/x-matroska,.mkv"
          className="hidden"
          disabled={isLoading}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      {status === 'uploading' && (
        <div>
          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
            <span>Uploading video...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 bg-[#2c1452] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'done' && (
        <p className="text-[11px] text-emerald-600 font-medium">✓ Video uploaded — processing in background.</p>
      )}

      {status === 'failed' && (
        <p className="text-[11px] text-red-500 font-medium">Upload failed — please try again.</p>
      )}
    </div>
  )
}

export default TpStreamsVideoUploader
