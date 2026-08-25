import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cn } from '../lib/utils';

function StatBar({ label, targetValue, suffix = '', delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    if (isInView) {
      const controls = animate(0, targetValue, {
        duration: 1.2,
        delay: delay,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(Math.round(value));
        }
      });
      return () => controls.stop();
    }
  }, [isInView, targetValue, prefersReducedMotion, delay]);

  // Height percentage calculation based on some arbitrary max values to make the bars look staggered
  // This simulates a VU meter look.
  const heightPercent = prefersReducedMotion 
    ? 100 
    : (isInView ? 100 : 0);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 flex-1 min-w-[120px]">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-4xl text-ivory">
          {displayValue.toLocaleString('id-ID')}{suffix}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted text-center h-8">
          {label}
        </span>
      </div>
      
      {/* Level Meter Bar - Vertical */}
      <div className="h-48 w-8 bg-navy-deep border border-divider rounded-sm relative overflow-hidden flex items-end justify-center pb-1">
        {/* segmented look */}
        <div className="absolute inset-0 z-10" style={{ backgroundImage: 'linear-gradient(transparent 80%, rgba(7, 20, 41, 1) 80%)', backgroundSize: '100% 4px' }}></div>
        
        <motion.div 
          className="w-full bg-blue-accent bottom-0 absolute shadow-[0_0_15px_rgba(74,127,232,0.6)]"
          initial={prefersReducedMotion ? { height: '100%' } : { height: '0%' }}
          animate={isInView ? { height: `${(targetValue / (targetValue > 1000 ? 2500 : 500)) * 100}%` } : { height: '0%' }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
          style={{ 
             // Minimum height to look good
             minHeight: isInView ? '20%' : '0%'
          }}
        ></motion.div>
      </div>
    </div>
  );
}

export default function StatsLevelMeter() {
  const stats = [
    { label: "Konten Diproduksi", value: 109, suffix: "+" }, // 85+9+15 based on prompt hint
    { label: "Reels Views", value: 2081, suffix: "" },
    { label: "YouTube Views", value: 388, suffix: "" },
    { label: "Program Ditangani", value: 12, suffix: "" }
  ];

  return (
    <section className="py-24 border-t border-divider bg-navy-base px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-end justify-center gap-8 md:gap-12">
        {stats.map((stat, idx) => (
          <StatBar 
            key={idx} 
            label={stat.label} 
            targetValue={stat.value} 
            suffix={stat.suffix}
            delay={idx * 0.1}
          />
        ))}
      </div>
    </section>
  );
}
