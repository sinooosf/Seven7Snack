import { useEffect, useRef, useState } from 'react'

const INTRO_DURATION_MS = 3000

// Plays /intro.mp4 for up to 3 seconds before handing off to the app.
// There's no real video in this project yet (drop one at
// `public/intro.mp4` any time — same file name, this component picks it
// up automatically), so until then the animated logo underneath acts as
// the intro on its own. The 3-second timer always fires regardless of
// whether the video file exists, is shorter, or is longer.
export default function IntroSplash({ onFinish }) {
  const [videoFailed, setVideoFailed] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    timeoutRef.current = setTimeout(onFinish, INTRO_DURATION_MS)
    return () => clearTimeout(timeoutRef.current)
  }, [onFinish])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink">
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-maroon-bright/30 blur-[90px]" />
      <img src="/logo.png" alt="Seven Snack" className="relative w-60 max-w-[70%] object-contain" />
      {!videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={onFinish}
          onError={() => setVideoFailed(true)}
        />
      )}
    </div>
  )
}
