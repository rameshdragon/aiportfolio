import { T, TILE_SIZE, MAP_W, MAP_H, LANDMARKS, CAR_POSITIONS } from '../data/mapData.js'

const COLORS = {
  void: '#0a0e14',
  path: '#2a2218',
  pathLine: '#3d3525',
  building: '#0d1520',
  buildingEdge: '#1a2535',
  buildingWindow: '#1e3a4a',
  buildingWindowLit: '#ff6b35',
  water: '#0a2a3a',
  waterHighlight: '#0d3548',
  tree: '#1a3a1e',
  treeTrunk: '#2a1a0a',
  bridge: '#3a2a15',
  bridgePlank: '#4a3a20',
  zombie: '#1a2a1a',
  ground: '#1a1e22',
  car: '#2a1a1a',
  fog: 'rgba(10, 18, 28, 0.4)',
}

// Draw a single tile
function drawTile(ctx, tx, ty, tile, time) {
  const x = tx * TILE_SIZE
  const y = ty * TILE_SIZE
  const S = TILE_SIZE

  switch (tile) {
    case T.VOID:
      ctx.fillStyle = COLORS.void
      ctx.fillRect(x, y, S, S)
      break

    case T.PATH:
      drawPath(ctx, x, y, S, time)
      break

    case T.BUILDING:
      drawBuilding(ctx, x, y, S, tx, ty, time)
      break

    case T.WATER:
      drawWater(ctx, x, y, S, tx, ty, time)
      break

    case T.TREE:
      drawGround(ctx, x, y, S)
      drawTree(ctx, x, y, S, tx, ty, time)
      break

    case T.BRIDGE:
      drawWater(ctx, x, y, S, tx, ty, time)
      drawBridge(ctx, x, y, S)
      break

    case T.ZOMBIE:
      drawPath(ctx, x, y, S, time)
      // Zombie bush drawn as eerie green patch
      ctx.fillStyle = 'rgba(30, 60, 30, 0.4)'
      ctx.beginPath()
      ctx.ellipse(x + S / 2, y + S / 2, S * 0.4, S * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()
      break

    case T.CAR:
      drawPath(ctx, x, y, S, time)
      break

    case T.GROUND:
      drawGround(ctx, x, y, S)
      break
  }
}

function drawGround(ctx, x, y, S) {
  ctx.fillStyle = COLORS.ground
  ctx.fillRect(x, y, S, S)
  // Subtle texture
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  for (let i = 0; i < 3; i++) {
    const rx = x + ((i * 17 + x) % S)
    const ry = y + ((i * 13 + y) % S)
    ctx.fillRect(rx, ry, 2, 1)
  }
}

function drawPath(ctx, x, y, S, time) {
  // Wet asphalt
  ctx.fillStyle = COLORS.path
  ctx.fillRect(x, y, S, S)
  // Cracks
  ctx.strokeStyle = COLORS.pathLine
  ctx.lineWidth = 0.5
  const seed = (x * 7 + y * 13) % 20
  if (seed < 4) {
    ctx.beginPath()
    ctx.moveTo(x + seed * 3, y)
    ctx.lineTo(x + S - seed * 2, y + S)
    ctx.stroke()
  }
  // Puddle reflection (animated)
  if ((x + y) % 200 < 80) {
    const shimmer = Math.sin(time * 2 + x * 0.1) * 0.03 + 0.05
    ctx.fillStyle = `rgba(0, 180, 220, ${shimmer})`
    ctx.beginPath()
    ctx.ellipse(x + S * 0.5, y + S * 0.6, S * 0.35, S * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawBuilding(ctx, x, y, S, tx, ty, time) {
  ctx.fillStyle = COLORS.building
  ctx.fillRect(x, y, S, S)
  // Edge lines
  ctx.strokeStyle = COLORS.buildingEdge
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, S - 1, S - 1)
  // Windows (some lit orange)
  const hash = (tx * 31 + ty * 47) % 10
  if (hash < 6) {
    const ww = 6, wh = 5
    const wx = x + S / 2 - ww / 2
    const wy = y + S / 2 - wh / 2
    const lit = hash < 2 && Math.sin(time + hash) > 0.3
    ctx.fillStyle = lit ? COLORS.buildingWindowLit : COLORS.buildingWindow
    ctx.fillRect(wx, wy, ww, wh)
    if (lit) {
      ctx.fillStyle = `rgba(255, 107, 53, ${0.15 + Math.sin(time * 2 + hash) * 0.05})`
      ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4)
    }
  }
}

function drawWater(ctx, x, y, S, tx, ty, time) {
  const wave = Math.sin(time * 0.8 + tx * 0.5 + ty * 0.3) * 0.03
  ctx.fillStyle = COLORS.water
  ctx.fillRect(x, y, S, S)
  // Animated wave lines
  ctx.strokeStyle = COLORS.waterHighlight
  ctx.lineWidth = 0.8
  for (let i = 0; i < 2; i++) {
    const wy = y + S * 0.3 + i * S * 0.35
    ctx.beginPath()
    for (let dx = 0; dx < S; dx += 3) {
      const dy = Math.sin(time * 1.5 + (x + dx) * 0.08 + i * 2) * 2
      dx === 0 ? ctx.moveTo(x + dx, wy + dy) : ctx.lineTo(x + dx, wy + dy)
    }
    ctx.stroke()
  }
  // Debris dots
  if ((tx * 11 + ty * 7) % 8 === 0) {
    ctx.fillStyle = 'rgba(40, 60, 50, 0.5)'
    ctx.fillRect(x + S * 0.3, y + S * 0.5, 3, 2)
  }
}

function drawTree(ctx, x, y, S, tx, ty, time) {
  const cx = x + S / 2, cy = y + S / 2
  // Trunk
  ctx.fillStyle = COLORS.treeTrunk
  ctx.fillRect(cx - 2, cy, 4, S * 0.35)
  // Canopy (sways slightly)
  const sway = Math.sin(time * 0.5 + tx * 3) * 1.5
  ctx.fillStyle = COLORS.tree
  ctx.beginPath()
  ctx.ellipse(cx + sway, cy - 2, S * 0.38, S * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  // Darker center
  ctx.fillStyle = 'rgba(10, 30, 12, 0.5)'
  ctx.beginPath()
  ctx.ellipse(cx + sway, cy, S * 0.2, S * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawBridge(ctx, x, y, S) {
  // Stone base
  ctx.fillStyle = COLORS.bridge
  ctx.fillRect(x + 2, y, S - 4, S)
  // Planks
  ctx.fillStyle = COLORS.bridgePlank
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 4, y + i * 12 + 2, S - 8, 8)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(x + 4, y + i * 12 + 2, S - 8, 8)
  }
  // Railings
  ctx.fillStyle = '#3a3025'
  ctx.fillRect(x + 2, y, 3, S)
  ctx.fillRect(x + S - 5, y, 3, S)
}

// Draw a car
export function drawCar(ctx, x, y, rot) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  // Body
  ctx.fillStyle = '#3a1a1a'
  ctx.fillRect(-20, -10, 40, 20)
  // Roof
  ctx.fillStyle = '#2a1515'
  ctx.fillRect(-10, -8, 20, 16)
  // Rust patches
  ctx.fillStyle = 'rgba(180, 80, 30, 0.4)'
  ctx.fillRect(-15, -6, 8, 5)
  ctx.fillRect(5, 2, 10, 4)
  // Wheels
  ctx.fillStyle = '#111'
  ctx.fillRect(-18, -12, 6, 4)
  ctx.fillRect(-18, 8, 6, 4)
  ctx.fillRect(12, -12, 6, 4)
  ctx.fillRect(12, 8, 6, 4)
  // Broken window
  ctx.fillStyle = 'rgba(20, 60, 70, 0.5)'
  ctx.fillRect(-5, -7, 10, 6)
  ctx.restore()
}

// Draw neon sign pole
export function drawSign(ctx, landmark, time, playerNear) {
  const x = landmark.tx * TILE_SIZE + TILE_SIZE / 2
  const y = landmark.ty * TILE_SIZE

  // Pole
  ctx.fillStyle = '#1a1a2a'
  ctx.fillRect(x - 2, y - 60, 4, 65)

  // Sign board
  const sw = 90, sh = 30
  const sx = x - sw / 2, sy = y - 70

  // Board background
  ctx.fillStyle = 'rgba(10, 15, 25, 0.95)'
  ctx.fillRect(sx, sy, sw, sh)
  ctx.strokeStyle = 'rgba(0, 200, 180, 0.4)'
  ctx.lineWidth = 1
  ctx.strokeRect(sx, sy, sw, sh)

  // Neon glow text
  const glow = Math.sin(time * 3) * 0.15 + 0.85
  const flicker = Math.random() > 0.97 ? 0.3 : 1
  ctx.save()
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Glow layers
  ctx.shadowColor = `rgba(0, 220, 180, ${0.8 * glow * flicker})`
  ctx.shadowBlur = 12
  ctx.fillStyle = `rgba(0, 255, 210, ${0.9 * glow * flicker})`
  ctx.fillText(landmark.label, x, sy + sh / 2)

  // Second pass for brighter core
  ctx.shadowBlur = 4
  ctx.fillText(landmark.label, x, sy + sh / 2)
  ctx.restore()

  // "Press F" indicator when near
  if (playerNear) {
    const bobY = Math.sin(time * 4) * 3
    ctx.save()
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = `rgba(255, 200, 50, ${0.7 + Math.sin(time * 5) * 0.3})`
    ctx.shadowColor = 'rgba(255, 200, 50, 0.6)'
    ctx.shadowBlur = 6
    ctx.fillText('PRESS F', x, y + TILE_SIZE + 16 + bobY)
    ctx.restore()
  }
}

// Draw fog/atmosphere
export function drawFog(ctx, camX, camY, W, H, time) {
  // Gradient fog from edges
  const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.7)
  grd.addColorStop(0, 'rgba(10, 18, 28, 0)')
  grd.addColorStop(0.7, 'rgba(10, 18, 28, 0.15)')
  grd.addColorStop(1, 'rgba(10, 18, 28, 0.5)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  // Moving fog wisps
  ctx.save()
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 5; i++) {
    const fx = (Math.sin(time * 0.15 + i * 2) * W * 0.5) + W / 2
    const fy = (Math.cos(time * 0.1 + i * 3) * H * 0.4) + H / 2
    const grd2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, 150)
    grd2.addColorStop(0, 'rgba(80, 120, 140, 0.5)')
    grd2.addColorStop(1, 'rgba(80, 120, 140, 0)')
    ctx.fillStyle = grd2
    ctx.fillRect(0, 0, W, H)
  }
  ctx.restore()
}

// Rain particles
export function drawRain(ctx, W, H, time) {
  ctx.save()
  ctx.strokeStyle = 'rgba(100, 160, 200, 0.15)'
  ctx.lineWidth = 1
  for (let i = 0; i < 60; i++) {
    const rx = ((i * 73 + time * 80) % (W + 100)) - 50
    const ry = ((i * 37 + time * 250) % (H + 100)) - 50
    ctx.beginPath()
    ctx.moveTo(rx, ry)
    ctx.lineTo(rx - 1, ry + 8)
    ctx.stroke()
  }
  ctx.restore()
}

// Main render function for visible tiles
export function renderMap(ctx, map, camX, camY, canvasW, canvasH, time) {
  const startTX = Math.max(0, Math.floor(camX / TILE_SIZE) - 1)
  const startTY = Math.max(0, Math.floor(camY / TILE_SIZE) - 1)
  const endTX = Math.min(MAP_W, Math.ceil((camX + canvasW) / TILE_SIZE) + 1)
  const endTY = Math.min(MAP_H, Math.ceil((camY + canvasH) / TILE_SIZE) + 1)

  for (let ty = startTY; ty < endTY; ty++) {
    for (let tx = startTX; tx < endTX; tx++) {
      drawTile(ctx, tx, ty, map[ty][tx], time)
    }
  }
}
