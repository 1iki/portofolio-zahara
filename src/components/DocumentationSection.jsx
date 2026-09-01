import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { documentations } from '../data/documentation';
import DocumentationModal from './DocumentationModal';
import { CornerPhotoWatermark } from './WatermarkOverlay';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

/**
 * Helper to parse aspect ratio string (e.g. "4 / 5" or "16 / 9") into width/height numerical ratio.
 */
function parseAspectRatio(ratioStr) {
  if (!ratioStr) return 16 / 9;
  const parts = ratioStr.split('/').map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
    return parts[0] / parts[1];
  }
  return 16 / 9;
}

/**
 * Helper to calculate height factor relative to column width (height = width * (1 / ratio)).
 */
function getHeightFactor(ratioStr) {
  const ratio = parseAspectRatio(ratioStr);
  return 1 / ratio;
}

/**
 * Hook to track responsive column count based on viewport breakpoints.
 * Mobile (< 640px): 2 columns
 * Tablet (640px - 1023px): 3 columns
 * Desktop (>= 1024px): 4 columns
 */
function useColumnCount() {
  const [columnCount, setColumnCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w >= 1024) return 4;
      if (w >= 640) return 3;
      return 2;
    }
    return 4;
  });

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setColumnCount(4);
      } else if (w >= 640) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columnCount;
}

/**
 * DocumentationSection — Editorial shortest-column masonry / production documentation wall.
 *
 * Architecture:
 * - Shortest-column greedy distribution algorithm (dynamically places each item into current shortest column)
 * - Each item preserves its exact media-native aspect ratio (data-driven from documentation.js)
 * - Responsive columns: 2 (mobile), 3 (tablet), 4 (desktop)
 * - Deferred image loading via native `loading="lazy"`
 * - Click opens lightbox (DocumentationModal)
 * - Keyboard accessible (Escape closes lightbox)
 */
export default function DocumentationSection() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { playClick } = useSound();
  const columnCount = useColumnCount();

  // Shortest-column placement algorithm
  const columns = useMemo(() => {
    const numCols = columnCount;
    const cols = Array.from({ length: numCols }, () => []);
    const heights = new Array(numCols).fill(0);
    const gapFactor = 0.06; // vertical gap allowance relative to column width

    documentations.forEach((item) => {
      const itemHeightFactor = getHeightFactor(item.aspectRatio);

      // Find column with minimum total height
      let minIndex = 0;
      for (let i = 1; i < numCols; i++) {
        if (heights[i] < heights[minIndex]) {
          minIndex = i;
        }
      }

      cols[minIndex].push(item);
      heights[minIndex] += itemHeightFactor + gapFactor;
    });

    return cols;
  }, [columnCount]);

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

      {/* Shortest-Column Masonry Photo Wall */}
      <div
        className={cn(
          "grid gap-3 sm:gap-4",
          columnCount === 2 && "grid-cols-2",
          columnCount === 3 && "grid-cols-3",
          columnCount === 4 && "grid-cols-4"
        )}
      >
        {columns.map((colItems, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-3 sm:gap-4">
            {colItems.map((item, idx) => {
              const isVideo = item.type === 'video';
              const thumbSrc = isVideo ? item.thumbnailUrl : (item.mediaUrl || item.thumbnailUrl);

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  style={{ aspectRatio: item.aspectRatio || '16 / 9' }}
                  className="relative w-full bg-navy-deep border border-divider rounded-sm overflow-hidden cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base shrink-0"
                  onClick={() => { playClick(); setSelectedDoc(item); }}
                  aria-label={`Lihat dokumentasi: ${item.title}`}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Thumbnail Image — exact media aspect ratio */}
                  <img
                    src={thumbSrc}
                    alt={`Dokumentasi ${item.title}`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none select-none"
                    draggable={false}
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Video indicator */}
                  {isVideo && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-onair-red/80 animate-pulse" />
                      <span className="text-[8px] font-mono tracking-widest text-ivory/70">VIDEO</span>
                    </div>
                  )}

                  {/* Photo watermark */}
                  {!isVideo && <CornerPhotoWatermark />}

                  {/* Hover overlay with title */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-10 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-ivory leading-tight line-clamp-2 block text-left">
                      {item.title}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ))}
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

