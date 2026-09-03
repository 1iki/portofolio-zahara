import React from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

/**
 * Standard Reusable Percent Loader Component — Porto ZEZE
 * 
 * Enforces Global Loading Standard:
 *   variant: "percent"
 *   label: "Percent"
 * 
 * Features:
 * - Tabular monospace numbers to prevent layout shifting
 * - Smooth 0% -> 100% progress animation with bar indicator
 * - States: loading, success, error (with retry CTA)
 * - Accessible: role="progressbar", aria-valuenow, aria-busy
 * - Responsive & supports prefers-reduced-motion
 */
export default function PercentLoader({
  variant = "percent",
  label = "Percent",
  value = 0,
  subtext = "",
  size = "md",
  showBar = true,
  error = null,
  onRetry = null,
  className = "",
  children = null,
}) {
  const prefersReducedMotion = useReducedMotion();
  const clampedValue = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

  // Size preset mappings
  const sizePresets = {
    inline: {
      container: "py-2 px-3",
      text: "text-[10px]",
      labelSize: "text-[8px]",
      barHeight: "h-[1.5px]",
      gap: "gap-1.5",
    },
    sm: {
      container: "p-3 max-w-xs",
      text: "text-xs",
      labelSize: "text-[9px]",
      barHeight: "h-[2px]",
      gap: "gap-2",
    },
    md: {
      container: "p-5 max-w-md",
      text: "text-sm",
      labelSize: "text-[10px]",
      barHeight: "h-[2.5px]",
      gap: "gap-3",
    },
    lg: {
      container: "p-8 max-w-lg",
      text: "text-base md:text-lg",
      labelSize: "text-xs",
      barHeight: "h-[3px]",
      gap: "gap-4",
    },
    xl: {
      container: "p-10 max-w-2xl",
      text: "text-xl md:text-2xl",
      labelSize: "text-xs md:text-sm",
      barHeight: "h-[4px]",
      gap: "gap-5",
    },
    fullscreen: {
      container: "fixed inset-0 z-50 bg-navy-base/95 backdrop-blur-md flex flex-col items-center justify-center p-6",
      text: "text-2xl md:text-3xl",
      labelSize: "text-xs md:text-sm",
      barHeight: "h-[3px] max-w-md",
      gap: "gap-6",
    },
  };

  const preset = sizePresets[size] || sizePresets.md;

  // Handle Error State
  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          "w-full flex flex-col items-center justify-center p-6 bg-navy-deep/90 border border-onair-red/30 rounded-sm text-center font-mono space-y-3 shadow-lg",
          size === 'fullscreen' && "fixed inset-0 z-50 bg-navy-base flex flex-col items-center justify-center p-6",
          className
        )}
      >
        <div className="w-10 h-10 rounded-full bg-onair-red/10 border border-onair-red/40 flex items-center justify-center text-onair-red shrink-0">
          <AlertCircle size={20} />
        </div>

        <div className="space-y-1 max-w-md">
          <p className="text-xs uppercase tracking-widest text-ivory font-semibold">
            Gagal Memuat Konten
          </p>
          <p className="text-[11px] font-sans text-muted leading-relaxed">
            {typeof error === 'string'
              ? error
              : (error?.message || 'Terjadi kesalahan saat menyiapkan konten.')}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-accent/15 border border-blue-accent/40 rounded-sm text-xs font-mono uppercase tracking-wider text-blue-accent hover:bg-blue-accent hover:text-navy-deep transition-all duration-300 shadow-[0_0_12px_rgba(74,127,232,0.2)] font-semibold cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>COBA LAGI</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-busy={clampedValue < 100}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      aria-label={`${subtext ? `${subtext} - ` : ''}${clampedValue}% ${label}`}
      className={cn(
        "w-full flex flex-col justify-center font-mono text-ivory select-none",
        preset.container,
        preset.gap,
        className
      )}
    >
      {/* Percentage & Label Header */}
      <div className="flex items-baseline justify-between w-full gap-4 min-w-0">
        {subtext ? (
          <span className="text-[11px] font-mono tracking-wider text-muted uppercase truncate">
            {subtext}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-baseline gap-1.5 shrink-0 ml-auto font-mono tracking-wider">
          <span
            className={cn(
              "font-bold text-ivory tabular-nums tracking-tight",
              preset.text
            )}
          >
            {clampedValue}%
          </span>
          <span
            className={cn(
              "font-semibold text-blue-accent uppercase tracking-widest opacity-80",
              preset.labelSize
            )}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Progress Line Bar */}
      {showBar && (
        <div className="w-full bg-divider/60 rounded-full overflow-hidden relative border border-white/5">
          <div
            className={cn(
              "bg-gradient-to-r from-blue-accent/50 via-blue-accent to-ivory rounded-full shadow-[0_0_10px_rgba(74,127,232,0.5)]",
              preset.barHeight,
              prefersReducedMotion ? "transition-none" : "transition-all duration-300 ease-out"
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      )}

      {children}
    </div>
  );
}

// Named alias exports for component consumer convenience
export { PercentLoader as PercentLoading, PercentLoader as Loading };
