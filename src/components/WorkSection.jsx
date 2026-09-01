import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { workCategories } from '../data/workCategories';
import WorkCard from './WorkCard';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cn } from '../lib/utils';

/**
 * WorkSection — renders a single production context category group section.
 * Supports desktop expanded view and mobile interactive accordion with deferred rendering.
 *
 * Props:
 *   number        — formatted section number ("01", "02", etc.)
 *   category      — category slug key (e.g. "polimedia-tv")
 *   works         — array of work items in this category
 *   isOpen        — boolean: is group expanded on mobile
 *   isLoaded      — boolean: has group been expanded at least once on mobile
 *   isMobile      — boolean: screen width < 768px
 *   onToggle      — function: toggle open state on mobile header click
 *   onSelectVideo — modal trigger handler
 *   onSelectInfo  — modal trigger handler
 *   children      — fallback elements if works prop is not passed
 */
export default function WorkSection({
  number,
  category,
  works,
  isOpen = false,
  isLoaded = false,
  isMobile = false,
  onToggle,
  onSelectVideo,
  onSelectInfo,
  children,
}) {
  const config = workCategories[category];
  const prefersReducedMotion = useReducedMotion();

  if (!config) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`WorkSection: unknown category "${category}"`);
    }
    return null;
  }

  // Determine whether card grid should be mounted in DOM
  // On desktop (!isMobile): ALWAYS mounted
  // On mobile (isMobile): mounted if currently open OR previously opened (cached)
  const shouldMountContent = !isMobile || isLoaded || isOpen;

  // Active expanded state for ARIA (always true on desktop)
  const isExpanded = !isMobile || isOpen;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 md:mb-16 last:mb-0"
    >
      {/* Section Header / Accordion Trigger */}
      <div className="mb-4 md:mb-8">
        <button
          type="button"
          onClick={isMobile ? onToggle : undefined}
          disabled={!isMobile}
          aria-expanded={isExpanded}
          aria-controls={`production-group-${category}`}
          aria-label={
            isMobile
              ? `${config.label} (${config.subtitle}) - ${isOpen ? 'Tutup' : 'Buka'} grup`
              : `${config.label}`
          }
          className={cn(
            "w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base rounded-sm transition-colors group/header",
            isMobile ? "cursor-pointer py-2 hover:bg-navy-deep/40 px-2 -mx-2" : "cursor-default"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              {/* Number + Label */}
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm md:text-base text-blue-accent tracking-wider font-medium shrink-0">
                  {number}
                </span>
                <span className="font-mono text-[10px] text-muted/50 tracking-wide shrink-0">/</span>
                <h3 className="font-display text-lg md:text-xl text-ivory tracking-wide truncate">
                  {config.label}
                </h3>
              </div>

              {/* Subtitle */}
              <p className="font-mono text-[11px] text-muted tracking-wider uppercase truncate">
                {config.subtitle}
              </p>
            </div>

            {/* Accordion Indicator Icon (Mobile Only) */}
            {isMobile && (
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300",
                    isOpen
                      ? "border-blue-accent bg-blue-accent/15 text-blue-accent shadow-[0_0_8px_rgba(74,127,232,0.3)]"
                      : "border-divider bg-navy-deep text-muted group-hover/header:border-blue-accent/50 group-hover/header:text-ivory"
                  )}
                >
                  {isOpen ? (
                    <Minus size={14} className="stroke-[2.5]" />
                  ) : (
                    <Plus size={14} className="stroke-[2.5]" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Console Divider Line */}
          <div className="mt-3 h-[1px] bg-gradient-to-r from-divider via-divider/50 to-transparent" />
        </button>
      </div>

      {/* Card Grid Container with Deferred Rendering & Smooth Animation */}
      <div id={`production-group-${category}`}>
        {shouldMountContent && (
          <motion.div
            initial={false}
            animate={
              isMobile
                ? {
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }
                : {
                    height: 'auto',
                    opacity: 1,
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            }
            style={{ overflow: isMobile && !isOpen ? 'hidden' : 'visible' }}
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
              isMobile && !isOpen && "pointer-events-none hidden md:grid"
            )}
          >
            {works ? (
              works.map((work, idx) => (
                <WorkCard
                  key={`${work.id || work.title}-${idx}`}
                  work={work}
                  onSelectVideo={onSelectVideo}
                  onSelectInfo={onSelectInfo}
                />
              ))
            ) : (
              children
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

