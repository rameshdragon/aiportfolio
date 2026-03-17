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

  // Sign board sits at y=14 — well above the tallest building (h=8)
  const BOARD_Y = 14

  return (
    <group position={position}>
      {/* Left pole — 14 units tall */}
      <mesh castShadow position={[0, BOARD_Y / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.1, BOARD_Y, 8]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Right pole */}
      <mesh castShadow position={[0.4, BOARD_Y / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.1, BOARD_Y, 8]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.4} />
      </mesh>

      {/* Sign board */}
      <mesh position={[0.2, BOARD_Y, 0]} ref={glowRef}>
        <boxGeometry args={[3.2, 1.4, 0.14]} />
        <meshStandardMaterial
          color="#0a0f18"
          emissive="#00c8b4"
          emissiveIntensity={0.8}
          roughness={0.5}
        />
      </mesh>

      {/* Neon text */}
      <Billboard position={[0.2, BOARD_Y, 0.09]}>
        <Text
          ref={textRef}
          fontSize={0.42}
          color="#00ffdd"
          anchorX="center"
          anchorY="middle"
          outlineColor="#00c8b4"
          outlineWidth={0.012}
        >
          {label}
        </Text>
      </Billboard>

      {/* Strong glow light from sign — visible from afar */}
      <pointLight
        position={[0.2, BOARD_Y, 0.8]}
        color="#00c8b4"
        intensity={6}
        distance={22}
      />

      {/* "Walk closer" prompt when near */}
      {isNear && (
        <Billboard position={[0.2, 2.5, 0]}>
          <Text
            fontSize={0.26}
            color="#ffcc33"
            anchorX="center"
            anchorY="middle"
            outlineColor="#ff9900"
            outlineWidth={0.01}
          >
            WALK NEAR TO EXPLORE
          </Text>
        </Billboard>
      )}

      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.02, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial
          color="#00c8b4"
          emissive="#00c8b4"
          emissiveIntensity={0.2}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  )
}
