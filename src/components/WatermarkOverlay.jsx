import React from 'react';
import { WATERMARK_CONFIG } from '../lib/watermarkConfig';

/**
 * Reusable Tiled Watermark Overlay Component
 *
 * Provides layered deterrence against unauthorized screenshot exploitation:
 * 1. Tiled diagonal pattern covering 100% of the script canvas area.
 * 2. Un-croppable layout — screenshotting any section still captures attribution.
 * 3. Non-interactive layer (`pointer-events: none`) ensuring viewer controls remain clickable.
 */
export function TiledScriptWatermark({ 
  customText, 
  opacity = WATERMARK_CONFIG.scriptOverlay.opacity,
  className = "" 
}) {
  const text = customText || WATERMARK_CONFIG.text;
  
  // Construct an inline SVG pattern data-URI for zero-dependency repeating tiled diagonal watermark
  const svgPattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="340" height="150" viewBox="0 0 340 150">
      <style>
        .wm-text {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          font-weight: 700;
          fill: rgba(0, 0, 0, 0.40);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
      </style>
      <g transform="rotate(-28 170 75)">
        <text x="10" y="55" class="wm-text">${text}</text>
        <text x="60" y="130" class="wm-text">${text}</text>
      </g>
    </svg>
  `.trim();

  const encodedSvg = encodeURIComponent(svgPattern);
  const dataUri = `url("data:image/svg+xml,${encodedSvg}")`;

  return (
    <div 
      className={`absolute inset-0 z-10 pointer-events-none select-none overflow-hidden ${className}`}
      style={{
        backgroundImage: dataUri,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
        opacity: opacity,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Subtle Corner Watermark for BTS Documentation Photos
 */
export function CornerPhotoWatermark({ className = "" }) {
  return (
    <div 
      className={`absolute bottom-3 right-3 z-10 pointer-events-none select-none px-2.5 py-1 rounded bg-navy-base/80 backdrop-blur-sm border border-divider/50 text-[10px] font-mono tracking-wider text-ivory/70 shadow-sm ${className}`}
      aria-hidden="true"
    >
      {WATERMARK_CONFIG.photoWatermark.text}
    </div>
  );
}
