import React from 'react';
import { motion } from 'motion/react';
import { Play, Info, ExternalLink, Radio } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { hasPlayableMedia, resolveThumbnail } from '../lib/utils';

/**
 * WorkHighlight — "LATEST SIGNAL" block.
 * Displays the most recent work globally (or per active role filter).
 * Determined dynamically by endDate — never static/manual.
 */
export default function WorkHighlight({ work, onSelectVideo, onSelectInfo }) {
  const { playClick } = useSound();

  if (!work) return null;

  const isPlayable = hasPlayableMedia(work);
  const thumbnail = resolveThumbnail(work);

  const handleWatch = () => {
    playClick();
    if (onSelectVideo) onSelectVideo(work);
  };

  const handleDetails = () => {
    playClick();
    if (onSelectInfo) onSelectInfo(work);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-16 overflow-hidden rounded-sm border border-blue-accent/30 bg-navy-deep"
    >
      {/* Subtle animated glow border */}
      <div className="absolute inset-0 rounded-sm pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(74,127,232,0.08) 0%, transparent 50%, rgba(74,127,232,0.04) 100%)',
      }} />

      <div className="relative flex flex-col lg:flex-row">
        {/* Thumbnail side (desktop: left column) */}
        {thumbnail && (
          <div className="relative w-full lg:w-[340px] xl:w-[400px] shrink-0 aspect-video lg:aspect-auto overflow-hidden border-b lg:border-b-0 lg:border-r border-divider">
            <img
              src={thumbnail}
              alt={work.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy-deep/60 hidden lg:block pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent to-transparent lg:hidden pointer-events-none" />
          </div>
        )}

        {/* Content side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center gap-4">
          {/* Signal header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-blue-accent" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-blue-accent font-medium uppercase">
                LATEST SIGNAL
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-accent/30 to-transparent" />
          </div>

          {/* Title */}
          <h3 className="font-display text-xl md:text-2xl lg:text-3xl text-ivory leading-tight">
            {work.title}
          </h3>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted tracking-wide uppercase">
            <span className="text-ivory/90">{work.role}</span>
            <span className="w-1 h-1 rounded-full bg-divider" />
            <span>{work.date}</span>
            {work.platform && (
              <>
                <span className="w-1 h-1 rounded-full bg-divider" />
                <span>{work.platform}</span>
              </>
            )}
          </div>

          {/* Organization */}
          {work.organization && (
            <span className="font-mono text-[10px] text-muted/70 tracking-wider uppercase -mt-2">
              {work.organization}
            </span>
          )}

          {/* Description (truncated) */}
          {work.description && (
            <p className="text-sm text-muted leading-relaxed line-clamp-2 max-w-xl">
              {work.description}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {isPlayable && (
              <button
                type="button"
                onClick={handleWatch}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-onair-red/10 border border-onair-red/40 rounded-sm text-[11px] font-mono tracking-wider text-onair-red hover:bg-onair-red hover:text-ivory transition-all duration-300 uppercase font-semibold"
                aria-label={`Tonton ${work.title}`}
              >
                <Play size={12} fill="currentColor" />
                <span>WATCH</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDetails}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-base border border-divider rounded-sm text-[11px] font-mono tracking-wider text-ivory/90 hover:border-blue-accent hover:text-blue-accent transition-all duration-300 uppercase font-semibold"
              aria-label={`Lihat detail ${work.title}`}
            >
              <Info size={12} />
              <span>DETAILS</span>
            </button>

            {work.externalUrl && (
              <a
                href={work.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClick()}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-mono tracking-wider text-muted hover:text-blue-accent transition-colors uppercase"
                aria-label={`Buka ${work.title} di platform asal`}
              >
                <ExternalLink size={11} />
                <span>OPEN</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
