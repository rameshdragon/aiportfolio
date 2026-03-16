import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const BOOT_LINES = [
  '> INITIALIZING NEURAL INTERFACE...',
  '> LOADING 3D RENDER ENGINE...',
  '> CONNECTING TO PORTFOLIO DATABASE...',
  '> CALIBRATING HOLOGRAPHIC DISPLAY...',
  '> PORTFOLIO ONLINE ✓',
]

export default function LoadingScreen({ onComplete }) {
  const [lines, setLines] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let i = 0
    const addLine = () => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]])
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100))
        i++
        setTimeout(addLine, 380)
      } else {
        setTimeout(onComplete, 500)
      }
    }
    setTimeout(addLine, 300)
  }, [onComplete])

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: '#000408',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 28,
      }}
    >
      {/* Logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 80, height: 80,
          border: '2px solid #00d4ff',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(0,212,255,0.4)',
          position: 'relative',
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 6,
            border: '1.5px solid #00ffcc',
            borderRadius: '50%',
          }}
        />
        <span style={{ fontSize: 28, position: 'relative', zIndex: 2 }}>⚡</span>
      </motion.div>

      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, color: '#00d4ff', letterSpacing: 6, fontWeight: 900 }}>
        RAMESH.DEV
      </div>

      {/* Terminal */}
      <div style={{
        background: 'rgba(0,5,15,0.9)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 12,
        padding: '18px 24px',
        width: 380,
        maxWidth: '90vw',
        minHeight: 160,
      }}>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 11,
              color: i === lines.length - 1 ? '#00ffcc' : 'rgba(0,212,255,0.65)',
              lineHeight: 2,
              letterSpacing: 1,
            }}
          >
            {line}
          </motion.div>
        ))}
        {lines.length < BOOT_LINES.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ fontFamily: 'Share Tech Mono, monospace', color: '#00d4ff', fontSize: 14 }}
          >
            _
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ width: 380, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,212,255,0.5)', letterSpacing: 2 }}>LOADING SYSTEMS</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: '#00d4ff' }}>{progress}%</span>
        </div>
        <div style={{ height: 3, background: 'rgba(0,212,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #00d4ff, #00ffcc)', borderRadius: 2, boxShadow: '0 0 8px #00d4ff' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
