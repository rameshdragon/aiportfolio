import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import HeroScene from '../scenes/HeroScene'

const CARDS = [
  { icon: '🗄️', title: 'DISTRIBUTED FS', tech: 'Python · gRPC · Docker · AWS', page: 2 },
  { icon: '💬', title: 'REALTIME CHAT', tech: 'Node.js · Kafka · Redis · GCP', page: 2 },
  { icon: '🎨', title: 'AI ICON SAAS', tech: 'React · DALL-E 3 · Stripe · AWS', page: 2 },
  { icon: '🌾', title: 'ML CROP YIELD', tech: 'Python · TensorFlow · Flask · GCP', page: 2 },
]

function HeroCard({ icon, title, tech, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      className="hero-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.12, duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.06, y: -8 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? 'rgba(0,212,255,0.1)' : 'rgba(0,10,30,0.8)',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.6)' : 'rgba(0,212,255,0.22)'}`,
        borderRadius: 16,
        padding: '20px 18px',
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        boxShadow: hovered ? '0 0 28px rgba(0,212,255,0.35)' : '0 0 10px rgba(0,212,255,0.07)',
        transition: 'background 0.3s, border 0.3s, box-shadow 0.3s',
        minWidth: 165,
        flex: '0 0 165px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10, textAlign: 'center' }}>{icon}</div>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: 10,
        color: '#00d4ff',
        letterSpacing: '1.5px',
        textAlign: 'center',
        fontWeight: 700,
        marginBottom: 8,
      }}>{title}</div>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 9,
        color: 'rgba(255,255,255,0.38)',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>{tech.split(' · ').join('\n')}</div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
        animation: 'bpulse 2.5s ease-in-out infinite',
      }} />
      <style>{`@keyframes bpulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </motion.div>
  )
}

export default function HeroPage({ onNavigate }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <HeroScene />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(28px, 5vw, 68px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '5px',
            textShadow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2)',
            animation: 'glitch 9s ease-in-out infinite',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          RAMESH<span style={{ color: '#00d4ff' }}> REDDY</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 'clamp(11px, 1.6vw, 16px)',
            color: 'rgba(0,212,255,0.72)',
            letterSpacing: '3px',
            fontWeight: 600,
            marginTop: 12,
            marginBottom: 42,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          MS Computer Science &nbsp;·&nbsp; Full-Stack &nbsp;·&nbsp; AI/ML &nbsp;·&nbsp; Distributed Systems
        </motion.div>

        <motion.div
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {CARDS.map((c, i) => (
            <HeroCard key={c.title} {...c} index={i} onClick={() => onNavigate(2)} />
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate(4)}
          style={{
            marginTop: 36,
            padding: '11px 38px',
            background: 'transparent',
            border: '1.5px solid #00d4ff',
            borderRadius: 40,
            color: '#00d4ff',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 12,
            letterSpacing: '3px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0,212,255,0.18)',
            transition: 'all 0.2s',
          }}
        >
          LAUNCH GAME ▶
        </motion.button>
      </div>
    </div>
  )
}
