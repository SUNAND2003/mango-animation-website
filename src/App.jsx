import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './Hero'
import { Nav, MangoExpressions, BottleExplorer, About, Ingredients, Final } from './Sections'

export default function App() {
  useEffect(() => {
    // Ultra-smooth physics-based scrolling
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.05,
      smoothWheel: true
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (t) => {
      lenis.raf(t * 1000)
    }

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return (
    <main id="top" className="relative bg-[#000000] text-[#f8fafc] selection:bg-amber-400 selection:text-black">
      <Nav />
      <Hero />
      <MangoExpressions />
      <BottleExplorer />
      <About />
      <Ingredients />
      <Final />
    </main>
  )
}
