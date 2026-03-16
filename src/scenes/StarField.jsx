import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function StarField({ count = 3000 }) {
  const mesh = useRef()
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 200
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200
      const t = Math.random()
      if (t < 0.6) { col[i*3]=0; col[i*3+1]=0.83; col[i*3+2]=1; }
      else if (t < 0.85) { col[i*3]=0; col[i*3+1]=1; col[i*3+2]=0.8; }
      else { col[i*3]=0.48; col[i*3+1]=0.18; col[i*3+2]=1; }
    }
    return [pos, col]
  }, [count])

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.01
      mesh.current.rotation.x = clock.getElapsedTime() * 0.005
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.18} vertexColors sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}
