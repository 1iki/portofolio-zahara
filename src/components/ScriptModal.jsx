import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, Linkedin, Instagram, FileText, AlertCircle } from 'lucide-react';
import { TiledScriptWatermark } from './WatermarkOverlay';
import AsyncImage from './common/AsyncImage';
import PercentLoader from './common/PercentLoader';
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
 * 3. Excerpt Scoping: Displays only the configured previewPercentage of pages.
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

/**
 * Generate Cloudinary page-specific image URLs from a base preview URL.
 * Cloudinary PDF previews use a `pg_N` transformation in the URL.
 * e.g. .../pg_1/v1234567890/porto-zeze/scripts/script-xxx.pdf
 * 
 * If the URL contains `pg_<N>`, we replace it with the target page.
 * Otherwise, we insert `pg_<N>` before the version segment.
 */
function generatePageUrl(basePreviewUrl, pageNumber) {
  if (!basePreviewUrl) return null;

  // Pattern: /pg_<digits>/ in Cloudinary transformation chain
  const pgRegex = /\/pg_\d+\//;
  if (pgRegex.test(basePreviewUrl)) {
    return basePreviewUrl.replace(pgRegex, `/pg_${pageNumber}/`);
  }

  // Fallback: insert pg_N before the /v<timestamp>/ segment
  const versionRegex = /(\/v\d+\/)/;
  if (versionRegex.test(basePreviewUrl)) {
    return basePreviewUrl.replace(versionRegex, `/pg_${pageNumber}$1`);
  }

  // If neither pattern matches, return as-is (single image fallback)
  return basePreviewUrl;
}

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

  // Calculate preview pages based on previewPercentage
  const { previewPages, totalPages, previewPercentage, isFullPreview } = useMemo(() => {
    const pct = Number(script?.previewPercentage);
    const safePct = (!Number.isFinite(pct) || pct < 1 || pct > 100) ? 100 : Math.round(pct);
    const total = Number(script?.pageCount) || 0;

    if (total <= 0) {
      // No page count — fallback to single image mode
      return { previewPages: 1, totalPages: 0, previewPercentage: safePct, isFullPreview: safePct >= 100 };
    }

    const pages = Math.max(1, Math.round(total * safePct / 100));
    return { previewPages: pages, totalPages: total, previewPercentage: safePct, isFullPreview: safePct >= 100 };
  }, [script]);

  // Generate array of page image URLs
  const pageUrls = useMemo(() => {
    const baseUrl = script?.previewImageUrl || script?.thumbnailUrl || '/naskah/salah-pintu-ep01.png';

    if (totalPages <= 0) {
      // No page count — show single image
      return [baseUrl];
    }

    const urls = [];
    for (let i = 1; i <= previewPages; i++) {
      urls.push(generatePageUrl(baseUrl, i));
    }
    return urls;
  }, [script, previewPages, totalPages]);

  if (!script) return null;

  // Dynamic preview scope label
  const previewScopeLabel = totalPages > 0
    ? `CUPLIKAN DIBATASI HINGGA ${previewPercentage}% — HALAMAN 1–${previewPages} DARI ${totalPages} Untuk Melindungi Hak Cipta Karya`
    : `CUPLIKAN DIBATASI HINGGA ${previewPercentage}% HALAMAN NASKAH`;

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
                <span className="text-blue-accent font-semibold">{script.previewPageCount || `${previewPercentage}% Preview`}</span>
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

              {/* Scrollable Script Pages Container */}
              <div className="relative w-full bg-navy-base overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <div className="flex flex-col items-center gap-3 p-2 sm:p-4">
                  {pageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-full max-w-2xl">
                      <AsyncImage
                        src={url}
                        fallbackSrc={script.thumbnailUrl || '/naskah/salah-pintu-ep01.png'}
                        alt={`Cuplikan naskah ${script.title} — halaman ${idx + 1} oleh Zahara Elhusna Barok`}
                        className="w-full h-auto object-contain rounded shadow-lg select-none pointer-events-none"
                        containerClassName="w-full min-h-[300px] border-0 bg-transparent"
                        loadingText={`Memuat halaman ${idx + 1}...`}
                        showPercentLoader={true}
                        onError={() => { }}
                        draggable={false}
                      />
                      {/* Page number indicator */}
                      {totalPages > 0 && (
                        <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded bg-navy-base/80 border border-divider/50 text-[9px] font-mono text-muted backdrop-blur-sm">
                          {idx + 1} / {isFullPreview ? totalPages : previewPages}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Gradient Fade-Out Mask — only when not full preview */}
                {!isFullPreview && (
                  <div className="sticky bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-navy-deep via-navy-deep/90 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Overlaid CTA Banner at the bottom of Excerpt — only when not full preview */}
              {!isFullPreview && (
                <div className="relative z-20 p-6 bg-navy-deep/95 border-t border-blue-accent/30 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/30 text-blue-accent text-xs font-mono">
                    <AlertCircle size={14} />
                    <span>{previewScopeLabel}</span>
                  </div>

                  {/* <div className="space-y-1">
                    <h4 className="font-display font-semibold text-base sm:text-lg text-ivory">
                      Tertarik Membaca Naskah Lengkap?
                    </h4>
                    <p className="text-xs text-muted max-w-lg mx-auto">
                      Dokumen naskah lengkap (versi PDF resmi/full draft) tersedia di Cloudinary atau atas permintaan untuk keperluan seleksi kerja.
                    </p>
                  </div> */}

                  {/* CTA Contact & PDF Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {/* {script.pdfUrl && (
                      <a
                        href={script.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-navy-base font-bold text-xs font-mono transition-all shadow-md"
                      >
                        <FileText size={15} />
                        Buka Dokumen PDF (Cloudinary)
                      </a>
                    )} */}
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
                  </div>
                </div>
              )}
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

