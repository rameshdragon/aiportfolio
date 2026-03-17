import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const MODELS = {
  deadtree:    'https://static.poly.pizza/65539ff7-ff6b-4036-ad02-8233b6ce748f.glb',
  birch:       'https://static.poly.pizza/457b2397-4bfb-41c4-862d-82d1592b2a5f.glb',
  grasspatch:  'https://static.poly.pizza/7082eec1-fb64-469d-939f-5ac71941f66c.glb',
  grass:       'https://static.poly.pizza/99357ca2-6364-4990-8d4c-9bc5a1a5e859.glb',
  grassyellow: 'https://static.poly.pizza/7a389fca-aecb-438b-94c9-b4f1bff4eda4.glb',
  bushes:      'https://static.poly.pizza/11bcb3a1-5901-402c-9863-75988b9e21d8.glb',
}

const DEFAULT_SCALE = {
  deadtree:    0.012,
  birch:       0.013,
  grasspatch:  0.015,
  grass:       0.014,
  grassyellow: 0.014,
  bushes:      0.013,
}

Object.values(MODELS).forEach(url => useGLTF.preload(url))

export function PolyVeg({ type = 'deadtree', position, rotation = 0, scale, color }) {
  const { scene } = useGLTF(MODELS[type])

  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    if (color) {
      const tint = new THREE.Color(color)
      const applyTint = (mat) => {
        const m = mat.clone()
        m.color.multiply(tint)
        return m
      }
      c.traverse(node => {
        if (node.isMesh) {
          if (Array.isArray(node.material)) {
            node.material = node.material.map(applyTint)
          } else {
            node.material = applyTint(node.material)
          }
        }
      })
    }
    return c
  }, [scene, color])

  const s = scale ?? DEFAULT_SCALE[type]

  return (
    <group position={position} rotation={[0, rotation, 0]} scale={s}>
      <primitive object={clone} />
    </group>
  )
}
