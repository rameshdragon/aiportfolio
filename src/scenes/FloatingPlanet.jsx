import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Ring, MeshDistortMaterial, Trail } from '@react-three/drei'
import * as THREE from 'three'

function Satellite({ radius, speed, offset, size = 0.08, color = '#00d4ff' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.z = Math.sin(t) * radius
    ref.current.position.y = Math.sin(t * 0.7) * 0.3
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  )
}

function OrbitalRing({ radius, tilt, color }) {
  return (
    <mesh rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 8, 120]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.5} />
    </mesh>
  )
}

export default function FloatingPlanet() {
  const groupRef = useRef()
  const planetRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.25
    }
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.18
    }
  })

  return (
    <group ref={groupRef} position={[2.2, 0, 0]}>
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[1.28, 32, 32]} />
        <meshStandardMaterial color="#00d4ff" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Main planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <MeshDistortMaterial
          color="#0a1628"
          emissive="#001a3d"
          emissiveIntensity={0.4}
          distort={0.25}
          speed={1.8}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Neon continents as emission patches */}
      <mesh rotation={[0.4, 0.8, 0.2]}>
        <sphereGeometry args={[1.06, 32, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.08}
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>

      {/* Orbital rings */}
      <OrbitalRing radius={1.55} tilt={Math.PI * 0.18} color="#00d4ff" />
      <OrbitalRing radius={1.9} tilt={Math.PI * 0.42} color="#00ffcc" />
      <OrbitalRing radius={2.25} tilt={Math.PI * 0.6} color="#7b2fff" />

      {/* Satellites */}
      <Satellite radius={1.55} speed={1.2} offset={0} size={0.07} color="#00d4ff" />
      <Satellite radius={1.9} speed={0.8} offset={2.1} size={0.06} color="#00ffcc" />
      <Satellite radius={2.25} speed={0.5} offset={4.2} size={0.09} color="#7b2fff" />

      {/* Point light from planet */}
      <pointLight color="#00d4ff" intensity={1.2} distance={8} />
    </group>
  )
}
