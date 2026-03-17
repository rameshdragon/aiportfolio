import { useState } from 'react'
import CyberpunkCity from './components/CyberpunkCity.jsx'

export default function App() {
  const [started, setStarted] = useState(false)
  if (started) return <CyberpunkCity />
  return <BootScreen onStart={() => setStarted(true)} />
}

// ─── BOOT SCREEN ──────────────────────────────────────────────────────────────
function BootScreen({ onStart }) {
  const [lines, setLines]   = useState([])
  const [ready, setReady]   = useState(false)

  useState(() => {
    const msgs = [
      '> NEURAL-CITY OS v7.0 INITIALIZING...',
      '> LOADING CITY SECTOR MAP...',
      '> SPAWNING 5 LAUNCH PADS...',
      '> ACTIVATING OCEAN THRUSTERS...',
      '> CALIBRATING HOLOGRAPHIC DISPLAYS...',
      '> ALL SYSTEMS ONLINE ▲ WELCOME ABOARD',
    ]
    let i = 0
    const t = setInterval(() => {
      if (i < msgs.length) setLines(p => [...p, msgs[i++]])
      else { clearInterval(t); setTimeout(() => setReady(true), 400) }
    }, 380)
    return () => clearInterval(t)
  })

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at center, #030d1e 0%, #010812 70%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'monospace', fontWeight: 900,
          fontSize: 'clamp(28px, 5vw, 64px)', color: '#00ccff', letterSpacing: 6,
          textShadow: '0 0 40px rgba(0,200,255,0.5), 0 0 80px rgba(0,100,255,0.3)',
        }}>
          NEURAL CITY
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: 11, color: '#0066ff',
          letterSpacing: 8, marginTop: 8, opacity: 0.8,
        }}>
          ◈ CYBERPUNK FLOATING MEGACITY ◈
        </div>
      </div>

      {/* Terminal */}
      <div style={{
        background: 'rgba(0,8,22,0.95)', border: '1px solid rgba(0,170,255,0.25)',
        borderRadius: 10, padding: '18px 26px', width: 440, maxWidth: '90vw', minHeight: 130,
        boxShadow: '0 0 40px rgba(0,100,255,0.1)',
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            fontFamily: 'monospace', fontSize: 11, lineHeight: 2,
            color: line.includes('ONLINE') ? '#00ff88' : 'rgba(0,200,255,0.65)',
            letterSpacing: 0.5,
          }}>
            {line}
          </div>
        ))}
        {!ready && <span style={{
          fontFamily: 'monospace', color: '#00aaff', fontSize: 14,
          animation: 'blink 0.5s infinite',
        }}>_</span>}
      </div>

      {ready && (
        <button
          onClick={onStart}
          style={{
            padding: '14px 52px', background: 'transparent',
            border: '1.5px solid #00aaff', borderRadius: 6,
            color: '#00aaff', fontFamily: 'monospace', fontSize: 13, letterSpacing: 5,
            cursor: 'pointer', boxShadow: '0 0 24px rgba(0,170,255,0.2)',
            transition: 'all 0.2s', animation: 'fadeIn 0.5s ease-out',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(0,170,255,0.12)'; e.target.style.boxShadow = '0 0 40px rgba(0,170,255,0.5)' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = '0 0 24px rgba(0,170,255,0.2)' }}
        >
          ENTER CITY
        </button>
      )}

      <div style={{
        fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,170,255,0.25)',
        letterSpacing: 2, textAlign: 'center', lineHeight: 2.2,
      }}>
        DRAG — ORBIT &nbsp;·&nbsp; SCROLL — ZOOM &nbsp;·&nbsp; CITY FLOATS ON OCEAN
      </div>

      <style>{`
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
