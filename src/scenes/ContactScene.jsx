import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, Stars, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import StarField from './StarField'
import * as THREE from 'three'

function PortalRing({ radius, color, speed, axis = 'z' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation[axis] = clock.getElapsedTime() * speed
    }
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.04, 12, 120]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} transparent opacity={0.7} />
    </mesh>
  )
}

function CentralSphere() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) { ref.current.rotation.y = t * 0.15; ref.current.rotation.z = t * 0.08 }
  })
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <MeshDistortMaterial color="#001a3d" emissive="#00d4ff" emissiveIntensity={0.25} distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial color="#00d4ff" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#00d4ff" intensity={2.0} distance={6} />
    </group>
  )
}

function FloatingCodes() {
  const group = useRef()
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.04
    }
  })
  const items = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2
    const r = 4 + Math.random() * 2
    return { x: Math.cos(angle) * r, y: (Math.random() - 0.5) * 4, z: Math.sin(angle) * r, color: ['#00d4ff', '#00ffcc', '#7b2fff'][i % 3] }
  })
  return (
    <group ref={group}>
      {items.map((item, i) => (
        <Float key={i} speed={0.6 + i * 0.1} floatIntensity={0.3}>
          <mesh position={[item.x, item.y, item.z]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.9} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export default function ContactScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 55 }} style={{ position: 'absolute', inset: 0 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 5]} color="#7b2fff" intensity={1.0} />
      <pointLight position={[0, -5, 3]} color="#00ffcc" intensity={0.8} />

      <Suspense fallback={null}>
        <StarField count={2000} />
        <Stars radius={80} depth={40} count={1500} factor={3} fade speed={0.8} />
        <CentralSphere />
        <FloatingCodes />
        <PortalRing radius={2.2} color="#00d4ff" speed={0.3} axis="z" />
        <PortalRing radius={2.8} color="#00ffcc" speed={-0.2} axis="x" />
        <PortalRing radius={3.4} color="#7b2fff" speed={0.15} axis="y" />
        <PortalRing radius={4.0} color="#ff2d78" speed={-0.1} axis="z" />
        <Sparkles count={100} scale={[14, 10, 8]} size={1.0} speed={0.3} color="#00d4ff" opacity={0.5} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.1} intensity={0.8} blendFunction={BlendFunction.ADD} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
