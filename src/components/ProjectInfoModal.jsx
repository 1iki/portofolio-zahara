import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ExternalLink, Calendar, Building, User, Layers, Tag } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../context/SoundContext';
import { resolveThumbnail, hasPlayableMedia } from '../lib/utils';
import MediaGallery from './MediaGallery';
import { normalizeMedia } from '../lib/mediaUtils';

export default function ProjectInfoModal({ work, onClose, onWatchVideo }) {
  const prefersReducedMotion = useReducedMotion();
  const { playClick } = useSound();
  const modalRef = useRef(null);
  
  const thumbnailSrc = resolveThumbnail(work);
  const [imageError, setImageError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isPlayable = hasPlayableMedia(work);

  const mediaList = normalizeMedia(work, thumbnailSrc);

  // Reset active slide index when modal work item changes
  useEffect(() => {
    setActiveIndex(0);
  }, [work?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playClick();
        onClose();
      }
    };

    // Body scroll lock
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    // Focus management
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, playClick]);

  if (!work) return null;

  const targetLink = work.externalUrl || work.link;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-navy-deep/90 backdrop-blur-md cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playClick();
            onClose();
          }}
        />

        {/* Modal Window — The Console Design */}
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          className="relative w-full max-w-2xl bg-navy-base border border-divider rounded-sm shadow-2xl overflow-hidden z-10 flex flex-col focus:outline-none my-auto max-h-[90vh]"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header Control Panel */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-deep border-b border-divider shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-accent animate-pulse shadow-[0_0_8px_rgba(74,127,232,0.8)]"></span>
                <span className="text-[10px] font-mono tracking-widest text-blue-accent font-medium uppercase">
                  PROJECT SPECIFICATION
                </span>
              </div>
              <div className="h-3 w-[1px] bg-divider"></div>
              <h2 id="info-modal-title" className="font-semibold text-ivory text-sm truncate">
                {work.title}
              </h2>
            </div>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-sm bg-navy-base border border-divider flex items-center justify-center text-muted hover:text-ivory hover:border-blue-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent shrink-0"
              aria-label="Tutup modal informasi"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Multi-Image Gallery Presentation */}
            {mediaList.length > 0 && (
              <MediaGallery
                media={mediaList}
                activeIndex={activeIndex}
                onIndexChange={setActiveIndex}
                title={work.title}
                showWatermark={false}
              />
            )}

            {/* Title & Output Badge */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-ivory leading-tight">{work.title}</h3>
              </div>
              {work.output && (
                <span className="px-3 py-1 bg-blue-accent/10 border border-blue-accent/30 rounded-sm text-xs font-mono tracking-wider text-blue-accent uppercase font-medium">
                  {work.output}
                </span>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-navy-deep rounded-sm border border-divider/50 font-mono text-xs">
              {work.role && (
                <div className="flex items-center gap-2 text-muted">
                  <User size={14} className="text-blue-accent shrink-0" />
                  <span className="text-ivory">{work.role}</span>
                </div>
              )}
              {work.organization && (
                <div className="flex items-center gap-2 text-muted">
                  <Building size={14} className="text-blue-accent shrink-0" />
                  <span className="text-ivory">{work.organization}</span>
                </div>
              )}
              {work.date && (
                <div className="flex items-center gap-2 text-muted">
                  <Calendar size={14} className="text-blue-accent shrink-0" />
                  <span className="text-ivory">{work.date}</span>
                </div>
              )}
              {work.platform && (
                <div className="flex items-center gap-2 text-muted">
                  <Layers size={14} className="text-blue-accent shrink-0" />
                  <span className="text-ivory">{work.platform}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {work.description ? (
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-muted tracking-widest uppercase block">[ DESCRIPTION ]</span>
                <p className="text-ivory/90 text-sm leading-relaxed whitespace-pre-line">
                  {work.description}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-muted tracking-widest uppercase block">[ DESCRIPTION ]</span>
                <p className="text-muted text-sm italic">
                  Informasi detail dan dokumentasi karya tersedia dalam inventaris portofolio Zahara.
                </p>
              </div>
            )}
          </div>

          {/* Footer Control Strip */}
          <div className="px-6 py-4 bg-navy-deep border-t border-divider flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              {isPlayable && onWatchVideo && (
                <button
                  onClick={() => {
                    playClick();
                    onWatchVideo(work);
                  }}
                  className="console-btn text-xs text-onair-red border-onair-red/50 hover:border-onair-red inline-flex items-center gap-2 font-mono"
                >
                  <Play size={12} fill="currentColor" /> TONTON VIDEO
                </button>
              )}

              {targetLink && (
                <a
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="console-btn text-xs text-blue-accent border-blue-accent inline-flex items-center gap-2 font-mono"
                  onClick={() => playClick()}
                >
                  BUKA TAUTAN <ExternalLink size={12} />
                </a>
              )}
            </div>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-4 py-2 bg-navy-base border border-divider text-xs font-mono text-ivory hover:border-blue-accent transition-colors rounded-sm ml-auto"
            >
              TUTUP
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
