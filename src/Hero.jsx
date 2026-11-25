import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MangoScroller from './MangoScroller'

export default function Hero() {
  const root = useRef()
  const [scrollProgress, setScrollProgress] = useState(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)'
        },
        (context) => {
          const { isDesktop } = context.conditions

          // 1. Initial states:
          // At scroll = 0: Headline typography is unblocked and clear. Mango is completely hidden.
          gsap.set('.show-copy', { autoAlpha: 0, y: 30 })
          gsap.set('.hero-seq-wrap', { autoAlpha: 0, scale: 0.94, y: 15 })

          // 2. Master pinned scroll timeline
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: '+=450%',
              scrub: 0.4, // Responsive real-time scrub with zero lag
              pin: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                const p = self.progress
                // Phase 1 (0.00 to 0.08): Mango emerges smoothly into scene as whole fruit (frame 1)
                // Phase 2 (0.08 to 0.86): Mango scrubs smoothly through all 208 authentic peeling frames
                // Phase 3 (0.86 to 1.00): Fully peeled fruit stays visible alongside bottle details
                if (p < 0.08) {
                  setScrollProgress(0)
                } else if (p < 0.86) {
                  setScrollProgress((p - 0.08) / (0.86 - 0.08))
                } else {
                  setScrollProgress(1)
                }
              }
            }
          })

          // Timeline choreography:
          // A. Scroll begins (0.00 -> 0.08):
          //    Hero copy fades out, mango emerges smoothly into center view and STAYS VISIBLE!
          tl.to('.hero-copy', { opacity: 0, yPercent: -20, duration: 0.08, ease: 'power1.out' }, 0)
            .to('.hero-hint', { opacity: 0, duration: 0.04 }, 0)
            .to('.hero-seq-wrap', { autoAlpha: 1, scale: 1, y: 0, duration: 0.08, ease: 'power1.out' }, 0.01)
            // B. Final reveal (0.86 -> 1.00):
            //    Desktop: offset left so bottle card appears on right
            //    Mobile: shift UP and scale so mango stays visible in upper half, while bottle card fills lower half cleanly!
            .to(
              '.hero-seq-wrap',
              {
                xPercent: isDesktop ? -18 : 0,
                yPercent: isDesktop ? 0 : -22,
                scale: isDesktop ? 0.95 : 0.72,
                duration: 0.14,
                ease: 'power2.inOut'
              },
              0.86
            )
            .to('.show-copy', { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.87)
        }
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      id="product"
      className="relative h-screen w-full overflow-hidden select-none bg-[#000000]"
    >
      {/* Hero Big Typography (Clean & Full View at Top - Mango Hidden Initially) */}
      <div className="hero-copy absolute inset-0 z-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-full px-3 sm:px-5 py-1 sm:py-1.5 mb-3 sm:mb-6 max-w-[90vw]">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <p className="tracking-[0.18em] sm:tracking-[0.45em] text-[9px] sm:text-xs font-bold text-amber-400 truncate">
            100% RAW RATNAGIRI ALPHONSO NECTAR
          </p>
        </div>
        <h1 className="font-display font-extrabold leading-[0.88] text-white text-[10vw] sm:text-[12vw] md:text-[9.2vw] tracking-tight drop-shadow-2xl">
          FRESHNESS<br />IN EVERY<br />DROP.
        </h1>
        <p className="mt-3 sm:mt-6 max-w-xs sm:max-w-md text-xs sm:text-sm md:text-base text-neutral-300 tracking-wider font-medium leading-relaxed px-2">
          Pure tree-ripened Alphonso mangoes, cold-pressed within hours of harvest. No concentrates, no added sugar.
        </p>
      </div>

      {/* Real Mango Continuous Scroll Peeling Animation (Emerges On Scroll & Stays Visible) */}
      <div className="hero-seq-wrap absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <MangoScroller progress={scrollProgress} />
      </div>

      {/* Final Bottle Reveal Card (Responsive for Mobile & Desktop) */}
      <div className="show-copy absolute z-20 inset-x-0 bottom-0 md:inset-y-0 md:left-1/2 flex flex-col justify-end md:justify-center px-4 sm:px-6 pb-6 sm:pb-10 md:pb-0 md:pr-20 pointer-events-none">
        <div className="bg-black/85 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-neutral-800/80 md:border-0 rounded-3xl p-5 sm:p-6 md:p-0 max-w-lg mx-auto md:mx-0 shadow-2xl md:shadow-none">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-neutral-900/90 border border-neutral-700/60 rounded-full px-3 sm:px-4 py-1 w-fit mb-2 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-[9px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] font-bold text-amber-400">
              COLD-PRESSED PERFECTION
            </p>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl md:text-8xl text-white leading-[0.92]">
            Pure<br /><span className="text-amber-400">Liquid Gold.</span>
          </h2>
          <p className="mt-2.5 sm:mt-4 md:mt-7 max-w-md text-xs sm:text-sm md:text-lg leading-relaxed text-neutral-300 line-clamp-2 sm:line-clamp-none">
            Chilled heavy glass, airtight gold seal, and 100% unadulterated Alphonso nectar. Each bottle captures the aromatic sweetness and bright wild sunshine of three whole mangoes.
          </p>

          {/* Nutritional Highlights Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3 sm:my-5 md:my-6 max-w-md border-y border-neutral-800/80 py-2.5 sm:py-4">
            <div>
              <div className="text-base sm:text-xl md:text-2xl font-display font-bold text-amber-400">100%</div>
              <div className="text-[8px] sm:text-[10px] tracking-wider text-neutral-400 font-medium uppercase">Raw Alphonso</div>
            </div>
            <div>
              <div className="text-base sm:text-xl md:text-2xl font-display font-bold text-amber-400">0%</div>
              <div className="text-[8px] sm:text-[10px] tracking-wider text-neutral-400 font-medium uppercase">Added Sugar</div>
            </div>
            <div>
              <div className="text-base sm:text-xl md:text-2xl font-display font-bold text-amber-400">4°C</div>
              <div className="text-[8px] sm:text-[10px] tracking-wider text-neutral-400 font-medium uppercase">Cold Pressed</div>
            </div>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 sm:gap-4 mt-1 sm:mt-2">
            <a
              href="#final"
              className="flex-1 sm:flex-none text-center bg-amber-500 text-black rounded-full px-5 sm:px-8 md:px-10 py-3 sm:py-4 text-[11px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] font-bold hover:scale-105 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/25 transition-all inline-block shadow-lg shadow-amber-500/20"
            >
              ORDER BOTTLE · $6.50
            </a>
            <a
              href="#expressions"
              className="flex-1 sm:flex-none text-center border border-neutral-700 text-neutral-200 rounded-full px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.25em] font-semibold hover:bg-neutral-900 transition-all inline-block"
            >
              EXPLORE
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Down Prompt */}
      <div className="hero-hint absolute z-20 bottom-4 sm:bottom-6 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[8px] sm:text-[9px] tracking-[0.35em] sm:tracking-[0.45em] text-neutral-400 uppercase font-bold mb-1">
          SCROLL TO UNPEEL & EXTRACT
        </span>
        <div className="w-3.5 sm:w-4 h-6 sm:h-7 border-2 border-neutral-700 rounded-full flex justify-center pt-1">
          <div className="w-1 h-1.5 sm:h-2 bg-amber-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
