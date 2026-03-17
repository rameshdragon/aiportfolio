import { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Stars, Sparkles, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { Ground, WaterArea } from './Ground'
import { PolyBuilding } from './PolyBuildings'
import { PolyVeg } from './PolyVegetation'
import { Car, PowerPole, Bridge, Rubble } from './Props'
import { SignPole } from './SignPole'
import { PlayerModel } from '../characters/PlayerModel'
import { ZombieModel } from '../characters/ZombieModel'

// ─── GAME CONFIG ───
const MOVE_SPEED = 0.08
const SIGN_RANGE = 4
const KILL_RANGE = 3

const LANDMARKS = [
  { pos: [0, 0, 28], id: 'start', label: 'RAMESH REDDY', section: 'intro' },
  { pos: [20, 0, 16], id: 'experience', label: 'EXPERIENCE', section: 'experience' },
  { pos: [22, 0, -4], id: 'projects', label: 'PROJECTS', section: 'projects' },
  { pos: [-16, 0, -2], id: 'skills', label: 'SKILLS', section: 'skills' },
  { pos: [-8, 0, -28], id: 'contact', label: 'CONTACT ME', section: 'contact' },
]

const ZOMBIE_SPAWNS = [
  { pos: [8, 0, 20], type: 0 },
  { pos: [-10, 0, 14], type: 1 },
  { pos: [14, 0, 4], type: 2 },
  { pos: [-6, 0, -12], type: 0 },
  { pos: [10, 0, -10], type: 1 },
  { pos: [-14, 0, -18], type: 2 },
  { pos: [4, 0, -20], type: 0 },
  { pos: [18, 0, -14], type: 1 },
]

// ─── COLLISION BOXES (buildings, water, etc.) ───
const COLLIDERS = [
  // Buildings
  { pos: [-8, 0, 22], size: [5, 4, 5] },
  { pos: [10, 0, 24], size: [4, 6, 4] },
  { pos: [-18, 0, 8], size: [6, 5, 5] },
  { pos: [16, 0, 10], size: [4, 4, 4] },
  { pos: [-4, 0, 4], size: [5, 7, 6] },
  { pos: [8, 0, -6], size: [4, 5, 4] },
  { pos: [-12, 0, -10], size: [5, 4, 5] },
  { pos: [24, 0, 0], size: [4, 6, 4] },
  { pos: [-20, 0, -14], size: [4, 4, 4] },
  { pos: [14, 0, -18], size: [5, 5, 5] },
  { pos: [0, 0, -14], size: [6, 8, 6] },
  // Water area — split to leave a ~10-unit gap around x=-8 so player can reach CONTACT ME
  { pos: [-22, 0, -30], size: [8, 2, 14] },   // far-left water block
  { pos: [-2, 0, -30], size: [10, 2, 14] },    // right water block
]

function checkCollision(x, z, colliders, radius = 0.5) {
  for (const c of colliders) {
    const hw = c.size[0] / 2 + radius
    const hd = c.size[2] / 2 + radius
    if (Math.abs(x - c.pos[0]) < hw && Math.abs(z - c.pos[2]) < hd) {
      return true
    }
  }
  return false
}

// ─── THIRD PERSON CAMERA ───
function ThirdPersonCamera({ target }) {
  const { camera } = useThree()
  const yaw = useRef(Math.PI)    // horizontal angle – starts behind player
  const pitch = useRef(0.45)     // vertical angle
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const RADIUS = 11

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
      yaw.current -= dx * 0.007
      pitch.current = Math.max(0.08, Math.min(1.25, pitch.current + dy * 0.005))
    }
    const noCtx = (e) => e.preventDefault()
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('contextmenu', noCtx)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('contextmenu', noCtx)
    }
  }, [])

  useFrame(() => {
    if (!target.current) return
    const px = target.current.position.x
    const pz = target.current.position.z
    const cosP = Math.cos(pitch.current)
    const sinP = Math.sin(pitch.current)
    const desiredX = px + RADIUS * Math.sin(yaw.current) * cosP
    const desiredY = 1.5 + RADIUS * sinP
    const desiredZ = pz + RADIUS * Math.cos(yaw.current) * cosP
    camera.position.lerp(new THREE.Vector3(desiredX, desiredY, desiredZ), 0.07)
    camera.lookAt(new THREE.Vector3(px, 1.5, pz))
  })

  return null
}

// ─── PLAYER CONTROLLER ───
function Player({ playerRef, keys, joystick, onNearSign, onNearZombie }) {
  const groupRef = useRef()
  const [moving, setMoving] = useState(false)
  const [dir, setDir] = useState(0)

  useEffect(() => {
    if (playerRef) playerRef.current = groupRef.current
  })

  useFrame(() => {
    if (!groupRef.current) return

    let dx = 0, dz = 0

    if (keys.current.ArrowLeft || keys.current.KeyA) dx -= 1
    if (keys.current.ArrowRight || keys.current.KeyD) dx += 1
    if (keys.current.ArrowUp || keys.current.KeyW) dz -= 1
    if (keys.current.ArrowDown || keys.current.KeyS) dz += 1

    if (joystick.current) {
      dx += joystick.current.x
      dz += joystick.current.y
    }

    const len = Math.sqrt(dx * dx + dz * dz)
    if (len > 0.1) {
      dx = (dx / len) * MOVE_SPEED
      dz = (dz / len) * MOVE_SPEED

      const nx = groupRef.current.position.x + dx
      const nz = groupRef.current.position.z + dz

      if (!checkCollision(nx, groupRef.current.position.z, COLLIDERS)) {
        groupRef.current.position.x = nx
      }
      if (!checkCollision(groupRef.current.position.x, nz, COLLIDERS)) {
        groupRef.current.position.z = nz
      }

      // Face movement direction
      const angle = Math.atan2(dx, dz)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        0.15
      )

      setMoving(true)
    } else {
      setMoving(false)
    }

    // Check landmarks
    const px = groupRef.current.position.x
    const pz = groupRef.current.position.z
    let nearSign = null
    for (const lm of LANDMARKS) {
      const dist = Math.sqrt((px - lm.pos[0]) ** 2 + (pz - lm.pos[2]) ** 2)
      if (dist < SIGN_RANGE) { nearSign = lm; break }
    }
    onNearSign(nearSign)
  })

  return (
    <group ref={groupRef} position={[0, 0, 30]}>
      <PlayerModel moving={moving} direction={dir} />
    </group>
  )
}

// ─── ZOMBIE NPC ───
function ZombieNPC({ spawn, playerRef, onNear, id, onRegisterKill }) {
  const ref = useRef()
  const [alive, setAlive] = useState(true)
  const [dying, setDying] = useState(false)
  const deathProgress = useRef(0)
  const moveDir = useRef(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize())
  const moveTimer = useRef(0)
  const startPos = useRef(new THREE.Vector3(...spawn.pos))

  useFrame(({ clock }) => {
    if (!ref.current || !alive) {
      if (dying) {
        deathProgress.current = Math.min(1, deathProgress.current + 0.03)
        if (deathProgress.current >= 1) setDying(false)
      }
      return
    }

    // Shamble around
    moveTimer.current++
    if (moveTimer.current > 100 + Math.random() * 100) {
      moveTimer.current = 0
      moveDir.current.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()
    }

    const speed = 0.015
    const nx = ref.current.position.x + moveDir.current.x * speed
    const nz = ref.current.position.z + moveDir.current.z * speed

    // Stay near spawn
    const distFromSpawn = Math.sqrt(
      (nx - startPos.current.x) ** 2 + (nz - startPos.current.z) ** 2
    )
    if (distFromSpawn < 4 && !checkCollision(nx, nz, COLLIDERS, 0.3)) {
      ref.current.position.x = nx
      ref.current.position.z = nz
    } else {
      moveDir.current.negate()
    }

    // Face direction
    ref.current.rotation.y = Math.atan2(moveDir.current.x, moveDir.current.z)

    // Check if player is near
    if (playerRef.current) {
      const dist = ref.current.position.distanceTo(playerRef.current.position)
      if (dist < KILL_RANGE) {
        onNear(id, true)
      } else {
        onNear(id, false)
      }
    }
  })

  const kill = useCallback(() => {
    setAlive(false)
    setDying(true)
    deathProgress.current = 0
  }, [])

  // Register kill function with parent
  useEffect(() => {
    if (onRegisterKill) onRegisterKill(id, kill)
  }, [id, kill, onRegisterKill])

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
      {/* Buildings — 5 unique GLBs, each recolored so no duplicate type+color exists */}
      {/* apartment: gray, rust, teal, navy */}
      <PolyBuilding type="apartment" position={[-8, 0, 22]}  rotation={0.2}  color="#b0a898" />
      <PolyBuilding type="apartment" position={[8, 0, -6]}   rotation={-0.3} color="#c04828" />
      <PolyBuilding type="apartment" position={[0, 0, -14]}  rotation={0.1}  color="#38a888" />
      <PolyBuilding type="apartment" position={[-12, 0, -10]} rotation={0.8} color="#2858b8" />
      {/* large: steel-blue, amber */}
      <PolyBuilding type="large"     position={[10, 0, 24]}  rotation={-0.1} color="#8898b0" />
      <PolyBuilding type="large"     position={[24, 0, 0]}   rotation={0.5}  color="#c87828" />
      {/* houses: olive, golden */}
      <PolyBuilding type="houses"    position={[-18, 0, 8]}  rotation={0.4}  color="#788840" />
      <PolyBuilding type="houses"    position={[16, 0, 10]}  rotation={-0.6} color="#c8a028" />
      {/* fantasy: violet, cyan */}
      <PolyBuilding type="fantasy"   position={[-4, 0, 4]}   rotation={0.3}  color="#7848c8" />
      <PolyBuilding type="fantasy"   position={[-20, 0, -14]} rotation={-0.4} color="#28b8c8" />
      {/* cabin: brown, crimson */}
      <PolyBuilding type="cabin"     position={[14, 0, -18]} rotation={0.7}  color="#c07838" />
      <PolyBuilding type="cabin"     position={[4, 0, 26]}   rotation={0.3}  color="#a82838" />
      <PolyBuilding type="cabin"     position={[-14, 0, 18]} rotation={-0.5} color="#5838a8" />

      {/* Cars */}
      <Car position={[6, 0, 22]} rotation={0.4} color="#4a1a1a" />
      <Car position={[-6, 0, 16]} rotation={-0.3} color="#2a2a3a" />
      <Car position={[18, 0, -8]} rotation={1.2} color="#3a2a15" />
      <Car position={[-10, 0, -4]} rotation={0.8} />
      <Car position={[12, 0, 14]} rotation={-0.6} color="#2a3a2a" />

      {/* Trees — deadtree + birch, each with unique colors */}
      <PolyVeg type="deadtree" position={[-14, 0, 2]}   rotation={0.4}  color="#a09080" />
      <PolyVeg type="deadtree" position={[20, 0, 22]}   rotation={-0.2} color="#c07850" />
      <PolyVeg type="deadtree" position={[-6, 0, -22]}  rotation={1.1}  color="#7088a8" />
      <PolyVeg type="birch"    position={[-22, 0, -6]}  rotation={0.6}  color="#98c878" />
      <PolyVeg type="birch"    position={[8, 0, -14]}   rotation={-0.8} color="#c8b840" />
      <PolyVeg type="birch"    position={[22, 0, -12]}  rotation={0.2}  color="#408858" />

      {/* Ground cover — bushes + grass variants, each unique type+color */}
      <PolyVeg type="bushes"      position={[-10, 0, 12]}  rotation={0.3}  color="#4a7830" />
      <PolyVeg type="bushes"      position={[14, 0, 8]}    rotation={-0.5} color="#286840" />
      <PolyVeg type="bushes"      position={[-4, 0, -24]}  rotation={0.9}  color="#785028" />
      <PolyVeg type="grass"       position={[-16, 0, -8]}  rotation={0.1}  color="#507830" />
      <PolyVeg type="grass"       position={[6, 0, -16]}   rotation={-0.4} color="#386828" />
      <PolyVeg type="grasspatch"  position={[18, 0, 4]}    rotation={0.7}  color="#608040" />
      <PolyVeg type="grasspatch"  position={[-18, 0, -20]} rotation={-0.2} color="#486030" />
      <PolyVeg type="grassyellow" position={[2, 0, 16]}    rotation={0.5}  color="#b8a030" />
      <PolyVeg type="grassyellow" position={[-8, 0, -6]}   rotation={-0.6} color="#a07828" />

      {/* Power poles */}
      <PowerPole position={[2, 0, 20]} />
      <PowerPole position={[-12, 0, 6]} />
      <PowerPole position={[10, 0, -2]} />
      <PowerPole position={[-8, 0, -16]} />

      {/* Bridge over water */}
      <Bridge position={[-6, -0.2, -24]} rotation={0} length={8} />

      {/* Rubble */}
      <Rubble position={[4, 0, 14]} />
      <Rubble position={[-8, 0, -2]} />
      <Rubble position={[16, 0, -6]} />
      <Rubble position={[-16, 0, -20]} />

      {/* Water */}
      <WaterArea position={[-14, 0, -32]} size={[22, 16]} />

      {/* Road paths (flat darker ground strips) */}
      {[
        [0, 28, 0], [0, 24, 0], [0, 20, 0], [4, 18, Math.PI/4],
        [10, 16, 0], [16, 16, 0], [20, 16, 0],
        [4, 16, 0], [0, 14, 0], [0, 10, 0],
        [-4, 8, -Math.PI/6], [-8, 6, 0], [-12, 4, 0], [-16, 2, Math.PI/6],
        [-16, -2, 0], [0, 8, Math.PI/5],
        [6, 4, 0], [10, 2, 0], [14, 0, 0], [18, -2, Math.PI/6],
        [22, -4, 0], [0, -2, 0], [-4, -6, 0], [-8, -10, Math.PI/4],
        [-8, -14, 0], [-8, -18, 0], [-8, -22, 0], [-8, -26, 0],
      ].map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, r || 0]} position={[x, 0.02, z]} receiveShadow>
          <planeGeometry args={[4, 5]} />
          <meshStandardMaterial color="#2a2218" roughness={0.92} />
        </mesh>
      ))}
    </>
  )
}

// ─── MAIN EXPORT ───
export default function GameWorld({ onSignActivate, onSignDeactivate, onKillPrompt, onKill }) {
  const playerRef = useRef()
  const keys = useRef({})
  const joystick = useRef(null)
  const zombieKillFns = useRef({})
  const nearZombies = useRef({})
  const currentSign = useRef(null)
  const handleKillRef = useRef(null)

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
      const anyNear = Object.values(nearZombies.current).some(v => v)
      onKillPrompt(anyNear)
    }
  }, [onKill, onKillPrompt])

  // Keep ref in sync so keydown handler always has the latest version
  useEffect(() => { handleKillRef.current = handleKill }, [handleKill])

  // Keyboard
  useEffect(() => {
    const down = (e) => { keys.current[e.code] = true; if (e.code === 'KeyF') handleKillRef.current?.() }
    const up = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
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
    const anyNear = Object.values(nearZombies.current).some(v => v)
    onKillPrompt(anyNear)
  }, [onKillPrompt])

  const handleRegisterKill = useCallback((id, fn) => {
    zombieKillFns.current[id] = fn
  }, [])

  // Expose joystick setter
  useEffect(() => {
    window.__gameSetJoystick = (x, y) => { joystick.current = { x, y } }
    window.__gameClearJoystick = () => { joystick.current = null }
    window.__gameKill = () => handleKillRef.current?.()
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 38], fov: 70 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, toneMappingExposure: 1.6 }}
    >
      {/* Atmosphere */}
      <fog attach="fog" args={['#0a1620', 35, 90]} />
      <ambientLight intensity={0.7} color="#8aa8c0" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.4}
        color="#ffe8c0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <pointLight position={[0, 8, 28]} color="#ff8855" intensity={1.2} distance={25} />
      <hemisphereLight intensity={0.4} groundColor="#1a1e22" color="#4a7090" />

      <Suspense fallback={null}>
        <Ground />
        <Environment />
        <Stars radius={100} depth={50} count={2000} factor={3} fade speed={0.5} />

        {/* Sign poles */}
        {LANDMARKS.map(lm => (
          <SignPole
            key={lm.id}
            position={lm.pos}
            label={lm.label}
            isNear={currentSign.current?.id === lm.id}
          />
        ))}

        {/* Player */}
        <Player
          playerRef={playerRef}
          keys={keys}
          joystick={joystick}
          onNearSign={handleNearSign}
          onNearZombie={() => {}}
        />

        {/* Zombies */}
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

        <ThirdPersonCamera target={playerRef} />

        {/* Ambient particles */}
        <Sparkles count={80} scale={[60, 15, 60]} size={1.5} speed={0.2} color="#2a4a5a" opacity={0.3} />
      </Suspense>
    </Canvas>
  )
}
