export default function HUD({ showKillPrompt }) {
  return (
    <>
      {/* Top-left title */}
      <div style={{
        position: 'fixed', top: 16, left: 20, zIndex: 50,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 12,
          color: 'rgba(0, 200, 180, 0.5)',
          letterSpacing: 3,
        }}>
          RAMESH REDDY — PORTFOLIO
        </div>
      </div>

      {/* Controls hint (desktop) */}
      <div style={{
        position: 'fixed', top: 16, right: 20, zIndex: 50,
        pointerEvents: 'none',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
        color: 'rgba(0, 200, 180, 0.3)',
        letterSpacing: 1,
        textAlign: 'right',
        lineHeight: 1.8,
      }}>
        WASD / ARROWS — MOVE<br />
        F — INTERACT / KILL
      </div>

      {/* Kill prompt */}
      {showKillPrompt && (
        <div style={{
          position: 'fixed',
          bottom: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 80,
          pointerEvents: 'none',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 13,
          color: 'rgba(255, 100, 60, 0.85)',
          letterSpacing: 2,
          textShadow: '0 0 10px rgba(255, 100, 60, 0.4)',
          animation: 'bob-prompt 1.5s ease-in-out infinite',
          background: 'rgba(10, 15, 20, 0.7)',
          padding: '6px 16px',
          borderRadius: 8,
          border: '1px solid rgba(255, 100, 60, 0.3)',
        }}>
          PRESS F TO KILL
        </div>
      )}

      {/* Minimap */}
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 50,
        width: 80, height: 100,
        background: 'rgba(8, 14, 22, 0.8)',
        border: '1px solid rgba(0, 200, 180, 0.2)',
        borderRadius: 6,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 7,
          color: 'rgba(0, 200, 180, 0.4)',
          textAlign: 'center',
          padding: '2px 0',
          letterSpacing: 1,
        }}>MAP</div>
      </div>

      <style>{`
        @keyframes bob-prompt {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
      `}</style>
    </>
  )
}
