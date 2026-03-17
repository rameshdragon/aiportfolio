import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const MODELS = {
  bridge:    'https://static.poly.pizza/e36966b4-e13e-46e8-aa2c-f9b643536d46.glb',
  telepole:  'https://static.poly.pizza/59cf1dd6-0e32-42fe-9bc6-31cb48fb8275.glb',
  brokencar: 'https://static.poly.pizza/ab665646-c115-492f-a72f-1120399a1dd5.glb',
  rover:     'https://static.poly.pizza/7992e6b4-8add-45a9-86fd-f208237d293c.glb',
}

const DEFAULT_SCALE = {
  bridge:    0.018,
  telepole:  0.016,
  brokencar: 0.013,
  rover:     0.013,
}

Object.values(MODELS).forEach(url => useGLTF.preload(url))

export function PolyProp({ type = 'brokencar', position, rotation = 0, scale, color }) {
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
