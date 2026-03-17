import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// White papers = interactive (resume pickup)
// Brown/grey papers = atmospheric debris
const WHITE_PAPERS = [
  { id: 'w1', pos: [12, 0.4, 36], seed: 1 },
  { id: 'w2', pos: [-8, 0.4, 18], seed: 2 },
  { id: 'w3', pos: [28, 0.4, -4], seed: 3 },
]

const DEBRIS = [
  { pos: [-30, 0.3, 20],  seed: 4,  color: '#5a4a30' },
  { pos: [16, 0.3, -22],  seed: 5,  color: '#4a3828' },
  { pos: [-10, 0.3, -30], seed: 6,  color: '#4a4038' },
  { pos: [4, 0.3, 44],    seed: 7,  color: '#5a5040' },
  { pos: [42, 0.3, 12],   seed: 8,  color: '#4a4028' },
  { pos: [-22, 0.3, -16], seed: 9,  color: '#3a3028' },
  { pos: [8, 0.3, -50],   seed: 10, color: '#505040' },
  { pos: [-40, 0.3, 30],  seed: 11, color: '#5a4830' },
  { pos: [34, 0.3, -36],  seed: 12, color: '#4a3820' },
  { pos: [-16, 0.3, 52],  seed: 13, color: '#383028' },
]

// One animated paper (shared logic)
function Paper({ startPos, seed, color = '#f5f0e0', interactive = false, playerRef, onNear, pickupDone }) {
  const ref = useRef()
  const basePos = useMemo(() => new THREE.Vector3(...startPos), [])
  const t0 = useMemo(() => seed * 2.17, [seed])
  const [wasNear, setWasNear] = useState(false)

  useFrame(({ clock }) => {
    if (!ref.current) return
    if (pickupDone) { ref.current.visible = false; return }

    const t = clock.getElapsedTime() + t0
    // Wind-driven float & tumble
    const windX = Math.sin(t * 0.37 + seed) * 0.6 + Math.sin(t * 0.83) * 0.3
    const windZ = Math.cos(t * 0.45 + seed) * 0.5 + Math.cos(t * 0.6)  * 0.2
    const lift  = Math.abs(Math.sin(t * 0.5 + seed)) * 0.8 + 0.15

    ref.current.position.set(
      basePos.x + windX,
      basePos.y + lift,
      basePos.z + windZ
    )
    ref.current.rotation.x = Math.sin(t * 1.1 + seed) * 0.4 + 0.1
    ref.current.rotation.y = t * 0.6 + seed
    ref.current.rotation.z = Math.cos(t * 0.9 + seed) * 0.35

    // Proximity check for interactive white papers
    if (interactive && playerRef?.current) {
      const dist = ref.current.position.distanceTo(playerRef.current.position)
      const near = dist < 4.5
      if (near !== wasNear) {
        setWasNear(near)
        onNear?.(near)
      }
    }
  })

  return (
    <group ref={ref} position={startPos}>
      {/* Paper */}
      <mesh castShadow>
        <planeGeometry args={[0.28, 0.38, 1, 1]} />
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          side={THREE.DoubleSide}
          emissive={interactive ? new THREE.Color(0.12, 0.10, 0.06) : new THREE.Color(0, 0, 0)}
        />
      </mesh>
      {/* Slight fold crease */}
      <mesh position={[0, 0, 0.001]} rotation={[0, 0, Math.PI / 8]}>
        <planeGeometry args={[0.01, 0.35]} />
        <meshStandardMaterial color={interactive ? '#d0c8b0' : '#2a2018'} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Glow ring for interactive papers */}
      {interactive && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 16]} />
          <meshStandardMaterial color="#e06820" emissive="#e06820" emissiveIntensity={0.8} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
}

export function WindPapers({ playerRef, onNearPaper }) {
  const [pickedUp, setPickedUp] = useState({})
  const nearCount = useRef(0)

  const handleNear = (id, near) => {
    if (near) {
      nearCount.current++
      if (nearCount.current === 1) onNearPaper?.(true)
    } else {
      nearCount.current = Math.max(0, nearCount.current - 1)
      if (nearCount.current === 0) onNearPaper?.(false)
    }
  }

  // Listen for E key pickup
  useFrame(() => {
    // Pickup logic handled via HTML button in App.jsx
  })

  return (
    <>
      {/* White interactive papers */}
      {WHITE_PAPERS.map(p => (
        <Paper
          key={p.id}
          startPos={p.pos}
          seed={p.seed}
          color="#f5f0e0"
          interactive
          playerRef={playerRef}
          onNear={(near) => handleNear(p.id, near)}
          pickupDone={pickedUp[p.id]}
        />
      ))}

      {/* Atmospheric debris (non-interactive) */}
      {DEBRIS.map((d, i) => (
        <Paper key={i} startPos={d.pos} seed={d.seed} color={d.color} />
      ))}

      {/* Tin cans and other floor debris */}
      {[
        [6, 0.1, 30], [-14, 0.1, 22], [20, 0.1, 0], [-6, 0.1, -24], [32, 0.1, -16],
      ].map(([x, y, z], i) => (
        <mesh key={`can${i}`} position={[x, y, z]} rotation={[Math.PI / 2, 0, i * 1.3]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.18, 8]} />
          <meshStandardMaterial color="#6a5a40" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
    </>
  )
}
