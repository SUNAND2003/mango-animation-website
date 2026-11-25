// Shared GSAP scrub state for 3D objects
export const S = {
  rot: 0,       // continuous smooth rotation
  elevate: 0,   // vertical fruit elevation
  split: 0,     // separation of succulent halves
  splash: 0,    // fluid nectar burst
  bottle: 0,    // bottle rise
  fill: 0,      // nectar filling
  cap: 0,       // gold cap seal
  move: 0,      // layout shift for final CTA
  intro: 1
}

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x) }
