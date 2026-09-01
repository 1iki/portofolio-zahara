import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, Linkedin, Instagram, FileText, AlertCircle } from 'lucide-react';
import { TiledScriptWatermark } from './WatermarkOverlay';
import { WATERMARK_CONFIG } from '../lib/watermarkConfig';
import { useSound } from '../context/SoundContext';

/**
 * Script Preview Viewer Modal
 * 
 * SECURITY & PROTECTION ARCHITECTURE (Deterrence Strategy):
 * =============================================================================
 * 1. Image-based presentation: The script is rendered via <img>/SVG canvas,
 *    NOT raw selectable text elements (<p>/<div>), preventing text extraction.
 * 2. Multi-layer Tiled Watermarking: 
 *    - Option 1: Composite watermark baked directly into the SVG file on build.
 *    - Option 2: TiledScriptWatermark SVG overlay at runtime.
 *    Result: Any screenshot taken will unmistakably carry Zahara's ownership attribution.
 * 3. Excerpt Scoping: Displays max 1 page / ~25-30% of script content.
 * 4. Gradient Fade-Out & CTA: Obscures remaining script content with CTA to request full copy.
 * 5. Cosmetic Deterrence: user-select: none & onContextMenu disabled.
 * 
 * LIMITATION DISCLAIMER:
 * Note that in standard web browsers, client-rendered images can still be captured 
 * via browser devtools or screen capture tools. This system acts as a strong 
 * DETERRENCE (making stolen samples unusable as original un-watermarked work) 
 * rather than a hardware DRM prevention system.
 * =============================================================================
 */
export default function ScriptModal({ script, onClose }) {
  const { playClick } = useSound();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!script) return null;

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
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-accent px-2 py-0.5 rounded bg-blue-accent/10 border border-blue-accent/20">
                    {script.format || 'CUPLIKAN NASKAH'}
                  </span>
                  <span className="text-xs font-mono text-muted flex items-center gap-1">
                    <Lock size={10} className="text-amber-400" />
                    WATERMARKED PREVIEW
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ivory truncate mt-0.5">
                  {script.title} — {script.episode}
                </h3>
              </div>
            </div>

            <button
              onClick={() => { playClick(); onClose(); }}
              className="p-2 rounded-full border border-divider hover:border-ivory text-muted hover:text-ivory transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup preview naskah"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-navy-base border border-divider/60 text-xs font-mono">
              <div>
                <span className="text-muted text-[10px] uppercase block">Peran</span>
                <span className="text-ivory font-semibold">{script.role}</span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase block">Tanggal</span>
                <span className="text-ivory">{script.date}</span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase block">Instansi / Produksi</span>
                <span className="text-ivory truncate block">{script.organization}</span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase block">Cakupan Cuplikan</span>
                <span className="text-blue-accent font-semibold">{script.previewPageCount}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-ivory/80 leading-relaxed">
              {script.description}
            </p>

            {/* Script Image Container with Protection Features */}
            <div
              className="relative w-full rounded-lg border border-divider bg-navy-base overflow-hidden select-none group"
              onContextMenu={(e) => e.preventDefault()} // Disable Right Click menu on script viewer
            >
              {/* Option 2: Runtime Tiled Watermark Overlay */}
              <TiledScriptWatermark opacity={0.16} />

              {/* Render Script Preview as Image/SVG Asset */}
              <div className="relative w-full flex justify-center bg-navy-base p-2 sm:p-4 min-h-[450px]">
                <img
                  src={script.previewImageUrl}
                  alt={`Cuplikan naskah ${script.title} oleh Zahara Elhusna Barok`}
                  className="w-full max-w-2xl h-auto object-contain rounded shadow-lg select-none pointer-events-none"
                  draggable={false}
                />

                {/* Bottom Gradient Fade-Out Mask */}
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-navy-deep via-navy-deep/90 to-transparent pointer-events-none" />
              </div>

              {/* Overlaid CTA Banner at the bottom of Excerpt */}
              <div className="relative z-20 p-6 bg-navy-deep/95 border-t border-blue-accent/30 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/30 text-blue-accent text-xs font-mono">
                  <AlertCircle size={14} />
                  <span>CUPLIKAN DIBATASI HINGGA ~25% DURASI / HALAMAN NASKAH</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-base sm:text-lg text-ivory">
                    Tertarik Membaca Naskah Lengkap?
                  </h4>
                  <p className="text-xs text-muted max-w-lg mx-auto">
                    Dokumen naskah lengkap (versi PDF resmi/full draft) tersedia atas permintaan untuk keperluan seleksi kerja, rekrutmen, atau penawaran kerja sama.
                  </p>
                </div>

                {/* CTA Contact Buttons */}
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <a
                    href={`mailto:${WATERMARK_CONFIG.contactEmail}?subject=Permintaan Naskah Lengkap: ${encodeURIComponent(script.title)}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-accent text-navy-base font-semibold text-xs font-mono hover:bg-blue-accent/90 transition-colors shadow-md"
                  >
                    <Mail size={14} />
                    Minta Naskah via Email
                  </a>
                  <a
                    href={WATERMARK_CONFIG.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider hover:border-ivory text-ivory text-xs font-mono transition-colors bg-navy-base"
                  >
                    <Linkedin size={14} />
                    Hubungi via LinkedIn
                  </a>
                  <a
                    href={WATERMARK_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-divider hover:border-ivory text-ivory text-xs font-mono transition-colors bg-navy-base"
                  >
                    <Instagram size={14} />
                    Instagram DM
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Protection Notice & Micro-copy */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-muted pt-2 border-t border-divider/50">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-blue-accent" />
                © {new Date().getFullYear()} {WATERMARK_CONFIG.ownerName} — Hak cipta dilindungi undang-undang.
              </span>
              <span className="text-[10px] text-muted/70">
                Zahara Elhusna Barok • Anti-theft protected preview • Developed by @fachri.aer
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
