


import { useUploadStore } from '@/store/uploadStore'

const GlobalUploadIndicator = () => {
    const uploads = useUploadStore((state) => state.uploads)
    const active = Object.values(uploads)

    if (active.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white
                    rounded-2xl p-4 w-72 z-50 shadow-2xl">

            <p className="text-sm font-semibold mb-3">
                🎬 Uploading {active.length} video{active.length > 1 ? 's' : ''}
            </p>

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
    )
}

export default GlobalUploadIndicator