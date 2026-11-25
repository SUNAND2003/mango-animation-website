import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MangoScroller from './MangoScroller'

export default function Hero() {
  const root = useRef()
  const [scrollProgress, setScrollProgress] = useState(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.show-copy', { autoAlpha: 0, y: 40 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=450%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress)
          }
        }
      })

      // Master synchronized timeline
      tl.to('.hero-copy', { opacity: 0, yPercent: -35, duration: 0.15 }, 0.04)
        .to('.hero-hint', { opacity: 0, duration: 0.08 }, 0.02)
        .to('.hero-seq-wrap', { xPercent: -22, duration: 0.18, ease: 'power2.inOut' }, 0.82)
        .to('.hero-cream', { opacity: 1, duration: 0.18 }, 0.82)
        .to('.show-copy', { autoAlpha: 1, y: 0, duration: 0.15 }, 0.85)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      id="product"
      className="relative h-screen w-full overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 38%, #181818 0%, #0a0a0a 50%, #000000 100%)' }}
    >
      <div className="hero-cream absolute inset-0 z-0 opacity-0 bg-[#000000]" />

      {/* Hero Big Typography Backdrop */}
      <div className="hero-copy absolute inset-0 z-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div className="inline-flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-full px-5 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="tracking-[0.45em] text-xs font-bold text-amber-400">
            100% RAW RATNAGIRI ALPHONSO NECTAR
          </p>
        </div>
        <h1 className="font-display font-extrabold leading-[0.86] text-white text-[16vw] md:text-[9.2vw] drop-shadow-2xl">
          FRESHNESS<br />IN EVERY<br />DROP.
        </h1>
        <p className="mt-6 max-w-md text-sm md:text-base text-neutral-300 tracking-wider font-medium">
          Pure tree-ripened Alphonso mangoes, cold-pressed within hours of harvest. No concentrates, no added sugar.
        </p>
      </div>

      {/* Real Mango Continuous Scroll Peeling Animation (Your 208 Frames) */}
      <div className="hero-seq-wrap absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <MangoScroller progress={scrollProgress} />
      </div>

      {/* Final Bottle Reveal Card (Right Column) */}
      <div className="show-copy absolute z-20 inset-x-0 bottom-0 md:inset-y-0 md:left-1/2 flex flex-col justify-end md:justify-center px-6 pb-14 md:pb-0 md:pr-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 bg-neutral-900/80 border border-neutral-700/50 rounded-full px-4 py-1 w-fit mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <p className="text-[11px] tracking-[0.4em] font-bold text-amber-400">THE COLD-PRESSED PERFECTION</p>
        </div>
        <h2 className="font-display font-extrabold text-5xl md:text-8xl text-white leading-[0.9]">
          Pure<br /><span className="text-amber-400">Liquid Gold.</span>
        </h2>
        <p className="mt-5 md:mt-7 max-w-md text-base md:text-lg leading-relaxed text-neutral-300">
          Chilled heavy glass, airtight gold seal, and 100% unadulterated Alphonso nectar. Each bottle captures the aromatic sweetness and bright wild sunshine of three whole mangoes.
        </p>

        {/* Nutritional Highlights Grid */}
        <div className="grid grid-cols-3 gap-3 my-6 max-w-md border-y border-neutral-800 py-4">
          <div>
            <div className="text-xl md:text-2xl font-display font-bold text-amber-400">100%</div>
            <div className="text-[10px] tracking-wider text-neutral-400 font-medium">RAW ALPHONSO</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-display font-bold text-amber-400">0%</div>
            <div className="text-[10px] tracking-wider text-neutral-400 font-medium">ADDED SUGAR</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-display font-bold text-amber-400">4°C</div>
            <div className="text-[10px] tracking-wider text-neutral-400 font-medium">COLD PRESSED</div>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-4 mt-2">
          <a
            href="#final"
            className="bg-amber-500 text-black rounded-full px-8 md:px-10 py-4 text-xs md:text-sm tracking-[0.3em] font-bold hover:scale-105 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/25 transition-all inline-block"
          >
            ORDER BOTTLE · $6.50
          </a>
          <a
            href="#expressions"
            className="border border-neutral-700 text-neutral-200 rounded-full px-6 py-4 text-xs md:text-sm tracking-[0.25em] font-semibold hover:bg-neutral-900 transition-all inline-block"
          >
            EXPLORE DETAILS
          </a>
        </div>
      </div>

      {/* Scroll Down Prompt */}
      <div className="hero-hint absolute z-20 bottom-6 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[9px] tracking-[0.45em] text-neutral-400 uppercase font-bold mb-1">
          SCROLL TO UNPEEL & EXTRACT
        </span>
        <div className="w-4 h-7 border-2 border-neutral-700 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
