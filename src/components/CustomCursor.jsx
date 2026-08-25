import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePointerType } from '../hooks/usePointerType';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function CustomCursor() {
  const isCoarse = usePointerType();
  const prefersReducedMotion = useReducedMotion();
  
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorVariant, setCursorVariant] = useState('default'); // 'default', 'hover', 'play'

  useEffect(() => {
    if (isCoarse || prefersReducedMotion) return;

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.closest('[data-cursor="play"]')) {
        setCursorVariant('play');
      } else if (target.closest('button') || target.closest('a') || target.closest('input')) {
        setCursorVariant('hover');
      } else {
        setCursorVariant('default');
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isCoarse, prefersReducedMotion]);

  if (isCoarse || prefersReducedMotion) return null;

  const variants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 1,
      backgroundColor: 'var(--color-blue-accent)',
      borderColor: 'transparent',
      mixBlendMode: 'normal'
    },
    hover: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1.5,
      backgroundColor: 'transparent',
      borderColor: 'var(--color-blue-accent)',
      borderWidth: '2px',
    },
    play: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      scale: 1,
      backgroundColor: 'transparent',
      borderColor: 'var(--color-onair-red)',
      borderWidth: '1px'
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[100] flex items-center justify-center border-0"
        animate={cursorVariant}
        variants={variants}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        {cursorVariant === 'play' && (
          <div className="flex items-center justify-center gap-1.5 w-12 h-12 bg-navy-base/80 rounded-full backdrop-blur-sm border border-onair-red/50">
            <div className="w-1.5 h-1.5 rounded-full bg-onair-red animate-pulse"></div>
            <span className="text-[9px] font-mono font-medium tracking-widest text-onair-red">PLAY</span>
          </div>
        )}
      </motion.div>
    </>
  );
}
