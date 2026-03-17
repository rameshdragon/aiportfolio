import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const PLAYER_URL = 'https://static.poly.pizza/3c91c233-ef8f-42e8-b081-5e86d9b77de1.glb'
useGLTF.preload(PLAYER_URL)

export function PlayerModel({ moving }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(PLAYER_URL)

  const { clone, autoScale, yOffset } = useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    const box = new THREE.Box3().setFromObject(c)
    const h = box.max.y - box.min.y
    const s = h > 0 ? 1.8 / h : 0.01
    // Shift up so the bottom of the model sits at y=0
    const yOff = -box.min.y * s
    return { clone: c, autoScale: s, yOffset: yOff }
  }, [scene])

  const { actions } = useAnimations(animations, groupRef)

  useFrame(() => {
    if (!actions) return
    const keys = Object.keys(actions)
    if (!keys.length) return
    const walkAnim = keys.find(k => /walk|run|move/i.test(k))
    const idleAnim = keys.find(k => /idle|stand/i.test(k))
    const target   = moving ? (walkAnim || keys[0]) : (idleAnim || keys[0])
    if (actions[target] && !actions[target].isRunning()) {
      Object.values(actions).forEach(a => a.stop())
      actions[target].play()
    }
  })

  return (
    <group ref={groupRef} position={[0, yOffset, 0]} scale={autoScale}>
      <primitive object={clone} />
    </group>
  )
}
