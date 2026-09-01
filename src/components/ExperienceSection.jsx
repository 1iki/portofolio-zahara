import React from 'react';
import { motion } from 'motion/react';
import { experienceCategories } from '../data/experienceCategories';

/**
 * ExperienceSection — Renders a dynamically sorted experience category group section.
 * Includes section number (01, 02, ...), title, subtitle, divider, and items.
 */
export default function ExperienceSection({ number, type, children }) {
  const config = experienceCategories[type];

  if (!config) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`ExperienceSection: unknown experience category "${type}"`);
    }
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 md:mb-20 last:mb-0"
    >
      {/* Section Header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-sm md:text-base text-blue-accent tracking-wider font-medium">
            {number}
          </span>
          <span className="font-mono text-[10px] text-muted/50 tracking-wide">/</span>
          <h3 className="font-display text-lg md:text-xl text-ivory tracking-wide">
            {config.label}
          </h3>
        </div>

        <p className="font-mono text-[11px] text-muted tracking-wider uppercase">
          {config.subtitle}
        </p>

        <div className="mt-3 h-[1px] bg-gradient-to-r from-divider via-divider/50 to-transparent" />
      </div>

      {/* Experience Item Stack */}
      <div className="space-y-0">
        {children}
      </div>
    </motion.section>
  );
}
