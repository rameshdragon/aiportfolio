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

// Target max-dimension (meters)
const TARGET = {
  bridge:     12,
  telepole:    8,
  brokencar:   4,
  rover:       4,
}

Object.values(MODELS).forEach(url => useGLTF.preload(url))

export function PolyProp({ type = 'brokencar', position, rotation = 0, color }) {
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
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = maxDim > 0 ? TARGET[type] / maxDim : 1
    const yOff = -box.min.y * s

    return { clone: c, autoScale: s, yOffset: yOff }
  }, [scene, color, type])

  return (
    <group position={[position[0], position[1] + yOffset, position[2]]} rotation={[0, rotation, 0]} scale={autoScale}>
      <primitive object={clone} />
    </group>
  )
}
