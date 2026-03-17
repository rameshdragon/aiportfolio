import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

// ─── WINDOW TEXTURE – mixed neon colors like the reference image ──────────────
function makeMixedWinTex(seed = 0) {
  const W = 512, H = 1024
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // Dark building face
  ctx.fillStyle = '#070e1c'
  ctx.fillRect(0, 0, W, H)

  // Neon color palette from the reference
  const palette = [
    '#ff9900', '#ffcc00', '#ffaa33', // warm orange / amber
    '#ffee44', '#ff8833',            // yellow / deep orange
    '#00ccff', '#44aaff', '#0088ff', // cyan / blue
    '#cc44ff', '#ff00aa', '#9933ff', // purple / magenta
    '#ff3388', '#ff6644',            // pink / coral
  ]

  const rng = (n) => Math.abs(Math.sin(n * 127.1 + seed * 311.7) * 43758.5) % 1
  const cols = 4, rows = 14
  const pw = W / cols, ph = H / rows

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const idx = col * rows + row
      const lit = rng(idx) > 0.22           // 78% windows are lit
      if (!lit) continue
      const colorIdx = Math.floor(rng(idx + 0.5) * palette.length)
      const color = palette[colorIdx]
      ctx.fillStyle = color
      ctx.fillRect(
        col * pw + pw * 0.1,
        row * ph + ph * 0.1,
        pw * 0.82,
        ph * 0.72,
      )
    }
  }
  return new THREE.CanvasTexture(c)
}

// Pre-generate a handful of window texture variants (shared across buildings)
const WIN_TEXS = [0, 1, 2, 3, 4].map(s => makeMixedWinTex(s))

// Building material factory – THE KEY FIX: emissive must be #ffffff + emissiveMap
function makeBuildingMats(texIdx) {
  const tex = WIN_TEXS[texIdx % WIN_TEXS.length]
  const side = new THREE.MeshStandardMaterial({
    color:            '#07101e',
    roughness:        0.8,
    metalness:        0.3,
    emissive:         new THREE.Color('#ffffff'), // WHITE → lets emissiveMap control color
    emissiveMap:      tex,
    emissiveIntensity: 1.6,
  })
  const roof = new THREE.MeshStandardMaterial({
    color: '#050b16', roughness: 0.95,
  })
  return [side, side, roof, roof, side, side]
}
const BMAT = [0,1,2,3,4].map(makeBuildingMats)

// ─── BUILDING DATA: [x, z, w, d, h, matIdx] ──────────────────────────────────
const BUILDINGS = [
  // ── Tall central cluster (back of city) ──
  [0,   -19, 5, 5, 44, 2],
  [-5,  -16, 4, 4, 30, 0],
  [5,   -16, 4, 4, 26, 1],
  [-9,  -19, 4, 3, 25, 2],
  [9,   -19, 4, 3, 23, 3],
  [-7,  -13, 4, 3, 21, 0],
  [7,   -13, 4, 3, 19, 4],
  [0,   -13, 4, 4, 16, 1],
  [-3,  -23, 3, 3, 18, 2],
  [3,   -23, 3, 3, 20, 0],
  [-13, -19, 5, 4, 17, 3],
  [13,  -19, 5, 4, 15, 1],
  [-17, -22, 4, 4, 13, 0],
  [17,  -22, 4, 4, 12, 4],
  // ── Left column ──
  [-17, -17, 5, 4, 14, 0],
  [-17,  -9, 5, 4, 12, 2],
  [-17,  -1, 5, 4, 10, 4],
  [-17,   7, 5, 4,  9, 1],
  [-22, -14, 4, 4, 11, 3],
  [-22,  -5, 4, 4,  9, 0],
  [-22,   4, 4, 4,  8, 2],
  [-28,  -9, 4, 4,  6, 1],
  [-28,   0, 4, 4,  5, 3],
  [-28,   9, 4, 4,  6, 0],
  // ── Right column ──
  [17,  -17, 5, 4, 13, 4],
  [17,   -9, 5, 4, 11, 0],
  [17,   -1, 5, 4, 10, 2],
  [17,    7, 5, 4,  9, 3],
  [22,  -14, 4, 4, 11, 1],
  [22,   -5, 4, 4,  9, 4],
  [22,    4, 4, 4,  8, 0],
  [28,   -9, 4, 4,  6, 2],
  [28,    0, 4, 4,  5, 1],
  [28,    9, 4, 4,  7, 3],
  // ── Center fill ──
  [-10,  -9, 4, 4, 10, 1],
  [10,   -9, 4, 4, 10, 0],
  [-5,   -6, 4, 4,  8, 3],
  [5,    -6, 4, 4,  9, 2],
  [0,    -6, 4, 3,  7, 4],
  [-10,   1, 4, 4,  8, 0],
  [10,    1, 4, 4,  8, 3],
  [-5,    4, 4, 4,  7, 1],
  [5,     4, 4, 4,  7, 2],
  [0,     4, 4, 4,  6, 0],
  [-15,   2, 4, 4,  8, 4],
  [15,    2, 4, 4,  8, 1],
  // ── Front edge ──
  [-5,   14, 5, 4,  5, 2],
  [5,    14, 5, 4,  5, 0],
  [0,    14, 4, 4,  7, 3],
  [-12,  14, 4, 4,  5, 1],
  [12,   14, 4, 4,  5, 4],
  [-21,  14, 4, 4,  5, 2],
  [21,   14, 4, 4,  5, 0],
  // ── Very front ──
  [-5,   21, 4, 4,  4, 1],
  [5,    21, 4, 4,  4, 3],
  [0,    21, 3, 3,  5, 2],
  [-11,  21, 4, 4,  4, 0],
  [11,   21, 4, 4,  4, 4],
]

// ─── TREE POSITIONS ───────────────────────────────────────────────────────────
const TREES = [
  [-4, 7], [4, 7], [0, 9], [-8, 8], [8, 8],
  [-12, 4], [12, 4], [-2, -2], [2, -2], [0, -3], [-6, 1], [6, 1],
]

// ─── LAUNCH PADS: [x, z, scale] ──────────────────────────────────────────────
const PADS = [
  [-26, 17, 1.0],
  [0,   24, 1.1],
  [26,  17, 1.0],
  [-23, -1, 0.9],
  [23,  -1, 0.9],
]

// ─── BOOSTERS: [x, z] ────────────────────────────────────────────────────────
const BOOSTERS = [
  [-33, -26], [0, -27], [33, -26],
  [-33,  26], [0,  27], [33,  26],
]

// ─── SCATTERED NEON LIGHTS to illuminate building faces ──────────────────────
const NEON_LIGHTS = [
  { pos: [-15, 18, -14], color: '#ff8800', d: 30 },
  { pos: [15,  18, -14], color: '#cc44ff', d: 30 },
  { pos: [0,   20, -18], color: '#00ccff', d: 28 },
  { pos: [-20, 15, -8],  color: '#ff8800', d: 25 },
  { pos: [20,  15, -8],  color: '#ff4488', d: 25 },
  { pos: [0,   16,  5],  color: '#8844ff', d: 25 },
  { pos: [-10, 14, -5],  color: '#ff8800', d: 22 },
  { pos: [10,  14, -5],  color: '#00ccff', d: 22 },
  { pos: [-26, 12, -4],  color: '#ff8800', d: 20 },
  { pos: [26,  12, -4],  color: '#cc44ff', d: 20 },
  { pos: [-5,  14, 13],  color: '#ff8800', d: 20 },
  { pos: [5,   14, 13],  color: '#0066ff', d: 20 },
  { pos: [0,   14, -8],  color: '#cc44ff', d: 22 },
  { pos: [-15, 12,  2],  color: '#ff8800', d: 18 },
  { pos: [15,  12,  2],  color: '#00aaff', d: 18 },
  { pos: [0,   10,  0],  color: '#ffffff', d: 40 },  // central fill
]

// ─── OCEAN ────────────────────────────────────────────────────────────────────
function Ocean() {
  const meshRef = useRef()
  const geom = useMemo(() => new THREE.PlaneGeometry(900, 900, 70, 70), [])
  const origXY = useMemo(() => {
    const pos = geom.attributes.position.array
    const out = new Float32Array((pos.length / 3) * 2)
    for (let i = 0; i < pos.length / 3; i++) {
      out[i * 2] = pos[i * 3]; out[i * 2 + 1] = pos[i * 3 + 1]
    }
    return out
  }, [geom])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pos = geom.attributes.position.array
    for (let i = 0; i < pos.length / 3; i++) {
      const x = origXY[i * 2], y = origXY[i * 2 + 1]
      pos[i * 3 + 2] =
        Math.sin(x * 0.04 + t * 0.9) * 0.85 +
        Math.sin(y * 0.05 + t * 0.75) * 0.6 +
        Math.sin((x + y) * 0.03 + t * 0.55) * 0.4
    }
    geom.attributes.position.needsUpdate = true
    geom.computeVertexNormals()
    // Scroll for "city moving forward" illusion
    meshRef.current.position.z = ((t * 3.5) % 80) - 30
  })

  return (
    <mesh ref={meshRef} geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -13, -20]}>
      <meshStandardMaterial
        color="#020d1e" roughness={0.05} metalness={0.98}
        emissive="#041530" emissiveIntensity={0.9}
      />
    </mesh>
  )
}

// ─── RAIN ─────────────────────────────────────────────────────────────────────
function Rain() {
  const ref = useRef()
  const count = 600
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i*3] = (Math.random()-.5)*160; a[i*3+1] = Math.random()*100+5; a[i*3+2] = (Math.random()-.5)*140
    }
    return a
  }, [])
  useFrame(() => {
    if (!ref.current) return
    const p = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      p[i*3+1] -= 0.55; p[i*3+2] += 0.08
      if (p[i*3+1] < -13) { p[i*3] = (Math.random()-.5)*160; p[i*3+1] = 90; p[i*3+2] = (Math.random()-.5)*140 }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#6699bb" size={0.16} sizeAttenuation transparent opacity={0.3} />
    </points>
  )
}

// ─── PLATFORM ─────────────────────────────────────────────────────────────────
function Platform() {
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00aaff', emissive: '#00aaff', emissiveIntensity: 3.0, roughness: 0.3,
  }), [])
  const gridMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#002244', emissive: '#002244', emissiveIntensity: 1.5,
  }), [])

  return (
    <group>
      {/* Main slab */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[74, 5, 60]} />
        <meshStandardMaterial color="#080f1d" roughness={0.9} metalness={0.4} />
      </mesh>
      {/* Under slab */}
      <mesh position={[0, -5.6, 0]}>
        <boxGeometry args={[72, 1.8, 58]} />
        <meshStandardMaterial color="#050c18" roughness={1} metalness={0.2} />
      </mesh>
      {/* Platform side detail bands */}
      {[-1.5, -3.0].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 30.3]}>
            <boxGeometry args={[74, 0.7, 0.4]} />
            <meshStandardMaterial color="#0a1525" roughness={0.8} />
          </mesh>
          <mesh position={[0, y, -30.3]}>
            <boxGeometry args={[74, 0.7, 0.4]} />
            <meshStandardMaterial color="#0a1525" roughness={0.8} />
          </mesh>
          <mesh position={[37.3, y, 0]}>
            <boxGeometry args={[0.4, 0.7, 60]} />
            <meshStandardMaterial color="#0a1525" roughness={0.8} />
          </mesh>
          <mesh position={[-37.3, y, 0]}>
            <boxGeometry args={[0.4, 0.7, 60]} />
            <meshStandardMaterial color="#0a1525" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Neon edge trim – front/back */}
      {[-30, 30].map((z, i) => (
        <mesh key={i} position={[0, -0.1, z]} material={edgeMat}>
          <boxGeometry args={[74.5, 0.28, 0.28]} />
        </mesh>
      ))}
      {/* Neon edge trim – left/right */}
      {[-37, 37].map((x, i) => (
        <mesh key={i} position={[x, -0.1, 0]} material={edgeMat}>
          <boxGeometry args={[0.28, 0.28, 60.5]} />
        </mesh>
      ))}
      {/* Road grid – vertical */}
      {[-24, -12, 0, 12, 24].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]} material={gridMat}>
          <boxGeometry args={[0.18, 0.06, 60]} />
        </mesh>
      ))}
      {/* Road grid – horizontal */}
      {[-24, -12, 0, 12, 24].map((z, i) => (
        <mesh key={i} position={[0, 0.08, z]} material={gridMat}>
          <boxGeometry args={[74, 0.06, 0.18]} />
        </mesh>
      ))}
    </group>
  )
}

// ─── BUILDING ─────────────────────────────────────────────────────────────────
function Building({ bx, bz, w, d, h, mi }) {
  const mats = BMAT[mi % BMAT.length]
  const geom = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d])
  return (
    <group position={[bx, 0, bz]}>
      <mesh position={[0, h / 2, 0]} geometry={geom} material={mats} />
      {/* Roof cap – hides window texture on top */}
      <mesh position={[0, h + 0.02, 0]}>
        <boxGeometry args={[w + 0.1, 0.05, d + 0.1]} />
        <meshStandardMaterial color="#040b14" roughness={0.95} />
      </mesh>
      {/* Rooftop block */}
      {h > 8 && (
        <mesh position={[0, h + 0.7, 0]}>
          <boxGeometry args={[w * 0.55, 1.1, d * 0.55]} />
          <meshStandardMaterial color="#060d18" roughness={0.9} metalness={0.5} />
        </mesh>
      )}
      {/* Antenna on tall buildings */}
      {h > 18 && (
        <>
          <mesh position={[0, h + h * 0.16 + 1, 0]}>
            <cylinderGeometry args={[0.07, 0.08, h * 0.30, 6]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, h + h * 0.31 + 1.2, 0]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={5} />
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
      <mesh position={[0, 2.9, 0]}>
        <coneGeometry args={[1.4, 3.2, 6]} />
        <meshStandardMaterial color="#0f4418" emissive="#062210" emissiveIntensity={0.6} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── LAUNCH PAD ───────────────────────────────────────────────────────────────
function LaunchPad({ lx, lz, scale = 1 }) {
  const r0 = useRef(), r1 = useRef(), r2 = useRef(), scrMat = useRef(), lRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (r0.current) r0.current.rotation.z =  t * 0.55
    if (r1.current) r1.current.rotation.z = -t * 0.38
    if (r2.current) r2.current.rotation.z =  t * 0.28
    if (scrMat.current) scrMat.current.emissiveIntensity = 0.8 + Math.sin(t * 1.8 + lx) * 0.3
    if (lRef.current)   lRef.current.intensity = 3 + Math.sin(t * 2.5 + lz) * 1.0
  })
  return (
    <group position={[lx, -0.5, lz]}>
      {/* Octagonal base */}
      <mesh>
        <cylinderGeometry args={[5.4 * scale, 5.9 * scale, 1.6, 8]} />
        <meshStandardMaterial color="#0a1622" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Inner ring platform */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[4.1 * scale, 4.1 * scale, 0.45, 8]} />
        <meshStandardMaterial color="#0c1a2a" metalness={0.65} />
      </mesh>
      {/* Ring 0 – outer */}
      <mesh ref={r0} rotation={[Math.PI/2,0,0]} position={[0, 1.15, 0]}>
        <torusGeometry args={[4.5 * scale, 0.15, 8, 72]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={3.0} />
      </mesh>
      {/* Ring 1 – mid */}
      <mesh ref={r1} rotation={[Math.PI/2,0,0]} position={[0, 1.23, 0]}>
        <torusGeometry args={[3.4 * scale, 0.12, 8, 64]} />
        <meshStandardMaterial color="#0055ff" emissive="#0055ff" emissiveIntensity={3.0} />
      </mesh>
      {/* Ring 2 – inner */}
      <mesh ref={r2} rotation={[Math.PI/2,0,0]} position={[0, 1.30, 0]}>
        <torusGeometry args={[2.3 * scale, 0.11, 8, 56]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={3.5} />
      </mesh>
      {/* Center glow */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, 1.35, 0]}>
        <circleGeometry args={[1.7 * scale, 32]} />
        <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={5} />
      </mesh>
      {/* Holographic display */}
      <group position={[0, 6.8 * scale, 0]}>
        <mesh>
          <planeGeometry args={[5.5 * scale, 3.4 * scale]} />
          <meshStandardMaterial
            ref={scrMat} color="#001122" emissive="#004477"
            emissiveIntensity={0.8} transparent opacity={0.88} side={THREE.DoubleSide}
          />
        </mesh>
        {/* Border lines */}
        {[[-2.75 * scale, 0],[2.75 * scale, 0]].map(([x,_], i) => (
          <mesh key={i} position={[x, 0, 0.01]}>
            <planeGeometry args={[0.09, 3.4 * scale]} />
            <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={3} />
          </mesh>
        ))}
        {[[-1.6 * scale, 0],[1.6 * scale, 0]].map(([y,_], i) => (
          <mesh key={i} position={[0, y, 0.01]}>
            <planeGeometry args={[5.5 * scale, 0.07]} />
            <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={3} />
          </mesh>
        ))}
        {[-1.0, -0.4, 0.2, 0.8].map((y, i) => (
          <mesh key={i} position={[0, y * scale, 0.02]}>
            <planeGeometry args={[5.0 * scale, 0.07]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.2} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
      <pointLight ref={lRef} color="#00aaff" intensity={4} distance={25} position={[0, 2, 0]} />
    </group>
  )
}

// ─── BOOSTER ──────────────────────────────────────────────────────────────────
function Booster({ bx, bz }) {
  const lRef = useRef(), gRef = useRef()
  useFrame(({ clock }) => {
    const p = 3.5 + Math.sin(clock.elapsedTime * 2.8 + bx * 0.3) * 1.5
    if (lRef.current) lRef.current.intensity = p
    if (gRef.current) gRef.current.emissiveIntensity = p * 0.85
  })
  return (
    <group position={[bx, -7.5, bz]}>
      <mesh>
        <cylinderGeometry args={[1.7, 2.2, 3.6, 8]} />
        <meshStandardMaterial color="#0a1522" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, -2.9, 0]}>
        <cylinderGeometry args={[0.9, 0.5, 2.4, 8]} />
        <meshStandardMaterial ref={gRef} color="#00eeff" emissive="#00eeff" emissiveIntensity={3.5} />
      </mesh>
      <mesh position={[0, -4.4, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={5} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, -5.1, 0]}>
        <sphereGeometry args={[2.2, 12, 12]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={2.5} transparent opacity={0.2} />
      </mesh>
      <pointLight ref={lRef} color="#00ccff" intensity={4.5} distance={35} position={[0, -4, 0]} />
    </group>
  )
}

// ─── CITY GROUP – bobs + slight lean ─────────────────────────────────────────
function CityGroup() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    ref.current.position.y = Math.sin(t * 0.42) * 0.9
    ref.current.rotation.x = Math.sin(t * 0.28) * 0.007
    ref.current.rotation.z = Math.sin(t * 0.35) * 0.004
  })
  return (
    <group ref={ref}>
      <Platform />
      {BUILDINGS.map(([x, z, w, d, h, mi], i) => (
        <Building key={i} bx={x} bz={z} w={w} d={d} h={h} mi={mi} />
      ))}
      {TREES.map(([x, z], i) => <Tree key={i} tx={x} tz={z} />)}
      {PADS.map(([x, z, s], i) => <LaunchPad key={i} lx={x} lz={z} scale={s} />)}
      {BOOSTERS.map(([x, z], i) => <Booster key={i} bx={x} bz={z} />)}
      {/* Extra billboard poles */}
      {[[-30, -23, 9], [30, -23, 9], [0, -27, 11]].map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.12, 0.12, h, 6]} />
            <meshStandardMaterial color="#223344" metalness={0.9} />
          </mesh>
          <mesh position={[0, h + 1.5, 0]}>
            <planeGeometry args={[5, 3]} />
            <meshStandardMaterial color="#001122" emissive="#0044aa" emissiveIntensity={1.8} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#0066ff" intensity={1.5} distance={14} position={[0, h + 1, 0]} />
        </group>
      ))}
    </group>
  )
}

// ─── SCENE LIGHTS ─────────────────────────────────────────────────────────────
function SceneLights() {
  return (
    <>
      {/* Strong ambient – city-wide blue-white glow */}
      <ambientLight color="#1a2d66" intensity={3.5} />
      {/* Moonlight directional from upper left */}
      <directionalLight color="#aabbdd" intensity={1.8} position={[-40, 100, 60]} />
      {/* Fill light from right */}
      <directionalLight color="#334488" intensity={0.9} position={[60, 60, 30]} />
      {/* City glow overhead */}
      <pointLight color="#2244aa" intensity={2} distance={200} position={[0, 50, 0]} />
      {/* Scattered neon point lights for building illumination */}
      {NEON_LIGHTS.map(({ pos, color, d }, i) => (
        <pointLight key={i} color={color} intensity={2.5} distance={d} position={pos} />
      ))}
    </>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function CyberpunkCity() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#010812', overflow: 'hidden' }}>
      {/* HUD */}
      <div style={{
        position: 'fixed', top: 22, left: 28, zIndex: 10, pointerEvents: 'none', fontFamily: 'monospace',
      }}>
        <div style={{ fontSize: 10, color: '#00aaff', letterSpacing: 3, marginBottom: 4, opacity: 0.8 }}>
          ◈ NEURAL CITY — SECTOR 7
        </div>
        <div style={{ fontSize: 8, color: 'rgba(0,170,255,0.45)', letterSpacing: 2 }}>
          5 LAUNCH PADS ACTIVE · BOOSTERS ONLINE
        </div>
      </div>
      <div style={{
        position: 'fixed', bottom: 22, right: 28, zIndex: 10, pointerEvents: 'none',
        fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,170,255,0.35)',
        letterSpacing: 2, textAlign: 'right',
      }}>
        SCROLL — ZOOM
      </div>

      <Canvas
        camera={{ position: [62, 88, 80], fov: 46, near: 0.5, far: 2000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.LinearToneMapping,
          toneMappingExposure: 0.95,
        }}
      >
        <fog attach="fog" args={['#010a1a', 130, 450]} />
        <Stars radius={280} depth={55} count={4500} factor={4} saturation={0.2} fade speed={0.4} />
        <SceneLights />
        <Ocean />
        <Rain />
        <CityGroup />
        {/* Fixed isometric angle – ROTATION LOCKED, zoom only */}
        <OrbitControls
          enableRotate={false}
          enablePan={false}
          enableZoom={true}
          zoomSpeed={0.8}
          minDistance={38}
          maxDistance={220}
          target={[0, 8, 0]}
        />
      </Canvas>
    </div>
  )
}
