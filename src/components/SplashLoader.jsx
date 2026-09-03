import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PercentLoader from './common/PercentLoader';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * SplashLoader — Indonesian Editorial Splash Loading Screen for Porto ZEZE
 * 
 * Concept: "Zahara — Portofolio & Karya Creative Loading Experience"
 * 
 * Visual Layout:
 *                     [ icon-zhr.png ]
 * 
 *                          ZAHARA
 *                    PORTOFOLIO & KARYA
 * 
 *                 Menyiapkan pengalaman...
 * 
 *                     0% ───────────
 *                          Percent
 * 
 * Sequence (Bahasa Indonesia Editorial):
 * - 0%  -> "Memulai..."
 * - 18% -> "Memulai..."
 * - 38% -> "Menyiapkan portofolio..."
 * - 62% -> "Menyusun karya..."
 * - 84% -> "Menyiapkan dokumentasi..."
 * - 96% -> "Memoles detail..."
 * - 100% -> "Siap."
 */
export default function SplashLoader({ onComplete, isDataLoaded = false }) {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Memulai...');
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Indonesian Editorial Stage Progress
    const stages = [
      { target: 18, text: 'Memulai...', delay: 120 },
      { target: 38, text: 'Menyiapkan portofolio...', delay: 350 },
      { target: 62, text: 'Menyusun karya...', delay: 650 },
      { target: 84, text: 'Menyiapkan dokumentasi...', delay: 950 },
      { target: 96, text: 'Memoles detail...', delay: 1250 },
      { target: 100, text: 'Siap.', delay: 1550 },
    ];

    let currentTimeout = null;
    let stageIdx = 0;

    const advanceStage = () => {
      if (stageIdx < stages.length) {
        const stage = stages[stageIdx];
        setProgress(stage.target);
        setStageText(stage.text);

        if (stage.target === 100) {
          setIsReady(true);
          // Brief completion state hold before fading out into main website
          currentTimeout = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 550); // match exit transition duration
          }, 450);
        } else {
          stageIdx++;
          currentTimeout = setTimeout(advanceStage, stage.delay);
        }
      }
    };

    advanceStage();

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [onComplete]);

  // Accelerate to 96% if all critical initial data loads faster
  useEffect(() => {
    if (isDataLoaded && progress < 90) {
      setProgress(96);
      setStageText('Memoles detail...');
    }
  }, [isDataLoaded, progress]);

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key="porto-zeze-splash"
          initial={{ opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: -12,
                  scale: 0.99,
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                }
          }
          className="fixed inset-0 z-50 bg-navy-base text-ivory flex flex-col items-center justify-between p-8 md:p-16 select-none overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-accent/10 via-navy-base to-navy-deep pointer-events-none" />
          
          {/* Subtle Scanline Overlay Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(74,127,232,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

          {/* Top Bar / Header Branding */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-7xl flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted z-10"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-accent animate-pulse" />
              <span>PORTFOLIO KREATIF ZAHARA</span>
            </span>
            <span>PRODUSER &amp; PENULIS NASKAH</span>
          </motion.div>

          {/* Center Brand Identity Section */}
          <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-6 max-w-xl">
            {/* Official Brand Monogram / Icon */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-full border border-blue-accent/30 bg-navy-deep/90 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(74,127,232,0.25)] relative group shrink-0"
            >
              <img
                src="/icon-zhr.png"
                alt="Zahara Elhusna Barok"
                className="w-full h-full object-contain rounded-full select-none pointer-events-none"
                draggable={false}
              />
              <div className="absolute -inset-1 rounded-full border border-blue-accent/20 animate-ping opacity-20 pointer-events-none" />
            </motion.div>

            {/* Editorial Brand Lockup */}
            <div className="space-y-1.5">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl md:text-6xl tracking-wider uppercase text-ivory leading-none font-semibold"
              >
                ZAHARA
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="font-mono text-xs md:text-sm tracking-[0.25em] uppercase text-blue-accent font-medium"
              >
                PORTOFOLIO &amp; KARYA
              </motion.h2>
            </div>

            {/* Subtitle Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="font-mono text-xs text-muted/80 tracking-widest uppercase"
            >
              Menyiapkan pengalaman...
            </motion.p>
          </div>

          {/* Bottom Progress Bar & Standard Percent Loader */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="w-full max-w-sm z-10"
          >
            <PercentLoader
              variant="percent"
              label="Percent"
              value={progress}
              subtext={stageText}
              size="md"
              showBar={true}
            />

            {/* Status indicator */}
            <div className="mt-3 text-center">
              <span className="font-mono text-[9px] text-muted/60 uppercase tracking-widest">
                {isReady ? 'Siap.' : 'Menyiapkan ruang kreatif...'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
