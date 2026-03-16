import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Post-apocalyptic ground with cracked road paths
export function Ground() {
  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1e22" roughness={0.95} />
      </mesh>
    </group>
  )
}

// Road segment
export function Road({ position, size = [4, 0.05, 4], rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} />
      </mesh>
      {/* Road lines */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.1, 0.01, size[2] * 0.8]} />
        <meshStandardMaterial color="#3d3525" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Water area with animated surface
export function WaterArea({ position = [0, 0, 0], size = [30, 30] }) {
  const meshRef = useRef()
  const matRef = useRef()

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.opacity = 0.7 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05
    }
  })

  return (
    <group position={position}>
      {/* Water bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#061820" roughness={0.8} />
      </mesh>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          ref={matRef}
          color="#0a3a4a"
          transparent
          opacity={0.75}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      {/* Debris in water */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.sin(i * 4.3) * size[0] * 0.35),
            -0.02,
            (Math.cos(i * 3.1) * size[1] * 0.35),
          ]}
        >
          <boxGeometry args={[0.3 + Math.random() * 0.5, 0.1, 0.2 + Math.random() * 0.4]} />
          <meshStandardMaterial color="#2a3a30" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
