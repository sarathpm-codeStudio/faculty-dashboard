


import { create } from 'zustand'

interface Upload {
    id: string
    fileName: string
    progress: number
    status: 'uploading' | 'saving' | 'done' | 'failed'
}

interface UploadStore {
    uploads: Record<string, Upload>
    addUpload: (id: string, upload: Upload) => void
    updateUpload: (id: string, data: Partial<Upload>) => void
    removeUpload: (id: string) => void
}

export const useUploadStore = create<UploadStore>((set) => ({
    uploads: {},

    addUpload: (id, upload) => set((state) => ({
        uploads: { ...state.uploads, [id]: upload }
    })),

    updateUpload: (id, data) => set((state) => ({
        uploads: {
            ...state.uploads,
            [id]: { ...state.uploads[id], ...data }
        }
    })),

    removeUpload: (id) => set((state) => {
        const uploads = { ...state.uploads }
        delete uploads[id]
        return { uploads }
    }),
}))