import { useEffect, useRef, useState, useCallback } from 'react'
import { GameEngine } from './game/Engine.js'
import Joystick from './components/Joystick.jsx'
import DetailPopup from './components/DetailPopup.jsx'
import HUD from './components/HUD.jsx'

export default function App() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [activeLandmark, setActiveLandmark] = useState(null)
  const [showKillPrompt, setShowKillPrompt] = useState(false)
  const [started, setStarted] = useState(false)

  const handleSignActivate = useCallback((landmark) => {
    setActiveLandmark(landmark)
  }, [])

  const handleSignDeactivate = useCallback(() => {
    setActiveLandmark(null)
  }, [])

  const handleKillPrompt = useCallback((show) => {
    setShowKillPrompt(show)
  }, [])

  useEffect(() => {
    if (!started || !canvasRef.current) return

    const engine = new GameEngine(
      canvasRef.current,
      handleSignActivate,
      handleSignDeactivate,
      handleKillPrompt
    )
    engineRef.current = engine
    engine.start()

    return () => engine.stop()
  }, [started, handleSignActivate, handleSignDeactivate, handleKillPrompt])

  const handleJoystickMove = useCallback((x, y) => {
    if (engineRef.current) engineRef.current.setJoystick(x, y)
  }, [])

  const handleJoystickStop = useCallback(() => {
    if (engineRef.current) engineRef.current.clearJoystick()
  }, [])

  const handleKill = useCallback(() => {
    if (engineRef.current) engineRef.current.tryKill()
  }, [])

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0e14', cursor: 'crosshair' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <HUD showKillPrompt={showKillPrompt} />
      <DetailPopup landmark={activeLandmark} />
      <Joystick
        onMove={handleJoystickMove}
        onStop={handleJoystickStop}
        onKill={handleKill}
        showKill={showKillPrompt}
      />
    </div>
  )
}

function StartScreen({ onStart }) {
  const [bootLines, setBootLines] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const lines = [
      '> INITIALIZING WASTELAND ENGINE...',
      '> LOADING MAP: SECTOR_7...',
      '> DEPLOYING M-7 UNIT...',
      '> SCANNING FOR HOSTILES...',
      '> ACTIVATING NEON BEACONS...',
      '> SYSTEM ONLINE ✓',
    ]
    let i = 0
    const timer = setInterval(() => {
      if (i < lines.length) {
        setBootLines(prev => [...prev, lines[i]])
        i++
      } else {
        clearInterval(timer)
        setTimeout(() => setReady(true), 400)
      }
    }, 350)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0a0e14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28,
    }}>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 'clamp(18px, 4vw, 36px)',
        color: '#00c8b4',
        letterSpacing: 8,
        textShadow: '0 0 20px rgba(0, 200, 180, 0.5)',
        textAlign: 'center',
      }}>
        CODE SURVIVE
      </div>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 14,
        color: 'rgba(0, 200, 180, 0.5)',
        letterSpacing: 3,
        textTransform: 'uppercase',
      }}>
        A Portfolio Experience
      </div>

      <div style={{
        background: 'rgba(0, 8, 16, 0.9)',
        border: '1px solid rgba(0, 200, 180, 0.2)',
        borderRadius: 10,
        padding: '18px 24px',
        width: 380,
        maxWidth: '90vw',
        minHeight: 140,
      }}>
        {bootLines.map((line, i) => (
          <div key={i} style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            color: i === bootLines.length - 1 && line.includes('✓') ? '#00c864' : 'rgba(0, 200, 180, 0.6)',
            lineHeight: 2,
            letterSpacing: 0.5,
          }}>
            {line}
          </div>
        ))}
        {!ready && (
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: '#00c8b4',
            fontSize: 14,
            animation: 'blink 0.6s infinite',
          }}>_</span>
        )}
      </div>

      {ready && (
        <button
          onClick={onStart}
          style={{
            padding: '12px 40px',
            background: 'transparent',
            border: '1.5px solid #00c8b4',
            borderRadius: 40,
            color: '#00c8b4',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14,
            letterSpacing: 4,
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 200, 180, 0.2)',
            transition: 'all 0.2s',
            animation: 'fadeIn 0.5s ease-out',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 200, 180, 0.15)'
            e.target.style.boxShadow = '0 0 30px rgba(0, 200, 180, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.boxShadow = '0 0 20px rgba(0, 200, 180, 0.2)'
          }}
        >
          ENTER WASTELAND
        </button>
      )}

      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
        color: 'rgba(0, 200, 180, 0.3)',
        letterSpacing: 1,
        textAlign: 'center',
        lineHeight: 2,
      }}>
        WASD / ARROWS — MOVE &nbsp;·&nbsp; F — KILL ZOMBIE<br />
        WALK TO NEON SIGNS TO EXPLORE PORTFOLIO
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
