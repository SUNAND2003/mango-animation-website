import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Photo, { IMG } from './Photo'

const rise = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 md:py-5 backdrop-blur-md bg-black/85 border-b border-neutral-800/80 text-white shadow-lg">
      <a href="#top" className="font-display font-extrabold text-2xl md:text-3xl tracking-tight flex items-center gap-2 text-white">
        <span>MANGUE</span>
        <span className="w-2 h-2 rounded-full bg-amber-400" />
      </a>

      <div className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-[0.3em] text-neutral-300">
        <a href="#product" className="hover:text-amber-400 transition-colors">EXPERIENCE</a>
        <a href="#expressions" className="hover:text-amber-400 transition-colors">EXPRESSIONS</a>
        <a href="#bottle-anatomy" className="hover:text-amber-400 transition-colors">THE BOTTLE</a>
        <a href="#story" className="hover:text-amber-400 transition-colors">ORCHARD</a>
        <a href="#ingredients" className="hover:text-amber-400 transition-colors">PURITY</a>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="#final"
          className="text-xs font-bold tracking-[0.25em] bg-amber-500 text-black rounded-full px-5 py-2.5 hover:scale-105 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          ORDER NOW
        </a>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full inset-x-0 bg-black/98 backdrop-blur-xl border-b border-neutral-800 p-6 flex flex-col gap-4 text-xs font-bold tracking-[0.25em] text-white shadow-2xl">
          <a href="#product" onClick={() => setMenuOpen(false)}>EXPERIENCE</a>
          <a href="#expressions" onClick={() => setMenuOpen(false)}>EXPRESSIONS</a>
          <a href="#bottle-anatomy" onClick={() => setMenuOpen(false)}>THE BOTTLE</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>ORCHARD</a>
          <a href="#ingredients" onClick={() => setMenuOpen(false)}>PURITY</a>
          <a href="#final" onClick={() => setMenuOpen(false)} className="text-amber-400 font-extrabold">ORDER ONLINE</a>
        </div>
      )}
    </nav>
  )
}

const MANGO_5 = [
  {
    id: 'whole',
    num: '01',
    name: 'The Sun-Kissed Alphonso',
    subtitle: 'WHOLE TREE-RIPENED FRUIT',
    desc: 'Harvested at dawn in Ratnagiri orchards. Saffron-amber skin kissed with crimson blush and natural dewdrops, capturing the sweet terpene aromatics.',
    img: IMG.whole,
    metrics: [
      { k: 'SWEETNESS', v: '24° Brix' },
      { k: 'HARVEST', v: 'Dawn Picked' },
      { k: 'SKIN', v: 'Natural Wax & Dew' }
    ],
    tag: 'ORIGINAL HARVEST'
  },
  {
    id: 'sliced',
    num: '02',
    name: 'The Precision Slices',
    subtitle: 'SUCCULENT CROSS-SECTION RINGS',
    desc: 'Clean cold-knife cross-sections showcasing the radial fibrous grain, glistening nectar drops, and the central ivory seed stone.',
    img: IMG.sliced,
    metrics: [
      { k: 'TEXTURE', v: 'Velvety & Tender' },
      { k: 'NECTAR', v: 'Pure Unfiltered' },
      { k: 'CORE', v: 'Fibrous Stone' }
    ],
    tag: 'FIBRE INTEGRITY'
  },
  {
    id: 'cubes',
    num: '03',
    name: 'The Diced Hedgehog Half',
    subtitle: 'INVERTED ARCH OF FRUIT GEMS',
    desc: 'The iconic culinary hedgehog scoring: an inverted mango dome where 16 succulent golden cubes pop outward, glistening with fresh nectar drops and mint.',
    img: IMG.cubes,
    metrics: [
      { k: 'CUT', v: 'Cross-Hatch Grid' },
      { k: 'GARNISH', v: 'Wild Garden Mint' },
      { k: 'BURST', v: 'Instant Juiciness' }
    ],
    tag: 'ICONIC TASTE'
  },
  {
    id: 'bottle',
    num: '04',
    name: 'The Chilled Glass Masterpiece',
    subtitle: 'CHILLED BOTTLE WITH CONDENSATION',
    desc: 'Heavy-bottomed clear glass bottle with chilled condensation beads, artisanal gold foil label, and airtight gold twist cap locking in 250ml of liquid sunshine.',
    img: IMG.bottle,
    metrics: [
      { k: 'VOLUME', v: '250 mL (8.5 oz)' },
      { k: 'FRUIT COUNT', v: '3 Ripe Mangoes' },
      { k: 'PACKAGING', v: '100% Recyclable Glass' }
    ],
    tag: 'THE FINISHED BOTTLE'
  },
  {
    id: 'splash',
    num: '05',
    name: 'The Nectar Splash Explosion',
    subtitle: 'PURE HIGH-SPEED FLUID EXTRACTION',
    desc: 'Dynamic high-speed liquid explosion of golden-orange mango nectar crowned with flying fresh mango chunks and suspended droplets.',
    img: IMG.splash,
    metrics: [
      { k: 'PRESS', v: '4°C Hydraulic' },
      { k: 'PURITY', v: '100% Undiluted' },
      { k: 'EXTRACTION', v: 'Slow Press' }
    ],
    tag: 'DYNAMIC PURITY'
  }
]

export function MangoExpressions() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const active = MANGO_5[selectedIdx]

  return (
    <section id="expressions" className="relative bg-[#070707] px-6 md:px-16 py-28 md:py-36 border-t border-neutral-800/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div {...rise} className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700/50 rounded-full px-4 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold tracking-[0.35em] text-amber-400 uppercase">
              FIVE CULINARY EXPRESSIONS
            </span>
          </motion.div>
          <motion.h2 {...rise} className="font-display font-extrabold text-white text-4xl md:text-7xl leading-[0.95]">
            From Orchard To Glass.
          </motion.h2>
          <motion.p {...rise} className="mt-4 text-neutral-300 text-base md:text-lg leading-relaxed">
            The authentic story of Alphonso mango through 5 culinary harvest expressions.
          </motion.p>
        </div>

        {/* Expression Selector Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 md:gap-3 p-1.5 bg-neutral-950 rounded-2xl mb-12 max-w-4xl mx-auto border border-neutral-800">
          {MANGO_5.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedIdx(idx)}
              className={`flex-1 min-w-[140px] py-3.5 px-4 rounded-xl text-left transition-all ${
                selectedIdx === idx
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02] font-bold'
                  : 'text-neutral-400 hover:bg-neutral-900 font-semibold'
              }`}
            >
              <span className={`block text-[10px] tracking-[0.3em] font-mono mb-1 ${
                selectedIdx === idx ? 'text-black/70 font-bold' : 'text-amber-400/80'
              }`}>
                {item.num}
              </span>
              <span className="block font-display font-bold text-sm md:text-base leading-tight">
                {item.name.split(' ')[1] || item.name}
              </span>
            </button>
          ))}
        </div>

        {/* Active Expression Card Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0e0e0e] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Real Photo Image */}
            <div className="lg:col-span-7 relative min-h-[420px] md:min-h-[560px] bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] overflow-hidden">
              <Photo
                src={active.img}
                alt={active.name}
                className="w-full h-full min-h-[420px] md:min-h-[560px]"
                priority
              />
            </div>

            {/* Description & Specs (Right Side) */}
            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono tracking-[0.3em] text-neutral-400 uppercase font-bold">
                  HARVEST {active.num} · {active.subtitle}
                </span>
                <h3 className="font-display font-extrabold text-3xl md:text-5xl text-white mt-2 leading-[0.95]">
                  {active.name}
                </h3>
                <p className="mt-5 text-neutral-300 text-base leading-relaxed">
                  {active.desc}
                </p>

                {/* Metrics */}
                <div className="mt-8 border-t border-neutral-800 pt-6 flex flex-col gap-3">
                  {active.metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-800/60 text-xs">
                      <span className="tracking-[0.25em] text-neutral-400 font-bold uppercase">{m.k}</span>
                      <span className="font-display font-bold text-sm text-amber-400">{m.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-neutral-400">
                  Authentic Ratnagiri Harvest
                </span>
                <a
                  href="#final"
                  className="bg-amber-500 text-black font-bold rounded-full px-7 py-3 text-xs tracking-[0.25em] hover:scale-105 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
                >
                  ORDER THIS BATCH
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export function BottleExplorer() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      title: 'Heavy Glass Punt & Base',
      desc: 'Reinforced concave base punt provides thermal mass, keeping the juice ice-cold for hours without artificial cooling.'
    },
    {
      title: 'Frost Condensation Beads',
      desc: 'Cold-pressed at 4°C. Glistening surface condensation beads capture the crisp morning chill and freshness.'
    },
    {
      title: 'Artisanal Gold Foil Seal',
      desc: 'Embossed textured paper label with Ratnagiri harvest insignia, zero-sugar certification, and lot registration.'
    },
    {
      title: 'Airtight Gold Twist Cap',
      desc: 'Knurled grip aluminum cap with food-grade airtight nitro seal preserving 100% of fruit enzymes.'
    }
  ]

  return (
    <section id="bottle-anatomy" className="relative bg-[#000000] px-6 md:px-16 py-28 md:py-36 overflow-hidden border-t border-neutral-800/80">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div {...rise} className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700/50 rounded-full px-4 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold tracking-[0.35em] text-amber-400 uppercase">
                THE ARTISANAL BOTTLE
              </span>
            </motion.div>
            <motion.h2 {...rise} className="font-display font-extrabold text-white text-4xl md:text-6xl leading-[0.95]">
              Engineered For Freshness.
            </motion.h2>
            <motion.p {...rise} className="mt-4 text-neutral-300 text-base leading-relaxed">
              Every curve of our custom bottle is sculpted to protect the delicate aromatic terpenes of raw Alphonso mango from oxidation and light degradation.
            </motion.p>

            {/* Interactive Feature Accordion */}
            <div className="mt-8 flex flex-col gap-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    activeFeature === i
                      ? 'bg-[#141414] border-neutral-700 shadow-xl translate-x-1'
                      : 'bg-[#090909] border-neutral-800/80 hover:bg-[#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-lg text-white">{f.title}</h4>
                    <span className={`text-xs font-mono font-bold ${activeFeature === i ? 'text-amber-400' : 'text-neutral-500'}`}>
                      0{i + 1}
                    </span>
                  </div>
                  {activeFeature === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-xs md:text-sm text-neutral-300 leading-relaxed"
                    >
                      {f.desc}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <a
                href="#final"
                className="bg-amber-500 text-black font-bold rounded-full px-8 py-3.5 text-xs tracking-[0.25em] hover:scale-105 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                ORDER THIS BOTTLE · $6.50
              </a>
            </div>
          </div>

          {/* Right Real Photo of the Bottle */}
          <div className="lg:col-span-7 order-1 lg:order-2 h-[480px] md:h-[620px] relative rounded-3xl bg-gradient-to-b from-[#181818] to-[#000000] border border-neutral-800 shadow-2xl overflow-hidden">
            <Photo src={IMG.bottle} alt="MANGUE Artisanal Bottle" className="w-full h-full" priority />
          </div>
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section id="story" className="relative bg-[#080808] px-6 md:px-16 py-32 md:py-44 overflow-hidden border-t border-neutral-800/80">
      <motion.div {...rise} className="hidden lg:block absolute right-[6%] top-20 w-80 h-[30rem] rounded-t-[999px] shadow-2xl overflow-hidden border-4 border-neutral-700/40">
        <Photo src={IMG.field} alt="Sunlit Mango Orchard" className="w-full h-full" />
      </motion.div>
      <motion.div {...rise} className="hidden lg:block absolute right-[23%] bottom-16 w-64 h-64 rounded-full shadow-2xl overflow-hidden border-8 border-[#080808]">
        <Photo src={IMG.closeup} alt="Fresh Sliced Alphonso Mango" className="w-full h-full" />
      </motion.div>

      <div className="relative max-w-5xl">
        <motion.div {...rise} className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700/50 rounded-full px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] font-bold tracking-[0.35em] text-amber-400 uppercase">
            COASTAL TERROIR & HARVEST
          </span>
        </motion.div>
        <motion.h2 {...rise} className="font-display font-extrabold text-white text-5xl md:text-8xl leading-[0.9]">
          Picked at dawn.<br />Bottled by noon.
        </motion.h2>
        <motion.p {...rise} className="mt-8 max-w-xl text-lg md:text-xl text-neutral-300 leading-relaxed">
          Our Alphonso mangoes grow along the sea cliffs of Ratnagiri, nourished by iron-rich laterite red soil and warm coastal breezes. We pick each fruit by hand at sunrise when sugar concentrations peak, pressing them within four hours.
        </motion.p>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-3xl">
          <motion.div {...rise} className="bg-[#121212]/90 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-md">
            <span className="font-mono text-xs text-amber-400 font-bold">01 / COASTAL</span>
            <h4 className="font-display font-bold text-xl text-white mt-1">Laterite Terroir</h4>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">Natural sea breeze and mineral-dense red soil yield intense saffron sweetness.</p>
          </motion.div>
          <motion.div {...rise} className="bg-[#121212]/90 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-md">
            <span className="font-mono text-xs text-amber-400 font-bold">02 / ZERO WATER</span>
            <h4 className="font-display font-bold text-xl text-white mt-1">100% Undiluted</h4>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">Not a single drop of water or sweetener added. Only authentic fruit nectar.</p>
          </motion.div>
          <motion.div {...rise} className="bg-[#121212]/90 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-md">
            <span className="font-mono text-xs text-amber-400 font-bold">03 / COLD CHAIN</span>
            <h4 className="font-display font-bold text-xl text-white mt-1">4°C Cold Chain</h4>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">Shipped chilled straight to your doorstep within 24 hours of bottling.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const ING = [
  { n: '01', t: 'Ripe Alphonso Mangoes (92%)', d: 'Tree-ripened, hand-picked at dawn from our Ratnagiri groves. Naturally rich in vitamins A, C, and bioactive antioxidants.' },
  { n: '02', t: 'Pressed Fresh Lime (4%)', d: 'A cold-pressed whisper of coastal Kagzi lime to gently balance the intense sweetness and preserve natural brightness.' },
  { n: '03', t: 'Mountain Spring Chill (4%)', d: 'Kept chilled at 4°C throughout cold pressing to prevent oxidation and lock in live enzymes and vibrant aroma.' }
]

export function Ingredients() {
  return (
    <section id="ingredients" className="relative min-h-screen bg-[#000000] py-28 md:py-36 overflow-hidden border-t border-neutral-800/80">
      <div className="relative z-10 px-6 md:px-16 max-w-7xl mx-auto">
        <motion.div {...rise} className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700/50 rounded-full px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] font-bold tracking-[0.35em] text-amber-400 uppercase">
            WHAT GOES INSIDE
          </span>
        </motion.div>
        <motion.h2 {...rise} className="font-display font-extrabold text-white text-5xl md:text-8xl leading-[0.9]">
          Three things.<br />Nothing else.
        </motion.h2>

        <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 h-[380px] md:h-[480px] rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl relative bg-[#0e0e0e]">
            <Photo src={IMG.sliced} alt="Succulent Mango Slices" className="w-full h-full" />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            {ING.map((item, i) => (
              <motion.div
                key={item.n}
                {...rise}
                transition={{ ...rise.transition, delay: i * 0.12 }}
                className="bg-[#101010]/90 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-md"
              >
                <span className="text-xs tracking-[0.4em] font-mono font-bold text-amber-400">{item.n}</span>
                <h3 className="font-display font-bold text-2xl text-white mt-1">{item.t}</h3>
                <p className="text-neutral-300 text-sm mt-2 leading-relaxed">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Final() {
  const [pack, setPack] = useState(6)
  const [ordered, setOrdered] = useState(false)

  const prices = {
    3: { price: 18, desc: 'Taster 3-Pack (3 x 250ml)' },
    6: { price: 34, desc: 'Signature 6-Pack (6 x 250ml) — Most Popular' },
    12: { price: 62, desc: 'Orchard Crate (12 x 250ml) — Best Value' }
  }

  return (
    <section
      id="final"
      className="relative min-h-screen py-24 md:py-32 overflow-hidden flex flex-col justify-between"
      style={{ background: 'radial-gradient(circle at 50% 50%, #171717 0%, #090909 65%, #000000 100%)' }}
    >
      <Photo src={IMG.splash} alt="Dynamic Mango Splash" className="absolute inset-0 opacity-40 mix-blend-screen" />

      <div className="relative z-10 px-6 md:px-16 max-w-4xl mx-auto text-center text-white">
        <motion.div {...rise} className="inline-flex items-center gap-2 bg-neutral-900 backdrop-blur-md border border-neutral-700/50 rounded-full px-5 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-bold tracking-[0.35em] uppercase text-amber-400">COLD PRESSED & DELIVERED COLD</span>
        </motion.div>
        <motion.h2 {...rise} className="font-display font-extrabold text-white text-5xl md:text-8xl leading-[0.88] drop-shadow-2xl">
          POUR YOURSELF<br />SOME HAPPINESS.
        </motion.h2>
        <motion.p {...rise} className="mt-6 text-neutral-300 text-base md:text-xl max-w-xl mx-auto leading-relaxed">
          Order your cold-pressed Alphonso mango nectar. Bottled in heavy glass and shipped in insulated refrigerated packaging.
        </motion.p>

        {/* Bundle Selector Card */}
        <motion.div {...rise} className="mt-10 bg-[#101010]/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 text-white max-w-lg mx-auto shadow-2xl border border-neutral-800">
          <span className="text-[10px] tracking-[0.3em] font-bold text-amber-400 uppercase">SELECT YOUR PACK</span>
          <div className="grid grid-cols-3 gap-3 my-5">
            {[3, 6, 12].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setPack(cnt)}
                className={`py-3 px-2 rounded-2xl border transition-all ${
                  pack === cnt
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30 scale-105 font-bold'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-semibold'
                }`}
              >
                <div className="font-display font-extrabold text-2xl">{cnt}</div>
                <div className="text-[10px] tracking-wider uppercase font-semibold">Bottles</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-neutral-800">
            <span className="text-xs font-semibold text-neutral-300 text-left">{prices[pack].desc}</span>
            <span className="font-display font-extrabold text-3xl text-amber-400">${prices[pack].price}</span>
          </div>

          <button
            onClick={() => {
              setOrdered(true)
              setTimeout(() => setOrdered(false), 4000)
            }}
            className="w-full mt-4 bg-amber-500 text-black font-bold tracking-[0.25em] text-sm py-4 rounded-full hover:scale-[1.02] hover:bg-amber-400 active:scale-95 transition-all shadow-xl shadow-amber-500/30"
          >
            {ordered ? '✓ ADDED TO CHILLED CRATE!' : `ORDER ${pack}-PACK NOW`}
          </button>

          <p className="mt-3 text-[11px] text-neutral-400 tracking-wider font-medium">
            ❄ Free 24-Hour Express Cold-Chain Delivery Included
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-neutral-500 text-xs tracking-widest pt-16 pb-6 px-6">
        <p className="mb-2">© 2026 MANGUE BEVERAGES LLC · RATNAGIRI · ALL RIGHTS RESERVED</p>
        <p className="text-[10px] text-neutral-600">100% RECYCLABLE GLASS · PURE COLD-PRESSED MANGO NECTAR</p>
      </footer>
    </section>
  )
}
