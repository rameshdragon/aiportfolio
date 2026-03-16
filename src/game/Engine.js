import { MAP, TILE_SIZE, MAP_W, MAP_H, LANDMARKS, ZOMBIE_SPAWNS, CAR_POSITIONS, PLAYER_START } from '../data/mapData.js'
import { renderMap, drawSign, drawFog, drawRain, drawCar } from './Renderer.js'
import { Player } from './Player.js'
import { Zombie } from './Zombie.js'
import { playSignReveal, playKill, playZombieGroan, playAmbient } from './Audio.js'

const KILL_RANGE = 50
const SIGN_RANGE = 60

export class GameEngine {
  constructor(canvas, onSignActivate, onSignDeactivate, onKillPrompt) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = 0
    this.height = 0
    this.onSignActivate = onSignActivate
    this.onSignDeactivate = onSignDeactivate
    this.onKillPrompt = onKillPrompt

    this.player = new Player(PLAYER_START.tx, PLAYER_START.ty)
    this.camera = { x: 0, y: 0 }
    this.keys = {}
    this.joystick = null
    this.time = 0
    this.running = false
    this.raf = null
    this.activeLandmark = null
    this.nearbyZombie = null
    this.killAnimating = false
    this.killAnimTimer = 0
    this.killAnimType = 0
    this.killTarget = null
    this.ambientTimer = 0
    this.groanTimer = 0

    // Spawn zombies
    this.zombies = ZOMBIE_SPAWNS.map(z => new Zombie(z.tx, z.ty, z.type))

    // Bind keyboard
    this._onKeyDown = (e) => {
      this.keys[e.code] = true
      if (e.code === 'KeyF') this.tryKill()
    }
    this._onKeyUp = (e) => { this.keys[e.code] = false }
  }

  start() {
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.running = true
    this.loop()
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  setJoystick(jx, jy) {
    this.joystick = { x: jx, y: jy }
  }

  clearJoystick() {
    this.joystick = null
  }

  tryKill() {
    if (this.killAnimating) return
    if (this.nearbyZombie && this.nearbyZombie.alive) {
      this.killAnimating = true
      this.killAnimTimer = 0
      this.killAnimType = Math.random() > 0.5 ? 0 : 1
      this.killTarget = this.nearbyZombie
      this.nearbyZombie.kill(this.killAnimType)
      playKill()
    }
  }

  loop() {
    if (!this.running) return

    this.time += 0.016
    this.ambientTimer++
    this.groanTimer++

    // Ambient sound every 8 seconds
    if (this.ambientTimer > 480) {
      this.ambientTimer = 0
      playAmbient()
    }

    // Random zombie groan
    if (this.groanTimer > 300 + Math.random() * 300) {
      this.groanTimer = 0
      playZombieGroan()
    }

    // Kill animation
    if (this.killAnimating) {
      this.killAnimTimer++
      if (this.killAnimTimer > 40) {
        this.killAnimating = false
        this.killTarget = null
      }
    }

    // Update player
    this.player.update(this.keys, this.joystick, MAP)

    // Update zombies
    this.zombies.forEach(z => z.update(MAP, this.time))

    // Camera follows player smoothly
    const targetCX = this.player.x - this.width / 2
    const targetCY = this.player.y - this.height / 2
    this.camera.x += (targetCX - this.camera.x) * 0.08
    this.camera.y += (targetCY - this.camera.y) * 0.08

    // Clamp camera
    this.camera.x = Math.max(0, Math.min(MAP_W * TILE_SIZE - this.width, this.camera.x))
    this.camera.y = Math.max(0, Math.min(MAP_H * TILE_SIZE - this.height, this.camera.y))

    // Check nearby landmarks
    const { tx: ptx, ty: pty } = this.player.getTilePos()
    let nearLandmark = null
    for (const lm of LANDMARKS) {
      const dist = Math.sqrt((this.player.x - (lm.tx * TILE_SIZE + TILE_SIZE / 2)) ** 2 +
                             (this.player.y - (lm.ty * TILE_SIZE + TILE_SIZE / 2)) ** 2)
      if (dist < SIGN_RANGE) {
        nearLandmark = lm
        break
      }
    }

    if (nearLandmark && nearLandmark !== this.activeLandmark) {
      this.activeLandmark = nearLandmark
      this.onSignActivate(nearLandmark)
      playSignReveal()
    } else if (!nearLandmark && this.activeLandmark) {
      this.onSignDeactivate()
      this.activeLandmark = null
    }

    // Check nearby zombies for kill prompt
    let closestZombie = null
    let closestDist = KILL_RANGE
    this.zombies.forEach(z => {
      if (!z.alive) return
      const d = z.distTo(this.player.x, this.player.y)
      if (d < closestDist) {
        closestDist = d
        closestZombie = z
      }
    })
    this.nearbyZombie = closestZombie
    this.onKillPrompt(!!closestZombie)

    // Render
    this.render()

    this.raf = requestAnimationFrame(() => this.loop())
  }

  render() {
    const { ctx, width, height, camera, time } = this
    ctx.clearRect(0, 0, width, height)

    // Dark background
    ctx.fillStyle = '#0a0e14'
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(-camera.x, -camera.y)

    // Map tiles
    renderMap(ctx, MAP, camera.x, camera.y, width, height, time)

    // Cars
    CAR_POSITIONS.forEach(c => {
      drawCar(ctx, c.tx * TILE_SIZE + TILE_SIZE / 2, c.ty * TILE_SIZE + TILE_SIZE / 2, c.rot)
    })

    // Signs
    LANDMARKS.forEach(lm => {
      const dist = Math.sqrt((this.player.x - (lm.tx * TILE_SIZE + TILE_SIZE / 2)) ** 2 +
                             (this.player.y - (lm.ty * TILE_SIZE + TILE_SIZE / 2)) ** 2)
      drawSign(ctx, lm, time, dist < SIGN_RANGE)
    })

    // Zombies (behind player if above, in front if below)
    const zombiesBehind = this.zombies.filter(z => z.y <= this.player.y)
    const zombiesFront = this.zombies.filter(z => z.y > this.player.y)

    zombiesBehind.forEach(z => z.draw(ctx, time))

    // Player
    this.player.draw(ctx, time)

    // Kill animation effect
    if (this.killAnimating && this.killTarget) {
      const kt = this.killTarget
      const progress = this.killAnimTimer / 40
      // Impact flash
      if (this.killAnimTimer < 10) {
        ctx.save()
        ctx.fillStyle = `rgba(255, 100, 50, ${0.4 * (1 - progress)})`
        ctx.beginPath()
        ctx.arc(kt.x, kt.y - 8, 20 * progress, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      // Impact text
      if (this.killAnimTimer < 25) {
        ctx.save()
        ctx.font = 'bold 14px monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(255, 80, 40, ${1 - progress})`
        const impactText = this.killAnimType === 0 ? 'PUNCH!' : 'KICK!'
        ctx.fillText(impactText, kt.x, kt.y - 25 - progress * 20)
        ctx.restore()
      }
    }

    zombiesFront.forEach(z => z.draw(ctx, time))

    ctx.restore()

    // Post-processing overlays
    drawFog(ctx, camera.x, camera.y, width, height, time)
    drawRain(ctx, width, height, time)

    // Vignette
    const vgrd = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.8)
    vgrd.addColorStop(0, 'rgba(0,0,0,0)')
    vgrd.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = vgrd
    ctx.fillRect(0, 0, width, height)

    // CRT scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.03)'
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1)
    }
  }
}
