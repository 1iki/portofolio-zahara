import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { getDocumentation, subscribeToDataChanges } from '../lib/contentService';
import DocumentationModal from './DocumentationModal';
import { CornerPhotoWatermark } from './WatermarkOverlay';
import PercentLoader from './common/PercentLoader';
import AsyncImage from './common/AsyncImage';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';
import { resolvePrimaryThumbnail } from '../lib/mediaUtils';
import {
  getDocumentationItemAspectRatio,
  getHeightFactorFromRatio,
  validateAndFormatAspectRatio
} from '../lib/aspectRatioUtils';

/**
 * Hook to track responsive column count based on viewport breakpoints.
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

export default function DocumentationSection() {
  const [docList, setDocList] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loadingState, setLoadingState] = useState('loading'); // 'loading' | 'success' | 'error'
  const [loadProgress, setLoadProgress] = useState(25);
  const [loadError, setLoadError] = useState(null);
  const [loadedRatios, setLoadedRatios] = useState({}); // Map of itemId -> measured ratio string
  const { playClick } = useSound();
  const columnCount = useColumnCount();

  const loadDocs = async () => {
    setLoadingState('loading');
    setLoadError(null);
    setLoadProgress(30);

    const timer1 = setTimeout(() => setLoadProgress(75), 150);

    try {
      const data = await getDocumentation();
      clearTimeout(timer1);
      setDocList(Array.isArray(data) ? data : []);
      setLoadProgress(100);
      setLoadingState('success');
    } catch (err) {
      clearTimeout(timer1);
      console.error('[DocumentationSection] Failed to load docs:', err);
      setLoadError(err?.message || 'Gagal memuat galeri dokumentasi.');
      setLoadingState('error');
    }
  };

  // Subscribe to real-time CMS mutations
  useEffect(() => {
    loadDocs();
    const unsubscribe = subscribeToDataChanges(() => {
      loadDocs();
    });
    return unsubscribe;
  }, []);

  // Handle dynamic measurement of image dimensions upon load
  const handleImageLoad = (item, e) => {
    if (e?.target && e.target.naturalWidth && e.target.naturalHeight) {
      const measuredRatio = validateAndFormatAspectRatio(
        e.target.naturalWidth / e.target.naturalHeight
      );
      if (measuredRatio) {
        setLoadedRatios((prev) => {
          if (prev[item.id] === measuredRatio) return prev;
          return { ...prev, [item.id]: measuredRatio };
        });
      }
    }
  };

  // Shortest-column placement algorithm using data-driven image ratios
  const columns = useMemo(() => {
    const numCols = columnCount;
    const cols = Array.from({ length: numCols }, () => []);
    const heights = new Array(numCols).fill(0);
    const gapFactor = 0.06; // vertical gap allowance relative to column width

    docList.forEach((item) => {
      const effectiveRatio = getDocumentationItemAspectRatio(item, loadedRatios[item.id]);
      const itemHeightFactor = getHeightFactorFromRatio(effectiveRatio);

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
  }, [columnCount, docList, loadedRatios]);

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
      {loadingState === 'loading' ? (
        <div className="py-16 flex justify-center border border-divider/40 rounded-sm bg-navy-deep/40">
          <PercentLoader
            variant="percent"
            label="Percent"
            value={loadProgress}
            subtext="Loading BTS Gallery..."
            size="md"
            showBar={true}
          />
        </div>
      ) : loadingState === 'error' ? (
        <div className="py-12 flex justify-center">
          <PercentLoader
            variant="percent"
            label="Percent"
            error={loadError}
            onRetry={loadDocs}
            size="md"
          />
        </div>
      ) : docList.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-divider rounded-sm">
          <span className="font-mono text-xs tracking-widest text-muted mb-2">[DOKUMENTASI BELUM TERSEDIA]</span>
          <p className="text-ivory text-sm">Konten dokumentasi produksi sedang dipersiapkan.</p>
        </div>
      ) : (
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
              const thumbSrc = resolvePrimaryThumbnail(item, isVideo ? item.thumbnailUrl : (item.mediaUrl || item.thumbnailUrl));
              const cardAspectRatio = getDocumentationItemAspectRatio(item, loadedRatios[item.id]);

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  style={{ aspectRatio: cardAspectRatio }}
                  className="relative w-full bg-navy-deep border border-divider rounded-sm overflow-hidden cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base shrink-0"
                  onClick={() => { playClick(); setSelectedDoc(item); }}
                  aria-label={`Lihat dokumentasi: ${item.title}`}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Thumbnail Image — data-driven media aspect ratio */}
                  <AsyncImage
                    src={thumbSrc}
                    alt={`Dokumentasi ${item.title}`}
                    onLoad={(e) => handleImageLoad(item, e)}
                    containerClassName="w-full h-full border-0 bg-navy-deep rounded-none"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none select-none"
                    draggable={false}
                    showPercentLoader={true}
                    loadingText="Memuat media..."
                    loading="eager"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-300 z-10" />

                  {/* Video indicator */}
                  {isVideo && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                      <div className="w-1.5 h-1.5 rounded-full bg-onair-red/80 animate-pulse" />
                      <span className="text-[8px] font-mono tracking-widest text-ivory/70">VIDEO</span>
                    </div>
                  )}

                  {/* Photo watermark */}
                  {!isVideo && <CornerPhotoWatermark />}

                  {/* Hover overlay with title */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-20 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
      )}

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
