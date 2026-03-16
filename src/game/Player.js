import { TILE_SIZE, isWalkable, MAP_W, MAP_H } from '../data/mapData.js'
import { stepTick } from './Audio.js'

export class Player {
  constructor(tx, ty) {
    this.x = tx * TILE_SIZE + TILE_SIZE / 2
    this.y = ty * TILE_SIZE + TILE_SIZE / 2
    this.speed = 2.2
    this.dir = 0 // 0=down, 1=left, 2=up, 3=right
    this.moving = false
    this.animFrame = 0
    this.animTimer = 0
    this.w = 28
    this.h = 40
  }

  update(keys, joystick, map) {
    let dx = 0, dy = 0

    // Keyboard
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1
    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1

    // Joystick
    if (joystick) {
      dx += joystick.x
      dy += joystick.y
    }

    // Normalize diagonal
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > 0) {
      dx = (dx / len) * this.speed
      dy = (dy / len) * this.speed
      this.moving = true
      stepTick()

      // Direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = dx > 0 ? 3 : 1
      } else {
        this.dir = dy > 0 ? 0 : 2
      }
    } else {
      this.moving = false
    }

    // Collision check
    const nx = this.x + dx
    const ny = this.y + dy

    // Check corners of the player hitbox
    const hw = this.w / 2 - 4
    const hh = this.h / 2 - 4
    const canMoveX = this.canMove(nx, this.y, hw, hh, map)
    const canMoveY = this.canMove(this.x, ny, hw, hh, map)

    if (canMoveX) this.x = nx
    if (canMoveY) this.y = ny

    // Clamp to map
    this.x = Math.max(hw, Math.min(MAP_W * TILE_SIZE - hw, this.x))
    this.y = Math.max(hh, Math.min(MAP_H * TILE_SIZE - hh, this.y))

    // Animation
    if (this.moving) {
      this.animTimer++
      if (this.animTimer > 8) {
        this.animTimer = 0
        this.animFrame = (this.animFrame + 1) % 4
      }
    } else {
      this.animFrame = 0
      this.animTimer = 0
    }
  }

  canMove(px, py, hw, hh, map) {
    const points = [
      [px - hw, py - hh],
      [px + hw, py - hh],
      [px - hw, py + hh],
      [px + hw, py + hh],
    ]
    for (const [cx, cy] of points) {
      const tx = Math.floor(cx / TILE_SIZE)
      const ty = Math.floor(cy / TILE_SIZE)
      if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return false
      if (!isWalkable(map[ty][tx])) return false
    }
    return true
  }

  draw(ctx, time) {
    ctx.save()
    ctx.translate(this.x, this.y)

    // Zombie-robot walk wobble
    const wobble = this.moving ? Math.sin(time * 10) * 0.06 : 0
    ctx.rotate(wobble)

    const f = this.animFrame
    const bobY = this.moving ? Math.sin(time * 12) * 2 : 0

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    const legSpread = this.moving ? Math.sin(time * 10) * 5 : 0
    ctx.fillStyle = '#1a3a30'
    ctx.fillRect(-8, 4 + bobY, 5, 16 + legSpread)
    ctx.fillRect(3, 4 + bobY, 5, 16 - legSpread)
    // Leg joints
    ctx.fillStyle = '#2a4a38'
    ctx.fillRect(-7, 10 + bobY, 3, 3)
    ctx.fillRect(4, 10 + bobY, 3, 3)

    // Body (torso armor)
    ctx.fillStyle = '#1e4438'
    ctx.fillRect(-10, -12 + bobY, 20, 18)
    // Rust patches
    ctx.fillStyle = 'rgba(180, 80, 30, 0.35)'
    ctx.fillRect(-8, -8 + bobY, 6, 4)
    ctx.fillRect(3, -4 + bobY, 5, 5)
    // Chest core glow
    ctx.fillStyle = `rgba(200, 220, 180, ${0.6 + Math.sin(time * 3) * 0.2})`
    ctx.beginPath()
    ctx.arc(0, -4 + bobY, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(200, 220, 180, 0.15)`
    ctx.beginPath()
    ctx.arc(0, -4 + bobY, 6, 0, Math.PI * 2)
    ctx.fill()

    // Arms
    const armSwing = this.moving ? Math.sin(time * 10) * 8 : 0
    // Left arm (long, claw-like)
    ctx.save()
    ctx.translate(-10, -6 + bobY)
    ctx.rotate(-0.2 + wobble)
    ctx.fillStyle = '#1a3a30'
    ctx.fillRect(-3, 0, 5, 18 + armSwing)
    // Claw
    ctx.fillStyle = '#2a4a38'
    ctx.fillRect(-4, 16 + armSwing, 3, 5)
    ctx.fillRect(0, 17 + armSwing, 3, 4)
    ctx.restore()

    // Right arm (holding weapon)
    ctx.save()
    ctx.translate(10, -6 + bobY)
    ctx.rotate(0.2 - wobble)
    ctx.fillStyle = '#1a3a30'
    ctx.fillRect(-2, 0, 5, 16 - armSwing)
    // Weapon
    ctx.fillStyle = '#3a3a25'
    ctx.fillRect(-1, 14 - armSwing, 4, 12)
    ctx.fillStyle = '#4a4a30'
    ctx.fillRect(-2, 24 - armSwing, 6, 3)
    ctx.restore()

    // Neck
    ctx.fillStyle = '#2a4a38'
    ctx.fillRect(-3, -16 + bobY, 6, 5)

    // Head (skull-like)
    ctx.fillStyle = '#2a5a48'
    ctx.beginPath()
    ctx.ellipse(0, -22 + bobY, 9, 10, 0, 0, Math.PI * 2)
    ctx.fill()

    // Face plate
    ctx.fillStyle = '#1a3a2e'
    ctx.fillRect(-7, -26 + bobY, 14, 8)

    // Glowing eyes
    const eyeGlow = 0.7 + Math.sin(time * 4) * 0.3
    ctx.fillStyle = `rgba(220, 200, 50, ${eyeGlow})`
    ctx.beginPath()
    ctx.arc(-3, -23 + bobY, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3, -23 + bobY, 2, 0, Math.PI * 2)
    ctx.fill()
    // Eye glow halo
    ctx.fillStyle = `rgba(220, 200, 50, ${eyeGlow * 0.2})`
    ctx.beginPath()
    ctx.arc(-3, -23 + bobY, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3, -23 + bobY, 5, 0, Math.PI * 2)
    ctx.fill()

    // Jaw line
    ctx.strokeStyle = '#1a3a2e'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-5, -16 + bobY)
    ctx.lineTo(0, -13 + bobY)
    ctx.lineTo(5, -16 + bobY)
    ctx.stroke()

    // M-7 marking
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)'
    ctx.font = '5px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('M-7', 0, -2 + bobY)

    ctx.restore()
  }

  getTilePos() {
    return {
      tx: Math.floor(this.x / TILE_SIZE),
      ty: Math.floor(this.y / TILE_SIZE),
    }
  }
}
