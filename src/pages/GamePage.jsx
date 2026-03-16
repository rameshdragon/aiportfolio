import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 460, H = 600
const SHIP_W = 36

function rand(min, max) { return Math.random() * (max - min) + min }

function drawShip(ctx, x, y, shielded) {
  ctx.save()
  ctx.translate(x, y)

  // Engine flame
  const fy = 26 + Math.random() * 8
  const fg = ctx.createRadialGradient(0, 22, 1, 0, 38, 18)
  fg.addColorStop(0, 'rgba(0,212,255,0.95)')
  fg.addColorStop(0.5, 'rgba(0,180,255,0.5)')
  fg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = fg
  ctx.beginPath()
  ctx.ellipse(-7, fy + 8, 4, 10 + Math.random() * 5, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(7, fy + 8, 4, 10 + Math.random() * 5, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Shield glow
  if (shielded) {
    ctx.strokeStyle = 'rgba(0,255,204,0.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(0, 0, 28, 32, 0, 0, Math.PI * 2)
    ctx.stroke()
    const sg = ctx.createRadialGradient(0, 0, 10, 0, 0, 32)
    sg.addColorStop(0, 'rgba(0,255,204,0)')
    sg.addColorStop(0.7, 'rgba(0,255,204,0.08)')
    sg.addColorStop(1, 'rgba(0,255,204,0.18)')
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.ellipse(0, 0, 28, 32, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Hull
  ctx.fillStyle = '#0a1628'
  ctx.strokeStyle = shielded ? '#00ffcc' : '#00d4ff'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, -22); ctx.lineTo(18, 20); ctx.lineTo(10, 12); ctx.lineTo(-10, 12); ctx.lineTo(-18, 20)
  ctx.closePath(); ctx.fill(); ctx.stroke()

  // Wings
  ctx.fillStyle = '#001a3d'
  ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(-26, 18); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(10, 4); ctx.lineTo(26, 18); ctx.lineTo(14, 14); ctx.closePath(); ctx.fill(); ctx.stroke()

  // Cockpit
  ctx.fillStyle = '#00d4ff'; ctx.globalAlpha = 0.65
  ctx.beginPath(); ctx.ellipse(0, -7, 5, 8, 0, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawAsteroid(ctx, a) {
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot)
  ctx.fillStyle = a.color + '18'; ctx.strokeStyle = a.color; ctx.lineWidth = 1.5
  ctx.beginPath()
  a.shape.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py))
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = a.color + '55'; ctx.lineWidth = 0.5
  ctx.beginPath()
  a.shape.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px * 0.5, py * 0.5) : ctx.lineTo(px * 0.5, py * 0.5))
  ctx.closePath(); ctx.stroke()
  ctx.restore()
}

function drawPowerup(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  const colors = { shield: '#00ffcc', rapid: '#ff9900', bomb: '#ff2d78', score: '#7b2fff' }
  const icons = { shield: '🛡', rapid: '⚡', bomb: '💣', score: '💎' }
  const c = colors[p.type]
  ctx.strokeStyle = c; ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6
    i === 0 ? ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14) : ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14)
  }
  ctx.closePath()
  ctx.fillStyle = c + '22'; ctx.fill(); ctx.stroke()
  ctx.font = '13px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(icons[p.type], 0, 0)
  ctx.restore()
}

function makeAsteroid(id) {
  const r = rand(16, 36), sides = Math.floor(rand(6, 11))
  const shape = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2
    return [Math.cos(a) * r * rand(0.6, 1), Math.sin(a) * r * rand(0.6, 1)]
  })
  return {
    id, x: rand(r, W - r), y: -r - 20, vy: rand(1.0, 2.8), vx: rand(-0.5, 0.5),
    rot: 0, vrot: rand(-0.03, 0.03), r, shape,
    color: ['#00d4ff', '#00ffcc', '#7b2fff', '#ff2d78', '#ff9900'][Math.floor(Math.random() * 5)],
  }
}

function makePowerup() {
  const types = ['shield', 'rapid', 'bomb', 'score']
  return {
    id: Math.random(),
    x: rand(30, W - 30), y: -30,
    vy: 1.2, rot: 0, vrot: 0.03,
    type: types[Math.floor(Math.random() * types.length)],
  }
}

function drawHUD(ctx, score, lives, level, shieldTime, rapidTime) {
  ctx.fillStyle = 'rgba(0,2,10,0.75)'
  ctx.fillRect(0, 0, W, 44)
  ctx.strokeStyle = 'rgba(0,212,255,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, 44); ctx.lineTo(W, 44); ctx.stroke()

  ctx.fillStyle = '#00d4ff'; ctx.font = '700 12px Orbitron, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${score}`, 14, 22)

  ctx.fillStyle = 'rgba(0,212,255,0.5)'; ctx.font = '10px Orbitron, sans-serif'
  ctx.fillText('SCORE', 14, 36)

  ctx.fillStyle = '#00ffcc'
  ctx.fillText(`LVL ${level}`, W / 2 - 22, 22)

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < lives ? '#ff2d78' : 'rgba(255,45,120,0.2)'
    ctx.beginPath(); ctx.arc(W - 70 + i * 22, 22, 6, 0, Math.PI * 2); ctx.fill()
  }

  // Shield bar
  if (shieldTime > 0) {
    ctx.fillStyle = 'rgba(0,255,204,0.15)'
    ctx.fillRect(0, 44, (shieldTime / 300) * W, 3)
    ctx.fillStyle = '#00ffcc'
    ctx.fillRect(0, 44, (shieldTime / 300) * W * 0.8, 3)
  }
  // Rapid fire bar
  if (rapidTime > 0) {
    ctx.fillStyle = 'rgba(255,153,0,0.15)'
    ctx.fillRect(0, 47, (rapidTime / 240) * W, 3)
    ctx.fillStyle = '#ff9900'
    ctx.fillRect(0, 47, (rapidTime / 240) * W * 0.8, 3)
  }

  // Scanline grid
  ctx.strokeStyle = 'rgba(0,212,255,0.04)'; ctx.lineWidth = 1
  for (let y = 50; y < H; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
}

export default function GamePage() {
  const canvasRef = useRef()
  const stateRef = useRef({
    ship: { x: W / 2, y: H - 90, vx: 0 },
    asteroids: [], bullets: [], powerups: [], particles: [],
    stars: Array.from({ length: 80 }, () => ({
      x: rand(0, W), y: rand(0, H), vy: rand(0.3, 1.0), r: rand(0.5, 1.8), a: rand(0.2, 0.7),
      c: Math.random() < 0.7 ? '#00d4ff' : Math.random() < 0.5 ? '#00ffcc' : '#ffffff',
    })),
    score: 0, lives: 3, level: 1,
    astTimer: 0, astInterval: 85,
    pwTimer: 0, pwInterval: 220,
    shieldTime: 0, rapidTime: 0,
    keys: {}, running: false, over: false, frame: 0, shootCooldown: 0,
  })
  const [uiScore, setUiScore] = useState(0)
  const [uiLives, setUiLives] = useState(3)
  const [uiLevel, setUiLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [notification, setNotification] = useState(null)
  const rafRef = useRef()
  const pausedRef = useRef(false)
  const astIdRef = useRef(0)

  const showNotif = useCallback((text, color) => {
    setNotification({ text, color })
    setTimeout(() => setNotification(null), 1400)
  }, [])

  const startGame = useCallback(() => {
    const s = stateRef.current
    s.ship = { x: W / 2, y: H - 90, vx: 0 }
    s.asteroids = []; s.bullets = []; s.powerups = []; s.particles = []
    s.score = 0; s.lives = 3; s.level = 1
    s.astTimer = 0; s.astInterval = 85
    s.pwTimer = 0; s.pwInterval = 220
    s.shieldTime = 0; s.rapidTime = 0
    s.running = true; s.over = false; s.frame = 0; s.shootCooldown = 0
    setUiScore(0); setUiLives(3); setUiLevel(1)
    setGameOver(false); setStarted(true)
    pausedRef.current = false; setPaused(false)
  }, [])

  useEffect(() => {
    const dn = (e) => { stateRef.current.keys[e.code] = true; if (e.code === 'Space') e.preventDefault() }
    const up = (e) => { stateRef.current.keys[e.code] = false }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    if (!started) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const loop = () => {
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(loop); return }
      const s = stateRef.current
      if (!s.running) return

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000408'; ctx.fillRect(0, 0, W, H)

      // Stars
      s.stars.forEach(st => {
        st.y += st.vy; if (st.y > H) { st.y = -2; st.x = rand(0, W) }
        ctx.globalAlpha = st.a; ctx.fillStyle = st.c
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      })

      const ks = s.keys
      // Move ship
      if (ks['ArrowLeft'] || ks['KeyA']) s.ship.vx = Math.max(s.ship.vx - 0.6, -6.5)
      else if (ks['ArrowRight'] || ks['KeyD']) s.ship.vx = Math.min(s.ship.vx + 0.6, 6.5)
      else s.ship.vx *= 0.87
      s.ship.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, s.ship.x + s.ship.vx))

      // Shoot
      const shotInterval = s.rapidTime > 0 ? 6 : 14
      if ((ks['Space'] || ks['KeyW'] || ks['ArrowUp']) && s.shootCooldown <= 0) {
        s.bullets.push({ x: s.ship.x, y: s.ship.y - 24, vy: -9 })
        if (s.rapidTime > 0) {
          s.bullets.push({ x: s.ship.x - 8, y: s.ship.y - 18, vy: -8.5 })
          s.bullets.push({ x: s.ship.x + 8, y: s.ship.y - 18, vy: -8.5 })
        }
        s.shootCooldown = shotInterval
      }
      if (s.shootCooldown > 0) s.shootCooldown--

      // Timers
      if (s.shieldTime > 0) s.shieldTime--
      if (s.rapidTime > 0) s.rapidTime--

      // Bullets
      s.bullets = s.bullets.filter(b => b.y > -10)
      s.bullets.forEach(b => {
        b.y += b.vy
        const col = s.rapidTime > 0 ? '#ff9900' : '#00d4ff'
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 16)
        grad.addColorStop(0, col); grad.addColorStop(1, col + '00')
        ctx.fillStyle = grad
        ctx.shadowColor = col; ctx.shadowBlur = 8
        ctx.fillRect(b.x - 2, b.y, 4, 16)
        ctx.shadowBlur = 0
      })

      // Spawn asteroids
      s.astTimer++
      if (s.astTimer >= s.astInterval) {
        s.asteroids.push(makeAsteroid(astIdRef.current++))
        s.astTimer = 0
        s.astInterval = Math.max(22, 85 - s.level * 5)
      }

      // Spawn powerups
      s.pwTimer++
      if (s.pwTimer >= s.pwInterval) {
        s.powerups.push(makePowerup())
        s.pwTimer = 0; s.pwInterval = rand(160, 300)
      }

      // Move/draw asteroids
      s.asteroids = s.asteroids.filter(a => a.y < H + 60)
      s.asteroids.forEach(a => {
        a.x += a.vx; a.y += a.vy; a.rot += a.vrot
        if (a.x < a.r || a.x > W - a.r) a.vx *= -1
        drawAsteroid(ctx, a)
      })

      // Move/draw powerups
      s.powerups = s.powerups.filter(p => p.y < H + 40)
      s.powerups.forEach(p => { p.y += p.vy; p.rot += p.vrot; drawPowerup(ctx, p) })

      // Bullet-asteroid collisions
      const hitAsts = new Set(), hitBullets = new Set()
      s.bullets.forEach((b, bi) => {
        s.asteroids.forEach((a, ai) => {
          if (hitAsts.has(ai)) return
          const dx = b.x - a.x, dy = b.y - a.y
          if (Math.sqrt(dx * dx + dy * dy) < a.r + 3) {
            hitAsts.add(ai); hitBullets.add(bi)
            s.score += Math.floor(10 + a.r)
            for (let p = 0; p < 10; p++) {
              const ang = rand(0, Math.PI * 2)
              s.particles.push({ x: a.x, y: a.y, vx: Math.cos(ang) * rand(1, 5), vy: Math.sin(ang) * rand(1, 5), life: 1, color: a.color, size: rand(1.5, 3.5) })
            }
          }
        })
      })
      s.bullets = s.bullets.filter((_, i) => !hitBullets.has(i))
      s.asteroids = s.asteroids.filter((_, i) => !hitAsts.has(i))

      // Player-powerup collision
      s.powerups = s.powerups.filter(p => {
        const dx = s.ship.x - p.x, dy = s.ship.y - p.y
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          if (p.type === 'shield') { s.shieldTime = 300 }
          else if (p.type === 'rapid') { s.rapidTime = 240 }
          else if (p.type === 'bomb') {
            s.asteroids.forEach(a => {
              for (let i = 0; i < 8; i++) {
                const ang = rand(0, Math.PI * 2)
                s.particles.push({ x: a.x, y: a.y, vx: Math.cos(ang) * rand(2, 6), vy: Math.sin(ang) * rand(2, 6), life: 1, color: '#ff2d78', size: 3 })
              }
            })
            s.score += s.asteroids.length * 15
            s.asteroids = []
          } else if (p.type === 'score') {
            s.score += 100
          }
          const colors = { shield: '#00ffcc', rapid: '#ff9900', bomb: '#ff2d78', score: '#7b2fff' }
          const labels = { shield: '🛡 SHIELD!', rapid: '⚡ RAPID FIRE!', bomb: '💣 BOMB!', score: '💎 +100!' }
          showNotif(labels[p.type], colors[p.type])
          return false
        }
        return true
      })

      // Player-asteroid collision
      s.asteroids = s.asteroids.filter(a => {
        const dx = s.ship.x - a.x, dy = s.ship.y - a.y
        if (Math.sqrt(dx * dx + dy * dy) < a.r + 14) {
          if (s.shieldTime > 0) {
            s.shieldTime = 0
            for (let p = 0; p < 12; p++) {
              const ang = rand(0, Math.PI * 2)
              s.particles.push({ x: a.x, y: a.y, vx: Math.cos(ang) * rand(2, 6), vy: Math.sin(ang) * rand(2, 6), life: 1, color: '#00ffcc', size: 3 })
            }
            return false
          }
          s.lives--; setUiLives(s.lives)
          if (s.lives <= 0) { s.running = false; s.over = true; setGameOver(true) }
          return false
        }
        return true
      })

      // Particles
      s.particles = s.particles.filter(p => p.life > 0)
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.04; p.vx *= 0.97; p.vy *= 0.97
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      })

      // Level up
      const newLevel = Math.floor(s.score / 250) + 1
      if (newLevel !== s.level) { s.level = newLevel; setUiLevel(newLevel) }

      drawShip(ctx, s.ship.x, s.ship.y, s.shieldTime > 0)
      drawHUD(ctx, s.score, s.lives, s.level, s.shieldTime, s.rapidTime)

      s.frame++
      setUiScore(s.score)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [started, showNotif])

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  const touchRef = useRef({ startX: 0 })

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#000408',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16,
    }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(12px, 2vw, 20px)', color: '#00d4ff', letterSpacing: '5px', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>
        // ASTEROID DODGE
      </motion.div>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef} width={W} height={H}
          style={{ border: '1px solid rgba(0,212,255,0.3)', borderRadius: 12, boxShadow: '0 0 40px rgba(0,212,255,0.15)', display: 'block', maxWidth: '90vw', maxHeight: '65vh' }}
          onTouchStart={e => { touchRef.current.startX = e.touches[0].clientX }}
          onTouchMove={e => {
            const dx = e.touches[0].clientX - touchRef.current.startX
            const s = stateRef.current
            if (dx < -8) { s.keys['ArrowLeft'] = true; s.keys['ArrowRight'] = false }
            else if (dx > 8) { s.keys['ArrowRight'] = true; s.keys['ArrowLeft'] = false }
            touchRef.current.startX = e.touches[0].clientX
          }}
          onTouchEnd={() => {
            stateRef.current.keys['ArrowLeft'] = false; stateRef.current.keys['ArrowRight'] = false
            stateRef.current.keys['Space'] = true
            setTimeout(() => stateRef.current.keys['Space'] = false, 60)
          }}
        />

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              key={notification.text}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              style={{
                position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
                fontFamily: 'Orbitron, sans-serif', fontSize: 14, color: notification.color,
                background: `${notification.color}18`, border: `1px solid ${notification.color}55`,
                padding: '6px 18px', borderRadius: 20,
                boxShadow: `0 0 20px ${notification.color}44`,
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
              }}
            >
              {notification.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay screens */}
        <AnimatePresence>
          {!started && (
            <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={overlayStyle}>
              <div style={{ fontSize: 60 }}>🚀</div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, color: '#00d4ff', letterSpacing: 4, fontWeight: 900 }}>ASTEROID DODGE</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', maxWidth: 280, lineHeight: 1.8 }}>
                <span style={{ color: '#00d4ff' }}>← → / A D</span> Move ship<br />
                <span style={{ color: '#00ffcc' }}>SPACE / W</span> Shoot<br />
                Collect <span style={{ color: '#00ffcc' }}>🛡</span> <span style={{ color: '#ff9900' }}>⚡</span> <span style={{ color: '#ff2d78' }}>💣</span> <span style={{ color: '#7b2fff' }}>💎</span> power-ups!
              </div>
              <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.96 }} onClick={startGame} style={btnStyle('#00d4ff')}>
                LAUNCH MISSION
              </motion.button>
            </motion.div>
          )}
          {gameOver && (
            <motion.div key="over" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={overlayStyle}>
              <div style={{ fontSize: 54 }}>💥</div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, color: '#ff2d78', letterSpacing: 4, fontWeight: 900 }}>SHIP DESTROYED</div>
              <div style={{ display: 'flex', gap: 28 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, color: '#00d4ff', fontWeight: 700 }}>{uiScore}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,212,255,0.5)', letterSpacing: 2 }}>SCORE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, color: '#00ffcc', fontWeight: 700 }}>{uiLevel}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,212,255,0.5)', letterSpacing: 2 }}>LEVEL</div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.96 }} onClick={startGame} style={btnStyle('#ff2d78')}>
                RETRY MISSION
              </motion.button>
            </motion.div>
          )}
          {paused && !gameOver && (
            <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 26, color: '#00ffcc', letterSpacing: 5, fontWeight: 900 }}>PAUSED</div>
              <motion.button whileHover={{ scale: 1.07 }} onClick={togglePause} style={btnStyle('#00ffcc')}>▶ RESUME</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {started && !gameOver && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={togglePause} style={{ ...btnStyle(paused ? '#00ffcc' : '#00d4ff'), padding: '7px 20px', fontSize: 10 }}>
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button onClick={startGame} style={{ ...btnStyle('#ff2d78'), padding: '7px 20px', fontSize: 10 }}>↺ RESTART</button>
        </div>
      )}

      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,212,255,0.28)', letterSpacing: 2, textAlign: 'center' }}>
        SWIPE MOBILE &nbsp;·&nbsp; ← → MOVE &nbsp;·&nbsp; SPACE SHOOT
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'absolute', inset: 0,
  background: 'rgba(0,4,14,0.93)', borderRadius: 12,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 20,
}
const btnStyle = (color) => ({
  padding: '11px 34px', background: 'transparent',
  border: `1.5px solid ${color}`, borderRadius: 40, color,
  fontFamily: 'Orbitron, sans-serif', fontSize: 12, letterSpacing: '3px',
  cursor: 'pointer', backdropFilter: 'blur(10px)',
  boxShadow: `0 0 20px ${color}33`, transition: 'all 0.2s',
})
