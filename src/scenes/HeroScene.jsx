import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, Stars, MeshDistortMaterial, GradientTexture } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import StarField from './StarField'
import FloatingPlanet from './FloatingPlanet'

function Grid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
      <planeGeometry args={[80, 80, 40, 40]} />
      <meshStandardMaterial
        color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.12}
        wireframe transparent opacity={0.15}
      />
    </mesh>
  )
}

function DataCube({ position, size, color, speed }) {
  return (
    <Float speed={speed} rotationIntensity={1.2} floatIntensity={0.8}>
      <mesh position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} wireframe transparent opacity={0.7} />
      </mesh>
    </Float>
  )
}

function NeuralNode({ position, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.4
      ref.current.rotation.z = clock.getElapsedTime() * 0.2
    }
  })
  return (
    <Float speed={1.0} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.18, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} wireframe />
      </mesh>
    </Float>
  )
}

// Wormhole tunnel effect
function WormholeTunnel() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.05
  })
  return (
    <mesh ref={ref} position={[0, 0, -12]}>
      <torusGeometry args={[8, 0.6, 16, 80]} />
      <meshStandardMaterial color="#7b2fff" emissive="#7b2fff" emissiveIntensity={0.3} transparent opacity={0.25} wireframe />
    </mesh>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 7], fov: 55 }}
      style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      gl={{ antialias: true, alpha: true, toneMappingExposure: 1.2 }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[-8, 6, 4]} color="#7b2fff" intensity={1.5} />
      <pointLight position={[8, -4, -6]} color="#00ffcc" intensity={0.8} />
      <directionalLight position={[0, 10, 5]} intensity={0.4} color="#ffffff" />

      <Suspense fallback={null}>
        <StarField count={2500} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <FloatingPlanet />
        <Grid />
        <WormholeTunnel />

        <Sparkles count={140} scale={[20, 12, 12]} size={1.4} speed={0.3} color="#00d4ff" opacity={0.55} />

        {/* Data cubes floating around */}
        <DataCube position={[-5, 1.5, -3]} size={0.4} color="#00d4ff" speed={1.2} />
        <DataCube position={[-4, -1, -2]} size={0.28} color="#7b2fff" speed={0.9} />
        <DataCube position={[-6, -0.5, -4]} size={0.5} color="#00ffcc" speed={1.5} />
        <DataCube position={[5.5, 2, -5]} size={0.35} color="#ff2d78" speed={0.7} />
        <DataCube position={[4, -1.5, -3]} size={0.22} color="#00d4ff" speed={1.1} />

        {/* Neural network nodes */}
        {[
          [-3.5, 2.5, -2], [-2.5, -2, -1.5], [3, 2.8, -3],
          [4.5, -2.2, -2], [-1.5, 3.2, -4], [2, -3, -3],
        ].map(([x, y, z], i) => (
          <NeuralNode key={i} position={[x, y, z]} color={['#00d4ff', '#00ffcc', '#7b2fff', '#ff2d78'][i % 4]} />
        ))}

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            intensity={0.6}
            blendFunction={BlendFunction.ADD}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005, 0.0005]}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
