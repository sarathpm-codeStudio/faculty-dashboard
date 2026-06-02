import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import { Play } from 'lucide-react'
import 'video.js/dist/video-js.css'

export type VideoPlayerProps = {
  src: string
  /** Set to true when src is a TPStream / iframe embed URL */
  embed?: boolean
  type?: string
  /** Thumbnail shown before the user clicks play */
  poster?: string
  className?: string
}

const isEmbedUrl = (src: string) =>
  src.includes('/embed/') ||
  src.includes('tpstreams.com') ||
  src.includes('youtube.com/embed') ||
  src.includes('player.vimeo.com')

const VideoPlayer = ({ src, embed, type = 'video/mp4', poster, className = '' }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [playing, setPlaying] = useState(false)

  const useIframe = embed ?? isEmbedUrl(src)

  useEffect(() => {
    setPlaying(false)
  }, [src, poster])

  useEffect(() => {
    if (useIframe) return
    if (!containerRef.current) return

    const videoEl = document.createElement('video')
    videoEl.className = 'video-js vjs-big-play-centered'
    containerRef.current.appendChild(videoEl)

    playerRef.current = videojs(videoEl, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      poster,
      sources: [{ src, type }],
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src, type, poster, useIframe])

  /* ── iframe mode — cover/poster first, embed loads only after play ── */
  if (useIframe) {
    return (
      <div
        className={`w-full aspect-video relative bg-[#F8F9FB] overflow-hidden ${className}`}
      >
        {!playing && (
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer group w-full h-full border-0 p-0"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            {poster ? (
              <img
                src={poster}
                alt="Video cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[#E8EBFF]" />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 flex items-center justify-center shadow-lg transition-all duration-200">
                <Play size={26} className="text-[#000B60] fill-[#000B60] ml-1" />
              </div>
            </div>
          </button>
        )}

        {playing && (
          <iframe
            src={src.includes('?') ? `${src}&autoplay=1` : `${src}?autoplay=1`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title="Course video"
          />
        )}
      </div>
    )
  }

  /* ── video.js mode ── */
  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
    />
  )
}

export default VideoPlayer
