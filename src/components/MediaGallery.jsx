import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { CornerPhotoWatermark } from './WatermarkOverlay';
import PercentLoader from './common/PercentLoader';
import AsyncImage from './common/AsyncImage';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

/**
 * Reusable Media Gallery Engine (Hardened Edition)
 * Portfolio: Zahara Elhusna
 *
 * Features:
 * - Single source-of-truth thumbnail (media[0]) and up to 55 images max
 * - Infinite Looping Carousel navigation (01 ← Prev → N, N ← Next → 01)
 * - Flexible media stage preserving image aspect ratios without cropping (object-contain)
 * - Two-digit counter badge (01 / N) in mono font
 * - Horizontal scrollable thumbnail rail with active indicator and scrollIntoView auto-scroll
 * - Touch swipe gestures (mobile) & Keyboard navigation (ArrowLeft / ArrowRight)
 * - Wrapped preloading (activeIndex ± 1 mod total) & lazy thumbnails with error fallbacks
 * - Corner photo watermark overlay & right-click deterrence
 */
export default function MediaGallery({
  media = [],
  activeIndex = 0,
  onIndexChange,
  title = 'Dokumentasi',
  showWatermark = true,
  className = '',
}) {
  const { playClick } = useSound();
  const [imageErrorMap, setImageErrorMap] = useState({});
  const [thumbErrorMap, setThumbErrorMap] = useState({});
  const thumbnailRefs = useRef([]);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const total = media.length;
  // Guard against out-of-bounds index
  const safeIndex = total > 0 ? Math.min(Math.max(0, activeIndex), total - 1) : 0;
  const currentMedia = media[safeIndex] || media[0] || null;

  // Formatted counter digits (e.g. "01 / 05")
  const currentNumStr = String(safeIndex + 1).padStart(2, '0');
  const totalNumStr = String(total).padStart(2, '0');

  // Looping navigation handlers
  const handlePrev = useCallback(() => {
    if (total > 1) {
      playClick();
      const prevIndex = (safeIndex - 1 + total) % total;
      onIndexChange(prevIndex);
    }
  }, [safeIndex, total, onIndexChange, playClick]);

  const handleNext = useCallback(() => {
    if (total > 1) {
      playClick();
      const nextIndex = (safeIndex + 1) % total;
      onIndexChange(nextIndex);
    }
  }, [safeIndex, total, onIndexChange, playClick]);

  // Preload adjacent wrapped images ((safeIndex ± 1 + total) % total)
  useEffect(() => {
    if (total <= 1) return;

    const prevIndex = (safeIndex - 1 + total) % total;
    const nextIndex = (safeIndex + 1) % total;
    const indicesToPreload = Array.from(new Set([prevIndex, nextIndex]));

    indicesToPreload.forEach((idx) => {
      const item = media[idx];
      if (item && item.src && item.type !== 'video') {
        const img = new Image();
        img.src = item.src;
      }
    });
  }, [safeIndex, media, total]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailRefs.current[safeIndex]) {
      thumbnailRefs.current[safeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [safeIndex]);

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartRef.current.x;
    const deltaY = touchEndY - touchStartRef.current.y;

    // Horizontal swipe threshold (50px minimum, horizontal dominance over vertical scroll)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else if (deltaX > 0) {
        handlePrev();
      }
    }
  };

  const handleImageError = (index) => {
    setImageErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  const handleThumbError = (index) => {
    setThumbErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  if (!currentMedia) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-navy-base border border-divider/60 rounded-lg text-muted font-mono text-xs">
        [ NO MEDIA AVAILABLE ]
      </div>
    );
  }

  const isCurrentVideo = currentMedia.type === 'video';
  const hasError = imageErrorMap[safeIndex];

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {/* Primary Media Stage Container */}
      <div
        className="relative w-full min-h-[300px] sm:min-h-[360px] max-h-[55vh] md:max-h-[60vh] flex items-center justify-center bg-navy-base border border-divider/60 rounded-lg overflow-hidden select-none group"
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Active Media Image or Video Embed */}
        {isCurrentVideo && currentMedia.videoEmbedUrl ? (
          <div className="relative w-full aspect-video bg-navy-base">
            <iframe
              src={currentMedia.videoEmbedUrl}
              title={currentMedia.alt || title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted font-mono text-xs gap-2 bg-navy-base w-full h-full">
            <ImageOff size={32} className="text-muted/40" />
            <span className="font-semibold text-ivory/80">IMAGE UNAVAILABLE</span>
            <span className="text-[11px] text-muted/60">Dokumentasi foto tidak dapat dimuat</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <AsyncImage
              key={currentMedia.src}
              src={currentMedia.src}
              alt={currentMedia.alt || `${title} - Foto ${currentNumStr}`}
              containerClassName="max-w-full max-h-[52vh] md:max-h-[58vh] w-auto h-auto border-0 bg-transparent"
              className="max-w-full max-h-[52vh] md:max-h-[58vh] w-auto h-auto object-contain rounded select-none pointer-events-none"
              draggable={false}
              showPercentLoader={true}
              loadingText="Memuat media..."
            />
          </AnimatePresence>
        )}

        {/* Corner Watermark Overlay */}
        {showWatermark && !isCurrentVideo && <CornerPhotoWatermark />}

        {/* Counter Badge (01 / N) */}
        {total > 1 && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded bg-navy-deep/85 border border-divider/80 text-[11px] font-mono font-semibold tracking-wider text-blue-accent backdrop-blur-md shadow-md">
            {currentNumStr} <span className="text-muted/60">/</span> {totalNumStr}
          </div>
        )}

        {/* Previous Button (Looping navigation, 44px min touch target) */}
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Gambar sebelumnya"
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-navy-deep/80 border border-divider/80 text-ivory opacity-80 hover:opacity-100 hover:scale-105 hover:border-blue-accent backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next Button (Looping navigation, 44px min touch target) */}
        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Gambar berikutnya"
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-navy-deep/80 border border-divider/80 text-ivory opacity-80 hover:opacity-100 hover:scale-105 hover:border-blue-accent backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Horizontal Thumbnail Navigation Rail */}
      {total > 1 && (
        <div className="w-full flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none select-none">
          {media.map((item, idx) => {
            const isActive = idx === safeIndex;
            const isThumbBroken = thumbErrorMap[idx];

            return (
              <button
                key={`${item.src}-${idx}`}
                ref={(el) => (thumbnailRefs.current[idx] = el)}
                type="button"
                onClick={() => {
                  playClick();
                  onIndexChange(idx);
                }}
                aria-label={`Foto ${idx + 1} dari ${total}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-sm border overflow-hidden transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent bg-navy-deep",
                  isActive
                    ? "border-2 border-blue-accent opacity-100 ring-2 ring-blue-accent/30 scale-105 z-10"
                    : "border-divider/60 opacity-50 hover:opacity-90 hover:border-ivory/50"
                )}
              >
                {isThumbBroken ? (
                  <div className="w-full h-full flex items-center justify-center text-muted bg-navy-base">
                    <ImageOff size={16} />
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                    draggable={false}
                    onError={() => handleThumbError(idx)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
