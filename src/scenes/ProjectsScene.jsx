import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import StarField from './StarField'
import * as THREE from 'three'

function HoloCrystal({ position, color, speed, size = 1 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    if (ref.current) { ref.current.rotation.x = t * 0.4; ref.current.rotation.z = t * 0.3 }
  })
  return (
    <Float speed={speed * 0.6} rotationIntensity={0.4} floatIntensity={0.6}>
      <group ref={ref} position={position}>
        <mesh>
          <octahedronGeometry args={[0.3 * size, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} wireframe transparent opacity={0.8} />
        </mesh>
        <mesh scale={1.5}>
          <octahedronGeometry args={[0.3 * size, 0]} />
          <meshStandardMaterial color={color} transparent opacity={0.06} />
        </mesh>
        <pointLight color={color} intensity={0.6} distance={2.5} />
      </group>
    </Float>
  )
}

function TechRing({ radius, color, speed, tilt = 0 }) {
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed })
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]} position={[0, 0, -8]}>
      <torusGeometry args={[radius, 0.025, 8, 80]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} />
    </mesh>
  )
}

function NeonGrid() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.z = (clock.getElapsedTime() * 0.5) % 2
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[60, 60, 30, 30]} />
      <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.08} wireframe transparent opacity={0.12} />
    </mesh>
  )
}

export default function ProjectsScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 58 }} style={{ position: 'absolute', inset: 0 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 8, 2]} color="#00ffcc" intensity={1.4} />
      <pointLight position={[-6, -4, 3]} color="#7b2fff" intensity={1.0} />
      <pointLight position={[6, 2, 1]} color="#ff2d78" intensity={0.7} />

      <Suspense fallback={null}>
        <StarField count={1600} />
        <Stars radius={80} depth={40} count={1500} factor={3} fade speed={0.5} />
        <NeonGrid />

        <TechRing radius={7} color="#00d4ff" speed={0.08} tilt={0.3} />
        <TechRing radius={9} color="#7b2fff" speed={-0.05} tilt={0.8} />
        <TechRing radius={11} color="#00ffcc" speed={0.04} tilt={-0.5} />

        <HoloCrystal position={[-6, 2, -4]} color="#00d4ff" speed={0.9} size={1.4} />
        <HoloCrystal position={[6, -1.5, -3]} color="#00ffcc" speed={0.7} size={1.1} />
        <HoloCrystal position={[-5, -2.5, -5]} color="#7b2fff" speed={1.1} size={0.9} />
        <HoloCrystal position={[5.5, 2.5, -6]} color="#ff2d78" speed={0.6} size={1.2} />

        <Sparkles count={80} scale={[18, 12, 10]} size={1.1} speed={0.25} color="#00d4ff" opacity={0.5} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={0.5} blendFunction={BlendFunction.ADD} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
