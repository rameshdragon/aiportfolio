import { PORTFOLIO } from '../data/portfolioData.js'

export default function DetailPopup({ landmark, onClose }) {
  if (!landmark) return null

  const section = landmark.section
  const data = PORTFOLIO

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 150,
      pointerEvents: 'none',
    }}>
      <div
        style={{
          background: 'rgba(8, 14, 22, 0.95)',
          border: '1px solid rgba(0, 200, 180, 0.35)',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 520,
          maxHeight: '80vh',
          overflowY: 'auto',
          width: '90%',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(0, 200, 180, 0.15), inset 0 1px 0 rgba(0, 200, 180, 0.1)',
          pointerEvents: 'all',
          animation: 'popupIn 0.3s ease-out',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top neon bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(0, 200, 180, 0.8), transparent)',
        }} />

        {/* Close hint */}
        <div style={{
          position: 'absolute', top: 10, right: 14,
          fontFamily: 'monospace', fontSize: 10,
          color: 'rgba(0, 200, 180, 0.4)',
          letterSpacing: 1,
        }}>
          WALK AWAY TO CLOSE
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 18,
          color: '#00c8b4',
          letterSpacing: 4,
          marginBottom: 16,
          textShadow: '0 0 10px rgba(0, 200, 180, 0.5)',
        }}>
          {'// '}{landmark.label}
        </div>

        {section === 'intro' && <IntroSection data={data.intro} />}
        {section === 'experience' && <ExperienceSection data={data.experience} />}
        {section === 'projects' && <ProjectsSection data={data.projects} />}
        {section === 'skills' && <SkillsSection data={data.skills} />}
        {section === 'contact' && <ContactSection data={data.contact} />}
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

function IntroSection({ data }) {
  return (
    <div>
      <div style={{ ...textStyle, fontSize: 22, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
        {data.name}
      </div>
      <div style={{ ...tagStyle, marginBottom: 12 }}>{data.tagline}</div>
      <div style={{
        display: 'inline-block',
        background: 'rgba(0, 200, 100, 0.15)',
        border: '1px solid rgba(0, 200, 100, 0.4)',
        borderRadius: 20,
        padding: '4px 14px',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 11,
        color: '#00c864',
        letterSpacing: 2,
        marginBottom: 14,
        animation: 'pulse-status 2s ease-in-out infinite',
      }}>
        ● {data.status}
      </div>
      <div style={descStyle}>{data.brief}</div>
      <style>{`
        @keyframes pulse-status {
          0%, 100% { box-shadow: 0 0 8px rgba(0,200,100,0.2); }
          50% { box-shadow: 0 0 16px rgba(0,200,100,0.4); }
        }
      `}</style>
    </div>
  )
}

function ExperienceSection({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.map((exp, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ ...tagStyle, color: '#00c8b4', fontSize: 11, fontWeight: 700 }}>{exp.role}</div>
          <div style={{ ...textStyle, fontSize: 14, color: '#ddd', marginBottom: 2 }}>{exp.org}</div>
          <div style={{ ...tagStyle, fontSize: 10, color: 'rgba(0,200,180,0.4)', marginBottom: 8 }}>{exp.date}</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {exp.bullets.map((b, j) => (
              <li key={j} style={{ ...descStyle, marginBottom: 4, paddingLeft: 14, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: '#00c8b4' }}>›</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ProjectsSection({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((proj, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ ...tagStyle, color: '#00c8b4', fontSize: 11, fontWeight: 700 }}>{proj.name}</div>
          <div style={{ ...descStyle, marginBottom: 8 }}>{proj.desc}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
            {proj.tech.map(t => (
              <span key={t} style={pillStyle}>{t}</span>
            ))}
          </div>
          <a href={proj.link} target="_blank" rel="noreferrer" style={linkStyle}>GitHub →</a>
        </div>
      ))}
    </div>
  )
}

function SkillsSection({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(data).map(([cat, skills]) => (
        <div key={cat}>
          <div style={{ ...tagStyle, color: '#00c8b4', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>// {cat.toUpperCase()}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.map(s => (
              <span key={s} style={pillStyle}>{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactSection({ data }) {
  const items = [
    { icon: '✉', label: 'EMAIL', val: data.email, href: `mailto:${data.email}` },
    { icon: '📡', label: 'PHONE', val: data.phone, href: `tel:${data.phone.replace(/[^\d]/g, '')}` },
    { icon: '⚡', label: 'GITHUB', val: 'rameshdragon', href: data.github },
    { icon: '🔗', label: 'LINKEDIN', val: 'ramesh-reddy-changal', href: data.linkedin },
    { icon: '📍', label: 'LOCATION', val: data.location, href: '#' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(item => (
        <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{
          ...cardStyle,
          display: 'flex', alignItems: 'center', gap: 12,
          textDecoration: 'none', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ ...tagStyle, fontSize: 9, color: 'rgba(0,200,180,0.45)', letterSpacing: 2 }}>{item.label}</div>
            <div style={{ ...textStyle, fontSize: 14, color: '#ddd' }}>{item.val}</div>
          </div>
          <span style={{ color: '#00c8b4', fontFamily: 'monospace' }}>→</span>
        </a>
      ))}
    </div>
  )
}

const textStyle = { fontFamily: "'Rajdhani', sans-serif" }
const tagStyle = { fontFamily: "'Share Tech Mono', monospace" }
const descStyle = { fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }
const cardStyle = {
  background: 'rgba(0, 20, 35, 0.6)',
  border: '1px solid rgba(0, 200, 180, 0.15)',
  borderRadius: 10,
  padding: '12px 14px',
}
const pillStyle = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: 10,
  padding: '3px 10px',
  borderRadius: 12,
  border: '1px solid rgba(0, 200, 180, 0.25)',
  color: 'rgba(0, 200, 180, 0.7)',
  background: 'rgba(0, 200, 180, 0.06)',
}
const linkStyle = {
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 12, fontWeight: 700,
  color: '#00c8b4',
  textDecoration: 'none',
  letterSpacing: 1,
}
