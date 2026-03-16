import { motion } from 'framer-motion'
import ContactScene from '../scenes/ContactScene'

const LINKS = [
  { icon: '✉️', type: 'EMAIL', val: 'rameshreddychangal@gmail.com', href: 'mailto:rameshreddychangal@gmail.com', color: '#00d4ff' },
  { icon: '📡', type: 'PHONE', val: '(667) 260-3005', href: 'tel:6672603005', color: '#00ffcc' },
  { icon: '⚡', type: 'GITHUB', val: 'github.com/rameshdragon', href: 'https://github.com/rameshdragon', color: '#7b2fff' },
  { icon: '🔗', type: 'LINKEDIN', val: 'ramesh-reddy-changal', href: 'https://linkedin.com/in/ramesh-reddy-changal', color: '#00d4ff' },
  { icon: '📍', type: 'LOCATION', val: 'Chicago, IL', href: '#', color: '#ff2d78' },
]

export default function ContactPage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ContactScene />

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(14px, 2vw, 24px)', color: '#00d4ff', letterSpacing: '6px', marginBottom: 28, textShadow: '0 0 20px rgba(0,212,255,0.5)' }}
        >
          // CONNECT
        </motion.div>

        {/* Hologram avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{ position: 'relative', width: 160, height: 160, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {[140, 115, 88, 62].map((d, i) => (
            <div key={d} style={{
              position: 'absolute',
              width: d, height: d,
              borderRadius: '50%',
              border: `1px solid rgba(0,212,255,${0.15 + i * 0.07})`,
              animation: `rs ${4 + i}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }} />
          ))}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', animation: 'float-y 3s ease-in-out infinite' }}>
            <div style={{ fontSize: 42 }}>🤖</div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, color: '#00d4ff', letterSpacing: 4, marginTop: 6, textShadow: '0 0 15px #00d4ff' }}>AI</div>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center', width: '100%', maxWidth: 400 }}>
          {LINKS.map((l, i) => (
            <motion.a
              key={l.type}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ x: 8, boxShadow: `0 0 20px ${l.color}44` }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(0,10,30,0.82)',
                border: `1px solid ${l.color}33`,
                borderRadius: 14,
                padding: '13px 20px',
                width: '100%',
                backdropFilter: 'blur(12px)',
                textDecoration: 'none',
                transition: 'box-shadow 0.3s',
                animation: 'breathe 4s ease-in-out infinite',
              }}
            >
              <div style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{l.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: `${l.color}88`, letterSpacing: 2 }}>{l.type}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, color: '#fff', fontWeight: 600 }}>{l.val}</div>
              </div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', color: l.color, fontSize: 14 }}>→</div>
            </motion.a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes rs { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
