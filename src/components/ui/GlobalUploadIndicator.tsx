import { useEffect, useState } from 'react'
import { useUploadStore } from '@/store/uploadStore'

const GlobalUploadIndicator = () => {
    const uploads = useUploadStore((state) => state.uploads)
    const active = Object.values(uploads)

    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (active.length > 0) {
            setMounted(true)
            const id = requestAnimationFrame(() => setVisible(true))
            return () => cancelAnimationFrame(id)
        } else if (mounted) {
            setVisible(false)
            const t = setTimeout(() => setMounted(false), 300)
            return () => clearTimeout(t)
        }
    }, [active.length, mounted])

    if (!mounted) return null

    return (
        <div
            className={`fixed z-[9999] bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-2xl w-72 shadow-2xl select-none transition-all duration-300 ease-out
                ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
            <div className="px-4 pt-4 pb-2">
                <p className="text-sm font-semibold">
                    🎬 Uploading {active.length} video{active.length > 1 ? 's' : ''}
                </p>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-3">
                {active.map((upload: any) => (
                    <div key={upload.id} className="mb-3">

                        {/* File name + percentage */}
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="truncate max-w-[180px]">
                                {upload.fileName}
                            </span>
                            <span>{upload.progress}%</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: `${upload.progress}%`,
                                    background:
                                        upload.status === 'uploading' ? '#3B82F6' :
                                            upload.status === 'saving' ? '#8B5CF6' :
                                                upload.status === 'done' ? '#10B981' :
                                                    '#EF4444',
                                }}
                            />
                        </div>

                        {/* Status label */}
                        <p className="text-[10px] text-gray-500 mt-1">
                            {upload.status === 'uploading' ? '⬆️ Uploading...' :
                                upload.status === 'saving' ? '⚙️ Saving...' :
                                    upload.status === 'done' ? '✅ Done!' :
                                        '❌ Failed — please retry'}
                        </p>

                    </div>
                ))}

                <p className="text-[10px] text-yellow-400 mt-2">
                    ⚠️ Don't close the browser while uploading
                </p>
            </div>
        </div>
    )
}

export default GlobalUploadIndicator
