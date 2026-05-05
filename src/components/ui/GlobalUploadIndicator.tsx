import { useEffect, useRef, useState } from 'react'
import { useUploadStore } from '@/store/uploadStore'

const GlobalUploadIndicator = () => {
    const uploads = useUploadStore((state) => state.uploads)
    const active = Object.values(uploads)

    const [pos, setPos] = useState({ x: window.innerWidth - 312, y: window.innerHeight - 200 })
    const dragging = useRef(false)
    const offset = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging.current) return
            const x = Math.min(Math.max(0, e.clientX - offset.current.x), window.innerWidth - 288)
            const y = Math.min(Math.max(0, e.clientY - offset.current.y), window.innerHeight - 60)
            setPos({ x, y })
        }
        const onUp = () => { dragging.current = false }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    if (active.length === 0) return null

    return (
        <div
            style={{ left: pos.x, top: pos.y }}
            className="fixed z-[9999] bg-gray-900 text-white rounded-2xl w-72 shadow-2xl select-none"
        >
            {/* Drag handle */}
            <div
                className="px-4 pt-4 pb-2 cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                    dragging.current = true
                    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
                    e.preventDefault()
                }}
            >
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
