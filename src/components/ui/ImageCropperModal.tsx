import { useCallback, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Cropper, { Area } from 'react-easy-crop'
import Modal from './Modal'
import Button from './Button'

interface ImageCropperModalProps {
    open: boolean
    image: string | null
    onClose: () => void
    onSave: (croppedImage: string) => void
    title?: string
    aspect?: number
    cropShape?: 'rect' | 'round'
    minZoom?: number
    maxZoom?: number
    outputType?: 'image/jpeg' | 'image/png' | 'image/webp'
    outputQuality?: number
    saveLabel?: string
    cancelLabel?: string
    hint?: string
}

const getCroppedImg = (
    imageSrc: string,
    cropArea: Area,
    outputType: string,
    outputQuality: number,
): Promise<string> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = imageSrc
        image.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = cropArea.width
            canvas.height = cropArea.height
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject(new Error('No canvas context'))
            ctx.drawImage(
                image,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, cropArea.width, cropArea.height,
            )
            resolve(canvas.toDataURL(outputType, outputQuality))
        }
        image.onerror = () => reject(new Error('Failed to load image'))
    })

const ImageCropperModal = ({
    open,
    image,
    onClose,
    onSave,
    title = 'Crop your photo',
    aspect = 1,
    cropShape = 'round',
    minZoom = 1,
    maxZoom = 3,
    outputType = 'image/jpeg',
    outputQuality = 0.9,
    saveLabel = 'Save Photo',
    cancelLabel = 'Cancel',
    hint = 'Drag the image to reposition, use the slider or mouse wheel to zoom.',
}: ImageCropperModalProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(minZoom)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setCrop({ x: 0, y: 0 })
            setZoom(minZoom)
            setCroppedAreaPixels(null)
        }
    }, [open, image, minZoom])

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const handleSave = async () => {
        if (!image || !croppedAreaPixels) return
        try {
            setSaving(true)
            const cropped = await getCroppedImg(image, croppedAreaPixels, outputType, outputQuality)
            onSave(cropped)
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        setZoom(minZoom)
        setCrop({ x: 0, y: 0 })
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            maxWidth="max-w-xl"
            footer={
                <>
                    <Button type="button" variant="white" onClick={onClose}>{cancelLabel}</Button>
                    <Button type="button" onClick={handleSave} loading={saving}>{saveLabel}</Button>
                </>
            }
        >
            {image && (
                <div className="flex flex-col gap-4">
                    <div className="relative w-full h-[320px] bg-[#F2F4F6] rounded-xl overflow-hidden">
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            cropShape={cropShape}
                            showGrid={false}
                            minZoom={minZoom}
                            maxZoom={maxZoom}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 w-12">Zoom</span>
                        <input
                            type="range"
                            min={minZoom}
                            max={maxZoom}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-[#000B60]"
                        />
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1 text-xs font-bold text-[#000B60] hover:underline cursor-pointer"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                    </div>

                    {hint && <p className="text-xs text-gray-500">{hint}</p>}
                </div>
            )}
        </Modal>
    )
}

export default ImageCropperModal
