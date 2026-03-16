import { useRef, useCallback, useEffect, useState } from 'react'

export default function Joystick({ onMove, onStop, onKill, showKill }) {
  const joyRef = useRef(null)
  const [active, setActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const stickPos = useRef({ x: 0, y: 0 })
  const centerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleStart = useCallback((e) => {
    e.preventDefault()
    const rect = joyRef.current.getBoundingClientRect()
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    setActive(true)
    handleMove(e)
  }, [])

  const handleMove = useCallback((e) => {
    if (!joyRef.current) return
    const touch = e.touches ? e.touches[0] : e
    const dx = touch.clientX - centerRef.current.x
    const dy = touch.clientY - centerRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 45
    const clamped = Math.min(dist, maxDist)
    const angle = Math.atan2(dy, dx)
    const nx = (Math.cos(angle) * clamped) / maxDist
    const ny = (Math.sin(angle) * clamped) / maxDist
    stickPos.current = { x: nx, y: ny }
    onMove(nx, ny)
  }, [onMove])

  const handleEnd = useCallback(() => {
    setActive(false)
    stickPos.current = { x: 0, y: 0 }
    onStop()
  }, [onStop])

  if (!isMobile) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      pointerEvents: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: '0 24px 30px',
    }}>
      {/* D-pad / Joystick */}
      <div
        ref={joyRef}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'rgba(10, 18, 28, 0.75)',
          border: '2px solid rgba(0, 200, 180, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          position: 'relative',
          boxShadow: '0 0 20px rgba(0, 200, 180, 0.1)',
        }}
      >
        {/* Direction indicators */}
        {['▲', '▼', '◄', '►'].map((arrow, i) => {
          const positions = [
            { top: 8, left: '50%', transform: 'translateX(-50%)' },
            { bottom: 8, left: '50%', transform: 'translateX(-50%)' },
            { left: 8, top: '50%', transform: 'translateY(-50%)' },
            { right: 8, top: '50%', transform: 'translateY(-50%)' },
          ]
          return (
            <span key={i} style={{
              position: 'absolute',
              ...positions[i],
              color: 'rgba(0, 200, 180, 0.4)',
              fontSize: 14,
              fontFamily: 'monospace',
              pointerEvents: 'none',
            }}>{arrow}</span>
          )
        })}
        {/* Stick knob */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: active
            ? 'rgba(0, 200, 180, 0.4)'
            : 'rgba(0, 200, 180, 0.2)',
          border: '2px solid rgba(0, 200, 180, 0.6)',
          transform: `translate(${stickPos.current.x * 35}px, ${stickPos.current.y * 35}px)`,
          transition: active ? 'none' : 'transform 0.15s',
          boxShadow: active ? '0 0 15px rgba(0, 200, 180, 0.4)' : 'none',
        }} />
      </div>

      {/* Kill button */}
      {showKill && (
        <button
          onTouchStart={(e) => { e.preventDefault(); onKill() }}
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'rgba(180, 40, 30, 0.7)',
            border: '2px solid rgba(255, 80, 50, 0.8)',
            color: '#fff',
            fontFamily: "'Orbitron', monospace",
            fontSize: 11,
            fontWeight: 'bold',
            letterSpacing: 1,
            pointerEvents: 'all',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255, 80, 50, 0.3)',
            animation: 'pulse-kill 1.5s ease-in-out infinite',
          }}
        >
          KILL
        </button>
      )}

      <style>{`
        @keyframes pulse-kill {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 80, 50, 0.3); }
          50% { transform: scale(1.08); box-shadow: 0 0 30px rgba(255, 80, 50, 0.5); }
        }
      `}</style>
    </div>
  )
}
