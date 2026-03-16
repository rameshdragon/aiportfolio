import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function PlayerModel({ moving, direction }) {
  const groupRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const headRef = useRef()
  const eyeLeftRef = useRef()
  const eyeRightRef = useRef()
  const coreRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const walkCycle = t * 6

    // Zombie wobble
    if (groupRef.current) {
      groupRef.current.rotation.z = moving ? Math.sin(t * 5) * 0.04 : 0
    }

    // Walk animation
    const legSwing = moving ? Math.sin(walkCycle) * 0.5 : 0
    const armSwing = moving ? Math.sin(walkCycle) * 0.4 : 0

    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing
    if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing - 0.3
    if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing - 0.2

    // Head bob
    if (headRef.current) {
      headRef.current.position.y = 1.65 + (moving ? Math.sin(walkCycle * 2) * 0.03 : 0)
    }

    // Glowing eyes
    const glow = 0.6 + Math.sin(t * 4) * 0.4
    if (eyeLeftRef.current) eyeLeftRef.current.material.emissiveIntensity = glow
    if (eyeRightRef.current) eyeRightRef.current.material.emissiveIntensity = glow

    // Core glow
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.15, 0.45, 0]}>
        {/* Upper leg */}
        <mesh castShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[0.18, 0.45, 0.18]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Knee joint */}
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#2a4a38" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Lower leg */}
        <mesh castShadow position={[0, -0.45, 0]}>
          <boxGeometry args={[0.14, 0.4, 0.14]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.65, 0.05]}>
          <boxGeometry args={[0.16, 0.06, 0.25]} />
          <meshStandardMaterial color="#2a3a30" roughness={0.8} metalness={0.4} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.15, 0.45, 0]}>
        <mesh castShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[0.18, 0.45, 0.18]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#2a4a38" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh castShadow position={[0, -0.45, 0]}>
          <boxGeometry args={[0.14, 0.4, 0.14]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.65, 0.05]}>
          <boxGeometry args={[0.16, 0.06, 0.25]} />
          <meshStandardMaterial color="#2a3a30" roughness={0.8} metalness={0.4} />
        </mesh>
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 0.65, 0.3]} />
        <meshStandardMaterial color="#1e4438" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Chest core */}
      <mesh ref={coreRef} position={[0, 1.05, 0.16]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#ccddaa"
          emissive="#ccddaa"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Rust patches */}
      <mesh position={[0.15, 1.1, 0.16]}>
        <boxGeometry args={[0.15, 0.1, 0.01]} />
        <meshStandardMaterial color="#8a4a1a" roughness={1} />
      </mesh>
      <mesh position={[-0.1, 0.85, 0.16]}>
        <boxGeometry args={[0.12, 0.08, 0.01]} />
        <meshStandardMaterial color="#7a3a15" roughness={1} />
      </mesh>
      {/* M-7 marking */}
      <mesh position={[0.18, 1.2, 0.16]}>
        <boxGeometry args={[0.08, 0.04, 0.005]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#2a4a38" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.65, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#2a5a48" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Face plate */}
        <mesh position={[0, -0.02, 0.12]}>
          <boxGeometry args={[0.28, 0.18, 0.08]} />
          <meshStandardMaterial color="#1a3a2e" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Eyes */}
        <mesh ref={eyeLeftRef} position={[-0.07, 0.03, 0.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#ddcc33" emissive="#ddcc33" emissiveIntensity={0.6} />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.07, 0.03, 0.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#ddcc33" emissive="#ddcc33" emissiveIntensity={0.6} />
        </mesh>
        {/* Jaw */}
        <mesh position={[0, -0.12, 0.1]}>
          <boxGeometry args={[0.2, 0.06, 0.1]} />
          <meshStandardMaterial color="#1e3a2e" roughness={0.7} metalness={0.3} />
        </mesh>
      </group>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.35, 1.2, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#2a4a38" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Claw */}
        <mesh position={[-0.03, -0.8, 0.02]} rotation={[0.2, 0, 0.1]}>
          <boxGeometry args={[0.03, 0.12, 0.03]} />
          <meshStandardMaterial color="#3a4a38" roughness={0.7} metalness={0.5} />
        </mesh>
        <mesh position={[0.03, -0.82, 0.02]} rotation={[0.2, 0, -0.1]}>
          <boxGeometry args={[0.03, 0.12, 0.03]} />
          <meshStandardMaterial color="#3a4a38" roughness={0.7} metalness={0.5} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.35, 1.2, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#2a4a38" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color="#1a3a30" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Weapon */}
        <mesh position={[0, -0.7, 0.1]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.06, 0.5, 0.08]} />
          <meshStandardMaterial color="#3a3a25" roughness={0.8} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.95, 0.25]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.18]} />
          <meshStandardMaterial color="#4a4a30" roughness={0.7} metalness={0.3} />
        </mesh>
      </group>

      {/* Eye glow light */}
      <pointLight position={[0, 1.65, 0.3]} color="#ddcc33" intensity={0.3} distance={2} />
    </group>
  )
}
