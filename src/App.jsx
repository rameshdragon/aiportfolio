import { useState, useCallback, useEffect, useRef } from 'react'
import GameWorld from './world/GameWorld.jsx'
import DetailPopup from './components/DetailPopup.jsx'
import Joystick from './components/Joystick.jsx'
import HUD from './components/HUD.jsx'
import { PORTFOLIO } from './data/portfolioData.js'

// ─── PROCEDURAL WIND SOUND ────────────────────────────────────────────────────
function useWindSound(active) {
  useEffect(() => {
    if (!active) return
    let ctx, source, gainNode
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      const bufSize = ctx.sampleRate * 4
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1

      source = ctx.createBufferSource()
      source.buffer = buf
      source.loop = true

      // Band-pass filter to shape wind
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'; bp.frequency.value = 350; bp.Q.value = 0.4

      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'; lp.frequency.value = 700

      gainNode = ctx.createGain()
      gainNode.gain.value = 0.06

      source.connect(bp).connect(lp).connect(gainNode).connect(ctx.destination)
      source.start()
    } catch (_) { /* autoplay blocked or not supported */ }

    return () => {
      try { source?.stop(); ctx?.close() } catch (_) {}
    }
  }, [active])
}

// ─── FOOTSTEP SOUND ───────────────────────────────────────────────────────────
function useFootstepSound(moving) {
  const timerRef = useRef(null)
  useEffect(() => {
    if (!moving) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02))
        const src = ctx.createBufferSource()
        src.buffer = buf
        const g = ctx.createGain(); g.gain.value = 0.18
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500
        src.connect(lp).connect(g).connect(ctx.destination)
        src.start()
        src.onended = () => ctx.close()
      } catch (_) {}
    }, 400)
    return () => clearInterval(timerRef.current)
  }, [moving])
}

export default function App() {
  const [activeLandmark,  setActiveLandmark]  = useState(null)
  const [showKillPrompt,  setShowKillPrompt]  = useState(false)
  const [started,         setStarted]         = useState(false)
  const [kills,           setKills]           = useState(0)
  const [playerHasMoved,  setPlayerHasMoved]  = useState(false)
  const [nearPaper,       setNearPaper]       = useState(false)
  const [showResume,      setShowResume]      = useState(false)

  useWindSound(started)

  const handleSignActivate   = useCallback((lm) => setActiveLandmark(lm), [])
  const handleSignDeactivate = useCallback(()   => setActiveLandmark(null), [])
  const handleKillPrompt     = useCallback((s)  => setShowKillPrompt(s), [])
  const handleKill           = useCallback(()   => setKills(k => k + 1), [])
  const handlePlayerMove     = useCallback(() => {
    setPlayerHasMoved(true)
  }, [])
  const handleNearPaper  = useCallback((near) => setNearPaper(near), [])
  const handlePickupPaper = useCallback(() => { setShowResume(true); setNearPaper(false) }, [])

  if (!started) return <StartScreen onStart={() => setStarted(true)} />

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#120a04', cursor: 'crosshair' }}>
      <GameWorld
        onSignActivate={handleSignActivate}
        onSignDeactivate={handleSignDeactivate}
        onKillPrompt={handleKillPrompt}
        onKill={handleKill}
        onPlayerMove={handlePlayerMove}
        onNearPaper={handleNearPaper}
      />

      {/* Intro overlay — shows until player moves */}
      <IntroOverlay visible={!playerHasMoved} />

      {/* Pick-up prompt */}
      {nearPaper && !showResume && (
        <button
          onClick={handlePickupPaper}
          style={{
            position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(224,100,20,0.2)', border: '1.5px solid #e06820',
            borderRadius: 8, padding: '10px 28px',
            fontFamily: 'monospace', fontSize: 13, color: '#e06820', letterSpacing: 3,
            cursor: 'pointer', zIndex: 200, animation: 'apocPulse 1.2s ease-in-out infinite',
            backdropFilter: 'blur(8px)',
          }}
        >
          [ E ] PICK UP RESUME
        </button>
      )}

      <HUD showKillPrompt={showKillPrompt} kills={kills} />
      {!showResume && <DetailPopup landmark={activeLandmark} />}
      {showResume && <ResumePopup onClose={() => setShowResume(false)} />}
      <Joystick showKill={showKillPrompt} />

      <style>{`
        @keyframes apocPulse {
          0%,100% { box-shadow: 0 0 10px rgba(224,100,20,0.3); }
          50%      { box-shadow: 0 0 24px rgba(224,100,20,0.7); }
        }
      `}</style>
    </div>
  )
}

// ─── INTRO OVERLAY ────────────────────────────────────────────────────────────
function IntroOverlay({ visible }) {
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: '38%', maxWidth: 420,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '0 0 0 48px',
      zIndex: 100, pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-40px)',
      transition: 'opacity 1.2s ease, transform 1.2s ease',
    }}>
      {/* Status */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(106,170,42,0.12)', border: '1px solid rgba(106,170,42,0.4)',
        borderRadius: 20, padding: '5px 16px', width: 'fit-content', marginBottom: 20,
        animation: visible ? 'statusBlink 2.5s ease-in-out infinite' : 'none',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6aaa2a', display: 'inline-block' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6aaa2a', letterSpacing: 2.5 }}>OPEN TO WORK</span>
      </div>

      {/* Name — big, bold, distressed */}
      <div style={{
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 900,
        fontSize: 'clamp(36px, 5vw, 64px)',
        color: '#f0d8b0', lineHeight: 0.95,
        textShadow: '2px 2px 0 rgba(224,100,20,0.4), 4px 4px 20px rgba(0,0,0,0.8)',
        marginBottom: 6, letterSpacing: -1,
      }}>
        RAMESH<br />REDDY
      </div>

      {/* Thick accent line */}
      <div style={{
        width: 80, height: 4,
        background: 'linear-gradient(90deg, #e06820, #c8a020, transparent)',
        borderRadius: 2, marginBottom: 18,
      }} />

      {/* Title */}
      <div style={{
        fontFamily: 'monospace', fontSize: 'clamp(11px, 1.4vw, 15px)',
        color: '#e06820', letterSpacing: 3, marginBottom: 6, lineHeight: 1.8,
      }}>
        AI &amp; FRONTEND ENGINEER
      </div>
      <div style={{
        fontFamily: 'monospace', fontSize: 'clamp(10px, 1.2vw, 13px)',
        color: 'rgba(240,216,176,0.5)', letterSpacing: 2, marginBottom: 28,
      }}>
        MS COMPUTER SCIENCE
      </div>

      {/* Walk prompt */}
      <div style={{
        fontFamily: 'monospace', fontSize: 11, color: 'rgba(240,216,176,0.35)',
        letterSpacing: 1.5, lineHeight: 2,
        borderLeft: '2px solid rgba(224,100,20,0.3)', paddingLeft: 14,
        animation: visible ? 'fadeFlicker 3s ease-in-out infinite' : 'none',
      }}>
        WASD — MOVE<br />
        WALK TO NEON SIGNS<br />
        F — NEUTRALIZE HOSTILES
      </div>

      <style>{`
        @keyframes statusBlink {
          0%,100% { box-shadow: 0 0 8px rgba(106,170,42,0.3); }
          50%      { box-shadow: 0 0 20px rgba(106,170,42,0.6); }
        }
        @keyframes fadeFlicker {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// ─── RESUME POPUP ─────────────────────────────────────────────────────────────
function ResumePopup({ onClose }) {
  const d = PORTFOLIO
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(5,2,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(14,7,2,0.98)',
          border: '1px solid rgba(224,100,20,0.35)',
          borderRadius: 16, padding: '28px 32px',
          maxWidth: 600, width: '92%', maxHeight: '85vh', overflowY: 'auto',
          animation: 'apocIn 0.3s ease-out',
          boxShadow: '0 0 60px rgba(224,100,20,0.2), 0 32px 64px rgba(0,0,0,0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 900, fontSize: 28, color: '#f0d8b0' }}>{d.intro.name}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#e06820', letterSpacing: 2, marginTop: 4 }}>AI & Frontend Engineer · {d.contact.location}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(240,216,176,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(224,100,20,0.2)', marginBottom: 20 }} />

        {/* Summary */}
        <Section title="PROFILE">{d.intro.brief}</Section>

        {/* Experience */}
        <Section title="EXPERIENCE">
          {d.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: '#f0d8b0' }}>{e.role} — {e.org}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#c8a020', letterSpacing: 1, marginBottom: 6 }}>{e.date}</div>
              {e.bullets.map((b, j) => (
                <div key={j} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: 'rgba(240,216,176,0.6)', marginBottom: 3, paddingLeft: 14 }}>
                  ⚡ {b}
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* Skills */}
        <Section title="SKILLS">
          {Object.entries(d.skills).map(([cat, skills]) => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#e06820', letterSpacing: 2, marginBottom: 6 }}>{cat.toUpperCase()}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map(s => (
                  <span key={s} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: 'rgba(224,100,20,0.1)', border: '1px solid rgba(224,100,20,0.3)', color: '#e06820' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </Section>

        {/* Contact */}
        <Section title="CONTACT">
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: 'rgba(240,216,176,0.6)', lineHeight: 2 }}>
            ✉ {d.contact.email}<br />
            📡 {d.contact.phone}<br />
            ⚡ github.com/rameshdragon<br />
            🔗 ramesh-reddy-changal (LinkedIn)
          </div>
        </Section>

        {/* Download button */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <a
            href="/resume.pdf" download="Ramesh_Reddy_Changal_Resume.pdf"
            style={{
              flex: 1, textAlign: 'center', padding: '12px 20px', borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(224,100,20,0.25), rgba(200,160,32,0.15))',
              border: '1.5px solid #e06820', color: '#e06820',
              fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, textDecoration: 'none',
            }}
          >
            ↓ DOWNLOAD RESUME
          </a>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px', borderRadius: 8,
              background: 'transparent', border: '1px solid rgba(240,216,176,0.15)',
              color: 'rgba(240,216,176,0.4)', fontFamily: 'monospace', fontSize: 12, letterSpacing: 1, cursor: 'pointer',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes apocIn {
          from { opacity: 0; transform: scale(0.96) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#c8a020', letterSpacing: 3, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{title}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(200,160,32,0.2)' }} />
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── START SCREEN (apocalypse themed) ────────────────────────────────────────
function StartScreen({ onStart }) {
  const [bootLines, setBootLines] = useState([])
  const [ready,     setReady]     = useState(false)

  useState(() => {
    const lines = [
      '> WASTELAND OS v3.7 BOOTING...',
      '> LOADING SECTOR MAP DATA...',
      '> DEPLOYING FIELD UNIT: RAMESH_7...',
      '> HOSTILE SCAN... 8 TARGETS FOUND...',
      '> PORTFOLIO BEACONS ONLINE...',
      '> SYSTEM READY ▲ GOOD LUCK OUT THERE',
    ]
    let i = 0
    const timer = setInterval(() => {
      if (i < lines.length) {
        const line = lines[i++]
        setBootLines(prev => [...prev, line])
      } else {
        clearInterval(timer)
        setTimeout(() => setReady(true), 400)
      }
    }, 380)
    return () => clearInterval(timer)
  })

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #120804 0%, #0a0500 60%, #080306 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      {/* Grunge title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 900,
          fontSize: 'clamp(32px, 6vw, 72px)', color: '#f0d8b0', letterSpacing: 4,
          textShadow: '0 0 30px rgba(224,100,20,0.4), 3px 3px 0 rgba(200,60,0,0.6)',
          lineHeight: 1,
        }}>
          DEAD ZONE
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: 12, color: '#e06820',
          letterSpacing: 5, marginTop: 8,
        }}>
          ▲ PORTFOLIO EXPERIENCE ▲
        </div>
      </div>

      {/* Boot terminal */}
      <div style={{
        background: 'rgba(5,2,0,0.9)', border: '1px solid rgba(224,100,20,0.25)',
        borderRadius: 10, padding: '18px 24px', width: 420, maxWidth: '90vw', minHeight: 130,
      }}>
        {bootLines.map((line, i) => (
          <div key={i} style={{
            fontFamily: 'monospace', fontSize: 11, lineHeight: 2,
            color: line.includes('READY') ? '#6aaa2a' : 'rgba(240,216,176,0.55)',
            letterSpacing: 0.5,
          }}>
            {line}
          </div>
        ))}
        {!ready && <span style={{ fontFamily: 'monospace', color: '#e06820', fontSize: 14, animation: 'blink 0.5s infinite' }}>_</span>}
      </div>

      {ready && (
        <button
          onClick={onStart}
          style={{
            padding: '13px 48px', background: 'transparent',
            border: '1.5px solid #e06820', borderRadius: 6,
            color: '#e06820', fontFamily: 'monospace', fontSize: 13, letterSpacing: 5,
            cursor: 'pointer', boxShadow: '0 0 24px rgba(224,100,20,0.2)',
            transition: 'all 0.2s', animation: 'fadeIn 0.5s ease-out',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(224,100,20,0.15)'; e.target.style.boxShadow = '0 0 36px rgba(224,100,20,0.5)' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = '0 0 24px rgba(224,100,20,0.2)' }}
        >
          ENTER WASTELAND
        </button>
      )}

      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(240,216,176,0.25)', letterSpacing: 1, textAlign: 'center', lineHeight: 2.2 }}>
        WASD / ARROWS — MOVE &nbsp;·&nbsp; MOUSE DRAG — CAMERA &nbsp;·&nbsp; F — ELIMINATE HOSTILE<br />
        APPROACH GLOWING BEACONS TO EXPLORE PORTFOLIO
      </div>

      <style>{`
        @keyframes blink   { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
