import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

const PLAYER_URL = 'https://static.poly.pizza/3c91c233-ef8f-42e8-b081-5e86d9b77de1.glb'

useGLTF.preload(PLAYER_URL)

export function PlayerModel({ moving, direction }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(PLAYER_URL)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, groupRef)

  useFrame(() => {
    if (!actions) return
    const keys = Object.keys(actions)
    if (keys.length === 0) return

    // Try to find walk/run/idle animations by name
    const walkAnim = keys.find((k) => /walk|run|move/i.test(k))
    const idleAnim = keys.find((k) => /idle|stand/i.test(k))

    if (moving) {
      const target = walkAnim || keys[0]
      if (actions[target] && !actions[target].isRunning()) {
        Object.values(actions).forEach((a) => a.stop())
        actions[target].play()
      }
    } else {
      const target = idleAnim || keys[0]
      if (actions[target] && !actions[target].isRunning()) {
        Object.values(actions).forEach((a) => a.stop())
        actions[target].play()
      }
    }
  })

  return (
    <group ref={groupRef} scale={[0.008, 0.008, 0.008]}>
      <primitive object={clone} />
    </group>
  )
}
