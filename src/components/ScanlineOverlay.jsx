import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function ScanlineOverlay() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 hidden sm:block mix-blend-overlay"
      style={{
        opacity: 0.04,
        background: `
          linear-gradient(rgba(74, 127, 232, 0) 50%, rgba(74, 127, 232, 0.25) 50%), 
          linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
        `,
        backgroundSize: '100% 2px, 3px 100%',
        animation: prefersReducedMotion ? 'none' : 'scanlineDrift 20s linear infinite',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanlineDrift {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 0 100vh, 0 0; }
        }
      `}} />
    </div>
  );
}
