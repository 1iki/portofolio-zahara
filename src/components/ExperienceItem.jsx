import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Building2 } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * ExperienceItem — Editorial Career Timeline Node & Card representing a single professional role.
 */
export default function ExperienceItem({ item, isLast = false }) {
  const prefersReducedMotion = useReducedMotion();

  if (!item) return null;

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* ── MOBILE TIMELINE ITEM (< 768px) ────────────────────────── */}
      <div className="block md:hidden relative pl-6 border-l border-divider/60 ml-2 pb-10 last:pb-0">
        {/* Mobile Timeline Node */}
        <div
          aria-hidden="true"
          className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-navy-base border-2 border-blue-accent flex items-center justify-center shadow-[0_0_8px_rgba(74,127,232,0.5)] z-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-accent" />
        </div>

        {/* Mobile Date Header */}
        <div className="flex items-center gap-2 font-mono text-xs text-blue-accent tracking-wider font-semibold mb-3">
          <Calendar size={13} className="shrink-0 text-blue-accent" />
          <span>{item.dateLabel}</span>
        </div>

        {/* Experience Card */}
        <article className="bg-navy-deep border border-divider hover:border-blue-accent/50 rounded-sm p-5 sm:p-6 transition-all duration-300 shadow-lg relative">
          {/* Header & Location */}
          <div className="pb-4 border-b border-divider/50">
            <h4 className="font-display text-lg sm:text-xl text-ivory leading-tight group-hover:text-blue-accent transition-colors">
              {item.position}
            </h4>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 font-mono text-xs text-muted uppercase">
              <div className="flex items-center gap-1.5">
                <Building2 size={13} className="shrink-0 text-muted/70" />
                <span className="text-ivory/80 font-medium">{item.organization}</span>
              </div>
              {item.location && (
                <div className="flex items-center gap-1 text-[11px] text-muted">
                  <MapPin size={12} className="shrink-0 text-muted/70" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Responsibilities Section */}
          {item.responsibilities && item.responsibilities.length > 0 && (
            <div className="mt-5">
              <span className="font-mono text-[10px] text-muted/70 tracking-[0.2em] uppercase block mb-3">
                [ TUGAS & KONTRIBUSI ]
              </span>
              <ul className="space-y-2">
                {item.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-ivory/90 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-accent mt-1.5 shrink-0 shadow-[0_0_6px_rgba(74,127,232,0.8)]" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics / Output Display Grid */}
          {item.metrics && item.metrics.length > 0 && (
            <div className="mt-5 pt-4 border-t border-divider/40">
              <span className="font-mono text-[10px] text-muted/70 tracking-[0.2em] uppercase block mb-3">
                [ OUTPUT / METRICS ]
              </span>
              <div className="grid grid-cols-3 gap-2">
                {item.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="bg-navy-base/80 p-2.5 rounded-sm border border-divider/60 hover:border-blue-accent/40 transition-colors flex flex-col justify-center text-center"
                  >
                    <span className="font-display text-lg font-bold text-blue-accent leading-none">
                      {metric.value}
                    </span>
                    <span className="font-mono text-[8px] text-muted tracking-wider uppercase mt-1 leading-tight line-clamp-2">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* ── DESKTOP EDITORIAL TIMELINE ITEM (>= 768px) ────────────── */}
      <div className="hidden md:grid md:grid-cols-[180px_32px_1fr] lg:grid-cols-[200px_32px_1fr] items-start pb-12 last:pb-0">
        {/* Left Column: Date & Location */}
        <div className="flex flex-col items-end pr-6 pt-1 text-right shrink-0">
          <span className="font-mono text-xs lg:text-sm text-blue-accent tracking-wider font-semibold">
            {item.dateLabel}
          </span>
          {item.location && (
            <div className="flex items-center gap-1 font-mono text-[11px] text-muted tracking-wide uppercase mt-1">
              <MapPin size={11} className="shrink-0 text-muted/60" />
              <span>{item.location}</span>
            </div>
          )}
        </div>

        {/* Center Column: Continuous Line + Node */}
        <div className="relative flex justify-center self-stretch">
          {/* Continuous Vertical Timeline Line */}
          {!isLast && (
            <div className="w-[2px] bg-gradient-to-b from-divider via-divider to-divider/20 absolute top-4 bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" />
          )}

          {/* Timeline Node Anchor */}
          <div
            aria-hidden="true"
            className="w-4 h-4 rounded-full bg-navy-base border-2 border-blue-accent flex items-center justify-center shadow-[0_0_10px_rgba(74,127,232,0.6)] z-10 mt-1 transition-transform duration-300 group-hover:scale-125 shrink-0"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-accent" />
          </div>
        </div>

        {/* Right Column: Experience Card */}
        <div className="pl-6 min-w-0">
          <article className="bg-navy-deep border border-divider hover:border-blue-accent/50 rounded-sm p-6 lg:p-8 transition-all duration-300 shadow-lg relative">
            {/* Header Info */}
            <div className="pb-4 border-b border-divider/50">
              <h4 className="font-display text-xl lg:text-2xl text-ivory leading-tight group-hover:text-blue-accent transition-colors">
                {item.position}
              </h4>
              <div className="flex items-center gap-2 mt-2 font-mono text-xs text-muted tracking-wide uppercase">
                <Building2 size={13} className="shrink-0 text-muted/70" />
                <span className="text-ivory/80 font-medium">{item.organization}</span>
              </div>
            </div>

            {/* Responsibilities Section */}
            {item.responsibilities && item.responsibilities.length > 0 && (
              <div className="mt-6">
                <span className="font-mono text-[10px] text-muted/70 tracking-[0.2em] uppercase block mb-3">
                  [ TUGAS & KONTRIBUSI ]
                </span>
                <ul className="space-y-2.5">
                  {item.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs lg:text-sm text-ivory/90 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-accent mt-2 shrink-0 shadow-[0_0_6px_rgba(74,127,232,0.8)]" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metrics / Output Display Grid */}
            {item.metrics && item.metrics.length > 0 && (
              <div className="mt-6 pt-5 border-t border-divider/40">
                <span className="font-mono text-[10px] text-muted/70 tracking-[0.2em] uppercase block mb-3">
                  [ OUTPUT / METRICS ]
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {item.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="bg-navy-base/80 p-3 lg:p-3.5 rounded-sm border border-divider/60 hover:border-blue-accent/40 transition-colors flex flex-col justify-center"
                    >
                      <span className="font-display text-xl lg:text-2xl font-bold text-blue-accent leading-none">
                        {metric.value}
                      </span>
                      <span className="font-mono text-[9px] text-muted tracking-wider uppercase mt-1.5 leading-tight">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </motion.div>
  );
}

