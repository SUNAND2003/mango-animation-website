import { useEffect, useRef, useState, useCallback } from 'react'

const TOTAL_FRAMES = 208
const FRAME_PAD = 3

function getFramePath(index) {
  const num = String(index).padStart(FRAME_PAD, '0')
  return `/images/sequence/frame_${num}.webp`
}

export default function MangoScroller({ progress = 0 }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const rigRef = useRef(null)
  const imagesRef = useRef([])
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  const lastRenderedIndexRef = useRef(-1)
  const mouseTargetRef = useRef({ x: 0, y: 0 })
  const mouseCurrentRef = useRef({ x: 0, y: 0 })
  const progressRef = useRef(progress)
  progressRef.current = progress

  // Direct canvas render helper
  const renderFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const images = imagesRef.current
    if (!images || images.length === 0) return

    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIdx))

    // Find the closest loaded image if current frame is not ready
    let imgToDraw = images[clamped]
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (clamped - offset >= 0 && images[clamped - offset]?.complete && images[clamped - offset].naturalWidth > 0) {
          imgToDraw = images[clamped - offset]
          break
        }
        if (clamped + offset < TOTAL_FRAMES && images[clamped + offset]?.complete && images[clamped + offset].naturalWidth > 0) {
          imgToDraw = images[clamped + offset]
          break
        }
      }
    }

    if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height)
      lastRenderedIndexRef.current = clamped
    }
  }, [])

  // 1. Progressive preloading of all 208 frames into browser cache
  useEffect(() => {
    let mounted = true
    const images = new Array(TOTAL_FRAMES)
    imagesRef.current = images

    // Load first frame immediately for instant first-paint
    const firstImg = new Image()
    firstImg.src = getFramePath(1)
    firstImg.onload = () => {
      if (!mounted) return
      images[0] = firstImg
      setFirstFrameReady(true)
      renderFrame(0)
    }

    // Load remaining frames
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = getFramePath(i)
      img.onload = () => {
        if (!mounted) return
        images[i - 1] = img
        const currentTarget = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(Math.max(0, Math.min(1, progressRef.current)) * (TOTAL_FRAMES - 1))
        )
        if (currentTarget === i - 1) {
          renderFrame(currentTarget)
        }
      }
      img.onerror = () => {
        if (mounted && images[i - 2]) {
          images[i - 1] = images[i - 2]
        }
      }
    }

    return () => {
      mounted = false
    }
  }, [renderFrame])

  // 2. High-performance RAF-driven 3D mouse parallax
  useEffect(() => {
    let animId
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 2
      const y = (e.clientY / innerHeight - 0.5) * 2
      mouseTargetRef.current = { x, y }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const updatePhysics = () => {
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.08
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.08

      if (rigRef.current) {
        const mx = mouseCurrentRef.current.x * 12
        const my = mouseCurrentRef.current.y * 12
        const tiltX = -mouseCurrentRef.current.y * 5
        const tiltY = mouseCurrentRef.current.x * 7
        rigRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
      }

      animId = requestAnimationFrame(updatePhysics)
    }

    animId = requestAnimationFrame(updatePhysics)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  // 3. Instant canvas scrub on scroll progress change
  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress))
    const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(clamped * (TOTAL_FRAMES - 1)))

    if (targetIndex !== lastRenderedIndexRef.current) {
      renderFrame(targetIndex)
    }
  }, [progress, renderFrame])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ perspective: 1200 }}
    >
      {/* 3D Floating Interactive Parallax Rig */}
      <div
        ref={rigRef}
        className="relative w-[360px] h-[202px] sm:w-[580px] sm:h-[326px] md:w-[820px] md:h-[461px] lg:w-[1040px] lg:h-[585px] max-w-[95vw] transition-transform ease-out duration-75"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Soft realistic studio contact shadow directly grounded under mango base */}
        <div
          className="absolute top-[76%] left-1/2 -translate-x-1/2 w-[36%] h-[8%] rounded-[100%] bg-black/90 blur-2xl pointer-events-none transition-all duration-300"
          style={{
            transform: 'translateX(-50%) scaleY(0.4)',
            opacity: Math.max(0.2, 0.7 - progress * 0.3)
          }}
        />

        {/* Transparent Canvas Frame Rendering Your 208 Authentic Peeling Frames */}
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain select-none transition-opacity duration-300 drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)]"
            style={{
              opacity: firstFrameReady ? 1 : 0
            }}
          />
        </div>
      </div>
    </div>
  )
}
