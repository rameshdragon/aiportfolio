// Tile types
export const T = {
  VOID: 0,      // outside map boundary
  PATH: 1,      // walkable orange path
  BUILDING: 2,  // black buildings (non-walkable)
  WATER: 3,     // blue water (non-walkable)
  TREE: 4,      // green trees (non-walkable)
  BRIDGE: 5,    // yellow bridge (walkable)
  ZOMBIE: 6,    // purple zombie bush (walkable, has enemy)
  CAR: 7,       // car obstacle (non-walkable)
  GROUND: 8,    // walkable ground (grey area)
}

export const TILE_SIZE = 48

// Map dimensions
export const MAP_W = 40
export const MAP_H = 50

// Helper to check if walkable
export const isWalkable = (tile) => tile === T.PATH || tile === T.BRIDGE || tile === T.GROUND || tile === T.ZOMBIE

// Sign/landmark positions (in tile coords) - the red dots
export const LANDMARKS = [
  { tx: 20, ty: 45, id: 'start', label: 'RAMESH REDDY', section: 'intro' },
  { tx: 32, ty: 36, id: 'experience', label: 'EXPERIENCE', section: 'experience' },
  { tx: 33, ty: 26, id: 'projects', label: 'PROJECTS', section: 'projects' },
  { tx: 12, ty: 26, id: 'skills', label: 'SKILLS', section: 'skills' },
  { tx: 14, ty: 10, id: 'contact', label: 'CONTACT ME', section: 'contact' },
]

// Zombie spawn positions (in tile coords) - the purple zones
export const ZOMBIE_SPAWNS = [
  { tx: 26, ty: 14, type: 0 },
  { tx: 28, ty: 15, type: 1 },
  { tx: 18, ty: 30, type: 2 },
  { tx: 22, ty: 32, type: 0 },
  { tx: 15, ty: 20, type: 1 },
  { tx: 30, ty: 22, type: 2 },
  { tx: 25, ty: 38, type: 0 },
  { tx: 10, ty: 16, type: 1 },
]

// Car positions
export const CAR_POSITIONS = [
  { tx: 18, ty: 42, rot: 0.2 },
  { tx: 28, ty: 30, rot: -0.3 },
  { tx: 14, ty: 34, rot: 0.1 },
  { tx: 30, ty: 18, rot: -0.15 },
  { tx: 22, ty: 22, rot: 0.4 },
]

// Player start position
export const PLAYER_START = { tx: 20, ty: 47 }

// Generate the map array matching the reference map shape
// The map is shaped like a head/face profile facing left
function generateMap() {
  const map = Array(MAP_H).fill(null).map(() => Array(MAP_W).fill(T.VOID))

  // Define the map boundary (the irregular head shape)
  // Row by row, define the left and right edges of the walkable area
  const bounds = [
    // top rows (water area + top of head)
    [18, 35], // 0
    [17, 36], // 1
    [16, 36], // 2
    [15, 36], // 3
    [14, 36], // 4
    [13, 35], // 5
    [12, 35], // 6
    [11, 35], // 7
    [10, 35], // 8
    [10, 34], // 9
    [10, 34], // 10
    [10, 34], // 11
    [10, 34], // 12
    [10, 34], // 13
    [10, 34], // 14
    [10, 35], // 15
    [10, 35], // 16
    [10, 36], // 17
    [10, 36], // 18
    [11, 36], // 19
    [11, 36], // 20
    [12, 36], // 21
    [12, 35], // 22
    [12, 35], // 23
    [12, 35], // 24
    [11, 35], // 25
    [10, 35], // 26
    [10, 34], // 27
    [10, 34], // 28
    [10, 34], // 29
    [10, 34], // 30
    [10, 34], // 31
    [11, 34], // 32
    [11, 34], // 33
    [11, 34], // 34
    [12, 34], // 35
    [12, 34], // 36
    [13, 34], // 37
    [14, 34], // 38
    [14, 34], // 39
    [14, 34], // 40
    [14, 34], // 41
    [15, 33], // 42
    [16, 32], // 43
    [17, 31], // 44
    [17, 30], // 45
    [17, 30], // 46
    [17, 30], // 47
    [18, 29], // 48
    [19, 28], // 49
  ]

  // Fill the interior with GROUND
  for (let y = 0; y < MAP_H; y++) {
    if (y < bounds.length) {
      const [left, right] = bounds[y]
      for (let x = left; x <= right; x++) {
        map[y][x] = T.GROUND
      }
    }
  }

  // Add water area (top-left, rows 0-8)
  for (let y = 0; y < 9; y++) {
    for (let x = 10; x < 22; x++) {
      if (map[y][x] === T.GROUND) {
        map[y][x] = T.WATER
      }
    }
  }

  // Add buildings (black blobs scattered)
  const buildings = [
    // Large building bottom-right (gray in map = large structure)
    { x: 24, y: 38, w: 8, h: 8 },
    // Various buildings throughout
    { x: 14, y: 14, w: 4, h: 3 },
    { x: 20, y: 18, w: 5, h: 4 },
    { x: 28, y: 12, w: 4, h: 3 },
    { x: 16, y: 28, w: 3, h: 4 },
    { x: 24, y: 24, w: 4, h: 3 },
    { x: 12, y: 36, w: 3, h: 3 },
    { x: 18, y: 8, w: 3, h: 3 },
    { x: 26, ty: 8, w: 4, h: 3 },
    { x: 30, y: 28, w: 3, h: 3 },
    { x: 11, y: 22, w: 3, h: 3 },
  ]

  buildings.forEach(b => {
    const by = b.y !== undefined ? b.y : b.ty
    if (by === undefined) return
    for (let dy = 0; dy < b.h; dy++) {
      for (let dx = 0; dx < b.w; dx++) {
        const yy = by + dy, xx = b.x + dx
        if (yy >= 0 && yy < MAP_H && xx >= 0 && xx < MAP_W) {
          if (map[yy][xx] === T.GROUND) map[yy][xx] = T.BUILDING
        }
      }
    }
  })

  // Add trees (green patches)
  const trees = [
    [13, 12], [14, 13], [30, 16], [31, 17], [12, 20], [13, 21],
    [28, 26], [29, 25], [16, 33], [17, 34], [10, 30], [11, 29],
    [32, 10], [33, 11], [20, 35], [21, 36], [26, 20], [27, 21],
    [15, 40], [14, 41], [10, 26], [11, 27],
  ]
  trees.forEach(([x, y]) => {
    if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W && map[y][x] === T.GROUND) {
      map[y][x] = T.TREE
    }
  })

  // Carve the main PATH (orange winding road)
  // Path from start (bottom) winding up through the map
  const pathPoints = [
    // Start area - bottom center going up
    ...line(20, 47, 20, 44),
    ...line(20, 44, 22, 42),
    ...line(22, 42, 22, 38),
    // Branch right to Experience
    ...line(22, 38, 28, 38),
    ...line(28, 38, 32, 36),
    ...line(32, 36, 32, 34),
    // Continue up from junction
    ...line(22, 38, 20, 35),
    ...line(20, 35, 20, 32),
    ...line(20, 32, 22, 30),
    ...line(22, 30, 26, 28),
    // Branch right to Projects
    ...line(26, 28, 30, 26),
    ...line(30, 26, 33, 26),
    // Continue left from junction to Skills
    ...line(22, 30, 18, 28),
    ...line(18, 28, 14, 26),
    ...line(14, 26, 12, 26),
    // Continue up to Contact area
    ...line(18, 28, 18, 24),
    ...line(18, 24, 16, 20),
    ...line(16, 20, 16, 16),
    ...line(16, 16, 14, 14),
    ...line(14, 14, 14, 10),
    // Bridge to contact
    ...line(14, 10, 14, 8),
  ]

  // Widen the path (make it 2 tiles wide in most places)
  const pathSet = new Set()
  pathPoints.forEach(([x, y]) => {
    pathSet.add(`${x},${y}`)
    pathSet.add(`${x + 1},${y}`)
    pathSet.add(`${x},${y + 1}`)
  })

  pathSet.forEach(key => {
    const [x, y] = key.split(',').map(Number)
    if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
      if (map[y][x] !== T.WATER && map[y][x] !== T.VOID) {
        map[y][x] = T.PATH
      }
    }
  })

  // Bridge over water (near contact)
  for (let y = 6; y <= 9; y++) {
    for (let dx = 0; dx < 2; dx++) {
      if (map[y][14 + dx] === T.WATER) {
        map[y][14 + dx] = T.BRIDGE
      }
    }
  }

  // Set landmark tiles to PATH (ensure they're walkable)
  LANDMARKS.forEach(lm => {
    if (lm.ty >= 0 && lm.ty < MAP_H && lm.tx >= 0 && lm.tx < MAP_W) {
      map[lm.ty][lm.tx] = T.PATH
      if (lm.tx + 1 < MAP_W) map[lm.ty][lm.tx + 1] = T.PATH
    }
  })

  // Set zombie spawn tiles
  ZOMBIE_SPAWNS.forEach(z => {
    if (z.ty >= 0 && z.ty < MAP_H && z.tx >= 0 && z.tx < MAP_W) {
      map[z.ty][z.tx] = T.ZOMBIE
    }
  })

  return map
}

// Bresenham line helper
function line(x0, y0, x1, y1) {
  const points = []
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
  let err = dx - dy, cx = x0, cy = y0
  while (true) {
    points.push([cx, cy])
    if (cx === x1 && cy === y1) break
    const e2 = 2 * err
    if (e2 > -dy) { err -= dy; cx += sx }
    if (e2 < dx) { err += dx; cy += sy }
  }
  return points
}

export const MAP = generateMap()
