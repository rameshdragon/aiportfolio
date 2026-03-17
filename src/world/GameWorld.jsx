import { Suspense, useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Ground, WaterArea } from './Ground'
import { WindPapers } from './WindPapers'
import { PolyBuilding } from './PolyBuildings'
import { PolyVeg } from './PolyVegetation'
import { PolyProp } from './PolyProps'
import { Rubble } from './Props'
import { SignPole } from './SignPole'
import { PlayerModel } from '../characters/PlayerModel'
import { ZombieModel } from '../characters/ZombieModel'

// ─── GAME CONFIG ───
const MOVE_SPEED  = 0.10
const SIGN_RANGE  = 5
const KILL_RANGE  = 5   // generous range so kill works easily

const LANDMARKS = [
  { pos: [0, 0, 50],    id: 'start',      label: 'RAMESH REDDY',  section: 'intro' },
  { pos: [45, 0, 30],   id: 'experience', label: 'EXPERIENCE',    section: 'experience' },
  { pos: [50, 0, -10],  id: 'projects',   label: 'PROJECTS',      section: 'projects' },
  { pos: [-35, 0, -8],  id: 'skills',     label: 'SKILLS',        section: 'skills' },
  { pos: [-16, 0, -56], id: 'contact',    label: 'CONTACT ME',    section: 'contact' },
]

const ZOMBIE_SPAWNS = [
  { pos: [18, 0, 44],   type: 0 },
  { pos: [-20, 0, 30],  type: 1 },
  { pos: [34, 0, 14],   type: 2 },
  { pos: [-12, 0, -20], type: 0 },
  { pos: [22, 0, -24],  type: 1 },
  { pos: [-30, 0, -42], type: 2 },
  { pos: [10, 0, -44],  type: 0 },
  { pos: [38, 0, -28],  type: 1 },
]

// ─── COLLIDERS — very generous so player can't clip through ───
const COLLIDERS = [
  // Apartments  (large footprints)
  { pos: [-22, 0, 44],  size: [16, 20, 16] },
  { pos: [20, 0, -14],  size: [16, 20, 16] },
  { pos: [2, 0, -30],   size: [16, 20, 16] },
  { pos: [-24, 0, -20], size: [16, 20, 16] },
  // Large
  { pos: [24, 0, 52],   size: [20, 25, 20] },
  { pos: [52, 0, 4],    size: [20, 25, 20] },
  // Houses
  { pos: [-40, 0, 18],  size: [18, 15, 16] },
  { pos: [36, 0, 22],   size: [18, 15, 16] },
  // Fantasy
  { pos: [-10, 0, 10],  size: [16, 22, 16] },
  { pos: [-44, 0, -28], size: [16, 22, 16] },
  // Cabin
  { pos: [30, 0, -36],  size: [14, 12, 14] },
  { pos: [-6, 0, 66],   size: [14, 12, 14] },
  { pos: [-32, 0, 38],  size: [14, 12, 14] },
  // Map boundaries
  { pos: [0,    0,  90], size: [200, 10, 4] },
  { pos: [0,    0, -90], size: [200, 10, 4] },
  { pos: [90,   0,   0], size: [4,   10, 200] },
  { pos: [-90,  0,   0], size: [4,   10, 200] },
]

function checkCollision(x, z, colliders, radius = 0.5) {
  for (const c of colliders) {
    const hw = c.size[0] / 2 + radius
    const hd = c.size[2] / 2 + radius
    if (Math.abs(x - c.pos[0]) < hw && Math.abs(z - c.pos[2]) < hd) return true
  }
  return false
}

// ─── SEEDED RANDOM ───
function seededRand(initSeed) {
  let s = initSeed >>> 0
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1)
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61)
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000
  }
}

// ─── ROAD EXCLUSION (for grass placement) ───
function onRoad(x, z) {
  if (Math.abs(x) < 5 && z > -72 && z < 72) return true    // N-S spine
  if (z > 24 && z < 36 && x > -2 && x < 52) return true    // E branch
  if (x > 42 && x < 54 && z > -14 && z < 34) return true   // E-S
  if (z > -13 && z < -3 && x < 2 && x > -42) return true   // W branch
  if (x > -21 && x < -11 && z < -3 && z > -62) return true // SW path
  return false
}

// ─── ABANDONED ROAD ───
function RoadSegment({ cx, cz, w, l, segIdx }) {
  const { potholes, cracks, dashes } = useMemo(() => {
    const rng = seededRand(segIdx * 1234 + 7)
    const count = (n) => Array.from({ length: n }, () => ({
      x: (rng() - 0.5) * (w * 0.85),
      z: (rng() - 0.5) * (l * 0.9),
      r: 0.35 + rng() * 0.55,
      rot: rng() * Math.PI,
      len: 0.5 + rng() * 2.0,
    }))
    return {
      potholes: count(Math.ceil(w * l / 50)),
      cracks:   count(Math.ceil(w * l / 10)),
      dashes:   Array.from({ length: Math.floor(l / 4) }, (_, i) => -l / 2 + 2 + i * 4),
    }
  }, [cx, cz, w, l, segIdx])

  return (
    <group position={[cx, 0, cz]}>
      {/* Asphalt base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial color="#2a2016" roughness={0.96} />
      </mesh>
      {/* Potholes */}
      {potholes.map((ph, i) => (
        <group key={i} position={[ph.x, 0, ph.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[ph.r, 10]} />
            <meshStandardMaterial color="#14100c" roughness={1} />
          </mesh>
          {/* Muddy water inside pothole */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
            <circleGeometry args={[ph.r * 0.72, 10]} />
            <meshStandardMaterial color="#1e2a1a" metalness={0.35} roughness={0.15} transparent opacity={0.82} />
          </mesh>
        </group>
      ))}
      {/* Cracks */}
      {cracks.map((cr, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, cr.rot, 0]} position={[cr.x, 0.03, cr.z]}>
          <planeGeometry args={[0.045, cr.len]} />
          <meshStandardMaterial color="#14100c" roughness={1} />
        </mesh>
      ))}
      {/* Faded centre-line dashes */}
      {dashes.map((dz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, dz]}>
          <planeGeometry args={[0.14, 1.6]} />
          <meshStandardMaterial color="#3a3426" roughness={1} transparent opacity={0.28} />
        </mesh>
      ))}
    </group>
  )
}

function AbandonedRoad() {
  const segs = [
    { cx: 0,   cz: 0,   w: 6,  l: 140 },  // N-S spine
    { cx: 24,  cz: 30,  w: 50, l: 6   },  // E branch
    { cx: 47,  cz: 9,   w: 6,  l: 44  },  // E-S
    { cx: -19, cz: -8,  w: 38, l: 6   },  // W branch
    { cx: -16, cz: -33, w: 6,  l: 52  },  // SW path
  ]
  return (
    <>
      {segs.map((s, i) => <RoadSegment key={i} {...s} segIdx={i} />)}
    </>
  )
}

// ─── INSTANCED GRASS ───
function GrassField() {
  const ref1 = useRef()  // dark green
  const ref2 = useRef()  // medium green
  const ref3 = useRef()  // dry yellow-green
  const N1 = 1400, N2 = 1200, N3 = 700

  useEffect(() => {
    const place = (meshRef, count, seed, color) => {
      if (!meshRef.current) return
      const rng = seededRand(seed)
      const dummy = new THREE.Object3D()
      let placed = 0, tries = 0
      while (placed < count && tries < count * 6) {
        tries++
        const x = (rng() - 0.5) * 175
        const z = (rng() - 0.5) * 175
        if (onRoad(x, z)) continue
        dummy.position.set(x, 0, z)
        dummy.rotation.y = rng() * Math.PI * 2
        const s = 0.5 + rng() * 1.1
        dummy.scale.set(s, s * (0.7 + rng() * 0.6), s)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(placed, dummy.matrix)
        placed++
      }
      meshRef.current.instanceMatrix.needsUpdate = true
    }
    place(ref1, N1, 111)
    place(ref2, N2, 222)
    place(ref3, N3, 333)
  }, [])

  return (
    <>
      <instancedMesh ref={ref1} args={[null, null, N1]} receiveShadow castShadow>
        <planeGeometry args={[0.28, 0.62]} />
        <meshStandardMaterial color="#527022" side={THREE.DoubleSide} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={ref2} args={[null, null, N2]} receiveShadow castShadow>
        <planeGeometry args={[0.22, 0.50]} />
        <meshStandardMaterial color="#668030" side={THREE.DoubleSide} roughness={1} />
      </instancedMesh>
      <instancedMesh ref={ref3} args={[null, null, N3]} receiveShadow castShadow>
        <planeGeometry args={[0.20, 0.42]} />
        <meshStandardMaterial color="#8a9030" side={THREE.DoubleSide} roughness={1} />
      </instancedMesh>
    </>
  )
}

// ─── THIRD PERSON CAMERA ───
function ThirdPersonCamera({ target, cameraYaw }) {
  const { camera } = useThree()
  const yaw   = useRef(0)
  const pitch = useRef(0.40)
  const isDragging  = useRef(false)
  const lastMouse   = useRef({ x: 0, y: 0 })
  const RADIUS = 12

  useEffect(() => {
    const onDown = (e) => {
      isDragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { isDragging.current = false }
    const onMove = (e) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
      yaw.current   += dx * 0.007
      pitch.current  = Math.max(0.1, Math.min(1.2, pitch.current + dy * 0.005))
      // Update shared ref IMMEDIATELY so Player always has current yaw
      cameraYaw.current = yaw.current
    }
    const noCtx = (e) => e.preventDefault()
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('contextmenu', noCtx)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('contextmenu', noCtx)
    }
  }, [cameraYaw])

  useFrame(() => {
    if (!target.current) return
    cameraYaw.current = yaw.current

    const px = target.current.position.x
    const pz = target.current.position.z
    const cosP = Math.cos(pitch.current)
    const sinP = Math.sin(pitch.current)
    const desiredX = px + RADIUS * Math.sin(yaw.current) * cosP
    const desiredY = 1.8 + RADIUS * sinP
    const desiredZ = pz + RADIUS * Math.cos(yaw.current) * cosP
    camera.position.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), 0.08)
    camera.lookAt(new THREE.Vector3(px, 1.5, pz))
  })

  return null
}

// ─── PLAYER CONTROLLER ───
function Player({ playerRef, keys, joystick, cameraYaw, onNearSign, onMove }) {
  const groupRef = useRef()
  const [moving, setMoving] = useState(false)

  useEffect(() => { if (playerRef) playerRef.current = groupRef.current })

  useFrame(() => {
    if (!groupRef.current) return

    let fwd = 0, rgt = 0
    if (keys.current.ArrowUp    || keys.current.KeyW) fwd =  1
    if (keys.current.ArrowDown  || keys.current.KeyS) fwd = -1
    if (keys.current.ArrowLeft  || keys.current.KeyA) rgt = -1
    if (keys.current.ArrowRight || keys.current.KeyD) rgt =  1
    if (joystick.current) { fwd -= joystick.current.y; rgt += joystick.current.x }

    const len = Math.sqrt(fwd * fwd + rgt * rgt)
    if (len > 0.1) {
      fwd /= len; rgt /= len
      // Camera-relative world displacement
      const y    = cameraYaw.current
      const sinY = Math.sin(y), cosY = Math.cos(y)
      const dx   = fwd * (-sinY) + rgt * cosY
      const dz   = fwd * (-cosY) + rgt * (-sinY)

      const nx = groupRef.current.position.x + dx * MOVE_SPEED
      const nz = groupRef.current.position.z + dz * MOVE_SPEED
      if (!checkCollision(nx, groupRef.current.position.z, COLLIDERS))
        groupRef.current.position.x = nx
      if (!checkCollision(groupRef.current.position.x, nz, COLLIDERS))
        groupRef.current.position.z = nz

      // Face movement direction
      const angle = Math.atan2(dx, dz)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, 0.15)

      setMoving(true)
      onMove?.()
    } else {
      setMoving(false)
    }

    const px = groupRef.current.position.x
    const pz = groupRef.current.position.z
    let nearSign = null
    for (const lm of LANDMARKS) {
      if (Math.hypot(px - lm.pos[0], pz - lm.pos[2]) < SIGN_RANGE) { nearSign = lm; break }
    }
    onNearSign(nearSign)
  })

  return (
    <group ref={groupRef} position={[0, 0, 68]}>
      <PlayerModel moving={moving} />
    </group>
  )
}

// ─── ZOMBIE NPC ───
function ZombieNPC({ spawn, playerRef, onNear, id, onRegisterKill }) {
  const ref  = useRef()
  const [alive, setAlive] = useState(true)
  const [dying, setDying] = useState(false)
  const deathProgress = useRef(0)
  const moveDir   = useRef(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize())
  const moveTimer = useRef(0)
  const startPos  = useRef(new THREE.Vector3(...spawn.pos))
  // Hysteresis: track whether player was "near" last frame
  const wasNear   = useRef(false)

  useFrame(() => {
    if (!ref.current || !alive) {
      if (dying) {
        deathProgress.current = Math.min(1, deathProgress.current + 0.03)
        if (deathProgress.current >= 1) setDying(false)
      }
      return
    }
    moveTimer.current++
    if (moveTimer.current > 100 + Math.random() * 100) {
      moveTimer.current = 0
      moveDir.current.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()
    }
    const speed = 0.018
    const nx = ref.current.position.x + moveDir.current.x * speed
    const nz = ref.current.position.z + moveDir.current.z * speed
    const distFromSpawn = Math.hypot(nx - startPos.current.x, nz - startPos.current.z)
    if (distFromSpawn < 5 && !checkCollision(nx, nz, COLLIDERS, 0.3)) {
      ref.current.position.x = nx
      ref.current.position.z = nz
    } else {
      moveDir.current.negate()
    }
    ref.current.rotation.y = Math.atan2(moveDir.current.x, moveDir.current.z)

    if (playerRef.current) {
      const dist = ref.current.position.distanceTo(playerRef.current.position)
      // Hysteresis: enter at KILL_RANGE, leave at KILL_RANGE + 1
      const threshold = wasNear.current ? KILL_RANGE + 1 : KILL_RANGE
      const near = dist < threshold
      if (near !== wasNear.current) {
        wasNear.current = near
        onNear(id, near)
      }
    }
  })

  const kill = useCallback(() => { setAlive(false); setDying(true); deathProgress.current = 0 }, [])
  useEffect(() => { if (onRegisterKill) onRegisterKill(id, kill) }, [id, kill, onRegisterKill])

  if (!alive && !dying) return null
  return (
    <group ref={ref} position={spawn.pos}>
      <ZombieModel type={spawn.type} dying={dying} deathProgress={deathProgress.current} />
    </group>
  )
}

// ─── ENVIRONMENT ───
function Environment() {
  return (
    <>
      {/* ── BUILDINGS — no color tint, use original model materials ── */}
      <PolyBuilding type="apartment" position={[-22, 0, 44]}  rotation={0.2}  />
      <PolyBuilding type="apartment" position={[20, 0, -14]}  rotation={-0.3} />
      <PolyBuilding type="apartment" position={[2, 0, -30]}   rotation={0.1}  />
      <PolyBuilding type="apartment" position={[-24, 0, -20]} rotation={0.8}  />
      <PolyBuilding type="large"     position={[24, 0, 52]}   rotation={-0.1} />
      <PolyBuilding type="large"     position={[52, 0, 4]}    rotation={0.5}  />
      <PolyBuilding type="houses"    position={[-40, 0, 18]}  rotation={0.4}  />
      <PolyBuilding type="houses"    position={[36, 0, 22]}   rotation={-0.6} />
      <PolyBuilding type="fantasy"   position={[-10, 0, 10]}  rotation={0.3}  />
      <PolyBuilding type="fantasy"   position={[-44, 0, -28]} rotation={-0.4} />
      <PolyBuilding type="cabin"     position={[30, 0, -36]}  rotation={0.7}  />
      <PolyBuilding type="cabin"     position={[-6, 0, 66]}   rotation={0.3}  />
      <PolyBuilding type="cabin"     position={[-32, 0, 38]}  rotation={-0.5} />

      {/* ── TREES ── */}
      <PolyVeg type="deadtree" position={[-28, 0, 6]}   rotation={0.4}  color="#a09080" />
      <PolyVeg type="deadtree" position={[26, 0, -6]}   rotation={-0.3} color="#c07850" />
      <PolyVeg type="deadtree" position={[-14, 0, -46]} rotation={1.1}  color="#7088a8" />
      <PolyVeg type="deadtree" position={[38, 0, -20]}  rotation={0.2}  color="#a88060" />
      <PolyVeg type="deadtree" position={[-50, 0, 10]}  rotation={0.8}  color="#907860" />
      <PolyVeg type="deadtree" position={[56, 0, -30]}  rotation={-0.6} color="#b09070" />
      <PolyVeg type="deadtree" position={[8, 0, 62]}    rotation={0.3}  color="#9a8060" />
      <PolyVeg type="deadtree" position={[-18, 0, 58]}  rotation={-0.4} color="#a07058" />
      <PolyVeg type="birch"    position={[-16, 0, 36]}  rotation={0.6}  color="#98c878" />
      <PolyVeg type="birch"    position={[10, 0, 40]}   rotation={-0.8} color="#c8b840" />
      <PolyVeg type="birch"    position={[-46, 0, 28]}  rotation={0.2}  color="#408858" />
      <PolyVeg type="birch"    position={[60, 0, -2]}   rotation={0.5}  color="#80c860" />
      <PolyVeg type="birch"    position={[18, 0, -46]}  rotation={-0.4} color="#a0d870" />
      <PolyVeg type="birch"    position={[-22, 0, -36]} rotation={1.0}  color="#60a850" />
      <PolyVeg type="birch"    position={[38, 0, 42]}   rotation={0.3}  color="#78c040" />
      <PolyVeg type="birch"    position={[-54, 0, -14]} rotation={-0.7} color="#90d068" />
      <PolyVeg type="birch"    position={[62, 0, 20]}   rotation={0.1}  color="#70b850" />
      <PolyVeg type="birch"    position={[-58, 0, 34]}  rotation={0.9}  color="#88c040" />
      <PolyVeg type="birch"    position={[14, 0, -60]}  rotation={-0.5} color="#60a038" />
      <PolyVeg type="birch"    position={[-40, 0, -50]} rotation={0.4}  color="#78b848" />

      {/* ── GROUND COVER — bushes, grass scattered everywhere ── */}
      <PolyVeg type="bushes"      position={[-18, 0, 40]}  color="#4a7830" />
      <PolyVeg type="bushes"      position={[-28, 0, 50]}  color="#286840" />
      <PolyVeg type="bushes"      position={[18, 0, 46]}   color="#785028" />
      <PolyVeg type="bushes"      position={[28, 0, 58]}   color="#5a8030" />
      <PolyVeg type="bushes"      position={[46, 0, 10]}   color="#3a6820" />
      <PolyVeg type="bushes"      position={[56, 0, -6]}   color="#687838" />
      <PolyVeg type="bushes"      position={[-38, 0, 24]}  color="#507030" />
      <PolyVeg type="bushes"      position={[32, 0, 16]}   color="#486028" />
      <PolyVeg type="bushes"      position={[-8, 0, 16]}   color="#608040" />
      <PolyVeg type="bushes"      position={[-44, 0, -22]} color="#786030" />
      <PolyVeg type="bushes"      position={[26, 0, -28]}  color="#507830" />
      <PolyVeg type="bushes"      position={[-28, 0, -26]} color="#406030" />
      <PolyVeg type="bushes"      position={[48, 0, -20]}  color="#486038" />
      <PolyVeg type="bushes"      position={[-56, 0, -4]}  color="#507830" />
      <PolyVeg type="bushes"      position={[20, 0, 62]}   color="#4a7820" />
      <PolyVeg type="grasspatch"  position={[6, 0, 34]}    color="#608040" />
      <PolyVeg type="grasspatch"  position={[-8, 0, 26]}   color="#486030" />
      <PolyVeg type="grasspatch"  position={[30, 0, -2]}   color="#507038" />
      <PolyVeg type="grasspatch"  position={[-20, 0, -12]} color="#5a7840" />
      <PolyVeg type="grasspatch"  position={[42, 0, -26]}  color="#488038" />
      <PolyVeg type="grasspatch"  position={[-12, 0, -50]} color="#406030" />
      <PolyVeg type="grasspatch"  position={[8, 0, -54]}   color="#548040" />
      <PolyVeg type="grasspatch"  position={[-36, 0, -44]} color="#486838" />
      <PolyVeg type="grasspatch"  position={[58, 0, 14]}   color="#507038" />
      <PolyVeg type="grasspatch"  position={[-62, 0, -8]}  color="#487040" />
      <PolyVeg type="grass"       position={[-4, 0, 42]}   color="#507830" />
      <PolyVeg type="grass"       position={[38, 0, 10]}   color="#386828" />
      <PolyVeg type="grass"       position={[-26, 0, -28]} color="#5a8030" />
      <PolyVeg type="grass"       position={[16, 0, -40]}  color="#488038" />
      <PolyVeg type="grass"       position={[-42, 0, 38]}  color="#507830" />
      <PolyVeg type="grass"       position={[54, 0, -42]}  color="#406830" />
      <PolyVeg type="grassyellow" position={[14, 0, 20]}   color="#b8a030" />
      <PolyVeg type="grassyellow" position={[-32, 0, 14]}  color="#a07828" />
      <PolyVeg type="grassyellow" position={[22, 0, -30]}  color="#c0a020" />
      <PolyVeg type="grassyellow" position={[-48, 0, -36]} color="#b09030" />
      <PolyVeg type="grassyellow" position={[44, 0, 34]}   color="#a89020" />

      {/* ── CARS ── */}
      <PolyProp type="brokencar" position={[12, 0, 48]}   rotation={0.4}  color="#5a3818" />
      <PolyProp type="brokencar" position={[26, 0, -24]}  rotation={1.2}  color="#503820" />
      <PolyProp type="brokencar" position={[-18, 0, -30]} rotation={0.6}  color="#402028" />
      <PolyProp type="rover"     position={[-14, 0, 32]}  rotation={-0.3} color="#303050" />
      <PolyProp type="rover"     position={[42, 0, 18]}   rotation={0.8}  color="#283828" />
      <PolyProp type="rover"     position={[36, 0, -48]}  rotation={-0.5} color="#382818" />

      {/* ── TELEPHONE POLES ── */}
      <PolyProp type="telepole" position={[4, 0, 42]}   />
      <PolyProp type="telepole" position={[-6, 0, 22]}  />
      <PolyProp type="telepole" position={[20, 0, 8]}   />
      <PolyProp type="telepole" position={[-22, 0, 4]}  />
      <PolyProp type="telepole" position={[30, 0, -14]} />
      <PolyProp type="telepole" position={[-8, 0, -34]} />
      <PolyProp type="telepole" position={[6, 0, -46]}  />
      <PolyProp type="telepole" position={[-16, 0, -38]}/>

      {/* ── BRIDGE + WATER (far from landmarks) ── */}
      <PolyProp type="bridge" position={[56, 0, -48]} rotation={Math.PI / 2} />
      <WaterArea position={[56, 0, -60]} size={[24, 20]} />

      {/* ── RUBBLE ── */}
      <Rubble position={[8, 0, 26]} />
      <Rubble position={[-16, 0, 6]} />
      <Rubble position={[34, 0, -8]} />
      <Rubble position={[-30, 0, -48]} />
    </>
  )
}

// ─── MAIN EXPORT ───
export default function GameWorld({ onSignActivate, onSignDeactivate, onKillPrompt, onKill, onPlayerMove, onNearPaper }) {
  const playerRef      = useRef()
  const cameraYaw      = useRef(0)
  const keys           = useRef({})
  const joystick       = useRef(null)
  const zombieKillFns  = useRef({})
  const nearZombies    = useRef({})
  const currentSign    = useRef(null)
  const handleKillRef  = useRef(null)

  const handleKill = useCallback(() => {
    let killed = false
    for (const [id, near] of Object.entries(nearZombies.current)) {
      if (near && zombieKillFns.current[id]) {
        zombieKillFns.current[id]()
        nearZombies.current[id] = false
        killed = true
      }
    }
    if (killed) {
      if (onKill) onKill()
      onKillPrompt(Object.values(nearZombies.current).some(v => v))
    }
  }, [onKill, onKillPrompt])

  useEffect(() => { handleKillRef.current = handleKill }, [handleKill])

  useEffect(() => {
    // Accept both e.code ('KeyF') and e.key ('f'/'F') to support synthetic events
    const down = (e) => {
      keys.current[e.code] = true
      if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') handleKillRef.current?.()
    }
    const up = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const handleNearSign = useCallback((sign) => {
    if (sign && sign !== currentSign.current) {
      currentSign.current = sign; onSignActivate(sign)
    } else if (!sign && currentSign.current) {
      currentSign.current = null; onSignDeactivate()
    }
  }, [onSignActivate, onSignDeactivate])

  const handleZombieNear = useCallback((id, near) => {
    nearZombies.current[id] = near
    onKillPrompt(Object.values(nearZombies.current).some(v => v))
  }, [onKillPrompt])

  const handleRegisterKill = useCallback((id, fn) => { zombieKillFns.current[id] = fn }, [])

  useEffect(() => {
    window.__gameSetJoystick   = (x, y) => { joystick.current = { x, y } }
    window.__gameClearJoystick = ()      => { joystick.current = null }
    window.__gameKill          = ()      => { handleKillRef.current?.() }
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 82], fov: 68 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, toneMappingExposure: 0.95 }}
    >
      <fog attach="fog" args={['#c89464', 80, 220]} />
      <Sky distance={450000} sunPosition={[2, 0.14, -1]} turbidity={7} rayleigh={2.8} mieCoefficient={0.006} mieDirectionalG={0.88} />
      <ambientLight intensity={1.4} color="#f5c870" />
      <directionalLight position={[40, 18, -20]} intensity={2.8} color="#ffaa38" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-100} shadow-camera-right={100}
        shadow-camera-top={100} shadow-camera-bottom={-100} />
      <hemisphereLight intensity={0.9} groundColor="#7a5028" color="#ffd090" />
      <pointLight position={[-40, 15, 0]} color="#ff7020" intensity={1.5} distance={80} />

      <Suspense fallback={null}>
        <Ground />
        <GrassField />
        <AbandonedRoad />
        <Environment />

        {LANDMARKS.map(lm => (
          <SignPole key={lm.id} position={lm.pos} label={lm.label} isNear={currentSign.current?.id === lm.id} />
        ))}

        <Player
          playerRef={playerRef}
          keys={keys}
          joystick={joystick}
          cameraYaw={cameraYaw}
          onNearSign={handleNearSign}
          onMove={onPlayerMove}
        />

        {ZOMBIE_SPAWNS.map((z, i) => (
          <ZombieNPC key={i} id={i} spawn={z} playerRef={playerRef}
            onNear={handleZombieNear} onRegisterKill={handleRegisterKill} />
        ))}

        <WindPapers playerRef={playerRef} onNearPaper={onNearPaper} />
        <ThirdPersonCamera target={playerRef} cameraYaw={cameraYaw} />

        <Sparkles count={120} scale={[100, 20, 100]} size={2} speed={0.1} color="#e08030" opacity={0.25} />
        <Sparkles count={60}  scale={[80, 10, 80]}   size={1} speed={0.2} color="#ffb050" opacity={0.15} />
      </Suspense>
    </Canvas>
  )
}
