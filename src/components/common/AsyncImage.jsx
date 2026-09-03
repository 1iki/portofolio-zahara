import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, RotateCcw } from 'lucide-react';
import PercentLoader from './PercentLoader';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

/**
 * AsyncImage — Async Image Loading Component for Porto ZEZE
 * 
 * Features:
 * - Deterministic image lifecycle: idle -> loading -> loaded / error
 * - Independent image loading (does NOT wait for iframe, video embed, or third-party scripts)
 * - Browser cache check (img.complete & naturalWidth > 0) to prevent 90% stuck state on cached images
 * - Uses PercentLoader (variant: "percent", label: "Percent") for smooth loading feedback
 * - Graceful fallback & error handling with retry capability
 * - Maintains aspect ratio to eliminate layout shifts
 */
export default function AsyncImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  aspectRatio = null,
  showPercentLoader = true,
  fallbackSrc = null,
  loadingText = "Memuat gambar...",
  onClick = null,
  draggable = false,
  loading = "eager",
  onError = null,
  onLoad = null,
  ...props
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [progress, setProgress] = useState(20);
  const imgRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const activeSrc = src || fallbackSrc;
    if (!activeSrc) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    setProgress(25);

    let isMounted = true;

    // Perceived progress ticks up to 90% max while network request completes
    const interval = setInterval(() => {
      if (!isMounted) return;
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 120);

    // Immediate check if image is ALREADY cached in browser memory
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        clearInterval(interval);
        setProgress(100);
        setStatus('loaded');
        if (onLoad) onLoad();
      } else if (imgRef.current.naturalWidth === 0 && imgRef.current.src) {
        // Image failed loading
        clearInterval(interval);
        setStatus('error');
      }
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [src, fallbackSrc, onLoad]);

  const handleImageLoad = (e) => {
    setProgress(100);
    setStatus('loaded');
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    if (onError) {
      onError(e);
    }
    if (fallbackSrc && src && src !== fallbackSrc) {
      setStatus('loading');
      setProgress(50);
    } else {
      setStatus('error');
    }
  };

  const handleRetry = (e) => {
    if (e) e.stopPropagation();
    setStatus('loading');
    setProgress(25);
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = '';
      imgRef.current.src = currentSrc;
    }
  };

  // If missing src and no fallback
  if (!src && !fallbackSrc) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-navy-deep border border-divider/40 flex flex-col items-center justify-center p-4 text-center font-mono text-xs text-muted",
          containerClassName
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
        <span>[ TANPA GAMBAR ]</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-navy-deep border border-divider/40 select-none group/async-img",
        containerClassName
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
      onClick={onClick}
    >
      {/* 1. Percent Loader Overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 bg-navy-deep flex flex-col items-center justify-center p-2 text-center pointer-events-none">
          {showPercentLoader ? (
            <PercentLoader
              variant="percent"
              label="Percent"
              value={progress}
              subtext={loadingText}
              size="inline"
              showBar={true}
              className="w-full max-w-[160px]"
            />
          ) : (
            <div className="w-5 h-5 border-2 border-blue-accent/30 border-t-blue-accent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* 2. Error Fallback Overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 z-10 bg-navy-deep/90 flex flex-col items-center justify-center p-3 text-center font-mono space-y-1.5 border border-onair-red/20">
          <ImageIcon className="w-5 h-5 text-muted/60" />
          <span className="text-[10px] uppercase text-muted tracking-wider">Gambar Tidak Tersedia</span>
          <button
            type="button"
            onClick={handleRetry}
            className="px-2 py-0.5 bg-navy-base border border-divider rounded-sm text-[9px] text-ivory/80 hover:text-blue-accent hover:border-blue-accent transition-colors uppercase flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw size={10} />
            <span>COBA LAGI</span>
          </button>
        </div>
      )}

      {/* 3. Real Image Element */}
      <motion.img
        ref={imgRef}
        src={src || fallbackSrc}
        alt={alt || 'Portfolio Media'}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={draggable}
        initial={false}
        animate={{
          opacity: status === 'loaded' ? 1 : 0,
          scale: status === 'loaded' ? 1 : 0.985,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
        className={cn(
          "w-full h-full object-cover pointer-events-none select-none",
          className
        )}
        {...props}
      />
    </div>
  );
}
