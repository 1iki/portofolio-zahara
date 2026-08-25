import React, { useRef, useEffect, useState } from 'react';
import { experience } from '../data/experience';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cn } from '../lib/utils';

export default function Timeline() {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();

    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-24 border-t border-divider bg-navy-base overflow-hidden" id="pengalaman">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">Pengalaman &<br/>Organisasi</h2>
      </div>

      <div className="relative">
        {/* Timecode Progress Bar */}
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="h-[2px] w-full bg-navy-deep relative rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-accent shadow-[0_0_8px_rgba(74,127,232,0.8)]"
              style={{ 
                width: `${scrollProgress}%`,
                transition: prefersReducedMotion ? 'none' : 'width 0.1s linear'
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-muted">
            <span>00:00:00:00</span>
            <span>00:00:00:{Math.floor(scrollProgress).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Horizontal Scroll Area */}
        <div 
          ref={scrollRef}
          tabIndex={0}
          aria-label="Timeline pengalaman"
          className={cn(
            "flex overflow-x-auto gap-6 px-6 pb-8 snap-x snap-mandatory hide-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base",
            "md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]" // Align with max-w-7xl
          )}
        >
          {experience.map((item, idx) => (
            <div 
              key={idx} 
              className="min-w-[80vw] md:min-w-[400px] snap-center shrink-0 flex flex-col gap-4 bg-navy-deep p-8 rounded-sm border border-divider hover:border-blue-accent/30 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-mono text-xs text-blue-accent tracking-wider mb-2">{item.date}</span>
                <h3 className="text-xl font-semibold text-ivory leading-tight">{item.role}</h3>
                <p className="text-muted mt-1 text-sm">{item.org}</p>
                {item.description && (
                  <p className="text-muted/70 mt-3 text-sm leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Spacer for ending scroll nicely */}
          <div className="min-w-[10vw] shrink-0"></div>
        </div>
      </div>
    </section>
  );
}
