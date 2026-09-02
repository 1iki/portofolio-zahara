import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { calculatePortfolioStats } from '../lib/portfolioStats';
import { getWorks, getExperience, subscribeToDataChanges } from '../lib/contentService';

function StatBar({ label, targetValue, suffix = '', delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
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

  // Calculate proportional meter fill height
  const calcHeightPercent = () => {
    if (targetValue > 1000) return (targetValue / 2500) * 100;
    if (targetValue > 200) return (targetValue / 500) * 100;
    return (targetValue / 150) * 100;
  };

  const fillHeight = Math.max(calcHeightPercent(), 15);

  return (
    <div ref={ref} className="w-full flex flex-col items-center gap-3 sm:gap-4 min-w-0">
      {/* Metric Number & Label */}
      <div className="flex flex-col items-center gap-1 w-full text-center">
        <span className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory tracking-tight leading-none">
          {displayValue.toLocaleString('id-ID')}{suffix}
        </span>
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted/80 text-center min-h-[2.25rem] flex items-center justify-center leading-tight max-w-[140px]">
          {label}
        </span>
      </div>
      
      {/* Level Meter Bar - Vertical */}
      <div className="h-32 sm:h-40 md:h-48 w-7 sm:w-8 bg-navy-deep border border-divider rounded-sm relative overflow-hidden flex items-end justify-center pb-1 shadow-inner">
        {/* CRT segmented scanline pattern */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(transparent 80%, rgba(7, 20, 41, 1) 80%)', 
            backgroundSize: '100% 4px' 
          }}
        ></div>
        
        <motion.div 
          className="w-full bg-blue-accent bottom-0 absolute shadow-[0_0_15px_rgba(74,127,232,0.6)]"
          initial={prefersReducedMotion ? { height: `${fillHeight}%` } : { height: '0%' }}
          animate={isInView ? { height: `${fillHeight}%` } : { height: '0%' }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
          style={{ 
             minHeight: isInView || prefersReducedMotion ? '12%' : '0%'
          }}
        ></motion.div>
      </div>
    </div>
  );
}

export default function StatsLevelMeter() {
  const [worksData, setWorksData] = useState([]);
  const [expData, setExpData] = useState([]);

  const loadData = async () => {
    try {
      const [w, e] = await Promise.all([getWorks(), getExperience()]);
      setWorksData(Array.isArray(w) ? w : []);
      setExpData(Array.isArray(e) ? e : []);
    } catch (err) {
      console.error('[StatsLevelMeter] Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const stats = useMemo(
    () => calculatePortfolioStats(worksData, expData),
    [worksData, expData]
  );

  return (
    <section className="py-16 sm:py-20 md:py-24 border-t border-divider bg-navy-base px-4 sm:px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 items-end justify-items-center">
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
