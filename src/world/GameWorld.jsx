import { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Sparkles, Text, Billboard } from '@react-three/drei'
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
const MOVE_SPEED = 0.1
const SIGN_RANGE = 5
const KILL_RANGE = 3

const LANDMARKS = [
  { pos: [0, 0, 50],   id: 'start',      label: 'RAMESH REDDY',  section: 'intro' },
  { pos: [45, 0, 30],  id: 'experience', label: 'EXPERIENCE',    section: 'experience' },
  { pos: [50, 0, -10], id: 'projects',   label: 'PROJECTS',      section: 'projects' },
  { pos: [-35, 0, -8], id: 'skills',     label: 'SKILLS',        section: 'skills' },
  { pos: [-16, 0, -56],id: 'contact',    label: 'CONTACT ME',    section: 'contact' },
]

const ZOMBIE_SPAWNS = [
  { pos: [18, 0, 44],  type: 0 },
  { pos: [-20, 0, 30], type: 1 },
  { pos: [34, 0, 14],  type: 2 },
  { pos: [-12, 0, -20],type: 0 },
  { pos: [22, 0, -24], type: 1 },
  { pos: [-30, 0, -42],type: 2 },
  { pos: [10, 0, -44], type: 0 },
  { pos: [38, 0, -28], type: 1 },
]

// ─── COLLIDERS ───
// Buildings + boundaries
const COLLIDERS = [
  // Apartments  (footprint ~9x9)
  { pos: [-22, 0, 44],  size: [9, 16, 9] },
  { pos: [20, 0, -14],  size: [9, 16, 9] },
  { pos: [2, 0, -30],   size: [9, 16, 9] },
  { pos: [-24, 0, -20], size: [9, 16, 9] },
  // Large       (footprint ~11x11)
  { pos: [24, 0, 52],   size: [11, 20, 11] },
  { pos: [52, 0, 4],    size: [11, 20, 11] },
  // Houses      (footprint ~10x10)
  { pos: [-40, 0, 18],  size: [10, 13, 10] },
  { pos: [36, 0, 22],   size: [10, 13, 10] },
  // Fantasy     (footprint ~9x9)
  { pos: [-10, 0, 10],  size: [9, 18, 9] },
  { pos: [-44, 0, -28], size: [9, 18, 9] },
  // Cabin       (footprint ~8x8)
  { pos: [30, 0, -36],  size: [8, 11, 8] },
  { pos: [-6, 0, 66],   size: [8, 11, 8] },
  { pos: [-32, 0, 38],  size: [8, 11, 8] },
  // Map boundaries (invisible walls)
  { pos: [0,   0,  85], size: [200, 10, 4] },
  { pos: [0,   0, -85], size: [200, 10, 4] },
  { pos: [85,  0,   0], size: [4,   10, 200] },
  { pos: [-85, 0,   0], size: [4,   10, 200] },
]

function checkCollision(x, z, colliders, radius = 0.5) {
  for (const c of colliders) {
    const hw = c.size[0] / 2 + radius
    const hd = c.size[2] / 2 + radius
    if (Math.abs(x - c.pos[0]) < hw && Math.abs(z - c.pos[2]) < hd) return true
  }
  return false
}

// ─── THIRD PERSON CAMERA ───
function ThirdPersonCamera({ target, cameraYaw }) {
  const { camera } = useThree()
  const yaw   = useRef(0)      // 0 = camera behind player (higher Z)
  const pitch = useRef(0.42)
  const isDragging = useRef(false)
  const lastMouse  = useRef({ x: 0, y: 0 })
  const RADIUS = 12

  useEffect(() => {
    const onDown = (e) => { isDragging.current = true;  lastMouse.current = { x: e.clientX, y: e.clientY } }
    const onUp   = () =>  { isDragging.current = false }
    const onMove = (e) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
      yaw.current   += dx * 0.007
      pitch.current  = Math.max(0.1, Math.min(1.2, pitch.current + dy * 0.005))
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
  }, [])

  useFrame(() => {
    if (!target.current) return
    // Share yaw so Player can do camera-relative movement
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

  useEffect(() => {
    if (playerRef) playerRef.current = groupRef.current
  })

  useFrame(() => {
    if (!groupRef.current) return

    // Raw directional input (camera-space)
    let fwd = 0, rgt = 0

    if (keys.current.ArrowUp   || keys.current.KeyW) fwd =  1
    if (keys.current.ArrowDown || keys.current.KeyS) fwd = -1
    if (keys.current.ArrowLeft || keys.current.KeyA) rgt = -1
    if (keys.current.ArrowRight|| keys.current.KeyD) rgt =  1

    if (joystick.current) {
      fwd -= joystick.current.y   // joystick Y+ = forward
      rgt += joystick.current.x   // joystick X+ = strafe right
    }

    const len = Math.sqrt(fwd * fwd + rgt * rgt)
    if (len > 0.1) {
      fwd /= len; rgt /= len

      // Rotate input from camera-space to world-space
      const y = cameraYaw.current
      const sinY = Math.sin(y), cosY = Math.cos(y)
      const dx = fwd * (-sinY) + rgt * cosY
      const dz = fwd * (-cosY) + rgt * (-sinY)

      const nx = groupRef.current.position.x + dx * MOVE_SPEED
      const nz = groupRef.current.position.z + dz * MOVE_SPEED

      if (!checkCollision(nx, groupRef.current.position.z, COLLIDERS))
        groupRef.current.position.x = nx
      if (!checkCollision(groupRef.current.position.x, nz, COLLIDERS))
        groupRef.current.position.z = nz

      // Face movement direction
      const angle = Math.atan2(dx, dz)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, angle, 0.15
      )

      setMoving(true)
      onMove?.()
    } else {
      setMoving(false)
    }

    // Landmark proximity
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
  const ref = useRef()
  const [alive, setAlive]   = useState(true)
  const [dying, setDying]   = useState(false)
  const deathProgress       = useRef(0)
  const moveDir             = useRef(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize())
  const moveTimer           = useRef(0)
  const startPos            = useRef(new THREE.Vector3(...spawn.pos))

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
      onNear(id, dist < KILL_RANGE)
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
      {/* ── BUILDINGS (13 total, well-spaced) ── */}
      <PolyBuilding type="apartment" position={[-22, 0, 44]}  rotation={0.2}   color="#b0a898" />
      <PolyBuilding type="apartment" position={[20, 0, -14]}  rotation={-0.3}  color="#c04828" />
      <PolyBuilding type="apartment" position={[2, 0, -30]}   rotation={0.1}   color="#38a888" />
      <PolyBuilding type="apartment" position={[-24, 0, -20]} rotation={0.8}   color="#2858b8" />
      <PolyBuilding type="large"     position={[24, 0, 52]}   rotation={-0.1}  color="#8898b0" />
      <PolyBuilding type="large"     position={[52, 0, 4]}    rotation={0.5}   color="#c87828" />
      <PolyBuilding type="houses"    position={[-40, 0, 18]}  rotation={0.4}   color="#788840" />
      <PolyBuilding type="houses"    position={[36, 0, 22]}   rotation={-0.6}  color="#c8a028" />
      <PolyBuilding type="fantasy"   position={[-10, 0, 10]}  rotation={0.3}   color="#7848c8" />
      <PolyBuilding type="fantasy"   position={[-44, 0, -28]} rotation={-0.4}  color="#28b8c8" />
      <PolyBuilding type="cabin"     position={[30, 0, -36]}  rotation={0.7}   color="#c07838" />
      <PolyBuilding type="cabin"     position={[-6, 0, 66]}   rotation={0.3}   color="#a82838" />
      <PolyBuilding type="cabin"     position={[-32, 0, 38]}  rotation={-0.5}  color="#5838a8" />

      {/* ── TREES (dead + birch) ── */}
      <PolyVeg type="deadtree" position={[-28, 0, 6]}    rotation={0.4}  color="#a09080" />
      <PolyVeg type="deadtree" position={[26, 0, -6]}    rotation={-0.3} color="#c07850" />
      <PolyVeg type="deadtree" position={[-14, 0, -46]}  rotation={1.1}  color="#7088a8" />
      <PolyVeg type="deadtree" position={[38, 0, -20]}   rotation={0.2}  color="#a88060" />
      <PolyVeg type="deadtree" position={[-50, 0, 10]}   rotation={0.8}  color="#907860" />
      <PolyVeg type="deadtree" position={[56, 0, -30]}   rotation={-0.6} color="#b09070" />
      <PolyVeg type="birch"    position={[-16, 0, 36]}   rotation={0.6}  color="#98c878" />
      <PolyVeg type="birch"    position={[10, 0, 40]}    rotation={-0.8} color="#c8b840" />
      <PolyVeg type="birch"    position={[-46, 0, 28]}   rotation={0.2}  color="#408858" />
      <PolyVeg type="birch"    position={[60, 0, -2]}    rotation={0.5}  color="#80c860" />
      <PolyVeg type="birch"    position={[18, 0, -46]}   rotation={-0.4} color="#a0d870" />
      <PolyVeg type="birch"    position={[-22, 0, -36]}  rotation={1.0}  color="#60a850" />
      <PolyVeg type="birch"    position={[38, 0, 42]}    rotation={0.3}  color="#78c040" />
      <PolyVeg type="birch"    position={[-54, 0, -14]}  rotation={-0.7} color="#90d068" />

      {/* ── BUSHES ── */}
      <PolyVeg type="bushes"      position={[-18, 0, 40]}  rotation={0.3}  color="#4a7830" />
      <PolyVeg type="bushes"      position={[-28, 0, 50]}  rotation={-0.5} color="#286840" />
      <PolyVeg type="bushes"      position={[18, 0, 46]}   rotation={0.9}  color="#785028" />
      <PolyVeg type="bushes"      position={[28, 0, 58]}   rotation={0.1}  color="#5a8030" />
      <PolyVeg type="bushes"      position={[46, 0, 10]}   rotation={0.7}  color="#3a6820" />
      <PolyVeg type="bushes"      position={[56, 0, -6]}   rotation={-0.2} color="#687838" />
      <PolyVeg type="bushes"      position={[-38, 0, 24]}  rotation={0.4}  color="#507030" />
      <PolyVeg type="bushes"      position={[32, 0, 16]}   rotation={-0.6} color="#486028" />
      <PolyVeg type="bushes"      position={[-8, 0, 16]}   rotation={0.5}  color="#608040" />
      <PolyVeg type="bushes"      position={[-44, 0, -22]} rotation={0.2}  color="#786030" />
      <PolyVeg type="bushes"      position={[26, 0, -28]}  rotation={-0.3} color="#507830" />
      <PolyVeg type="bushes"      position={[-28, 0, -26]} rotation={0.8}  color="#406030" />

      {/* ── GRASS PATCHES ── */}
      <PolyVeg type="grasspatch"  position={[6, 0, 34]}    rotation={0.7}  color="#608040" />
      <PolyVeg type="grasspatch"  position={[-8, 0, 26]}   rotation={-0.2} color="#486030" />
      <PolyVeg type="grasspatch"  position={[30, 0, -2]}   rotation={0.4}  color="#507038" />
      <PolyVeg type="grasspatch"  position={[-20, 0, -12]} rotation={0.1}  color="#5a7840" />
      <PolyVeg type="grasspatch"  position={[42, 0, -26]}  rotation={0.6}  color="#488038" />
      <PolyVeg type="grasspatch"  position={[-12, 0, -50]} rotation={-0.4} color="#406030" />
      <PolyVeg type="grasspatch"  position={[8, 0, -54]}   rotation={0.2}  color="#548040" />
      <PolyVeg type="grasspatch"  position={[-36, 0, -44]} rotation={0.9}  color="#486838" />
      <PolyVeg type="grass"       position={[-4, 0, 42]}   rotation={0.1}  color="#507830" />
      <PolyVeg type="grass"       position={[38, 0, 10]}   rotation={-0.4} color="#386828" />
      <PolyVeg type="grass"       position={[-26, 0, -28]} rotation={0.5}  color="#5a8030" />
      <PolyVeg type="grass"       position={[16, 0, -40]}  rotation={-0.6} color="#488038" />
      <PolyVeg type="grassyellow" position={[14, 0, 20]}   rotation={0.5}  color="#b8a030" />
      <PolyVeg type="grassyellow" position={[-32, 0, 14]}  rotation={-0.3} color="#a07828" />
      <PolyVeg type="grassyellow" position={[22, 0, -30]}  rotation={0.7}  color="#c0a020" />
      <PolyVeg type="grassyellow" position={[-48, 0, -36]} rotation={0.2}  color="#b09030" />

      {/* ── CARS ── */}
      <PolyProp type="brokencar" position={[12, 0, 48]}   rotation={0.4}  color="#6a3a1a" />
      <PolyProp type="brokencar" position={[26, 0, -24]}  rotation={1.2}  color="#5a4a20" />
      <PolyProp type="brokencar" position={[-18, 0, -30]} rotation={0.6}  color="#4a2a40" />
      <PolyProp type="rover"     position={[-14, 0, 32]}  rotation={-0.3} color="#3a3a5a" />
      <PolyProp type="rover"     position={[42, 0, 18]}   rotation={0.8}  color="#2a4a2a" />
      <PolyProp type="rover"     position={[36, 0, -48]}  rotation={-0.5} color="#4a3020" />

      {/* ── TELEPHONE POLES ── */}
      <PolyProp type="telepole" position={[4, 0, 42]}    rotation={0.1} />
      <PolyProp type="telepole" position={[-6, 0, 22]}   rotation={-0.2} />
      <PolyProp type="telepole" position={[20, 0, 8]}    rotation={0.3} />
      <PolyProp type="telepole" position={[-22, 0, 4]}   rotation={0.0} />
      <PolyProp type="telepole" position={[30, 0, -14]}  rotation={0.2} />
      <PolyProp type="telepole" position={[-8, 0, -34]}  rotation={-0.1} />
      <PolyProp type="telepole" position={[6, 0, -46]}   rotation={0.4} />
      <PolyProp type="telepole" position={[-16, 0, -38]} rotation={0.0} />

      {/* ── BRIDGE + WATER (far east, away from contact sign) ── */}
      <PolyProp type="bridge" position={[56, 0, -48]} rotation={Math.PI / 2} />
      <WaterArea position={[56, 0, -60]} size={[24, 20]} />

      {/* ── RUBBLE ── */}
      <Rubble position={[8, 0, 26]} />
      <Rubble position={[-16, 0, 6]} />
      <Rubble position={[34, 0, -8]} />
      <Rubble position={[-30, 0, -48]} />

      {/* ── ROADS (warm sandy strips between landmarks) ── */}
      {/* N-S spine */}
      {[-8,-16,-24,-32,-40,-48,-56, 0,8,16,24,32,40,48,56,64].map((z, i) => (
        <mesh key={`ns${i}`} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, z]} receiveShadow>
          <planeGeometry args={[5, 8]} />
          <meshStandardMaterial color="#8a6e48" roughness={0.9} />
        </mesh>
      ))}
      {/* E branch toward experience */}
      {[8,16,24,32,40].map((x, i) => (
        <mesh key={`e${i}`} rotation={[-Math.PI/2, 0, Math.PI/2]} position={[x, 0.02, 30]} receiveShadow>
          <planeGeometry args={[5, 8]} />
          <meshStandardMaterial color="#8a6e48" roughness={0.9} />
        </mesh>
      ))}
      {/* E-S branch experience→projects */}
      {[18,10,0,-8].map((z, i) => (
        <mesh key={`es${i}`} rotation={[-Math.PI/2, 0, 0]} position={[46, 0.02, z]} receiveShadow>
          <planeGeometry args={[5, 8]} />
          <meshStandardMaterial color="#8a6e48" roughness={0.9} />
        </mesh>
      ))}
      {/* W branch toward skills */}
      {[-8,-16,-24,-32].map((x, i) => (
        <mesh key={`w${i}`} rotation={[-Math.PI/2, 0, Math.PI/2]} position={[x, 0.02, -8]} receiveShadow>
          <planeGeometry args={[5, 8]} />
          <meshStandardMaterial color="#8a6e48" roughness={0.9} />
        </mesh>
      ))}
      {/* SW path toward contact */}
      {[-14,-22,-30,-38,-46,-54].map((z, i) => (
        <mesh key={`sw${i}`} rotation={[-Math.PI/2, 0, 0]} position={[-16, 0.02, z]} receiveShadow>
          <planeGeometry args={[5, 8]} />
          <meshStandardMaterial color="#8a6e48" roughness={0.9} />
        </mesh>
      ))}
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
    const down = (e) => { keys.current[e.code] = true;  if (e.code === 'KeyF') handleKillRef.current?.() }
    const up   = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const handleNearSign = useCallback((sign) => {
    if (sign && sign !== currentSign.current) {
      currentSign.current = sign
      onSignActivate(sign)
    } else if (!sign && currentSign.current) {
      currentSign.current = null
      onSignDeactivate()
    }
  }, [onSignActivate, onSignDeactivate])

  const handleZombieNear = useCallback((id, near) => {
    nearZombies.current[id] = near
    onKillPrompt(Object.values(nearZombies.current).some(v => v))
  }, [onKillPrompt])

  const handleRegisterKill = useCallback((id, fn) => { zombieKillFns.current[id] = fn }, [])

  useEffect(() => {
    window.__gameSetJoystick  = (x, y) => { joystick.current = { x, y } }
    window.__gameClearJoystick = () =>    { joystick.current = null }
    window.__gameKill          = () =>    { handleKillRef.current?.() }
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 82], fov: 68 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, toneMappingExposure: 0.95 }}
    >
      {/* ── ATMOSPHERE ── */}
      <fog attach="fog" args={['#c89464', 80, 220]} />

      {/* Evening golden-hour sky */}
      <Sky
        distance={450000}
        sunPosition={[2, 0.14, -1]}
        turbidity={7}
        rayleigh={2.8}
        mieCoefficient={0.006}
        mieDirectionalG={0.88}
      />

      {/* Warm evening lighting */}
      <ambientLight intensity={1.4} color="#f5c870" />
      <directionalLight
        position={[40, 18, -20]}
        intensity={2.8}
        color="#ffaa38"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight intensity={0.9} groundColor="#7a5028" color="#ffd090" />

      {/* Warm fill from west (sunset side) */}
      <pointLight position={[-40, 15, 0]} color="#ff7020" intensity={1.5} distance={80} />

      <Suspense fallback={null}>
        <Ground />
        <Environment />

        {LANDMARKS.map(lm => (
          <SignPole
            key={lm.id}
            position={lm.pos}
            label={lm.label}
            isNear={currentSign.current?.id === lm.id}
          />
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
          <ZombieNPC
            key={i}
            id={i}
            spawn={z}
            playerRef={playerRef}
            onNear={handleZombieNear}
            onRegisterKill={handleRegisterKill}
          />
        ))}

        <WindPapers playerRef={playerRef} onNearPaper={onNearPaper} />

        <ThirdPersonCamera target={playerRef} cameraYaw={cameraYaw} />

        {/* Floating dust motes (apocalypse atmosphere) */}
        <Sparkles count={120} scale={[100, 20, 100]} size={2} speed={0.1} color="#e08030" opacity={0.25} />
        <Sparkles count={60}  scale={[80, 10, 80]}   size={1} speed={0.2} color="#ffb050" opacity={0.15} />
      </Suspense>
    </Canvas>
  )
}
