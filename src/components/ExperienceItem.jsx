import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Building2 } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * ExperienceItem — Broadcast Dossier Card representing a single professional role.
 */
export default function ExperienceItem({ item }) {
  const prefersReducedMotion = useReducedMotion();

  if (!item) return null;

  return (
    <motion.article
      layout
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-navy-deep border border-divider hover:border-blue-accent/50 rounded-sm p-6 md:p-8 transition-all duration-300 shadow-lg relative group"
    >
      {/* Header Info Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-divider/50">
        <div className="flex items-center gap-2 font-mono text-xs text-blue-accent tracking-wider font-medium">
          <Calendar size={13} className="shrink-0 text-blue-accent" />
          <span>{item.dateLabel}</span>
        </div>

        {item.location && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted tracking-wide uppercase">
            <MapPin size={12} className="shrink-0 text-muted/70" />
            <span>{item.location}</span>
          </div>
        )}
      </div>

      {/* Main Title & Organization */}
      <div className="mt-4">
        <h4 className="font-display text-xl md:text-2xl text-ivory leading-tight group-hover:text-blue-accent transition-colors">
          {item.position}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 font-mono text-xs text-muted tracking-wide uppercase">
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
              <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ivory/90 leading-relaxed">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {item.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-navy-base/80 p-3 md:p-3.5 rounded-sm border border-divider/60 hover:border-blue-accent/40 transition-colors flex flex-col justify-center"
              >
                <span className="font-display text-xl md:text-2xl font-bold text-blue-accent leading-none">
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
    </motion.article>
  );
}
