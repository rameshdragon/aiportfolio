import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Rusted abandoned car
export function Car({ position, rotation = 0, color = '#3a1a1a' }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.8, 0.7, 3.5]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[0, 1, -0.2]}>
        <boxGeometry args={[1.6, 0.6, 1.8]} />
        <meshStandardMaterial color="#2a1515" roughness={0.85} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1, 0.7]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[1.4, 0.5]} />
        <meshStandardMaterial color="#1a3a4a" transparent opacity={0.5} roughness={0.3} />
      </mesh>
      {/* Rust patches */}
      <mesh position={[0.6, 0.5, 0.8]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color="#6a3a15" roughness={1} transparent opacity={0.6} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, 0.2, 1.1], [0.9, 0.2, 1.1], [-0.9, 0.2, -1.1], [0.9, 0.2, -1.1]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// Dead tree
export function DeadTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 3, 6]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      {/* Branches */}
      <mesh castShadow position={[0.5, 2.5, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.04, 0.08, 1.5, 5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[-0.4, 2.8, 0.2]} rotation={[0.3, 0, 0.6]}>
        <cylinderGeometry args={[0.03, 0.07, 1.2, 5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      {/* Sparse leaves */}
      <mesh position={[0.8, 3, 0]}>
        <sphereGeometry args={[0.4, 6, 6]} />
        <meshStandardMaterial color="#1a3a1e" roughness={0.9} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// Green bush/vegetation
export function Bush({ position, scale = 1, color = '#1a3a1e' }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.3, 0.3, 0.2]}>
        <sphereGeometry args={[0.45, 7, 7]} />
        <meshStandardMaterial color="#1e4422" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Utility/power pole
export function PowerPole({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 6, 6]} />
        <meshStandardMaterial color="#3a3a30" roughness={0.9} />
      </mesh>
      {/* Cross arm */}
      <mesh position={[0, 5.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 2, 5]} />
        <meshStandardMaterial color="#3a3a30" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Bridge
export function Bridge({ position, rotation = 0, length = 6 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Stone supports */}
      <mesh castShadow position={[-1.2, 0.3, -length / 2 + 0.5]}>
        <boxGeometry args={[0.6, 1.2, 1]} />
        <meshStandardMaterial color="#4a4a48" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[1.2, 0.3, -length / 2 + 0.5]}>
        <boxGeometry args={[0.6, 1.2, 1]} />
        <meshStandardMaterial color="#4a4a48" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-1.2, 0.3, length / 2 - 0.5]}>
        <boxGeometry args={[0.6, 1.2, 1]} />
        <meshStandardMaterial color="#4a4a48" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[1.2, 0.3, length / 2 - 0.5]}>
        <boxGeometry args={[0.6, 1.2, 1]} />
        <meshStandardMaterial color="#4a4a48" roughness={0.9} />
      </mesh>
      {/* Wooden planks (deck) */}
      {Array.from({ length: Math.floor(length / 0.4) }, (_, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, 0.85, -length / 2 + i * 0.4 + 0.2]}>
          <boxGeometry args={[2.8, 0.08, 0.35]} />
          <meshStandardMaterial color="#4a3a20" roughness={0.9} />
        </mesh>
      ))}
      {/* Railings */}
      <mesh position={[-1.3, 1.3, 0]}>
        <boxGeometry args={[0.08, 0.6, length]} />
        <meshStandardMaterial color="#3a2a15" roughness={0.9} />
      </mesh>
      <mesh position={[1.3, 1.3, 0]}>
        <boxGeometry args={[0.08, 0.6, length]} />
        <meshStandardMaterial color="#3a2a15" roughness={0.9} />
      </mesh>
      {/* Railing posts */}
      {Array.from({ length: Math.floor(length / 1.5) + 1 }, (_, i) => (
        <group key={i}>
          <mesh position={[-1.3, 1.2, -length / 2 + i * 1.5]}>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#3a2a15" roughness={0.9} />
          </mesh>
          <mesh position={[1.3, 1.2, -length / 2 + i * 1.5]}>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#3a2a15" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Rubble/debris pile
export function Rubble({ position }) {
  return (
    <group position={position}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.3) * 0.5,
            0.1 + i * 0.05,
            Math.cos(i * 1.7) * 0.4,
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
        >
          <boxGeometry args={[
            0.2 + Math.random() * 0.3,
            0.1 + Math.random() * 0.15,
            0.2 + Math.random() * 0.3,
          ]} />
          <meshStandardMaterial color="#2a2a28" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
