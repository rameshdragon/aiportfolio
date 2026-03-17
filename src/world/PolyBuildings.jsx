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

// Scale buildings to target HEIGHT (Y) so they look tall
const TARGET_HEIGHT = {
  apartment: 14,
  large:     18,
  houses:    11,
  fantasy:   16,
  cabin:      9,
}

Object.values(MODELS).forEach(url => useGLTF.preload(url))

export function PolyBuilding({ type = 'apartment', position, rotation = 0, color }) {
  const { scene } = useGLTF(MODELS[type])

  const { clone, autoScale, yOffset } = useMemo(() => {
    const c = SkeletonUtils.clone(scene)

    if (color) {
      const tint = new THREE.Color(color)
      c.traverse(node => {
        if (node.isMesh) {
          const applyTint = (mat) => { const m = mat.clone(); m.color.multiply(tint); return m }
          node.material = Array.isArray(node.material)
            ? node.material.map(applyTint)
            : applyTint(node.material)
        }
      })
    }

    const box = new THREE.Box3().setFromObject(c)
    const size = new THREE.Vector3()
    box.getSize(size)
    // Scale to target height so buildings look properly tall
    const s = size.y > 0 ? TARGET_HEIGHT[type] / size.y : 1
    const yOff = -box.min.y * s

    return { clone: c, autoScale: s, yOffset: yOff }
  }, [scene, color, type])

  return (
    <group
      position={[position[0], (position[1] ?? 0) + yOffset, position[2]]}
      rotation={[0, rotation, 0]}
      scale={autoScale}
    >
      <primitive object={clone} />
    </group>
  )
}
