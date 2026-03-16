import { motion } from 'framer-motion'

const PAGES = ['HERO', 'EXPERIENCE', 'PROJECTS', 'GAME', 'CONTACT']
const ICONS = ['🏠', '💼', '🚀', '🎮', '📡']

export default function Navigation({ current, onNavigate }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        position: 'fixed',
        bottom: 26,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'rgba(0,8,22,0.9)',
        border: '1px solid rgba(0,212,255,0.18)',
        borderRadius: 50,
        padding: '10px 24px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 30px rgba(0,212,255,0.07)',
      }}
    >
      {PAGES.map((label, i) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {i > 0 && <div style={{ position: 'absolute' }} />}
          <motion.button
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(i)}
            title={label}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: current === i ? '2px solid #00d4ff' : '1.5px solid rgba(0,212,255,0.28)',
              background: current === i ? 'rgba(0,212,255,0.18)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: current === i ? '0 0 16px rgba(0,212,255,0.5)' : 'none',
              transition: 'all 0.3s',
              position: 'relative',
            }}
          >
            {ICONS[i]}
            {current === i && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,212,255,0.5)',
                  animation: 'pulse-ring 1.8s ease-out infinite',
                }}
              />
            )}
          </motion.button>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 8,
            color: current === i ? '#00d4ff' : 'rgba(0,212,255,0.35)',
            letterSpacing: '1px',
            marginTop: 2,
            transition: 'color 0.3s',
          }}>{label}</div>
        </div>
      ))}
    </motion.nav>
  )
}
