import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tv, ExternalLink } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../context/SoundContext';

export default function VideoModal({ work, onClose }) {
  const prefersReducedMotion = useReducedMotion();
  const { playClick } = useSound();
  const modalRef = useRef(null);

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

  const isYouTube = work.mediaType === 'youtube' || work.videoUrl?.includes('youtube.com') || work.videoUrl?.includes('youtu.be');
  const isDrive = work.mediaType === 'drive' || work.videoUrl?.includes('drive.google.com');
  const isTikTok = work.mediaType === 'tiktok' || work.videoUrl?.includes('tiktok.com');

  const targetLink = work.externalUrl || work.link || work.videoUrl;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-navy-deep/90 backdrop-blur-md cursor-pointer"
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
          className={`relative w-full ${isDrive && work.aspectRatio === 'portrait' ? 'max-w-md' : 'max-w-4xl'} bg-navy-base border border-divider rounded-sm shadow-2xl overflow-hidden z-10 flex flex-col focus:outline-none`}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header Control Panel */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-deep border-b border-divider">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-onair-red animate-pulse shadow-[0_0_8px_rgba(232,68,44,0.8)]"></span>
                <span className="text-[10px] font-mono tracking-widest text-onair-red font-medium uppercase">
                  {isYouTube ? 'LIVE BROADCAST' : isDrive ? 'DRIVE PREVIEW' : isTikTok ? 'TIKTOK FEED' : 'MEDIA MONITOR'}
                </span>
              </div>
              <div className="h-3 w-[1px] bg-divider"></div>
              <h2 id="modal-title" className="font-semibold text-ivory text-sm truncate">
                {work.title}
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {targetLink && (
                <a
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-muted hover:text-blue-accent transition-colors uppercase tracking-wider"
                  aria-label={`Buka ${work.title} di platform asal`}
                >
                  {isYouTube ? 'YouTube' : isDrive ? 'Google Drive' : isTikTok ? 'TikTok' : 'OPEN'} <ExternalLink size={12} />
                </a>
              )}
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="w-8 h-8 rounded-sm bg-navy-base border border-divider flex items-center justify-center text-muted hover:text-ivory hover:border-blue-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent"
                aria-label="Tutup modal video"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Video Iframe Container */}
          <div className={`relative ${isDrive && work.aspectRatio === 'portrait' ? 'aspect-[9/16]' : 'aspect-video'} w-full bg-ink flex items-center justify-center`}>
            {isYouTube && work.videoUrl ? (
              <iframe
                src={work.videoUrl.includes('autoplay=1') ? work.videoUrl : `${work.videoUrl}${work.videoUrl.includes('?') ? '&' : '?'}autoplay=1`}
                title={work.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isDrive && work.videoUrl ? (
              <iframe
                src={work.videoUrl}
                title={work.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              /* Fallback for TikTok or non-iframe media */
              <div className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-navy-deep/80 w-full h-full">
                {work.thumbnail && (
                  <img src={work.thumbnail} alt={work.title} className="max-h-48 object-contain rounded-sm border border-divider" />
                )}
                <span className="font-mono text-xs text-muted uppercase tracking-widest">[EXTERNAL MEDIA]</span>
                <p className="text-ivory text-sm max-w-md">{work.title} dipublikasikan di {work.platform || 'platform eksternal'}.</p>
                {targetLink && (
                  <a
                    href={targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="console-btn text-xs text-blue-accent border-blue-accent inline-flex items-center gap-2"
                  >
                    BUKA MEDIA ASLI <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata Status Strip */}
          <div className="px-4 py-3 bg-navy-deep border-t border-divider flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-muted uppercase">
            <div className="flex items-center gap-4">
              <span>ROLE: <strong className="text-ivory">{work.role}</strong></span>
              {work.organization && (
                <span>ORG: <strong className="text-ivory">{work.organization}</strong></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tv size={12} className="text-blue-accent" />
              <span>THE CONSOLE VIDEO MONITOR</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
