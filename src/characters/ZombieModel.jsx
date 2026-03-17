import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

const ZOMBIE_URL = 'https://static.poly.pizza/bf45b855-a93f-4cb9-94c9-730aaff052ac.glb'

useGLTF.preload(ZOMBIE_URL)

export function ZombieModel({ type = 0, dying = false, deathProgress = 0 }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(ZOMBIE_URL)

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, groupRef)

  useFrame(() => {
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
  })

  // Play walk/idle animation
  useFrame(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0]
      if (firstAction && !firstAction.isRunning()) {
        firstAction.play()
      }
    }
  })

  return (
    <group ref={groupRef} scale={[0.008, 0.008, 0.008]}>
      <primitive object={clone} />
    </group>
  )
}
