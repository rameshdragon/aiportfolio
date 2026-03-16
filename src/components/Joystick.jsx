import { useRef, useCallback, useEffect, useState } from 'react'

export default function Joystick({ showKill }) {
  const [isMobile, setIsMobile] = useState(false)
  const stickRef = useRef(null)
  const baseRef = useRef(null)
  const activeTouch = useRef(null)
  const originRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleTouchStart = useCallback((e) => {
    if (activeTouch.current !== null) return
    const touch = e.touches[0]
    activeTouch.current = touch.identifier
    const rect = baseRef.current.getBoundingClientRect()
    originRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }, [])

  const handleTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i]
      if (touch.identifier === activeTouch.current) {
        const dx = touch.clientX - originRef.current.x
        const dy = touch.clientY - originRef.current.y
        const maxDist = 40
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
        const angle = Math.atan2(dy, dx)
        const nx = Math.cos(angle) * dist
        const ny = Math.sin(angle) * dist

        if (stickRef.current) {
          stickRef.current.style.transform = `translate(${nx}px, ${ny}px)`
        }

        // Normalize to -1..1
        const jx = nx / maxDist
        const jy = -ny / maxDist // invert Y for game coords
        if (window.__gameSetJoystick) {
          window.__gameSetJoystick(jx, jy)
        }
        break
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    let found = false
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === activeTouch.current) {
        found = true
        break
      }
    }
    if (!found) {
      activeTouch.current = null
      if (stickRef.current) {
        stickRef.current.style.transform = 'translate(0px, 0px)'
      }
      if (window.__gameClearJoystick) {
        window.__gameClearJoystick()
      }
    }
  }, [])

  const handleKill = useCallback(() => {
    if (window.__gameKill) {
      window.__gameKill()
    }
  }, [])

  if (!isMobile) return null

  return (
    <>
      {/* Joystick */}
      <div
        ref={baseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          bottom: 40,
          left: 40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(0, 200, 180, 0.1)',
          border: '2px solid rgba(0, 200, 180, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          touchAction: 'none',
        }}
      >
        <div
          ref={stickRef}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(0, 200, 180, 0.4)',
            border: '2px solid rgba(0, 200, 180, 0.6)',
            boxShadow: '0 0 15px rgba(0, 200, 180, 0.3)',
            transition: 'transform 0.05s',
          }}
        />
      </div>

      {/* Kill button */}
      {showKill && (
        <button
          onTouchStart={handleKill}
          style={{
            position: 'fixed',
            bottom: 60,
            right: 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(200, 50, 50, 0.3)',
            border: '2px solid rgba(255, 80, 80, 0.6)',
            color: '#ff6644',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            cursor: 'pointer',
            zIndex: 200,
            touchAction: 'none',
            boxShadow: '0 0 20px rgba(255, 80, 80, 0.3)',
          }}
        >
          KILL
        </button>
      )}

      {/* Interact button (always visible on mobile) */}
      <button
        onTouchStart={() => {
          // Simulate F key press for sign interaction
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }))
        }}
        style={{
          position: 'fixed',
          bottom: 160,
          right: 40,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(0, 200, 180, 0.15)',
          border: '2px solid rgba(0, 200, 180, 0.4)',
          color: '#00c8b4',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          letterSpacing: 1,
          cursor: 'pointer',
          zIndex: 200,
          touchAction: 'none',
          boxShadow: '0 0 15px rgba(0, 200, 180, 0.2)',
        }}
      >
        READ
      </button>
    </>
  )
}
