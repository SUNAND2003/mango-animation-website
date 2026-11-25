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

  // Direct canvas render helper - guarantees zero flicker and pristine clarity
  const renderFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false }) // pure opaque black backing for maximum FPS & sharpness
    if (!ctx) return

    const images = imagesRef.current
    if (!images || images.length === 0) return

    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIdx))

    // Find the closest loaded image if current frame is still downloading
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
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      // Direct full-canvas draw without clearing to avoid any blank flicker
      ctx.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height)
      lastRenderedIndexRef.current = clamped
    }
  }, [])

  // 1. Intelligent progressive preloading of all 208 authentic frames
  useEffect(() => {
    let mounted = true
    const images = new Array(TOTAL_FRAMES)
    imagesRef.current = images

    // A. Load first frame immediately for instant first-paint
    const firstImg = new Image()
    firstImg.src = getFramePath(1)
    firstImg.onload = () => {
      if (!mounted) return
      images[0] = firstImg
      setFirstFrameReady(true)
      renderFrame(0)
    }

    // B. Prioritize scrubbing anchor frames (every 4th frame), then all in-between frames
    const keyIndices = []
    const otherIndices = []
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (i % 4 === 0) keyIndices.push(i)
      else otherIndices.push(i)
    }

    const loadQueue = [...keyIndices, ...otherIndices]

    for (const i of loadQueue) {
      const img = new Image()
      img.src = getFramePath(i)
      img.onload = () => {
        if (!mounted) return
        images[i - 1] = img
        // If current scrub position targets this or adjacent frame, render immediately
        const currentTarget = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(Math.max(0, Math.min(1, progressRef.current)) * (TOTAL_FRAMES - 1))
        )
        if (currentTarget === i - 1 || lastRenderedIndexRef.current === -1) {
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
        const mx = mouseCurrentRef.current.x * 10
        const my = mouseCurrentRef.current.y * 10
        const tiltX = -mouseCurrentRef.current.y * 4
        const tiltY = mouseCurrentRef.current.x * 6
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
        className="relative w-[360px] h-[202px] sm:w-[580px] sm:h-[326px] md:w-[820px] md:h-[461px] lg:w-[1100px] lg:h-[619px] max-w-[95vw] transition-transform ease-out duration-75"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Crisp Canvas Frame Rendering Authentic 208 Peeling Frames */}
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain select-none bg-black"
            style={{
              opacity: firstFrameReady ? 1 : 0
            }}
          />
        </div>
      </div>
    </div>
  )
}
