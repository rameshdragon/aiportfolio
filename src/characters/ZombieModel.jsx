import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

const ZOMBIE_URLS = [
  'https://static.poly.pizza/bf45b855-a93f-4cb9-94c9-730aaff052ac.glb',
  'https://static.poly.pizza/e27f7949-662e-40ae-a52c-23b990378d95.glb',
  'https://static.poly.pizza/1186bfa9-03a8-405a-a4cd-179f6539d656.glb',
]

ZOMBIE_URLS.forEach((url) => useGLTF.preload(url))

function ZombieInstance({ url, dying, deathProgress }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(url)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, groupRef)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const t = Date.now() * 0.001

    if (dying) {
      groupRef.current.rotation.x = deathProgress * 1.5
      groupRef.current.rotation.z = deathProgress * 0.5
      groupRef.current.position.y = -deathProgress * 0.5
    } else {
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.06
      groupRef.current.rotation.x = 0.08
    }

    // Play first animation if available and not already running
    if (actions) {
      const first = Object.values(actions)[0]
      if (first && !first.isRunning()) first.play()
    }
  })

  return (
    <group ref={groupRef} scale={[0.008, 0.008, 0.008]}>
      <primitive object={clone} />
    </group>
  )
}

export function ZombieModel({ type = 0, dying = false, deathProgress = 0 }) {
  const url = ZOMBIE_URLS[type % ZOMBIE_URLS.length]
  return <ZombieInstance url={url} dying={dying} deathProgress={deathProgress} />
}
