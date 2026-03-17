import { useState, useEffect, useRef, useCallback } from 'react'
import { PORTFOLIO } from '../data/portfolioData.js'

// ─── APOCALYPSE COLOUR PALETTE ───────────────────────────────────────────────
const C = {
  bg:          'rgba(10, 5, 2, 0.97)',
  cardBg:      'rgba(28, 14, 4, 0.92)',
  cardBorder:  'rgba(224, 100, 20, 0.28)',
  accent:      '#e06820',
  gold:        '#c8a020',
  green:       '#6aaa2a',
  red:         '#d03020',
  text:        '#f0d8b0',
  muted:       'rgba(240,216,176,0.55)',
  pillBg:      'rgba(224,100,20,0.10)',
  pillBorder:  'rgba(224,100,20,0.38)',
}

function buildSlides(section) {
  const d = PORTFOLIO
  if (section === 'intro')      return [{ type: 'profile' }]
  if (section === 'experience') return d.experience.map((exp, i) => ({ type: 'job',     data: exp,  num: i + 1, total: d.experience.length }))
  if (section === 'projects')   return d.projects.map((p, i)   => ({ type: 'project',  data: p,    num: i + 1, total: d.projects.length   }))
  if (section === 'skills')     return [{ type: 'skills' }]
  if (section === 'contact')    return [{ type: 'contact' }]
  return []
}

export default function DetailPopup({ landmark }) {
  const [slideIdx,    setSlideIdx]    = useState(0)
  const [displayIdx,  setDisplayIdx]  = useState(0)
  const [flipPhase,   setFlipPhase]   = useState('in') // 'in' | 'out'
  const pendingIdx = useRef(0)
  const animating  = useRef(false)

  // Reset on landmark change
  useEffect(() => {
    setSlideIdx(0)
    setDisplayIdx(0)
    setFlipPhase('in')
    animating.current = false
  }, [landmark?.id])

  const navigate = useCallback((newIdx) => {
    if (animating.current) return
    animating.current = true
    pendingIdx.current = newIdx
    setFlipPhase('out')
    setTimeout(() => {
      setDisplayIdx(newIdx)
      setSlideIdx(newIdx)
      setFlipPhase('in')
      setTimeout(() => { animating.current = false }, 320)
    }, 280)
  }, [])

  if (!landmark) return null

  const slides  = buildSlides(landmark.section)
  const slide   = slides[displayIdx] ?? slides[0]
  const total   = slides.length
  const hasPrev = slideIdx > 0
  const hasNext = slideIdx < total - 1

  const cardStyle = {
    background:   C.bg,
    border:       `1px solid ${C.cardBorder}`,
    borderRadius: 16,
    overflow:     'hidden',
    boxShadow:    `0 0 60px rgba(224,100,20,0.2), 0 24px 48px rgba(0,0,0,0.7)`,
    transition:   'transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s ease',
    transformStyle: 'preserve-3d',
    transform:    flipPhase === 'out'
      ? 'perspective(900px) rotateY(90deg) scale(0.95)'
      : 'perspective(900px) rotateY(0deg)  scale(1)',
    opacity:      flipPhase === 'out' ? 0 : 1,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 150, pointerEvents: 'none',
    }}>
      {/* Card wrapper */}
      <div style={{
        position: 'relative',
        maxWidth: 580, width: '92%',
        pointerEvents: 'all',
        animation: 'apocIn 0.35s cubic-bezier(.2,.8,.3,1)',
      }}>

        {/* ── LEFT NAV ── */}
        {hasPrev && (
          <NavBtn onClick={() => navigate(slideIdx - 1)} side="left">‹</NavBtn>
        )}

        {/* ── CARD with flip transform ── */}
        <div style={cardStyle}>
          {/* Top accent stripe */}
          <div style={{
            background: `linear-gradient(135deg, ${C.accent}cc, ${C.gold}88, ${C.red}66)`,
            padding: '10px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,220,180,0.85)', letterSpacing: 3, textTransform: 'uppercase' }}>
              ▲ {landmark.label}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,220,180,0.5)', letterSpacing: 2 }}>
              WALK AWAY TO CLOSE
            </span>
          </div>

          {/* Slide content */}
          <div style={{ padding: '22px 26px 18px' }}>
            <SlideContent slide={slide} />
          </div>

          {/* Bottom nav dots */}
          {total > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 26px 18px' }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => navigate(i)} style={{
                  width: i === slideIdx ? 20 : 6, height: 6,
                  borderRadius: 3, border: 'none', cursor: 'pointer',
                  background: i === slideIdx ? C.accent : 'rgba(224,100,20,0.25)',
                  transition: 'all 0.2s', padding: 0,
                }} />
              ))}
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: C.muted, marginLeft: 10, letterSpacing: 1 }}>
                {slideIdx + 1} / {total}
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT NAV ── */}
        {hasNext && (
          <NavBtn onClick={() => navigate(slideIdx + 1)} side="right">›</NavBtn>
        )}
      </div>

      <style>{`
        @keyframes apocIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes statusPulse {
          0%,100% { box-shadow: 0 0 8px rgba(106,170,42,0.3); }
          50%      { box-shadow: 0 0 18px rgba(106,170,42,0.6); }
        }
      `}</style>
    </div>
  )
}

function NavBtn({ onClick, side, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: '50%',
        [side]: -52, transform: 'translateY(-50%)',
        width: 40, height: 40, borderRadius: '50%',
        background: `rgba(224,100,20,0.18)`,
        border: `1.5px solid ${C.cardBorder}`,
        color: C.accent, fontSize: 22, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', zIndex: 2,
        backdropFilter: 'blur(6px)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `rgba(224,100,20,0.35)` }}
      onMouseLeave={e => { e.currentTarget.style.background = `rgba(224,100,20,0.18)` }}
    >
      {children}
    </button>
  )
}

// ─── SLIDE CONTENT RENDERERS ──────────────────────────────────────────────────

function SlideContent({ slide }) {
  const d = PORTFOLIO
  if (slide.type === 'profile')  return <ProfileSlide  data={d.intro} />
  if (slide.type === 'job')      return <JobSlide       {...slide} />
  if (slide.type === 'project')  return <ProjectSlide   {...slide} />
  if (slide.type === 'skills')   return <SkillsSlide    data={d.skills} />
  if (slide.type === 'contact')  return <ContactSlide   data={d.contact} />
  return null
}

function ProfileSlide({ data }) {
  return (
    <div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: 'rgba(106,170,42,0.12)',
        border: '1px solid rgba(106,170,42,0.4)',
        borderRadius: 20, padding: '4px 14px', marginBottom: 18,
        animation: 'statusPulse 2.4s ease-in-out infinite',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6aaa2a', display: 'inline-block' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6aaa2a', letterSpacing: 2 }}>{data.status}</span>
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 32, color: C.text, lineHeight: 1.1, marginBottom: 6 }}>
        {data.name}
      </div>
      <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.gold})`, borderRadius: 2, marginBottom: 14 }} />
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.accent, letterSpacing: 1.5, marginBottom: 16, lineHeight: 1.7 }}>
        {data.tagline}
      </div>
      <div style={{
        background: C.cardBg, border: `1px solid ${C.cardBorder}`,
        borderRadius: 10, padding: '14px 16px',
        fontFamily: "'Rajdhani', sans-serif", fontSize: 14.5, color: C.muted, lineHeight: 1.75,
      }}>
        {data.brief}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        {[['3+', 'Years Experience'], ['4', 'Live Projects'], ['MS', 'Computer Science']].map(([val, label]) => (
          <div key={label} style={{
            flex: '1 1 auto', textAlign: 'center', minWidth: 80,
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            borderRadius: 10, padding: '10px 8px',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 22, color: C.accent, fontWeight: 700 }}>{val}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: C.muted, letterSpacing: 1 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function JobSlide({ data: exp, num }) {
  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>
        EXPERIENCE // {String(num).padStart(2, '0')}
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 24, color: C.accent, lineHeight: 1.15, marginBottom: 4 }}>
        {exp.role}
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, color: C.text, marginBottom: 2 }}>
        {exp.org}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 18 }}>
        {exp.date}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exp.bullets.map((b, i) => (
          <div key={i} style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            borderRadius: 8, padding: '10px 14px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ color: C.accent, fontSize: 14, marginTop: 1, flexShrink: 0 }}>⚡</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PROJECT MOCKUPS ──────────────────────────────────────────────────────────

const PROJECT_MOCKUPS = {
  'Distributed File System': () => (
    <div style={{
      background: '#0a0a0a', border: '1px solid #1a3a1a', borderRadius: 8,
      padding: '12px 14px', fontFamily: 'monospace', fontSize: 11,
      color: '#4aff6a', lineHeight: 1.7, marginBottom: 14, overflow: 'hidden',
    }}>
      <div style={{ color: '#888', marginBottom: 6 }}>● ● ● &nbsp; distributed-fs / cluster status</div>
      <div><span style={{ color: '#4aff6a' }}>✓</span> master-node:8080 <span style={{ color: '#aaa' }}>— LEADER (raft term 47)</span></div>
      <div><span style={{ color: '#4aff6a' }}>✓</span> chunk-node-1:9001 <span style={{ color: '#aaa' }}>— HEALTHY  chunks: 1,204</span></div>
      <div><span style={{ color: '#4aff6a' }}>✓</span> chunk-node-2:9002 <span style={{ color: '#aaa' }}>— HEALTHY  chunks: 1,198</span></div>
      <div><span style={{ color: '#4aff6a' }}>✓</span> chunk-node-3:9003 <span style={{ color: '#aaa' }}>— HEALTHY  chunks: 1,201</span></div>
      <div style={{ marginTop: 6, color: '#c8a020' }}>replication factor: 3x &nbsp;·&nbsp; uptime: 99.9%</div>
      <div style={{ color: '#888', fontSize: 10 }}>last election: 2.3s ago &nbsp;·&nbsp; 0 node failures detected</div>
    </div>
  ),
  'Realtime Messaging': () => (
    <div style={{
      background: '#080a10', border: '1px solid #1a2a3a', borderRadius: 8,
      overflow: 'hidden', marginBottom: 14,
    }}>
      <div style={{ background: '#0e1520', padding: '8px 12px', fontFamily: 'monospace', fontSize: 10, color: '#4a8aff', letterSpacing: 1 }}>
        ● ● ● &nbsp; realtime-chat / #general &nbsp;— 10,247 online
      </div>
      {[
        ['alex_k', '#4aff6a',  '09:41', 'system latency p99?'],
        ['system', '#c8a020',  '09:41', '→ 47ms (Kafka lag: 0ms, Redis: O(1))'],
        ['priya_m','#e06820',  '09:42', 'impressive. scaling to 12k now'],
        ['system', '#c8a020',  '09:42', '→ auto-scaled GCP Cloud Run ×8 pods'],
        ['alex_k', '#4aff6a',  '09:42', 'zero drops. sick architecture'],
      ].map(([user, col, time, msg]) => (
        <div key={time+msg} style={{ display: 'flex', gap: 10, padding: '5px 12px', fontFamily: 'monospace', fontSize: 11, borderTop: '1px solid #0e1520' }}>
          <span style={{ color: col, minWidth: 64, fontSize: 10 }}>{user}</span>
          <span style={{ color: '#556', fontSize: 10, minWidth: 38 }}>{time}</span>
          <span style={{ color: '#a0b8d8' }}>{msg}</span>
        </div>
      ))}
    </div>
  ),
  'AI Icon Generation SaaS': () => (
    <div style={{
      background: '#08080e', border: '1px solid #2a1a3a', borderRadius: 8,
      padding: '10px 12px', marginBottom: 14,
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a060ff', marginBottom: 8, letterSpacing: 1 }}>
        ● ● ● &nbsp; AI Icon Generator &nbsp;— DALL-E 3 &nbsp;·&nbsp; 5 styles
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 8 }}>
        {[
          { icon: '⚙', bg: '#1a1040', c: '#8040ff' },
          { icon: '🔥', bg: '#1a0a0a', c: '#ff6020' },
          { icon: '⚡', bg: '#0a1a10', c: '#40ff80' },
          { icon: '💡', bg: '#1a1a0a', c: '#ffd020' },
          { icon: '🛡', bg: '#0a1020', c: '#2080ff' },
        ].map(({ icon, bg, c }) => (
          <div key={icon} style={{
            background: bg, border: `1px solid ${c}44`,
            borderRadius: 8, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>{icon}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: '#1a0a2a', border: '1px solid #6030c044', borderRadius: 6, padding: '5px 10px', fontFamily: 'monospace', fontSize: 10, color: '#a060ff' }}>
          ✓ Stripe billing active
        </div>
        <div style={{ flex: 1, background: '#0a1a0a', border: '1px solid #40804044', borderRadius: 6, padding: '5px 10px', fontFamily: 'monospace', fontSize: 10, color: '#50c060' }}>
          ✓ AWS serverless
        </div>
      </div>
    </div>
  ),
  'ML Crop Yield Prediction': () => (
    <div style={{
      background: '#080c08', border: '1px solid #1a3a1a', borderRadius: 8,
      padding: '12px 14px', marginBottom: 14, fontFamily: 'monospace', fontSize: 11,
    }}>
      <div style={{ color: '#6aaa2a', marginBottom: 10, letterSpacing: 1 }}>● ● ● &nbsp; crop-yield / model dashboard</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        {[['87.2%','Accuracy'],['0.034','MAE'],['50K+','Records'],['40%','Speedup']].map(([v,l]) => (
          <div key={l} style={{ flex: 1, background: '#0e1a0e', border: '1px solid #2a4a2a', borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
            <div style={{ color: '#6aff30', fontSize: 14, fontWeight: 700 }}>{v}</div>
            <div style={{ color: '#4a7a4a', fontSize: 9 }}>{l}</div>
          </div>
        ))}
      </div>
      {/* Mini bar chart */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 36 }}>
        {[0.55,0.7,0.62,0.80,0.74,0.87,0.91,0.85,0.89,0.93].map((h, i) => (
          <div key={i} style={{ flex: 1, background: `hsl(${100 + h*40},60%,${30 + h*20}%)`, height: `${h*100}%`, borderRadius: '2px 2px 0 0' }} />
        ))}
      </div>
      <div style={{ color: '#4a7a4a', fontSize: 9, marginTop: 4 }}>prediction accuracy by epoch →</div>
    </div>
  ),
}

function ProjectSlide({ data: proj, num }) {
  const Mockup = PROJECT_MOCKUPS[proj.name]
  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>
        PROJECT // {String(num).padStart(2, '0')}
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 24, color: C.text, lineHeight: 1.15, marginBottom: 4 }}>
        {proj.name}
      </div>
      <div style={{ width: 50, height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, marginBottom: 12 }} />

      {/* Tech pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {proj.tech.map(t => (
          <span key={t} style={{
            fontFamily: 'monospace', fontSize: 10, padding: '3px 10px',
            borderRadius: 12, background: C.pillBg, border: `1px solid ${C.pillBorder}`,
            color: C.accent, letterSpacing: 0.5,
          }}>{t}</span>
        ))}
      </div>

      {/* Screenshot mockup */}
      {Mockup && <Mockup />}

      {/* Description */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.cardBorder}`,
        borderRadius: 10, padding: '12px 14px',
        fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 14,
      }}>
        {proj.desc}
      </div>

      <a
        href={proj.link} target="_blank" rel="noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 22px', borderRadius: 8,
          background: `linear-gradient(135deg, ${C.accent}30, ${C.gold}20)`,
          border: `1.5px solid ${C.accent}`,
          color: C.accent, fontFamily: 'monospace', fontSize: 12, letterSpacing: 2,
          textDecoration: 'none', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${C.accent}30` }}
        onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.accent}30, ${C.gold}20)` }}
      >
        VIEW ON GITHUB →
      </a>
    </div>
  )
}

function SkillsSlide({ data }) {
  const colors = [C.accent, C.gold, C.green]
  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 14 }}>ARSENAL // TOOLS & TECHNOLOGIES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(data).map(([cat, skills], ci) => (
          <div key={cat} style={{
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: colors[ci % 3], letterSpacing: 2, marginBottom: 10 }}>
              ▸ {cat.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map(s => (
                <span key={s} style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 600,
                  padding: '4px 12px', borderRadius: 14,
                  background: `${colors[ci % 3]}12`, border: `1px solid ${colors[ci % 3]}40`,
                  color: colors[ci % 3],
                }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactSlide({ data }) {
  const items = [
    { icon: '✉', label: 'EMAIL',    val: data.email,                 href: `mailto:${data.email}` },
    { icon: '📡', label: 'PHONE',    val: data.phone,                 href: `tel:${data.phone.replace(/\D/g,'')}` },
    { icon: '⚡', label: 'GITHUB',   val: 'github.com/rameshdragon',  href: data.github },
    { icon: '🔗', label: 'LINKEDIN', val: 'ramesh-reddy-changal',     href: data.linkedin },
    { icon: '📍', label: 'LOCATION', val: data.location,              href: '#' },
  ]
  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 14 }}>CONTACT // REACH OUT</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <a key={item.label} href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: C.cardBg, border: `1px solid ${C.cardBorder}`,
              borderRadius: 10, padding: '11px 14px', textDecoration: 'none',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}80` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.cardBorder }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.muted, letterSpacing: 2 }}>{item.label}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: C.text, marginTop: 2 }}>{item.val}</div>
            </div>
            <span style={{ color: C.accent, fontFamily: 'monospace' }}>→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
