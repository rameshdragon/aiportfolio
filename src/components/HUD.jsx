export default function HUD({ showKillPrompt, kills = 0 }) {
  return (
    <>
      {/* Kill counter */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 20,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 13,
        color: 'rgba(0, 200, 180, 0.6)',
        letterSpacing: 2,
        textShadow: '0 0 10px rgba(0, 200, 180, 0.3)',
        zIndex: 100,
      }}>
        KILLS: {kills}
      </div>

      {/* Controls hint */}
      <div style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
        color: 'rgba(0, 200, 180, 0.25)',
        letterSpacing: 1,
        textAlign: 'center',
        zIndex: 100,
        pointerEvents: 'none',
      }}>
        WASD — MOVE &nbsp;·&nbsp; F — KILL
      </div>

      {/* Kill prompt */}
      {showKillPrompt && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 16,
          color: '#ff6644',
          letterSpacing: 3,
          textShadow: '0 0 15px rgba(255, 100, 60, 0.5)',
          zIndex: 100,
          pointerEvents: 'none',
          animation: 'killPulse 1s ease-in-out infinite',
        }}>
          PRESS F TO KILL
        </div>
      )}

      {/* M-7 unit indicator */}
      <div style={{
        position: 'fixed',
        top: 16,
        left: 20,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 11,
        color: 'rgba(0, 200, 180, 0.4)',
        letterSpacing: 2,
        zIndex: 100,
      }}>
        M-7 UNIT ACTIVE
      </div>

      <style>{`
        @keyframes killPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
