import React, { useState, useEffect } from 'react';
import { Video, RotateCcw, AlertTriangle } from 'lucide-react';
import PercentLoader from './PercentLoader';
import { cn } from '../../lib/utils';

/**
 * AsyncEmbed — Async Embed & Video Loading Component for Porto ZEZE
 * 
 * Used for YouTube embeds, TikTok embeds, external document frames, etc.
 * Enforces:
 *   variant: "percent"
 *   label: "Percent"
 */
export default function AsyncEmbed({
  src,
  title = "Media Embed",
  aspectRatio = "16 / 9",
  className = "",
  subtext = "Preparing media player...",
  allowFullscreen = true,
  onLoaded = null,
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [progress, setProgress] = useState(20);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setStatus('loading');
    setProgress(25);

    const timer1 = setTimeout(() => setProgress(55), 250);
    const timer2 = setTimeout(() => setProgress(85), 600);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatus('loaded');
      if (onLoaded) onLoaded();
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [src, reloadKey, onLoaded]);

  const handleRetry = () => {
    setStatus('loading');
    setProgress(15);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div
      className={cn(
        "relative w-full bg-navy-deep border border-divider/60 rounded-sm overflow-hidden select-none",
        className
      )}
      style={{ aspectRatio }}
    >
      {/* 1. Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-20 bg-navy-deep flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent mb-3">
            <Video size={18} className="animate-pulse" />
          </div>
          <PercentLoader
            variant="percent"
            label="Percent"
            value={progress}
            subtext={subtext}
            size="md"
            showBar={true}
            className="w-full max-w-xs"
          />
        </div>
      )}

      {/* 2. Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 bg-navy-deep flex flex-col items-center justify-center p-6 text-center font-mono space-y-3 border border-onair-red/30">
          <AlertTriangle className="w-8 h-8 text-onair-red" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ivory">
              Konten Embed Tidak Dapat Dimuat
            </p>
            <p className="text-[11px] text-muted font-sans max-w-sm">
              Koneksi ke server penyedia media terputus atau URL tidak valid.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-1.5 bg-blue-accent/15 border border-blue-accent/40 rounded-sm text-xs font-mono uppercase tracking-wider text-blue-accent hover:bg-blue-accent hover:text-navy-deep transition-all duration-300 flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>COBA LAGI</span>
          </button>
        </div>
      )}

      {/* 3. IFrame Render */}
      {src && (
        <iframe
          key={reloadKey}
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={allowFullscreen}
          onLoad={() => {
            setProgress(100);
            setStatus('loaded');
            if (onLoaded) onLoaded();
          }}
          onError={() => setStatus('error')}
          className={cn(
            "w-full h-full border-0 transition-opacity duration-500",
            status === 'loaded' ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
