import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

const MODELS = {
  apartment: 'https://static.poly.pizza/9dbf2d34-a6cb-4ff3-90ee-2081c05df9e1.glb',
  large:     'https://static.poly.pizza/238cf4fb-49b4-4c96-b29e-fee1e69f28f9.glb',
  houses:    'https://static.poly.pizza/d150762b-2366-4acb-a841-5572a300648e.glb',
  fantasy:   'https://static.poly.pizza/341c9305-c6dd-4427-ad00-620ad57eb14e.glb',
  cabin:     'https://static.poly.pizza/9f69cf1b-e9f0-495a-9f68-0dab4bffd6d2.glb',
}

Object.values(MODELS).forEach(url => useGLTF.preload(url))

// Default scale per model type so they look reasonable in the scene
const DEFAULT_SCALE = {
  apartment: 0.012,
  large:     0.014,
  houses:    0.013,
  fantasy:   0.011,
  cabin:     0.010,
}

export function PolyBuilding({ type = 'apartment', position, rotation = 0, scale, color }) {
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
