import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

export function SignPole({ position, label, isNear }) {
  const glowRef = useRef()
  const textRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (glowRef.current) {
      glowRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.3
      // Neon flicker
      if (Math.random() > 0.98) {
        glowRef.current.material.emissiveIntensity = 0.2
      }
    }
  })

  return (
    <group position={position}>
      {/* Pole */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 8]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Second pole */}
      <mesh castShadow position={[0.4, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 8]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Sign board */}
      <mesh position={[0.2, 5.2, 0]} ref={glowRef}>
        <boxGeometry args={[3, 1.2, 0.12]} />
        <meshStandardMaterial
          color="#0a0f18"
          emissive="#00c8b4"
          emissiveIntensity={0.8}
          roughness={0.5}
        />
      </mesh>

      {/* Neon text */}
      <Billboard position={[0.2, 5.2, 0.08]}>
        <Text
          ref={textRef}
          fontSize={0.35}
          color="#00ffdd"
          anchorX="center"
          anchorY="middle"
          outlineColor="#00c8b4"
          outlineWidth={0.01}
        >
          {label}
        </Text>
      </Billboard>

      {/* Glow light from sign */}
      <pointLight
        position={[0.2, 5.2, 0.5]}
        color="#00c8b4"
        intensity={2}
        distance={8}
      />

      {/* "Press F" prompt when near */}
      {isNear && (
        <Billboard position={[0.2, 1.2, 0]}>
          <Text
            fontSize={0.22}
            color="#ffcc33"
            anchorX="center"
            anchorY="middle"
            outlineColor="#ff9900"
            outlineWidth={0.008}
          >
            PRESS F TO READ
          </Text>
        </Billboard>
      )}

      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.02, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial
          color="#00c8b4"
          emissive="#00c8b4"
          emissiveIntensity={0.15}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}
