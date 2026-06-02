import { useEffect, useRef, useState } from 'react'
import { useUploadStore } from '@/store/uploadStore'

type Position = { x: number; y: number }

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

const GlobalUploadIndicator = () => {
    const uploads = useUploadStore((state) => state.uploads)
    const active = Object.values(uploads)

    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(false)
    const [position, setPosition] = useState<Position | null>(null)
    const [dragging, setDragging] = useState(false)
    const dragOffsetRef = useRef<Position>({ x: 0, y: 0 })
    const cardRef = useRef<HTMLDivElement | null>(null)

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

    useEffect(() => {
        if (!mounted) return

        const id = requestAnimationFrame(() => {
            if (!cardRef.current) return

            const cardWidth = cardRef.current.offsetWidth
            const cardHeight = cardRef.current.offsetHeight

            setPosition((prev) => {
                if (prev) return prev
                return {
                    x: Math.max((window.innerWidth - cardWidth) / 2, 8),
                    y: Math.max(window.innerHeight - cardHeight - 24, 8),
                }
            })
        })

        return () => cancelAnimationFrame(id)
    }, [mounted])

    useEffect(() => {
        if (!position) return

        const handleResize = () => {
            if (!cardRef.current) return
            const cardWidth = cardRef.current.offsetWidth
            const cardHeight = cardRef.current.offsetHeight

            setPosition((prev) => {
                if (!prev) return prev
                return {
                    x: clamp(prev.x, 8, Math.max(window.innerWidth - cardWidth - 8, 8)),
                    y: clamp(prev.y, 8, Math.max(window.innerHeight - cardHeight - 8, 8)),
                }
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [position])

    useEffect(() => {
        if (!dragging) return

        const handlePointerMove = (event: PointerEvent) => {
            if (!cardRef.current) return
            const cardWidth = cardRef.current.offsetWidth
            const cardHeight = cardRef.current.offsetHeight

            const maxX = Math.max(window.innerWidth - cardWidth - 8, 8)
            const maxY = Math.max(window.innerHeight - cardHeight - 8, 8)

            setPosition({
                x: clamp(event.clientX - dragOffsetRef.current.x, 8, maxX),
                y: clamp(event.clientY - dragOffsetRef.current.y, 8, maxY),
            })
        }

        const handlePointerUp = () => setDragging(false)

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)

        return () => {
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
        }
    }, [dragging])

    const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!position) return
        dragOffsetRef.current = {
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        }
        setDragging(true)
    }

    if (!mounted) return null

    return (
        <div
            ref={cardRef}
            onPointerDown={onDragStart}
            className={`fixed z-9999 bg-gray-900 text-white rounded-2xl w-72 shadow-2xl select-none touch-none transition-all duration-300 ease-out
                ${dragging ? 'cursor-grabbing' : 'cursor-grab'}
                ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{
                left: position?.x ?? 8,
                top: position?.y ?? 8,
            }}
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
