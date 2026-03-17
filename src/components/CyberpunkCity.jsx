import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'

// ─── WINDOW TEXTURE FACTORY ──────────────────────────────────────────────────
const _texCache = {}
function getWinTex(type) {
  if (_texCache[type]) return _texCache[type]
  const cfg = {
    warm:   { pri: '#ff8800', acc: '#ffdd44', bg: '#03080f' },
    cyan:   { pri: '#00ccff', acc: '#0066ff', bg: '#020c14' },
    purple: { pri: '#cc44ff', acc: '#ff0088', bg: '#040612' },
    pink:   { pri: '#ff3366', acc: '#ff8833', bg: '#040410' },
    green:  { pri: '#00ff88', acc: '#44ff44', bg: '#020c08' },
  }[type] || { pri: '#ff8800', acc: '#ffcc44', bg: '#030810' }

  const W = 256, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = cfg.bg
  ctx.fillRect(0, 0, W, H)
  const cols = 4, rows = 12
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const s = Math.abs(Math.sin(col * 31.7 + row * 17.3 + type.length * 7.1))
      if (s > 0.28) {
        ctx.fillStyle = s > 0.72 ? cfg.acc : cfg.pri
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = 8
        const pw = W / cols, ph = H / rows
        ctx.fillRect(col * pw + pw * 0.12, row * ph + ph * 0.12, pw * 0.76, ph * 0.66)
      }
    }
  }
  _texCache[type] = new THREE.CanvasTexture(c)
  return _texCache[type]
}

// ─── SHARED MATERIALS ────────────────────────────────────────────────────────
const _matCache = {}
const ROOF_MAT = new THREE.MeshStandardMaterial({ color: '#040810', roughness: 0.95 })
function getBuildingMat(type) {
  if (_matCache[type]) return _matCache[type]
  const tex = getWinTex(type)
  const side = new THREE.MeshStandardMaterial({
    color: '#060c18', map: tex, emissiveMap: tex,
    emissive: '#111111', emissiveIntensity: 0.45,
    roughness: 0.7, metalness: 0.35,
  })
  _matCache[type] = [side, side, ROOF_MAT, ROOF_MAT, side, side]
  return _matCache[type]
}

// ─── BUILDING DATA: [x, z, w, d, h, type] ────────────────────────────────────
const BUILDINGS = [
  // Central tall skyscrapers
  [0,   -19, 5, 5, 44, 'cyan'],
  [-5,  -16, 4, 4, 30, 'warm'],
  [5,   -16, 4, 4, 26, 'purple'],
  [-9,  -19, 4, 3, 24, 'cyan'],
  [9,   -19, 4, 3, 22, 'pink'],
  [-7,  -13, 4, 3, 20, 'warm'],
  [7,   -13, 4, 3, 18, 'purple'],
  [0,   -13, 4, 4, 15, 'warm'],
  [-3,  -23, 3, 3, 17, 'cyan'],
  [3,   -23, 3, 3, 19, 'green'],
  [-13, -19, 5, 4, 16, 'cyan'],
  [13,  -19, 5, 4, 14, 'pink'],
  // Left column
  [-17, -19, 5, 4, 14, 'warm'],
  [-17, -11, 5, 4, 12, 'cyan'],
  [-17,  -3, 5, 4, 10, 'purple'],
  [-17,   5, 5, 4,  9, 'warm'],
  [-22, -15, 4, 4, 10, 'cyan'],
  [-22,  -6, 4, 4,  9, 'warm'],
  [-22,   3, 4, 4,  8, 'purple'],
  [-28,  -9, 4, 4,  6, 'pink'],
  [-28,  -1, 4, 4,  5, 'warm'],
  // Right column
  [17,  -19, 5, 4, 13, 'purple'],
  [17,  -11, 5, 4, 11, 'warm'],
  [17,   -3, 5, 4, 10, 'cyan'],
  [17,    5, 5, 4,  9, 'pink'],
  [22,  -15, 4, 4, 10, 'warm'],
  [22,   -6, 4, 4,  9, 'cyan'],
  [22,    3, 4, 4,  8, 'purple'],
  [28,   -9, 4, 4,  6, 'warm'],
  [28,   -1, 4, 4,  5, 'pink'],
  // Center mid
  [-10,  -9, 4, 4, 10, 'warm'],
  [10,   -9, 4, 4, 10, 'purple'],
  [-5,   -6, 4, 4,  8, 'cyan'],
  [5,    -6, 4, 4,  8, 'warm'],
  [0,    -6, 4, 3,  7, 'purple'],
  // Front section
  [-10,   1, 4, 4,  8, 'purple'],
  [10,    1, 4, 4,  8, 'warm'],
  [-5,    4, 4, 4,  7, 'cyan'],
  [5,     4, 4, 4,  7, 'pink'],
  [0,     4, 4, 4,  6, 'warm'],
  [-15,   2, 4, 4,  7, 'cyan'],
  [15,    2, 4, 4,  7, 'purple'],
  // Front edge buildings
  [-5,   13, 5, 4,  5, 'warm'],
  [5,    13, 5, 4,  5, 'cyan'],
  [0,    13, 4, 4,  6, 'purple'],
  [-12,  13, 4, 4,  5, 'pink'],
  [12,   13, 4, 4,  5, 'warm'],
  [-28,   8, 4, 4,  6, 'cyan'],
  [28,    8, 4, 4,  6, 'purple'],
]

// ─── TREE POSITIONS ───────────────────────────────────────────────────────────
const TREES = [
  [-4, 7], [4, 7], [0, 9], [-8, 8], [8, 8],
  [-12, 4], [12, 4], [-2, -2], [2, -2],
  [-6, 1], [6, 1], [0, -2],
]

// ─── LAUNCH PAD POSITIONS: [x, z, scale] ─────────────────────────────────────
const PADS = [
  [-26, 17, 1.0],
  [0,   23, 1.1],
  [26,  17, 1.0],
  [-23, -1, 0.9],
  [23,  -1, 0.9],
]

// ─── BOOSTER POSITIONS ────────────────────────────────────────────────────────
const BOOSTERS = [
  [-32, -25], [0, -25], [32, -25],
  [-32,  25], [0,  25], [32,  25],
]

// ─── OCEAN ────────────────────────────────────────────────────────────────────
function Ocean() {
  const meshRef = useRef()
  const geom = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 72, 72), [])
  const origXY = useMemo(() => {
    const pos = geom.attributes.position.array
    const xy = new Float32Array((pos.length / 3) * 2)
    for (let i = 0; i < pos.length / 3; i++) {
      xy[i * 2]     = pos[i * 3]
      xy[i * 2 + 1] = pos[i * 3 + 1]
    }
    return xy
  }, [geom])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pos = geom.attributes.position.array
    for (let i = 0; i < pos.length / 3; i++) {
      const x = origXY[i * 2], y = origXY[i * 2 + 1]
      pos[i * 3 + 2] =
        Math.sin(x * 0.04 + t * 0.9) * 0.8 +
        Math.sin(y * 0.05 + t * 0.75) * 0.55 +
        Math.sin((x + y) * 0.03 + t * 0.55) * 0.4
    }
    geom.attributes.position.needsUpdate = true
    geom.computeVertexNormals()
    // Scroll backward → city appears to move forward
    meshRef.current.position.z = ((t * 3.5) % 80) - 40
  })

  return (
    <mesh ref={meshRef} geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -13, -20]}>
      <meshStandardMaterial
        color="#010a16" roughness={0.08} metalness={0.95}
        emissive="#021020" emissiveIntensity={0.7}
      />
    </mesh>
  )
}

// ─── OCEAN SPRAY PARTICLES ────────────────────────────────────────────────────
function OceanSpray() {
  const ref = useRef()
  const count = 300
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 30 + Math.random() * 10
      positions[i * 3]     = Math.cos(angle) * r * 1.2
      positions[i * 3 + 1] = -10 + Math.random() * 3
      positions[i * 3 + 2] = Math.sin(angle) * r
      velocities[i * 3]     = (Math.random() - 0.5) * 0.05
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.04
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05
    }
    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      if (pos[i * 3 + 1] > -7) {
        const angle = Math.random() * Math.PI * 2
        const r = 30 + Math.random() * 10
        pos[i * 3]     = Math.cos(angle) * r * 1.2
        pos[i * 3 + 1] = -12
        pos[i * 3 + 2] = Math.sin(angle) * r
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#55ddff" size={0.25} sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

// ─── RAIN ─────────────────────────────────────────────────────────────────────
function Rain() {
  const ref = useRef()
  const count = 800
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 140
      arr[i * 3 + 1] = Math.random() * 80 + 5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    return arr
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.6
      pos[i * 3 + 2] += 0.1
      if (pos[i * 3 + 1] < -12) {
        pos[i * 3]     = (Math.random() - 0.5) * 140
        pos[i * 3 + 1] = 75
        pos[i * 3 + 2] = (Math.random() - 0.5) * 120
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#88aacc" size={0.18} sizeAttenuation transparent opacity={0.35} />
    </points>
  )
}

// ─── PLATFORM ─────────────────────────────────────────────────────────────────
function Platform() {
  return (
    <group>
      {/* Main slab */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[72, 5, 58]} />
        <meshStandardMaterial color="#09111e" roughness={0.9} metalness={0.3} />
      </mesh>
      {/* Underslab */}
      <mesh position={[0, -5.5, 0]}>
        <boxGeometry args={[70, 1.5, 56]} />
        <meshStandardMaterial color="#060c15" roughness={1} metalness={0.2} />
      </mesh>
      {/* Neon edge trim – front/back */}
      {[-29, 29].map((z, i) => (
        <mesh key={i} position={[0, -0.2, z]}>
          <boxGeometry args={[72.5, 0.22, 0.22]} />
          <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {/* Neon edge trim – left/right */}
      {[-36, 36].map((x, i) => (
        <mesh key={i} position={[x, -0.2, 0]}>
          <boxGeometry args={[0.22, 0.22, 58.5]} />
          <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {/* Surface grid – vertical lines */}
      {[-24, -12, 0, 12, 24].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.12, 0.08, 58]} />
          <meshStandardMaterial color="#001833" emissive="#001833" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Surface grid – horizontal lines */}
      {[-24, -12, 0, 12, 24].map((z, i) => (
        <mesh key={i} position={[0, 0.06, z]}>
          <boxGeometry args={[72, 0.08, 0.12]} />
          <meshStandardMaterial color="#001833" emissive="#001833" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ─── BUILDING ─────────────────────────────────────────────────────────────────
function Building({ bx, bz, w, d, h, type }) {
  const mats = useMemo(() => getBuildingMat(type), [type])
  const geom = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d])
  const antColor = { warm:'#ff8800', cyan:'#00ccff', purple:'#cc44ff', pink:'#ff3366', green:'#00ff88' }[type]

  return (
    <group position={[bx, 0, bz]}>
      <mesh position={[0, h / 2, 0]} geometry={geom} material={mats} />
      {/* Roof cover (hides window tex on top) */}
      <mesh position={[0, h + 0.02, 0]}>
        <boxGeometry args={[w + 0.08, 0.04, d + 0.08]} />
        <meshStandardMaterial color="#030810" roughness={0.95} />
      </mesh>
      {/* Rooftop block */}
      {h > 8 && (
        <mesh position={[0, h + 0.6, 0]}>
          <boxGeometry args={[w * 0.55, 1.0, d * 0.55]} />
          <meshStandardMaterial color="#070f1a" roughness={0.9} metalness={0.4} />
        </mesh>
      )}
      {/* Antenna on skyscrapers */}
      {h > 16 && (
        <>
          <mesh position={[0, h + h * 0.15 + 1.2, 0]}>
            <cylinderGeometry args={[0.06, 0.07, h * 0.28, 6]} />
            <meshStandardMaterial color={antColor} emissive={antColor} emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0, h + h * 0.29 + 1.4, 0]}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={4} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ─── TREE ─────────────────────────────────────────────────────────────────────
function Tree({ tx, tz }) {
  return (
    <group position={[tx, 0, tz]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.8, 6]} />
        <meshStandardMaterial color="#2d1800" roughness={1} />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <coneGeometry args={[1.4, 3.0, 6]} />
        <meshStandardMaterial color="#0d3d12" emissive="#052009" emissiveIntensity={0.5} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── LAUNCH PAD ───────────────────────────────────────────────────────────────
function LaunchPad({ lx, lz, scale = 1 }) {
  const ring0 = useRef(), ring1 = useRef(), ring2 = useRef()
  const screenRef = useRef()
  const lightRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ring0.current) ring0.current.rotation.z =  t * 0.55
    if (ring1.current) ring1.current.rotation.z = -t * 0.38
    if (ring2.current) ring2.current.rotation.z =  t * 0.28
    if (screenRef.current) screenRef.current.emissiveIntensity = 0.6 + Math.sin(t * 1.8 + lx) * 0.25
    if (lightRef.current) lightRef.current.intensity = 2.5 + Math.sin(t * 2.5 + lz) * 0.8
  })

  return (
    <group position={[lx, -1.0, lz]}>
      {/* Octagonal base */}
      <mesh>
        <cylinderGeometry args={[5.2 * scale, 5.8 * scale, 1.4, 8]} />
        <meshStandardMaterial color="#0a1520" metalness={0.75} roughness={0.45} />
      </mesh>
      {/* Inner platform */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[4.0 * scale, 4.0 * scale, 0.4, 8]} />
        <meshStandardMaterial color="#0d1a28" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Ring 0 – outer */}
      <mesh ref={ring0} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.1, 0]}>
        <torusGeometry args={[4.5 * scale, 0.13, 8, 72]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2.2} />
      </mesh>
      {/* Ring 1 – mid */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.18, 0]}>
        <torusGeometry args={[3.4 * scale, 0.11, 8, 64]} />
        <meshStandardMaterial color="#0055ff" emissive="#0055ff" emissiveIntensity={2.0} />
      </mesh>
      {/* Ring 2 – inner */}
      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.26, 0]}>
        <torusGeometry args={[2.3 * scale, 0.10, 8, 56]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2.5} />
      </mesh>
      {/* Center glow disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.32, 0]}>
        <circleGeometry args={[1.6 * scale, 32]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={3.5} />
      </mesh>
      {/* Holographic screen */}
      <group position={[0, 6.5 * scale, 0]}>
        <mesh>
          <planeGeometry args={[5.2 * scale, 3.2 * scale]} />
          <meshStandardMaterial
            ref={screenRef}
            color="#001122" emissive="#003a66" emissiveIntensity={0.8}
            transparent opacity={0.88} side={THREE.DoubleSide}
          />
        </mesh>
        {/* Screen border */}
        {[[-2.6 * scale, 0], [2.6 * scale, 0]].map(([x, _], i) => (
          <mesh key={i} position={[x, 0, 0.02]}>
            <planeGeometry args={[0.09, 3.2 * scale]} />
            <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2.5} />
          </mesh>
        ))}
        {[[-1.5 * scale, 0], [1.5 * scale, 0]].map(([y, _], i) => (
          <mesh key={i} position={[0, y, 0.02]}>
            <planeGeometry args={[5.2 * scale, 0.07]} />
            <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2.5} />
          </mesh>
        ))}
        {/* Scan lines */}
        {[-1.1, -0.5, 0.1, 0.7, 1.1].map((y, i) => (
          <mesh key={i} position={[0, y * scale, 0.03]}>
            <planeGeometry args={[4.8 * scale, 0.06]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.8} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      {/* Glow light */}
      <pointLight ref={lightRef} color="#00aaff" intensity={3} distance={22} position={[0, 2, 0]} />
    </group>
  )
}

// ─── BOOSTER ──────────────────────────────────────────────────────────────────
function Booster({ bx, bz }) {
  const lightRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = 3.2 + Math.sin(t * 2.8 + bx * 0.3) * 1.4
    if (lightRef.current) lightRef.current.intensity = p
    if (glowRef.current)  glowRef.current.emissiveIntensity = p * 0.9
  })

  return (
    <group position={[bx, -7.5, bz]}>
      {/* Outer housing */}
      <mesh>
        <cylinderGeometry args={[1.6, 2.1, 3.5, 8]} />
        <meshStandardMaterial color="#0a1522" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Inner nozzle */}
      <mesh position={[0, -2.8, 0]}>
        <cylinderGeometry args={[0.9, 0.5, 2.2, 8]} />
        <meshStandardMaterial ref={glowRef} color="#00eeff" emissive="#00eeff" emissiveIntensity={3} />
      </mesh>
      {/* Flame sphere */}
      <mesh position={[0, -4.2, 0]}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={4} transparent opacity={0.65} />
      </mesh>
      {/* Wide glow halo */}
      <mesh position={[0, -4.8, 0]}>
        <sphereGeometry args={[2.0, 12, 12]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={2} transparent opacity={0.25} />
      </mesh>
      {/* Point light */}
      <pointLight ref={lightRef} color="#00ccff" intensity={4} distance={32} position={[0, -4, 0]} />
    </group>
  )
}

// ─── HOLOGRAPHIC BILLBOARD ────────────────────────────────────────────────────
function Billboard({ bx, bz, h = 8 }) {
  return (
    <group position={[bx, 0, bz]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, h, 6]} />
        <meshStandardMaterial color="#223344" metalness={0.9} />
      </mesh>
      <mesh position={[0, h + 1.4, 0]}>
        <planeGeometry args={[4.5, 2.8]} />
        <meshStandardMaterial
          color="#001122" emissive="#004488" emissiveIntensity={1.1}
          transparent opacity={0.88} side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color="#0066ff" intensity={1} distance={12} position={[0, h + 1, 0]} />
    </group>
  )
}

// ─── CITY GROUP (bobs + forward lean) ─────────────────────────────────────────
function CityGroup() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!groupRef.current) return
    groupRef.current.position.y = Math.sin(t * 0.42) * 0.9
    groupRef.current.rotation.x = Math.sin(t * 0.28) * 0.008
    groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.004
  })

  return (
    <group ref={groupRef}>
      <Platform />
      {BUILDINGS.map(([x, z, w, d, h, type], i) => (
        <Building key={i} bx={x} bz={z} w={w} d={d} h={h} type={type} />
      ))}
      {TREES.map(([x, z], i) => <Tree key={i} tx={x} tz={z} />)}
      {PADS.map(([x, z, scale], i) => <LaunchPad key={i} lx={x} lz={z} scale={scale} />)}
      {BOOSTERS.map(([x, z], i) => <Booster key={i} bx={x} bz={z} />)}
      {/* Extra billboards */}
      <Billboard bx={-28} bz={-22} h={9} />
      <Billboard bx={28}  bz={-22} h={9} />
      <Billboard bx={0}   bz={-26} h={11} />
    </group>
  )
}

// ─── SCENE LIGHTS ─────────────────────────────────────────────────────────────
function SceneLights() {
  const neon1Ref = useRef(), neon2Ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (neon1Ref.current) neon1Ref.current.intensity = 1.2 + Math.sin(t * 1.3) * 0.4
    if (neon2Ref.current) neon2Ref.current.intensity = 1.2 + Math.sin(t * 1.7 + 1) * 0.4
  })

  return (
    <>
      <ambientLight color="#050c1a" intensity={0.6} />
      <directionalLight color="#1a2d4a" intensity={0.9} position={[-60, 100, 60]} />
      <pointLight color="#0033aa" intensity={1.5} distance={220} position={[0, 40, 0]} />
      <pointLight ref={neon1Ref} color="#ff6600" intensity={1.2} distance={60} position={[-18, 22, -12]} />
      <pointLight ref={neon2Ref} color="#cc00ff" intensity={1.2} distance={60} position={[18, 22, -12]} />
      <pointLight color="#00ccff" intensity={0.9} distance={80} position={[0, 10, 20]} />
    </>
  )
}

// ─── MAIN CANVAS ──────────────────────────────────────────────────────────────
export default function CyberpunkCity() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#010812', overflow: 'hidden' }}>
      {/* HUD overlay */}
      <div style={{
        position: 'fixed', top: 24, left: 32, zIndex: 10, pointerEvents: 'none',
        fontFamily: 'monospace',
      }}>
        <div style={{ fontSize: 10, color: '#00aaff', letterSpacing: 3, marginBottom: 4, opacity: 0.7 }}>
          ◈ NEURAL CITY — SECTOR 7
        </div>
        <div style={{ fontSize: 8, color: 'rgba(0,180,255,0.4)', letterSpacing: 2 }}>
          5 LAUNCH PADS ACTIVE &nbsp;·&nbsp; BOOSTERS ONLINE
        </div>
      </div>
      {/* Controls hint */}
      <div style={{
        position: 'fixed', bottom: 24, right: 32, zIndex: 10, pointerEvents: 'none',
        fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,170,255,0.35)',
        letterSpacing: 2, textAlign: 'right', lineHeight: 2,
      }}>
        DRAG — ORBIT &nbsp;·&nbsp; SCROLL — ZOOM
      </div>

      <Canvas
        camera={{ position: [75, 95, 85], fov: 44, near: 0.5, far: 1500 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
        shadows
      >
        <fog attach="fog" args={['#010812', 120, 400]} />
        <Stars radius={300} depth={60} count={4000} factor={4} saturation={0} fade speed={0.5} />

        <SceneLights />
        <Ocean />
        <OceanSpray />
        <Rain />
        <CityGroup />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
          minDistance={35}
          maxDistance={250}
          target={[0, 8, 0]}
        />
      </Canvas>
    </div>
  )
}
