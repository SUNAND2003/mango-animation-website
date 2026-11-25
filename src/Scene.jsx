import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { S, sm } from './state'
import { Mango, Splash, Bottle, Decor } from './Objects'

const mobile = typeof window !== 'undefined' && window.innerWidth < 768
const dpr = mobile ? [1, 1.25] : [1, 1.75]

export function Studio() {
  return (
    <>
      <ambientLight intensity={0.9} />
      {/* Warm Golden Key Sunlight */}
      <directionalLight position={[4, 7, 5]} intensity={2.4} color="#fff6e8" castShadow />
      {/* Cool Sky Fill Light */}
      <directionalLight position={[-4, 3, -2]} intensity={1.2} color="#ffe2b8" />
      {/* Warm Mango Rim Highlight (makes fruit curve & dewdrops pop) */}
      <pointLight position={[-3.5, 2, 3]} intensity={28} color="#ffb74d" />
      <pointLight position={[3.5, -1, 2.5]} intensity={20} color="#ff9800" />
      <pointLight position={[0, 4, -3]} intensity={15} color="#ffd580" />

      {/* Specular Lightformers for Glass & Gloss Reflections */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={5.5} position={[0, 6, -4]} scale={[14, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={4} position={[-5, 2, 3]} scale={[3, 9, 1]} color="#ffe4b5" />
        <Lightformer form="rect" intensity={3.5} position={[5, 1, 2]} scale={[4, 9, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={2.5} position={[0, -2, 2]} scale={[6, 6, 1]} color="#ffcf70" />
      </Environment>
    </>
  )
}

function Rig() {
  useFrame(({ camera, pointer }) => {
    const elevate = sm(S.elevate)
    const bottle = sm(S.bottle)
    const targetX = Math.sin(S.rot * 0.08) * 0.35 + pointer.x * 0.4
    const targetY = elevate * 0.45 - bottle * 0.2 + pointer.y * 0.25
    const targetZ = (mobile ? 10.5 : 8.2) + elevate * 0.5 - bottle * 0.35

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06)
    camera.lookAt(0, elevate * 0.35, 0)
  })
  return null
}

function Mover({ children }) {
  const g = useRef()
  useFrame(({ camera, size }) => {
    if (!g.current) return
    const k = sm(S.move)
    const desk = size.width >= 768
    const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
    g.current.position.set(desk ? -0.48 * hh * (size.width / size.height) * k : 0, desk ? 0 : 0.32 * hh * k, 0)
    g.current.scale.setScalar(desk ? 1.05 : 1 - 0.14 * k)
  })
  return <group ref={g}>{children}</group>
}

// Master 3D WebGL Hero Canvas
export function HeroScene() {
  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: mobile ? 40 : 35, position: [0, 0, 8.2] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.18 }}
    >
      <Suspense fallback={null}>
        <Studio />
        <Rig />
        <Decor />
        <Mango />
        <ContactShadows position={[0, -2.05, 0]} opacity={0.6} scale={8} blur={2.4} far={3.5} color="#010a07" />
        <Splash count={mobile ? 45 : 75} />
        <Mover>
          <Bottle />
          <ContactShadows position={[0, -2.05, 0]} opacity={0.6} scale={10} blur={2.6} far={4} color="#010a07" />
        </Mover>
      </Suspense>
    </Canvas>
  )
}
