import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Building({ position, size = [4, 6, 4], color = '#0d1520', damaged = false }) {
  const windowRef = useRef()

  useFrame(({ clock }) => {
    if (windowRef.current) {
      windowRef.current.material.emissiveIntensity =
        0.2 + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.15
    }
  })

  const [w, h, d] = size
  const windowColor = Math.random() > 0.7 ? '#ff6b35' : '#1e3a4a'
  const hasLitWindow = Math.random() > 0.5

  return (
    <group position={position}>
      {/* Main structure */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Roof edge */}
      <mesh position={[0, h + 0.1, 0]}>
        <boxGeometry args={[w + 0.2, 0.2, d + 0.2]} />
        <meshStandardMaterial color="#1a2535" roughness={0.8} />
      </mesh>

      {/* Windows */}
      {Array.from({ length: Math.floor(h / 2) }, (_, iy) =>
        Array.from({ length: Math.max(1, Math.floor(w / 2)) }, (_, ix) => {
          const wx = -w / 2 + 1 + ix * 2
          const wy = 1.5 + iy * 2
          const lit = hasLitWindow && iy === 0 && ix === 0
          return (
            <mesh
              key={`${iy}-${ix}`}
              ref={lit ? windowRef : undefined}
              position={[wx, wy, d / 2 + 0.01]}
            >
              <planeGeometry args={[0.8, 1]} />
              <meshStandardMaterial
                color={lit ? '#ff6b35' : '#1e3a4a'}
                emissive={lit ? '#ff6b35' : '#000000'}
                emissiveIntensity={lit ? 0.3 : 0}
              />
            </mesh>
          )
        })
      )}

      {/* Damage marks */}
      {damaged && (
        <>
          <mesh position={[w / 2 - 0.5, h * 0.6, d / 2 + 0.02]} rotation={[0, 0, 0.3]}>
            <planeGeometry args={[1.5, 2]} />
            <meshStandardMaterial color="#1a1a1a" transparent opacity={0.5} />
          </mesh>
          <mesh position={[-w / 4, h * 0.8, 0]} castShadow>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Small ruined shack
export function Shack({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Walls */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[3, 2.4, 3]} />
        <meshStandardMaterial color="#1a2520" roughness={0.9} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.6, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.4, 0.15, 3.4]} />
        <meshStandardMaterial color="#2a1a15" roughness={0.85} />
      </mesh>
      {/* Door opening */}
      <mesh position={[0, 0.8, 1.51]}>
        <planeGeometry args={[1, 1.6]} />
        <meshStandardMaterial color="#0a0e14" />
      </mesh>
    </group>
  )
}
