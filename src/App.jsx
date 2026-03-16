import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navigation from './components/Navigation'
import LoadingScreen from './components/LoadingScreen'
import HeroPage from './pages/HeroPage'
import ExperiencePage from './pages/ExperiencePage'
import ProjectsPage from './pages/ProjectsPage'
import GamePage from './pages/GamePage'
import ContactPage from './pages/ContactPage'

const PAGES = [HeroPage, ExperiencePage, ProjectsPage, GamePage, ContactPage]
const PAGE_NAMES = ['hero', 'experience', 'projects', 'game', 'contact']

const variants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 100 : -100, scale: 0.97, filter: 'blur(6px)' }),
  animate: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -100 : 100, scale: 0.97, filter: 'blur(6px)' }),
}

export default function App() {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const dirRef = useRef(1)

  const navigate = (to) => {
    if (to === current || to < 0 || to >= PAGES.length) return
    dirRef.current = to > current ? 1 : -1
    setCurrent(to)
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      // Don't intercept in game
      if (current === 3) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(current + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current])

  const PageComponent = PAGES[current]

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#000408' }}>
      <AnimatePresence>
        {!loaded && <LoadingScreen key="loader" onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <>
          {/* Vignette */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }} />

          {/* CRT scanlines overlay */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 6, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }} />

          {/* Pages */}
          <AnimatePresence mode="wait" custom={dirRef.current}>
            <motion.div
              key={PAGE_NAMES[current]}
              custom={dirRef.current}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0, zIndex: 10 }}
            >
              <PageComponent onNavigate={navigate} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'all' }}>
              <Navigation current={current} onNavigate={navigate} />
            </div>
          </div>

          {/* Keyboard hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'fixed', top: 18, right: 20, zIndex: 100,
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 9,
              color: 'rgba(0,212,255,0.28)',
              letterSpacing: 2,
              pointerEvents: 'none',
            }}
          >
            ← → NAVIGATE
          </motion.div>
        </>
      )}

      <style>{`
        @keyframes glitch {
          0%,89%,100%{clip-path:none;transform:none}
          90%{clip-path:polygon(0 18%,100% 18%,100% 28%,0 28%);transform:translate(-4px,0)}
          91%{clip-path:polygon(0 58%,100% 58%,100% 68%,0 68%);transform:translate(4px,0)}
          92%{clip-path:none;transform:none}
        }
        @keyframes breathe {
          0%,100%{box-shadow:0 0 10px rgba(0,212,255,0.15),0 0 25px rgba(0,212,255,0.04)}
          50%{box-shadow:0 0 26px rgba(0,212,255,0.45),0 0 55px rgba(0,212,255,0.16)}
        }
        @keyframes pulse-ring {
          0%{transform:scale(0.85);opacity:1}
          100%{transform:scale(2.2);opacity:0}
        }
        @keyframes float-y {
          0%,100%{transform:translateY(0px)}
          50%{transform:translateY(-12px)}
        }
      `}</style>
    </div>
  )
}
