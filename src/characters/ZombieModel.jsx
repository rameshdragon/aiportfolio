import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const ZOMBIE_URLS = [
  'https://static.poly.pizza/bf45b855-a93f-4cb9-94c9-730aaff052ac.glb',
  'https://static.poly.pizza/e27f7949-662e-40ae-a52c-23b990378d95.glb',
  'https://static.poly.pizza/1186bfa9-03a8-405a-a4cd-179f6539d656.glb',
]
ZOMBIE_URLS.forEach(url => useGLTF.preload(url))

function ZombieInstance({ url, dying, deathProgress }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(url)

  const { clone, autoScale, yOffset } = useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    const box = new THREE.Box3().setFromObject(c)
    const h = box.max.y - box.min.y
    const s = h > 0 ? 1.8 / h : 0.01
    // Lift so feet are at y = 0
    const yOff = -box.min.y * s
    return { clone: c, autoScale: s, yOffset: yOff }
  }, [scene])

  const { actions } = useAnimations(animations, groupRef)

  useFrame(() => {
    if (!groupRef.current) return
    const t = Date.now() * 0.001
    if (dying) {
      groupRef.current.rotation.x = deathProgress * 1.5
      groupRef.current.rotation.z = deathProgress * 0.5
      // Fall INTO ground relative to yOffset base
      groupRef.current.position.y = yOffset - deathProgress * 0.8
    } else {
      groupRef.current.position.y = yOffset
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.06
      groupRef.current.rotation.x = 0.08
    }
    if (actions) {
      const first = Object.values(actions)[0]
      if (first && !first.isRunning()) first.play()
    }
  })

  return (
    <group ref={groupRef} scale={autoScale}>
      <primitive object={clone} />
    </group>
  )
}

export function ZombieModel({ type = 0, dying = false, deathProgress = 0 }) {
  const url = ZOMBIE_URLS[type % ZOMBIE_URLS.length]
  return <ZombieInstance url={url} dying={dying} deathProgress={deathProgress} />
}
