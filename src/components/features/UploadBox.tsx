

import { Loader2, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

interface UploadBoxProps {
    accept: string
    preview: string | null
    previewType: 'image' | 'video'
    icon: React.ReactNode
    title: string
    hint: string
    loading?: boolean
    videoBlockedMessage?: string | null
    /** e.g. 16/9 — preview container uses this aspect ratio */
    aspectRatio?: number
    error?: string | null
    onFile: (file: File) => void
    onClear: () => void
}

export const UploadBox = ({
    accept,
    preview,
    previewType,
    icon,
    title,
    hint,
    loading = false,
    videoBlockedMessage = null,
    aspectRatio,
    error = null,
    onFile,
    onClear,
}: UploadBoxProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const [drag, setDrag] = useState(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDrag(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile(file)
    }

    return (
        <div className="flex flex-col gap-1.5 w-full">
        <div
            onClick={() => ref.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden w-full
        ${aspectRatio ? 'min-h-[120px]' : 'h-[200px]'}
        ${drag
                    ? 'border-[#2c1452] bg-[#eef0ff]'
                    : error
                        ? 'border-red-400 bg-red-50/40 hover:border-red-500'
                        : 'border-gray-200 bg-[#F8F9FB] hover:border-[#2c1452]/40'}`}
            style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
        >
            {preview ? (
                <>
                    {previewType === 'image' ? (
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                    ) : previewType === 'video' && videoBlockedMessage ? (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F8F9FB] px-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Loader2 size={22} className="text-[#2c1452] animate-spin" />
                            <p className="text-xs font-semibold text-[#2c1452]">{videoBlockedMessage}</p>
                        </div>
                    ) : preview.includes('tpstreams.com') || preview.includes('/embed/') ? (
                        <iframe
                            src={preview}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            onClick={(e) => e.stopPropagation()}
                        />

                    ) : (
                        <video src={preview} className="w-full h-full object-cover" controls onClick={(e) => e.stopPropagation()} />

                    )}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClear() }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    >
                        <X size={12} />
                    </button>
                    {previewType === 'video' && (
                        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 text-white text-[10px] font-semibold rounded-full">
                                <Upload size={9} /> Click to change video
                            </span>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center gap-1.5 px-4 text-center select-none">
                    <div className="w-9 h-9 rounded-xl bg-white shadow flex items-center justify-center text-[#2c1452]">
                        {icon}
                    </div>
                    <p className="text-xs font-semibold text-gray-600">{title}</p>
                    <p className="text-[10px] text-gray-400 leading-snug">{hint}</p>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2c1452]">
                        <Upload size={10} /> Click to upload or drag and drop
                    </span>
                </div>
            )}
            {loading && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={22} className="text-[#2c1452] animate-spin" />
                    <p className="text-xs font-semibold text-[#2c1452]">Uploading…</p>
                </div>
            )}
            <input
                ref={ref}
                type="file"
                accept={accept}
                className="hidden"
                disabled={loading}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
        </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}
