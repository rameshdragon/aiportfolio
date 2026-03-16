import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const TYPES = [
  { body: '#4a3a20', cloth: '#8a7030', head: '#6a5a3a', blood: '#6a2020' },
  { body: '#2a3a5a', cloth: '#3a4a6a', head: '#5a5a5a', blood: '#5a1818' },
  { body: '#5a2a2a', cloth: '#7a3a1a', head: '#6a4a3a', blood: '#7a2222' },
]

export function ZombieModel({ type = 0, dying = false, deathProgress = 0 }) {
  const groupRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()

  const style = TYPES[type % TYPES.length]

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const shuffle = t * 3

    // Zombie shamble
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.06
      groupRef.current.rotation.x = 0.08 // leaning forward
    }

    const legSwing = Math.sin(shuffle) * 0.3
    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing

    // Reaching arms
    const armReach = Math.sin(t * 1.5) * 0.15
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -1.2 + armReach
      leftArmRef.current.rotation.z = 0.2
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -1.0 - armReach
      rightArmRef.current.rotation.z = -0.2
    }
  })

  if (dying) {
    const t = deathProgress
    return (
      <group
        position={[0, -t * 0.5, t * 0.3]}
        rotation={[t * 1.5, 0, t * 0.5]}
        scale={1 - t * 0.3}
      >
        <ZombieBody style={style} refs={{}} />
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <ZombieBody
        style={style}
        refs={{ leftArmRef, rightArmRef, leftLegRef, rightLegRef }}
      />
    </group>
  )
}

function ZombieBody({ style, refs }) {
  return (
    <>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.35, 12]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Legs */}
      <group ref={refs.leftLegRef} position={[-0.1, 0.4, 0]}>
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[0.14, 0.4, 0.14]} />
          <meshStandardMaterial color={style.cloth} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.35, 0.03]}>
          <boxGeometry args={[0.12, 0.06, 0.2]} />
          <meshStandardMaterial color="#2a2a22" roughness={0.9} />
        </mesh>
      </group>
      <group ref={refs.rightLegRef} position={[0.1, 0.4, 0]}>
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[0.14, 0.4, 0.14]} />
          <meshStandardMaterial color={style.cloth} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.35, 0.03]}>
          <boxGeometry args={[0.12, 0.06, 0.2]} />
          <meshStandardMaterial color="#2a2a22" roughness={0.9} />
        </mesh>
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[0.4, 0.55, 0.25]} />
        <meshStandardMaterial color={style.cloth} roughness={0.9} />
      </mesh>
      {/* Blood marks */}
      <mesh position={[-0.08, 0.9, 0.13]}>
        <boxGeometry args={[0.1, 0.15, 0.01]} />
        <meshStandardMaterial color={style.blood} roughness={1} />
      </mesh>
      <mesh position={[0.1, 0.75, 0.13]}>
        <boxGeometry args={[0.12, 0.1, 0.01]} />
        <meshStandardMaterial color={style.blood} roughness={1} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.3, 0.02]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color={style.head} roughness={0.85} />
      </mesh>
      {/* Dead eyes */}
      <mesh position={[-0.05, 1.32, 0.14]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color={style.blood} emissive={style.blood} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.05, 1.32, 0.14]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color={style.blood} emissive={style.blood} emissiveIntensity={0.3} />
      </mesh>
      {/* Open mouth */}
      <mesh position={[0, 1.22, 0.13]}>
        <boxGeometry args={[0.08, 0.04, 0.04]} />
        <meshStandardMaterial color="#1a0808" />
      </mesh>

      {/* Arms (reaching forward) */}
      <group ref={refs.leftArmRef} position={[-0.28, 1.05, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color={style.head} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, -0.35, 0]}>
          <boxGeometry args={[0.08, 0.25, 0.08]} />
          <meshStandardMaterial color={style.head} roughness={0.9} />
        </mesh>
      </group>
      <group ref={refs.rightArmRef} position={[0.28, 1.05, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color={style.head} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, -0.35, 0]}>
          <boxGeometry args={[0.08, 0.25, 0.08]} />
          <meshStandardMaterial color={style.head} roughness={0.9} />
        </mesh>
      </group>
    </>
  )
}
