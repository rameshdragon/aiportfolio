import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectsScene from '../scenes/ProjectsScene'

const PROJECTS = [
  {
    id: 0,
    icon: '🗄️',
    name: 'DISTRIBUTED FILE SYSTEM',
    desc: 'GFS-inspired with 3x chunk replication, Raft leader election, 99.9% uptime under sustained node kills.',
    tech: ['Python', 'gRPC', 'Docker', 'AWS'],
    color: '#00d4ff',
    github: 'https://github.com/rameshdragon/distributed-fs',
    stats: [{ label: 'Uptime', val: '99.9%' }, { label: 'Replication', val: '3x' }, { label: 'Consensus', val: 'Raft' }],
  },
  {
    id: 1,
    icon: '💬',
    name: 'REALTIME MESSAGING',
    desc: '10K+ concurrent users, Kafka partitioning, Redis O(1) presence, <50ms p99 on GCP Cloud Run.',
    tech: ['Node.js', 'Kafka', 'Redis', 'GCP'],
    color: '#00ffcc',
    github: 'https://github.com/rameshdragon/realtime-chat',
    stats: [{ label: 'Users', val: '10K+' }, { label: 'Latency', val: '<50ms' }, { label: 'Broker', val: 'Kafka' }],
  },
  {
    id: 2,
    icon: '🎨',
    name: 'AI ICON GENERATION SAAS',
    desc: 'Full-stack solo — DALL-E 3, Stripe payments, AWS serverless, 5 gen modes, real users & revenue.',
    tech: ['React', 'DALL-E 3', 'Stripe', 'AWS'],
    color: '#ff2d78',
    github: 'https://github.com/rameshdragon/ai-icon-generator',
    stats: [{ label: 'Modes', val: '5' }, { label: 'AI', val: 'DALL-E 3' }, { label: 'Payments', val: 'Stripe' }],
  },
  {
    id: 3,
    icon: '🌾',
    name: 'ML CROP YIELD PREDICTION',
    desc: '23% accuracy gain, 80% preprocessing speedup via vectorized NumPy. GCP + React dashboard.',
    tech: ['Python', 'TensorFlow', 'Flask', 'GCP'],
    color: '#7b2fff',
    github: 'https://github.com/rameshdragon/crop-yield',
    stats: [{ label: 'Accuracy', val: '87%' }, { label: 'Speed ↑', val: '80%' }, { label: 'Records', val: '50K+' }],
  },
]

function ProjectCard({ proj, index, selected, onClick }) {
  const isSelected = selected === proj.id
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      style={{
        background: isSelected ? `${proj.color}18` : 'rgba(0,10,30,0.82)',
        border: `1px solid ${isSelected ? proj.color : proj.color + '40'}`,
        borderRadius: 20,
        padding: '0',
        width: 260,
        cursor: 'pointer',
        backdropFilter: 'blur(22px)',
        boxShadow: isSelected ? `0 0 35px ${proj.color}44` : `0 0 12px ${proj.color}11`,
        transition: 'background 0.3s, box-shadow 0.3s',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${proj.color}, transparent)` }} />

      {/* Preview area */}
      <div style={{
        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,4,14,0.9)',
        borderBottom: `1px solid ${proj.color}22`,
        fontSize: 44,
        position: 'relative', overflow: 'hidden',
      }}>
        {proj.icon}
        <div style={{
          position: 'absolute', top: -4, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${proj.color}, transparent)`,
          animation: 'scanline 3.2s linear infinite',
        }} />
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10, color: proj.color, letterSpacing: '2px', marginBottom: 7, fontWeight: 700 }}>
          {proj.name}
        </div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.56)', lineHeight: 1.5, marginBottom: 10 }}>
          {proj.desc}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {proj.tech.map(t => (
            <span key={t} style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
              padding: '2px 8px', borderRadius: 10,
              border: `1px solid ${proj.color}33`, color: proj.color + 'bb',
            }}>{t}</span>
          ))}
        </div>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {proj.stats.map(s => (
                  <div key={s.label} style={{
                    flex: 1, textAlign: 'center',
                    background: `${proj.color}12`,
                    borderRadius: 8, padding: '6px 4px',
                    border: `1px solid ${proj.color}22`,
                  }}>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, color: proj.color, fontWeight: 700 }}>{s.val}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <a
          href={proj.github}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-block',
            fontFamily: 'Rajdhani, sans-serif', fontSize: 11, fontWeight: 700,
            padding: '5px 14px', borderRadius: 8,
            border: `1px solid ${proj.color}55`, color: proj.color,
            background: `${proj.color}0f`,
            textDecoration: 'none', letterSpacing: '1px',
            transition: 'all 0.2s',
          }}
        >
          GitHub →
        </a>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ProjectsScene />

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', height: '100%',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 24px 100px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(14px, 2vw, 24px)',
            color: '#00d4ff',
            letterSpacing: '6px',
            marginBottom: 36,
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(0,212,255,0.5)',
          }}
        >
          // PROJECTS
        </motion.div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.id}
              proj={p}
              index={i}
              selected={selected}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,212,255,0.35)', marginTop: 24, letterSpacing: 2 }}
        >
          CLICK CARD TO EXPAND DETAILS
        </motion.p>
      </div>

      <style>{`@keyframes scanline{0%{top:-4px;opacity:0.8}100%{top:100%;opacity:0}}`}</style>
    </div>
  )
}
