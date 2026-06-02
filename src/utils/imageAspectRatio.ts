export const ASPECT_RATIO_16_9 = 16 / 9
export const ASPECT_RATIO_TOLERANCE = 0.05

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve({ width: img.naturalWidth, height: img.naturalHeight })
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Could not read image'))
        }
        img.src = url
    })
}

export function isAspectRatioMatch(
    width: number,
    height: number,
    targetRatio: number,
    tolerance = ASPECT_RATIO_TOLERANCE
): boolean {
    if (!width || !height) return false
    const ratio = width / height
    return Math.abs(ratio - targetRatio) <= tolerance
}

export function isAspectRatio16x9(
    width: number,
    height: number,
    tolerance = ASPECT_RATIO_TOLERANCE
): boolean {
    return isAspectRatioMatch(width, height, ASPECT_RATIO_16_9, tolerance)
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
    const [meta, base64] = dataUrl.split(',')
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg'
    const binary = atob(base64)
    const arr = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
    return new File([arr], filename, { type: mime })
}
