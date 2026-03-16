import { motion } from 'framer-motion'
import ExperienceScene from '../scenes/ExperienceScene'

const EXPERIENCES = [
  {
    role: 'GRADUATE TEACHING ASSISTANT',
    org: 'University of Maryland, Baltimore County',
    date: 'AUG 2024 – MAY 2025',
    bullets: [
      'Cut assignment error rate 30%, improved scores 20% across 150+ students',
      'Mentored in distributed systems, NLP & algorithm design',
      'Redesigned 3 problem sets/semester to industry standards',
    ],
    color: '#00d4ff',
  },
  {
    role: 'SOFTWARE ENGINEERING INTERN',
    org: 'Path Creators',
    date: 'JUN 2021 – JUL 2021',
    bullets: [
      'Reduced API latency 40% (320ms → 190ms) via O(1) hash map',
      'Built NLP chatbot — 500+ users in first month',
      'Fixed race condition killing 15% of CI runs in one line',
    ],
    color: '#00ffcc',
  },
  {
    role: 'RESEARCH INTERN',
    org: 'ICRISAT',
    date: 'SEP 2022 – OCT 2022',
    bullets: [
      'O(n²) → O(n log n) pipeline — 40% reliability gain on 50K+ records',
      'Deployed ML model at 87% accuracy via Flask REST API',
      'Eliminated 25% session data loss for 200+ field researchers',
    ],
    color: '#7b2fff',
  },
]

const SKILLS = [
  { label: '// LANGUAGES', pills: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'SQL'] },
  { label: '// FRAMEWORKS', pills: ['React', 'Next.js', 'Node.js', 'Spring Boot', 'FastAPI', 'TensorFlow', 'PyTorch', 'LangChain'] },
  { label: '// CLOUD & INFRA', pills: ['GCP', 'AWS', 'Docker', 'Kubernetes', 'Kafka', 'Redis', 'PostgreSQL', 'MongoDB'] },
]

export default function ExperiencePage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <ExperienceScene />

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
            marginBottom: 32,
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(0,212,255,0.5)',
          }}
        >
          // EXPERIENCE
        </motion.div>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1100, marginBottom: 32 }}>
          {EXPERIENCES.map((exp, i) => (
            <motion.div
              key={exp.role}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6, boxShadow: `0 0 30px ${exp.color}44` }}
              style={{
                background: 'rgba(0,10,30,0.82)',
                border: `1px solid ${exp.color}44`,
                borderRadius: 18,
                padding: '22px 20px',
                width: 300,
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${exp.color}, transparent)` }} />
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10, color: exp.color, letterSpacing: '2px', marginBottom: 4 }}>{exp.role}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, color: '#fff', fontWeight: 600, marginBottom: 3 }}>{exp.org}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(0,212,255,0.44)', marginBottom: 12 }}>{exp.date}</div>
              <ul style={{ listStyle: 'none' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.62)',
                    lineHeight: 1.5,
                    marginBottom: 5,
                    paddingLeft: 14,
                    position: 'relative',
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: exp.color }}>›</span>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div style={{ maxWidth: 900, width: '100%' }}>
          {SKILLS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{ marginBottom: 14 }}
            >
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: '#00d4ff', letterSpacing: '2px', marginBottom: 6 }}>{s.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {s.pills.map(p => (
                  <motion.span
                    key={p}
                    whileHover={{ scale: 1.1, background: 'rgba(0,212,255,0.2)' }}
                    style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 13px',
                      borderRadius: 20,
                      border: '1px solid rgba(0,212,255,0.26)',
                      color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(0,212,255,0.07)',
                      letterSpacing: '0.5px',
                      cursor: 'default',
                      transition: 'background 0.2s',
                    }}
                  >{p}</motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
