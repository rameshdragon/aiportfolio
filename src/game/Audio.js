// Web Audio API sound effects
let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function tone(freq, dur, type = 'sine', vol = 0.1, slide = null) {
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = type
    o.frequency.setValueAtTime(freq, c.currentTime)
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + dur)
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.start(); o.stop(c.currentTime + dur)
  } catch (e) { /* silent fail */ }
}

export function playStep() {
  tone(80, 0.08, 'sine', 0.04)
  tone(120, 0.05, 'triangle', 0.02)
}

export function playSignReveal() {
  tone(440, 0.15, 'sine', 0.08, 880)
  setTimeout(() => tone(660, 0.12, 'sine', 0.06), 80)
  setTimeout(() => tone(880, 0.18, 'sine', 0.05), 160)
}

export function playKill() {
  tone(200, 0.12, 'sawtooth', 0.1, 80)
  setTimeout(() => tone(100, 0.2, 'square', 0.06, 40), 60)
  setTimeout(() => tone(60, 0.3, 'sawtooth', 0.05), 120)
}

export function playZombieGroan() {
  tone(90, 0.5, 'sawtooth', 0.03, 60)
  tone(95, 0.4, 'sine', 0.02, 70)
}

export function playAmbient() {
  // Low rumble
  tone(40, 2.0, 'sine', 0.015, 35)
  tone(55, 1.5, 'triangle', 0.01, 45)
}

// Footstep counter for timing
let stepCount = 0
export function stepTick() {
  stepCount++
  if (stepCount % 12 === 0) playStep()
}
