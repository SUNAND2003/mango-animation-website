import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, useGLTF, Center } from '@react-three/drei'
import { S, clamp, sm } from './state'

// Texture Loader helper with sRGB color space
const loadTex = (url, isColor = true) => {
  if (typeof document === 'undefined') return null
  const t = new THREE.TextureLoader().load(url)
  if (isColor) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

// Canvas texture helper for bottle label
const cv = (w, h, fn) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  fn(c.getContext('2d'), w, h)
  return c
}
const texFromCanvas = (c) => {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

// -------------------------------------------------------------
// PHOTOREALISTIC TEXTURES
// -------------------------------------------------------------
const properMangoTex = loadTex('/images/proper-mango-clean.png', true)
const realCutTex = loadTex('/images/mango-cut-real.jpg', true)

// Luxury Artisanal Bottle Label
const createBottleLabelCanvas = () => {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const ctx = c.getContext('2d')

  // Smooth warm ivory parchment background
  ctx.fillStyle = '#faf4ea'
  ctx.fillRect(0, 0, 1024, 512)

  // Metallic gold filigree borders
  ctx.fillStyle = '#d4af37'
  ctx.fillRect(0, 24, 1024, 8)
  ctx.fillRect(0, 480, 1024, 8)

  // Brand Name
  ctx.fillStyle = '#5c1906'
  ctx.font = 'bold 88px serif'
  ctx.textAlign = 'center'
  ctx.fillText('MANGUE', 512, 210)

  // Subtitle
  ctx.font = '600 24px sans-serif'
  ctx.letterSpacing = '10px'
  ctx.fillStyle = '#8c3d10'
  ctx.fillText('100% PURE RATNAGIRI ALPHONSO', 512, 285)

  // Gold badge line
  ctx.font = '500 18px sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillStyle = '#b58b2a'
  ctx.fillText('COLD-PRESSED · ZERO ADDED SUGAR · 250 ML', 512, 345)

  return c
}
const bottleLabelTex = typeof document !== 'undefined' ? texFromCanvas(createBottleLabelCanvas()) : null

// PROPER PHOTOREALISTIC ALPHONSO MANGO MATERIAL
const properMangoMat = new THREE.MeshPhysicalMaterial({
  map: properMangoTex,
  color: '#ffffff', // 100% True Photographic Color
  roughness: 0.22,
  metalness: 0.02,
  clearcoat: 0.95,
  clearcoatRoughness: 0.12,
  sheen: 0.6,
  sheenColor: new THREE.Color('#ffc83b'),
  envMapIntensity: 1.4,
  transparent: true,
  alphaTest: 0.05,
  side: THREE.DoubleSide
})

const realMangoSkinMat = properMangoMat

// REAL CUT MANGO FLESH MATERIAL
const fleshMat = new THREE.MeshPhysicalMaterial({
  map: realCutTex,
  roughness: 0.32,
  clearcoat: 0.7,
  clearcoatRoughness: 0.2,
  sheen: 1,
  sheenColor: new THREE.Color('#ffd36b')
})

const seedGeo = new THREE.SphereGeometry(0.12, 16, 16).scale(0.8, 1.8, 0.4)
const seedMat = new THREE.MeshStandardMaterial({ color: '#f6d887', roughness: 0.6 })
const nectarJuiceMat = new THREE.MeshPhysicalMaterial({
  color: '#ff9800',
  emissive: '#4a1500',
  roughness: 0.04,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  transmission: 0.92,
  ior: 1.34,
  transparent: true,
  opacity: 0.92
})

// -------------------------------------------------------------
// AUTHENTIC ALPHONSO MANGO 3D ORGANIC SURFACE
// -------------------------------------------------------------
export function evalMangoSurface(u, v) {
  const theta = u * Math.PI * 2
  const totalH = 2.42
  const y = (0.5 - v) * totalH

  // Stem basin depression at the top
  const stemDip = v < 0.08 ? -0.11 * Math.pow(1 - v / 0.08, 2) : 0

  // Alphonso radius profile: broad rounded shoulders, plump belly, curved beak
  let r = 0
  if (v < 0.03) {
    r = 0.18 + (v / 0.03) * 0.38
  } else {
    const tv = (v - 0.03) / 0.97
    r = 1.02 * Math.sin(Math.PI * Math.pow(tv, 0.62)) * (0.76 + 0.32 * Math.pow(1 - tv, 0.45))
  }
  if (r < 0.01) r = 0.01

  // Ventral asymmetry (sunny cheek is rounder)
  const cheek = 1.0 + 0.16 * Math.cos(theta - 0.3) * Math.sin(Math.PI * Math.pow(v, 0.7))

  // Ovate lateral compression
  const radX = r * cheek * 1.04
  const radZ = r * cheek * 0.84

  // Lateral curve (beak hook) along X
  const curveX = 0.15 * Math.sin(Math.PI * v) - 0.08 * Math.pow(v, 2.2)

  const px = curveX + Math.cos(theta) * radX
  const py = y + stemDip
  const pz = Math.sin(theta) * radZ

  return [px, py, pz]
}

// Seamless Whole 3D Alphonso Mango Mesh Geometry
function createWholeMangoGeometry(widthSeg = 64, heightSeg = 64) {
  const geo = new THREE.BufferGeometry()
  const positions = []
  const uvs = []
  const indices = []

  for (let j = 0; j <= heightSeg; j++) {
    const v = j / heightSeg
    for (let i = 0; i <= widthSeg; i++) {
      const u = i / widthSeg
      const [px, py, pz] = evalMangoSurface(u, v)
      positions.push(px, py, pz)
      uvs.push(u, v)
    }
  }

  for (let j = 0; j < heightSeg; j++) {
    for (let i = 0; i < widthSeg; i++) {
      const a = j * (widthSeg + 1) + i
      const b = (j + 1) * (widthSeg + 1) + i
      const c = (j + 1) * (widthSeg + 1) + (i + 1)
      const d = j * (widthSeg + 1) + (i + 1)
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// Succulent Half-Cut Geometry (for Act 2: Pure Nectar Reveal)
function createMangoHalfGeometry(isRightHalf = true, segs = 48) {
  const geo = new THREE.BufferGeometry()
  const positions = []
  const uvs = []
  const indices = []

  // Range of u: left half is u in [0.5, 1.0], right half is u in [0.0, 0.5]
  const uStart = isRightHalf ? 0.0 : 0.5
  const uEnd = isRightHalf ? 0.5 : 1.0

  // 1. Outer skin hemisphere
  for (let j = 0; j <= segs; j++) {
    const v = j / segs
    for (let i = 0; i <= segs; i++) {
      const u = uStart + (i / segs) * (uEnd - uStart)
      const [px, py, pz] = evalMangoSurface(u, v)
      positions.push(px, py, pz)
      uvs.push(u, v)
    }
  }

  const skinIndexCount = segs * segs * 6
  for (let j = 0; j < segs; j++) {
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i
      const b = (j + 1) * (segs + 1) + i
      const c = (j + 1) * (segs + 1) + (i + 1)
      const d = j * (segs + 1) + (i + 1)
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }
  geo.addGroup(0, skinIndexCount, 0) // Material 0: Outer Skin

  // 2. Planar Cut Face (along Z-Y plane)
  const cutFaceStart = indices.length
  const centerIdx = positions.length / 3
  positions.push(0, 0, 0)
  uvs.push(0.5, 0.5)

  const rimStart = positions.length / 3
  for (let j = 0; j <= segs * 2; j++) {
    const t = j / (segs * 2)
    // Boundary runs along u = uStart from top to bottom, then along u = uEnd from bottom to top
    const v = t < 0.5 ? t * 2.0 : (1.0 - (t - 0.5) * 2.0)
    const u = t < 0.5 ? uStart : uEnd
    const [px, py, pz] = evalMangoSurface(u, v)
    positions.push(0, py, pz)
    uvs.push(0.5 + pz * 0.42, 0.5 + py * 0.38)
  }

  for (let j = 0; j < segs * 2; j++) {
    if (isRightHalf) {
      indices.push(centerIdx, rimStart + j + 1, rimStart + j)
    } else {
      indices.push(centerIdx, rimStart + j, rimStart + j + 1)
    }
  }
  const cutFaceCount = segs * 2 * 3
  geo.addGroup(cutFaceStart, cutFaceCount, 1) // Material 1: Cut Flesh

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// Curved 3D Leaf Geometry mapped with the Real Leaf Photo
function createCurvedLeafGeometry(w = 1.35, h = 1.75, segs = 18) {
  const geo = new THREE.PlaneGeometry(w, h, segs, segs)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const normY = (y + h * 0.5) / h
    const archZ = Math.sin(normY * Math.PI) * 0.22
    const crease = -Math.abs(x) * 0.12
    pos.setZ(i, archZ + crease)
  }
  geo.computeVertexNormals()
  return geo
}

// 3D Stem Twig Geometry
function createStemGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.02, 0.12, 0.01),
    new THREE.Vector3(0.04, 0.28, -0.02)
  ])
  return new THREE.TubeGeometry(curve, 14, 0.045, 10, false)
}

// Realistic Leaf & Wooden Stem Component
function RealisticMangoFoliage() {
  const leafGeo = useMemo(() => createCurvedLeafGeometry(1.3, 1.65, 16), [])
  const stemGeo = useMemo(() => createStemGeometry(), [])

  const leafMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: realLeafTex,
    transparent: true,
    alphaTest: 0.12,
    roughness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide
  }), [])

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: realStemTex,
    color: '#55361e',
    roughness: 0.85
  }), [])

  return (
    <group position={[0.06, 1.14, 0]}>
      {/* 3D Wooden Stem */}
      <mesh geometry={stemGeo} material={stemMaterial} />
      {/* 3D Mango Leaf Arching Gracefully to the Right */}
      <group position={[0.42, 0.18, 0.02]} rotation={[-0.1, 0.28, -0.32]}>
        <mesh geometry={leafGeo} material={leafMaterial} />
      </group>
    </group>
  )
}

// 3D Glistening Water Dewdrops on Mango Surface
function MangoDewdrops({ count = 80 }) {
  const meshRef = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])
  const dropletGeo = useMemo(() => new THREE.SphereGeometry(0.026, 10, 10).scale(1, 0.65, 1), [])

  const dropMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.04,
    metalness: 0,
    transmission: 0.94,
    ior: 1.333,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.88
  }), [])

  const dropsData = useMemo(() => {
    const list = []
    const rng = (s) => { const x = Math.sin(s) * 10000; return x - Math.floor(x) }
    for (let i = 0; i < count; i++) {
      const u = rng(i * 7 + 1)
      const v = 0.12 + rng(i * 7 + 2) * 0.76
      const [px, py, pz] = evalMangoSurface(u, v)
      const scale = 0.6 + rng(i * 7 + 3) * 0.9
      list.push({ px, py, pz, scale })
    }
    return list
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return
    dropsData.forEach((d, i) => {
      o.position.set(d.px, d.py, d.pz)
      o.scale.setScalar(d.scale)
      o.updateMatrix()
      meshRef.current.setMatrixAt(i, o.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[dropletGeo, dropMaterial, count]} frustumCulled={false} />
  )
}

// -------------------------------------------------------------
// HIGH-RESOLUTION 3D ORGANIC CURVED MANGO VOLUME GEOMETRY
// -------------------------------------------------------------
function createProperMango3DGeometry(width = 3.1, height = 3.4, depth = 0.52, segs = 48) {
  const geo = new THREE.BufferGeometry()
  const positions = []
  const uvs = []
  const indices = []

  // Front Shell (curving outward along +Z)
  for (let j = 0; j <= segs; j++) {
    const v = j / segs
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const x = (u - 0.5) * width
      const y = (0.5 - v) * height
      const dx = (u - 0.5) * 2
      const dy = (v - 0.5) * 2
      const r2 = dx * dx + dy * dy
      const zFactor = Math.max(0, 1 - r2)
      const z = Math.sqrt(zFactor) * depth

      positions.push(x, y, z)
      uvs.push(u, v)
    }
  }

  // Back Shell (curving along -Z for full 3D body volume)
  const offset = (segs + 1) * (segs + 1)
  for (let j = 0; j <= segs; j++) {
    const v = j / segs
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const x = (u - 0.5) * width
      const y = (0.5 - v) * height
      const dx = (u - 0.5) * 2
      const dy = (v - 0.5) * 2
      const r2 = dx * dx + dy * dy
      const zFactor = Math.max(0, 1 - r2)
      const z = -Math.sqrt(zFactor) * depth * 0.7

      positions.push(x, y, z)
      uvs.push(1 - u, v)
    }
  }

  // Indices for Front Shell
  for (let j = 0; j < segs; j++) {
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i
      const b = (j + 1) * (segs + 1) + i
      const c = (j + 1) * (segs + 1) + (i + 1)
      const d = j * (segs + 1) + (i + 1)
      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  // Indices for Back Shell
  for (let j = 0; j < segs; j++) {
    for (let i = 0; i < segs; i++) {
      const a = offset + j * (segs + 1) + i
      const b = offset + (j + 1) * (segs + 1) + i
      const c = offset + (j + 1) * (segs + 1) + (i + 1)
      const d = offset + j * (segs + 1) + (i + 1)
      indices.push(a, d, b)
      indices.push(b, d, c)
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// -------------------------------------------------------------
// GENUINE 3D SCANNED MANGO MODEL (GLB)
// -------------------------------------------------------------
export function Mango({ st = S }) {
  const groupRef = useRef()
  const { scene } = useGLTF('/models/mango.glb')

  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.roughness = 0.32
          child.material.metalness = 0.02
          child.material.clearcoat = 0.88
          child.material.clearcoatRoughness = 0.16
          child.material.envMapIntensity = 1.6
        }
      }
    })
    return clone
  }, [scene])

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const elevate = sm(st.elevate)
    const bottleActive = sm(st.bottle)

    // Interactive pointer gyroscopic tilt
    const cursorTiltX = -pointer.y * 0.28
    const cursorTiltY = pointer.x * 0.36

    // Smooth continuous 360 3D rotation with scroll + floating hover
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, cursorTiltX, 0.08)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, st.rot + cursorTiltY, 0.1)
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.03

    // Floating breathing position + elevate during extraction
    const floatY = Math.sin(t * 1.5) * 0.08 * (1 - elevate)
    groupRef.current.position.set(
      0,
      floatY + elevate * 1.35 - bottleActive * 2.8,
      -elevate * 0.35
    )

    // Proportional scale for the 3D model (elevating & fading into bottle)
    const scale = 1.45 * (1 - sm(clamp((st.bottle - 0.25) / 0.75)))
    groupRef.current.scale.setScalar(Math.max(0.0001, scale))
    groupRef.current.visible = groupRef.current.scale.x > 0.01
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={model} rotation={[0, 0, -Math.PI / 2]} />
      </Center>
    </group>
  )
}
useGLTF.preload('/models/mango.glb')

// -------------------------------------------------------------
// ORBITAL GOLDEN NECTAR BURST (Act 2: Zero-Gravity Fluid Extraction)
// -------------------------------------------------------------
export function Splash({ st = S, count = 65 }) {
  const meshRef = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => Array.from({ length: count }, (_, i) => {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const speed = 1.4 + Math.random() * 2.2
    const size = 0.05 + Math.random() * 0.14
    return {
      dir: new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta) * 0.65,
        Math.cos(phi)
      ),
      speed,
      size,
      orbitOffset: Math.random() * Math.PI * 2
    }
  }), [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = sm(st.splash)
    const time = clock.elapsedTime
    const bottleActive = sm(st.bottle)

    if (t < 0.01 || bottleActive > 0.95) {
      meshRef.current.visible = false
      return
    }
    meshRef.current.visible = true

    particles.forEach((p, i) => {
      // Fluid orbital swirl in zero-gravity
      const radialDist = p.speed * t * 1.85
      const angle = p.orbitOffset + time * 1.2
      const px = Math.cos(angle) * radialDist * p.dir.x
      const py = 1.35 + p.dir.y * radialDist - t * 0.65
      const pz = Math.sin(angle) * radialDist * p.dir.z

      // Sizing with elastic pulse
      const s = p.size * sm(t * 3) * (1 - sm(clamp((t - 0.7) / 0.3))) * (1 - bottleActive)
      o.position.set(px, py, pz)
      o.scale.setScalar(Math.max(0.0001, s))
      o.updateMatrix()
      meshRef.current.setMatrixAt(i, o.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 14, 14]} />
      <primitive object={nectarJuiceMat} attach="material" />
    </instancedMesh>
  )
}

// -------------------------------------------------------------
// PHOTOREALISTIC CHILLED GLASS BOTTLE
// -------------------------------------------------------------
const bottleGlassMat = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.3,
  roughness: 0.02,
  clearcoat: 1.0,
  clearcoatRoughness: 0.06,
  transmission: 0.92,
  ior: 1.52,
  thickness: 0.45,
  envMapIntensity: 2.2,
  side: THREE.DoubleSide,
  depthWrite: false
})

export function Bottle({ st = S }) {
  const g = useRef(), liq = useRef(), foam = useRef(), cap = useRef(), bub = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])

  // Heavy Base Lathe Glass Profile
  const body = useMemo(() => {
    const points = [
      [0, 0],
      [0.82, 0],
      [0.88, 0.12],
      [0.88, 2.35],
      [0.82, 2.85],
      [0.44, 3.2],
      [0.40, 3.65],
      [0.45, 3.75]
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(points, 56)
  }, [])

  const liqGeo = useMemo(() => new THREE.CylinderGeometry(0.81, 0.77, 2.3, 48).translate(0, 1.15, 0), [])
  const B = useMemo(() => Array.from({ length: 32 }, () => ({
    r: Math.random() * 0.65,
    a: Math.random() * 6.28,
    v: 0.15 + Math.random() * 0.25,
    o: Math.random(),
    s: 0.02 + Math.random() * 0.035
  })), [])

  useFrame(({ clock, pointer }) => {
    if (!g.current) return
    const t = clock.elapsedTime
    const fl = sm(st.fill)
    const bottleActive = sm(st.bottle)
    const h = 2.3 * Math.max(fl, 0.0001)

    // Smooth emergence
    g.current.scale.setScalar(Math.max(0.0001, bottleActive * 1.05))
    g.current.visible = bottleActive > 0.01

    // Subtle cursor tilt for glass bottle
    g.current.rotation.y = t * 0.08 + pointer.x * 0.25
    g.current.position.y = -1.8 + bottleActive * 0.25

    if (liq.current) {
      liq.current.scale.y = Math.max(fl, 0.0001)
      liq.current.visible = fl > 0.003
      liq.current.rotation.z = Math.sin(t * 2.4) * 0.012 * Math.sin(Math.PI * clamp(fl))
    }
    if (foam.current) {
      foam.current.position.y = 0.08 + h
      foam.current.visible = fl > 0.01
    }
    if (cap.current) {
      const c = sm(st.cap)
      cap.current.position.y = 3.75 + (1 - c) * 2.5
      cap.current.rotation.y = (1 - c) * Math.PI * 3.5
    }
    if (bub.current) {
      B.forEach((b, i) => {
        o.position.set(Math.cos(b.a + t * 0.3) * b.r, 0.1 + ((t * b.v + b.o) % 1) * h, Math.sin(b.a + t * 0.3) * b.r)
        o.scale.setScalar(fl > 0.04 ? b.s : 0.0001)
        o.updateMatrix()
        bub.current.setMatrixAt(i, o.matrix)
      })
      bub.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={g} position={[0, -1.8, 0]}>
      {/* 3D Glass Body */}
      <mesh geometry={body} material={bottleGlassMat} renderOrder={2} />

      {/* Golden Nectar Liquid */}
      <mesh ref={liq} geometry={liqGeo} material={nectarJuiceMat} position={[0, 0.08, 0]} />

      {/* Foam Head */}
      <mesh ref={foam}>
        <cylinderGeometry args={[0.79, 0.79, 0.05, 48]} />
        <meshStandardMaterial color="#ffd37a" roughness={0.4} />
      </mesh>

      {/* Micro Bubbles */}
      <instancedMesh ref={bub} args={[undefined, undefined, 32]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </instancedMesh>

      {/* Artisanal Paper Label Wrap with Mangue Branding */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.885, 0.885, 1.15, 56, 1, true]} />
        <meshStandardMaterial map={bottleLabelTex} roughness={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Glass Highlight Rim Strip */}
      <mesh position={[-0.58, 1.3, 0.72]} rotation={[0, -0.7, 0]} renderOrder={3}>
        <planeGeometry args={[0.07, 2.4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Knurled Gold Metal Cap */}
      <mesh ref={cap} position={[0, 3.75, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.34, 48]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

// Glowing Nectar Atmosphere Particles
export function Decor() {
  const g = useRef()
  const items = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, r = 2.6 + Math.random() * 2.0
    return {
      p: [Math.cos(a) * r, (Math.random() - 0.5) * 3.4, Math.sin(a) * r * 0.7 - 0.4],
      s: 0.08 + Math.random() * 0.12
    }
  }), [])

  useFrame(({ clock }) => {
    if (!g.current) return
    g.current.rotation.y = clock.elapsedTime * 0.05
  })

  return (
    <group ref={g}>
      {items.map((it, i) => (
        <Float key={i} speed={1.2} rotationIntensity={1.0} floatIntensity={1.2}>
          <mesh position={it.p} scale={it.s * 2.0}>
            <sphereGeometry args={[0.32, 12, 12]} />
            <meshPhysicalMaterial color="#ffaa17" roughness={0.08} clearcoat={1} transparent opacity={0.55} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
