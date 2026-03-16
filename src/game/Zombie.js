import { TILE_SIZE, isWalkable, MAP_W, MAP_H } from '../data/mapData.js'

const ZOMBIE_TYPES = [
  { bodyColor: '#4a3a20', clothColor: '#8a7030', headColor: '#6a5a3a', name: 'worker' },
  { bodyColor: '#2a3a5a', clothColor: '#3a4a6a', headColor: '#5a5a5a', name: 'police' },
  { bodyColor: '#5a2a2a', clothColor: '#7a3a1a', headColor: '#6a4a3a', name: 'civilian' },
]

export class Zombie {
  constructor(tx, ty, type = 0) {
    this.x = tx * TILE_SIZE + TILE_SIZE / 2
    this.y = ty * TILE_SIZE + TILE_SIZE / 2
    this.startX = this.x
    this.startY = this.y
    this.speed = 0.4 + Math.random() * 0.3
    this.dir = Math.floor(Math.random() * 4)
    this.alive = true
    this.type = ZOMBIE_TYPES[type % ZOMBIE_TYPES.length]
    this.animTimer = 0
    this.animFrame = 0
    this.moveTimer = 0
    this.moveDuration = 60 + Math.floor(Math.random() * 120)
    this.pauseTimer = 0
    this.paused = false
    this.dying = false
    this.deathTimer = 0
    this.deathType = 0 // 0=punch, 1=kick
    this.hitEffectTimer = 0
    this.wobblePhase = Math.random() * Math.PI * 2
  }

  update(map, time) {
    if (!this.alive) {
      if (this.dying) {
        this.deathTimer++
        if (this.deathTimer > 40) {
          this.dying = false
        }
      }
      return
    }

    this.animTimer++
    if (this.animTimer > 14) {
      this.animTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
    }

    if (this.hitEffectTimer > 0) this.hitEffectTimer--

    // Random shambling movement
    if (this.paused) {
      this.pauseTimer--
      if (this.pauseTimer <= 0) {
        this.paused = false
        this.dir = Math.floor(Math.random() * 4)
        this.moveDuration = 40 + Math.floor(Math.random() * 80)
      }
      return
    }

    this.moveTimer++
    if (this.moveTimer >= this.moveDuration) {
      this.moveTimer = 0
      this.paused = true
      this.pauseTimer = 30 + Math.floor(Math.random() * 60)
      return
    }

    const dirs = [[0, 1], [-1, 0], [0, -1], [1, 0]]
    const [ddx, ddy] = dirs[this.dir]
    const nx = this.x + ddx * this.speed
    const ny = this.y + ddy * this.speed

    // Stay near spawn area
    const distFromSpawn = Math.sqrt((nx - this.startX) ** 2 + (ny - this.startY) ** 2)
    if (distFromSpawn > TILE_SIZE * 3) {
      this.dir = (this.dir + 2) % 4
      return
    }

    // Check walkable
    const tx = Math.floor(nx / TILE_SIZE)
    const ty = Math.floor(ny / TILE_SIZE)
    if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H && isWalkable(map[ty][tx])) {
      this.x = nx
      this.y = ny
    } else {
      this.dir = (this.dir + 1 + Math.floor(Math.random() * 2)) % 4
    }
  }

  kill(deathType = 0) {
    if (!this.alive) return
    this.alive = false
    this.dying = true
    this.deathTimer = 0
    this.deathType = deathType
  }

  draw(ctx, time) {
    if (!this.alive && !this.dying) return

    ctx.save()
    ctx.translate(this.x, this.y)

    // Death animation
    if (this.dying) {
      const t = this.deathTimer / 40
      ctx.globalAlpha = 1 - t
      if (this.deathType === 0) {
        // Punch - fly back
        ctx.translate(0, -t * 15)
        ctx.rotate(t * 1.5)
      } else {
        // Kick - fly sideways
        ctx.translate(t * 20, -t * 5)
        ctx.rotate(t * 2)
      }
      ctx.scale(1 - t * 0.3, 1 - t * 0.3)
    }

    // Hit flash
    if (this.hitEffectTimer > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(this.hitEffectTimer) * 0.3
    }

    const wobble = Math.sin(time * 3 + this.wobblePhase) * 0.08
    ctx.rotate(wobble)

    const bobY = Math.sin(time * 4 + this.wobblePhase) * 1.5

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(0, 14, 10, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs (shambling)
    const legAnim = Math.sin(time * 4 + this.wobblePhase) * 4
    ctx.fillStyle = this.type.clothColor
    ctx.fillRect(-6, 2 + bobY, 4, 12 + legAnim)
    ctx.fillRect(2, 2 + bobY, 4, 12 - legAnim)

    // Body
    ctx.fillStyle = this.type.clothColor
    ctx.fillRect(-8, -10 + bobY, 16, 14)

    // Blood/tear marks
    ctx.fillStyle = 'rgba(120, 30, 20, 0.5)'
    ctx.fillRect(-5, -6 + bobY, 3, 6)
    ctx.fillRect(3, -3 + bobY, 4, 4)

    // Arms (reaching forward zombie-style)
    const armReach = Math.sin(time * 3 + this.wobblePhase) * 3
    ctx.fillStyle = this.type.headColor
    ctx.save()
    ctx.translate(-8, -6 + bobY)
    ctx.rotate(-0.5 + armReach * 0.05)
    ctx.fillRect(-2, 0, 4, 14)
    ctx.restore()
    ctx.save()
    ctx.translate(8, -6 + bobY)
    ctx.rotate(0.5 - armReach * 0.05)
    ctx.fillRect(-2, 0, 4, 14)
    ctx.restore()

    // Head
    ctx.fillStyle = this.type.headColor
    ctx.beginPath()
    ctx.ellipse(0, -16 + bobY, 7, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    // Eyes (dead, hollow)
    ctx.fillStyle = 'rgba(180, 30, 30, 0.7)'
    ctx.beginPath()
    ctx.arc(-3, -17 + bobY, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(3, -17 + bobY, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Mouth
    ctx.strokeStyle = 'rgba(100, 20, 20, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(0, -13 + bobY, 3, 0, Math.PI)
    ctx.stroke()

    ctx.restore()
  }

  distTo(px, py) {
    return Math.sqrt((this.x - px) ** 2 + (this.y - py) ** 2)
  }
}
