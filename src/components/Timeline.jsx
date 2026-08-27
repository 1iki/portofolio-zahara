import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { experience } from '../data/experience';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { usePointerType } from '../hooks/usePointerType';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export default function Timeline() {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isCoarse = usePointerType();
  const { playClick } = useSound();

  const totalCount = experience.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (scrollLeft > 20 && !hasScrolled) {
        setHasScrolled(true);
      }

      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);

        // Compute active card index from scroll position
        const firstCard = el.firstElementChild;
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 24 : 340;
        const computedIndex = Math.min(
          Math.max(Math.round(scrollLeft / cardWidth), 0),
          totalCount - 1
        );
        setActiveIndex(computedIndex);
      } else {
        setScrollProgress(0);
        setActiveIndex(0);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();

    return () => el.removeEventListener('scroll', handleScroll);
  }, [totalCount, hasScrolled]);

  const scrollPrev = () => {
    playClick();
    setHasScrolled(true);
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? el.firstElementChild.getBoundingClientRect().width + 24 : 340;
    el.scrollBy({ left: -cardWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const scrollNext = () => {
    playClick();
    setHasScrolled(true);
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? el.firstElementChild.getBoundingClientRect().width + 24 : 340;
    el.scrollBy({ left: cardWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const scrollToCard = (index) => {
    playClick();
    setHasScrolled(true);
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? el.firstElementChild.getBoundingClientRect().width + 24 : 340;
    el.scrollTo({ left: index * cardWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToCard(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToCard(totalCount - 1);
    }
  };

  // Formatted active timecodes (e.g. 00:00:00:01 to 00:00:00:06)
  const activeTimecode = `00:00:00:${String(activeIndex + 1).padStart(2, '0')}`;
  const totalTimecode = `00:00:00:${String(totalCount).padStart(2, '0')}`;
  const positionIndicator = `${String(activeIndex + 1).padStart(2, '0')} / ${String(totalCount).padStart(2, '0')}`;

  return (
    <section className="py-24 border-t border-divider bg-navy-base overflow-hidden" id="pengalaman">
      <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
            Pengalaman &<br />Organisasi
          </h2>
        </div>

        {/* Console Controls & Micro Hint */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
          {/* Position Indicator Badge */}
          <span className="font-mono text-xs text-blue-accent tracking-widest bg-blue-accent/10 px-3 py-1.5 border border-blue-accent/30 rounded-sm font-semibold">
            {positionIndicator}
          </span>

          {/* Subtle Swipe / Drag Affordance Cue */}
          <div className="font-mono text-[10px] text-muted tracking-widest uppercase bg-navy-deep px-3 py-1.5 border border-divider/40 rounded-sm inline-flex items-center gap-1.5">
            {isCoarse ? (
              <>
                <span>SWIPE</span>
                {!prefersReducedMotion && !hasScrolled ? (
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: 3, duration: 0.8, ease: "easeInOut" }}
                    className="text-blue-accent inline-block font-bold"
                  >
                    →
                  </motion.span>
                ) : (
                  <span className="text-blue-accent font-bold">→</span>
                )}
              </>
            ) : (
              <span>[ DRAG / SCROLL TO SCRUB ]</span>
            )}
          </div>

          {/* Arrow Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              aria-label="Pengalaman sebelumnya"
              className={cn(
                "w-9 h-9 rounded-sm border flex items-center justify-center font-mono text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent",
                activeIndex === 0
                  ? "border-divider/30 text-muted/30 cursor-not-allowed bg-navy-deep/40"
                  : "border-divider bg-navy-deep text-ivory hover:border-blue-accent hover:text-blue-accent cursor-pointer active:scale-95"
              )}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={scrollNext}
              disabled={activeIndex === totalCount - 1}
              aria-label="Pengalaman berikutnya"
              className={cn(
                "w-9 h-9 rounded-sm border flex items-center justify-center font-mono text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent",
                activeIndex === totalCount - 1
                  ? "border-divider/30 text-muted/30 cursor-not-allowed bg-navy-deep/40"
                  : "border-divider bg-navy-deep text-ivory hover:border-blue-accent hover:text-blue-accent cursor-pointer active:scale-95"
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
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
          <div className="flex justify-between mt-2 text-[10px] font-mono text-muted tracking-wider">
            <span className="text-blue-accent font-semibold">{activeTimecode}</span>
            <span>{totalTimecode}</span>
          </div>
        </div>

        {/* Horizontal Scroll Area */}
        <div
          ref={scrollRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Timeline pengalaman dan organisasi"
          style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
          className={cn(
            "flex overflow-x-auto gap-6 px-6 pb-8 snap-x snap-mandatory hide-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base",
            "md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]" // Align with max-w-7xl
          )}
        >
          {experience.map((item, idx) => (
            <div
              key={`${item.role}-${idx}`}
              className={cn(
                "w-[80vw] sm:w-[340px] md:w-[400px] max-w-[460px] snap-start shrink-0 flex flex-col justify-between gap-4 bg-navy-deep p-6 md:p-8 rounded-sm border transition-all duration-300",
                activeIndex === idx
                  ? "border-blue-accent/60 shadow-[0_0_15px_rgba(74,127,232,0.12)]"
                  : "border-divider hover:border-blue-accent/30"
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-blue-accent tracking-wider">{item.date}</span>
                  <span className="font-mono text-[9px] text-muted/60 tracking-widest">
                    [{String(idx + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}]
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-ivory leading-tight">{item.role}</h3>
                <p className="text-muted mt-1 text-xs md:text-sm font-mono tracking-wide uppercase opacity-80">{item.org}</p>
                {item.description && (
                  <p className="text-muted/80 mt-4 text-xs md:text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
                )}
              </div>
            </div>
          ))}

          {/* Spacer for ending scroll nicely with card peeking */}
          <div className="w-[10vw] shrink-0"></div>
        </div>
      </div>
    </section>
  );
}
