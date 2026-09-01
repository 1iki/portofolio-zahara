import React, { useState } from 'react';
import { motion } from 'motion/react';
import { documentations } from '../data/documentation';
import DocumentationModal from './DocumentationModal';
import { CornerPhotoWatermark } from './WatermarkOverlay';
import { useSound } from '../context/SoundContext';

/**
 * DocumentationSection — simplified photo gallery with lightbox.
 *
 * Requirements:
 * - Title: "Dokumentasi"
 * - Simple photo/video grid
 * - Click opens popup/lightbox (DocumentationModal)
 * - No sub-sections, no filters, no metadata cards
 * - Responsive, mobile-friendly
 * - Keyboard accessible (Escape closes lightbox)
 */
export default function DocumentationSection() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { playClick } = useSound();

  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="dokumentasi">

      {/* Section Header */}
      <div className="mb-12">
        <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">Dokumentasi</h2>
        <p className="font-mono text-[11px] text-muted tracking-wider uppercase mt-2">
          Behind The Scenes &amp; Produksi
        </p>
        <div className="mt-4 h-[1px] bg-gradient-to-r from-divider via-divider/50 to-transparent" />
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {documentations.map((item, idx) => {
          const isVideo = item.type === 'video';
          const thumbSrc = isVideo ? item.thumbnailUrl : (item.mediaUrl || item.thumbnailUrl);

          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative aspect-[4/3] bg-navy-deep border border-divider rounded-sm overflow-hidden cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base"
              onClick={() => { playClick(); setSelectedDoc(item); }}
              aria-label={`Lihat dokumentasi: ${item.title}`}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Thumbnail Image */}
              <img
                src={thumbSrc}
                alt={`Dokumentasi ${item.title}`}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none select-none"
                draggable={false}
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Video indicator */}
              {isVideo && (
                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-onair-red/80" />
                  <span className="text-[8px] font-mono tracking-widest text-ivory/70">VIDEO</span>
                </div>
              )}

              {/* Photo watermark */}
              {!isVideo && <CornerPhotoWatermark />}

              {/* Hover overlay with title */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-10 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[10px] sm:text-[11px] font-semibold text-ivory leading-tight line-clamp-2 block">
                  {item.title}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedDoc && (
        <DocumentationModal
          item={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </section>
  );
}
