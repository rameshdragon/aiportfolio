import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#b49260" roughness={0.92} />
      </mesh>
    </group>
  )
}

export function Road({ position, size = [6, 0.05, 6], rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#8a7055" roughness={0.88} />
      </mesh>
    </group>
  )
}

// Wind-animated water with ripples
export function WaterArea({ position = [0, 0, 0], size = [30, 30] }) {
  const surfaceRef = useRef()
  const posAttr    = useRef()
  const segments   = 24

  // Build a subdivided plane for wave animation
  const geo = useRef(new THREE.PlaneGeometry(size[0], size[1], segments, segments))

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const g = geo.current
    const pos = g.attributes.position

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const idx = i * (segments + 1) + j
        const x = pos.getX(idx)
        const z = pos.getY(idx)   // Y in local plane = Z in world
        // Composite wave = wind ripples + swell
        const wave =
          Math.sin(x * 0.4 + t * 2.1)  * 0.08 +
          Math.sin(z * 0.5 + t * 1.7)  * 0.06 +
          Math.sin((x + z) * 0.3 + t * 1.3) * 0.04
        pos.setZ(idx, wave)
      }
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
  })

  return (
    <group position={position}>
      {/* Water bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#1a3040" roughness={0.9} />
      </mesh>

      {/* Animated water surface */}
      <mesh ref={surfaceRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <primitive object={geo.current} attach="geometry" />
        <meshStandardMaterial
          color="#3a7a9a"
          transparent
          opacity={0.8}
          roughness={0.05}
          metalness={0.6}
          envMapIntensity={0.8}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Wind foam streaks on surface */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.1) * size[0] * 0.3,
          -0.06,
          Math.cos(i * 0.9) * size[1] * 0.3,
        ]} rotation={[-Math.PI / 2, 0, i * 0.8]}>
          <planeGeometry args={[0.15, size[0] * 0.4 + Math.sin(i) * 2]} />
          <meshStandardMaterial color="#c8e8f0" transparent opacity={0.18} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}
