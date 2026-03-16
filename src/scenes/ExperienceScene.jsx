import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import StarField from './StarField'

function SkillOrb({ position, color, index }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * 0.8 + index) * 0.15
    ref.current.rotation.y = t * 0.5
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} wireframe />
      </mesh>
      <mesh scale={1.4}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <pointLight color={color} intensity={0.4} distance={1.5} />
    </group>
  )
}

function DNAHelix() {
  const group = useRef()

  const [curve1, curve2, midPoints] = useMemo(() => {
    const pts1 = [], pts2 = []
    for (let i = 0; i < 80; i++) {
      const t = (i / 79) * Math.PI * 6
      pts1.push(new THREE.Vector3(Math.cos(t) * 0.6, (i / 79) * 8 - 4, Math.sin(t) * 0.6))
      pts2.push(new THREE.Vector3(Math.cos(t + Math.PI) * 0.6, (i / 79) * 8 - 4, Math.sin(t + Math.PI) * 0.6))
    }
    const c1 = new THREE.CatmullRomCurve3(pts1)
    const c2 = new THREE.CatmullRomCurve3(pts2)
    const mids = Array.from({ length: 16 }, (_, i) => {
      const t = i / 15
      const p1 = c1.getPoint(t), p2 = c2.getPoint(t)
      return [(p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2]
    })
    return [c1, c2, mids]
  }, [])

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.2
  })

  return (
    <group ref={group} position={[-5.5, 0, -2]}>
      <mesh>
        <tubeGeometry args={[curve1, 200, 0.018, 8, false]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.9} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve2, 200, 0.018, 8, false]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.9} />
      </mesh>
      {midPoints.map((mp, i) => (
        <mesh key={i} position={mp}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#7b2fff" emissive="#7b2fff" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

const SKILL_ORBS = [
  { color: '#00d4ff', pos: [3.5, 1.8, -1] },
  { color: '#00ffcc', pos: [4.2, 0.2, -2] },
  { color: '#7b2fff', pos: [3, -1.2, -1.5] },
  { color: '#ff2d78', pos: [5, -0.5, -3] },
  { color: '#00d4ff', pos: [2.5, 1, -3] },
  { color: '#00ffcc', pos: [5.5, 1.5, -4] },
]

export default function ExperienceScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ position: 'absolute', inset: 0 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 5]} color="#00d4ff" intensity={1.2} />
      <pointLight position={[-5, -3, 2]} color="#7b2fff" intensity={0.8} />

      <Suspense fallback={null}>
        <StarField count={1800} />
        <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.6} />
        <DNAHelix />
        {SKILL_ORBS.map((s, i) => (
          <SkillOrb key={i} position={s.pos} color={s.color} index={i} />
        ))}
        <Sparkles count={60} scale={[14, 10, 8]} size={0.9} speed={0.2} color="#00d4ff" opacity={0.4} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.18} intensity={0.6} blendFunction={BlendFunction.ADD} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
