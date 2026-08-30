import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Video, ExternalLink, ShieldCheck } from 'lucide-react';
import { CornerPhotoWatermark } from './WatermarkOverlay';
import { useSound } from '../context/SoundContext';

/**
 * Documentation (BTS) Viewer Modal
 *
 * Features:
 * - Medium resolution photos with subtle corner watermark badge (~40% opacity).
 * - Unlisted video embeds via YouTube/Vimeo iframe (no direct .mp4 raw file download link).
 * - Right-click deterrence (onContextMenu prevention).
 */
export default function DocumentationModal({ item, onClose }) {
  const { playClick } = useSound();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isVideo = item.type === 'video';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-navy-base/90 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-navy-deep border border-divider rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-navy-base/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-blue-accent/10 border border-blue-accent/30 text-blue-accent">
                {isVideo ? <Video size={18} /> : <Camera size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-accent px-2 py-0.5 rounded bg-blue-accent/10 border border-blue-accent/20">
                    {isVideo ? 'VIDEO BTS / LIPUTAN' : 'FOTO BTS PRODUKSI'}
                  </span>
                  <span className="text-xs font-mono text-muted flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    DOKUMENTASI RESMI
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ivory truncate mt-0.5">
                  {item.title}
                </h3>
              </div>
            </div>

            <button
              onClick={() => { playClick(); onClose(); }}
              className="p-2 rounded-full border border-divider hover:border-ivory text-muted hover:text-ivory transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup dokumentasi"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

            {/* Media Presentation Container */}
            <div 
              className="relative w-full rounded-lg border border-divider bg-navy-base overflow-hidden select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {isVideo ? (
                /* Video Embed Presentation — Unlisted YouTube/Vimeo iFrame (No .mp4 raw link) */
                <div className="relative w-full aspect-video bg-navy-base">
                  <iframe
                    src={item.videoEmbedUrl}
                    title={item.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* Photo Presentation — Medium Resolution + Corner Watermark Badge */
                <div className="relative w-full min-h-[350px] max-h-[550px] flex items-center justify-center bg-navy-base p-2">
                  <img
                    src={item.mediaUrl}
                    alt={`Dokumentasi ${item.title}`}
                    className="w-full max-h-[520px] object-contain rounded select-none pointer-events-none"
                    draggable={false}
                  />
                  {/* Subtle Corner Watermark Overlay (~40% opacity) */}
                  <CornerPhotoWatermark />
                </div>
              )}
            </div>

            {/* Metadata Detail Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-navy-base border border-divider/60 text-xs font-mono">
              <div>
                <span className="text-muted text-[10px] uppercase block">Proyek</span>
                <span className="text-ivory font-semibold">{item.project}</span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase block">Peran</span>
                <span className="text-ivory">{item.role}</span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase block">Lokasi</span>
                <span className="text-ivory truncate block">{item.location}</span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase block">Waktu Produksi</span>
                <span className="text-blue-accent font-semibold">{item.date}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-ivory/80 leading-relaxed">
              {item.description}
            </p>

            {/* External Link (if Video) */}
            {item.externalUrl && (
              <div className="pt-2 flex justify-end">
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider hover:border-blue-accent text-xs font-mono text-muted hover:text-ivory transition-colors"
                >
                  <ExternalLink size={14} />
                  Tonton di Platform Asli (YouTube)
                </a>
              </div>
            )}

            {/* Footer Micro-copy */}
            <div className="text-[11px] font-mono text-muted/70 pt-2 border-t border-divider/50 text-center sm:text-left">
              © {new Date().getFullYear()} Zahara Elhusna Barok — Dokumentasi behind-the-scenes kegiatan produksi media.
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
