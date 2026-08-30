import React from 'react';
import { motion } from 'motion/react';
import { workCategories } from '../data/workCategories';

/**
 * WorkSection — renders a single category group section.
 * Includes auto-numbered label, subtitle, divider, and children (WorkCard grid).
 *
 * Props:
 *   number   — formatted section number ("01", "02", etc.) — computed from sorted index
 *   category — category slug key (e.g. "polimedia-tv")
 *   children — WorkCard elements
 */
export default function WorkSection({ number, category, children }) {
  const config = workCategories[category];

  if (!config) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`WorkSection: unknown category "${category}"`);
    }
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 last:mb-0"
    >
      {/* Section Header */}
      <div className="mb-8">
        {/* Number + Label */}
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-sm md:text-base text-blue-accent tracking-wider font-medium">
            {number}
          </span>
          <span className="font-mono text-[10px] text-muted/50 tracking-wide">/</span>
          <h3 className="font-display text-lg md:text-xl text-ivory tracking-wide">
            {config.label}
          </h3>
        </div>

        {/* Subtitle */}
        <p className="font-mono text-[11px] text-muted tracking-wider uppercase ml-0 md:ml-[calc(theme(fontSize.base)+1.5rem)]">
          {config.subtitle}
        </p>

        {/* Divider */}
        <div className="mt-3 h-[1px] bg-gradient-to-r from-divider via-divider/50 to-transparent" />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children}
      </div>
    </motion.section>
  );
}
