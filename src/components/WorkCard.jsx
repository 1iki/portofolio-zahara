import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Info } from 'lucide-react';
import { usePointerType } from '../hooks/usePointerType';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../context/SoundContext';
import { resolveThumbnail, getYouTubeThumbnailFrames, getYouTubeThumbnailFallback, hasPlayableMedia } from '../lib/utils';
import ScrubDeck from './ScrubDeck';

export default function WorkCard({ work, onSelectVideo, onSelectInfo }) {
  const cardRef = useRef(null);
  const { playPulse, playClick } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [thumbnailSrc, setThumbnailSrc] = useState(() => resolveThumbnail(work));
  const [imageErrorCount, setImageErrorCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isCoarse = usePointerType();

  // Throttle ref for frame updates (~150ms)
  const lastFrameUpdate = useRef(0);

  const isActive = isHovered || isFocused;
  const isPlayable = hasPlayableMedia(work);
  const isYouTube = work.mediaType === 'youtube' || (!work.mediaType && work.videoUrl?.includes('youtube.com'));
  const isDrive = work.mediaType === 'drive';
  const isTikTok = work.mediaType === 'tiktok';

  // Scrub frames only apply for YouTube
  const frames = isYouTube ? getYouTubeThumbnailFrames(work.videoUrl || work.link) : [];
  const hasThumbnail = !!thumbnailSrc && imageErrorCount < 2;

  // Current image source: use scrub frame if available, otherwise resolved thumbnail
  const currentImageSrc = (frames.length > 0 && isYouTube && scrubProgress > 0)
    ? (frames[currentFrame] || thumbnailSrc)
    : thumbnailSrc;

  // Image error fallback handling to prevent infinite loops or broken icons
  const handleImageError = () => {
    if (imageErrorCount === 0 && isYouTube) {
      setImageErrorCount(1);
      const fallback = getYouTubeThumbnailFallback(work.videoUrl || work.link);
      if (fallback && fallback !== thumbnailSrc) {
        setThumbnailSrc(fallback);
        return;
      }
    }
    setImageErrorCount(2); // Stop retrying, render fallback UI
  };

  const handleMouseMove = (e) => {
    if (isCoarse || !cardRef.current || !isYouTube) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = cardRef.current.offsetWidth;
    const progress = Math.min(Math.max((x / width) * 100, 0), 100);
    setScrubProgress(progress);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!prefersReducedMotion) playPulse();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScrubProgress(0);
    setCurrentFrame(0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!prefersReducedMotion) playPulse();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isHovered) {
      setScrubProgress(0);
      setCurrentFrame(0);
    }
  };

  const handleKeyDown = (e) => {
    if (!isActive) return;
    if (isYouTube && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newProgress = Math.min(scrubProgress + 5, 100);
        setScrubProgress(newProgress);
        handleScrub(newProgress);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newProgress = Math.max(scrubProgress - 5, 0);
        setScrubProgress(newProgress);
        handleScrub(newProgress);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isPlayable && onSelectVideo) {
        playClick();
        onSelectVideo(work);
      } else if (onSelectInfo) {
        playClick();
        onSelectInfo(work);
      }
    }
  };

  const handleScrub = useCallback((progress) => {
    if (frames.length === 0) return;

    const now = Date.now();
    if (now - lastFrameUpdate.current < 150) return;
    lastFrameUpdate.current = now;

    const frameIndex = Math.min(Math.floor(progress / 25), frames.length - 1);
    setCurrentFrame(frameIndex);
  }, [frames]);

  const handleCardClick = () => {
    playClick();
    if (isPlayable && onSelectVideo) {
      onSelectVideo(work);
    } else if (onSelectInfo) {
      onSelectInfo(work);
    }
  };

  const handleWatchClick = (e) => {
    e.stopPropagation();
    playClick();
    if (onSelectVideo) {
      onSelectVideo(work);
    }
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    playClick();
    if (onSelectInfo) {
      onSelectInfo(work);
    }
  };

  // Status badge label
  const statusLabel = isYouTube
    ? "ON AIR"
    : isTikTok
      ? "TIKTOK"
      : isDrive
        ? "DRIVE"
        : work.mediaType === 'instagram'
          ? "INSTAGRAM"
          : work.mediaType === 'image'
            ? "NO PREVIEW"
            : work.mediaType ? work.mediaType.toUpperCase() : "INFO";

  return (
    <motion.div
      ref={cardRef}
      role="region"
      tabIndex={0}
      layout
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col group bg-navy-deep border border-divider rounded-sm overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-cursor={isPlayable ? "play" : "pointer"}
      aria-label={`${work.title} - ${work.role}`}
      onClick={handleCardClick}
    >
      {/* Thumbnail Area */}
      <div className="aspect-video relative bg-ink overflow-hidden border-b border-divider">
        {hasThumbnail ? (
          <>
            <img
              src={currentImageSrc}
              alt={work.title}
              className={`absolute inset-0 w-full h-full ${work.aspectRatio === 'portrait' ? 'object-contain bg-navy-base p-2' : 'object-cover'} opacity-85 group-hover:opacity-100 transition-opacity duration-500`}
              onError={handleImageError}
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent pointer-events-none"></div>
          </>
        ) : (
          <>
            {/* Fallback pattern when image is missing or failed */}
            <div className="absolute inset-0 opacity-15" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 243, 236, 0.1) 10px, rgba(245, 243, 236, 0.1) 20px)' }}></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted font-mono text-xs opacity-60 px-4 text-center gap-1">
              <span className="text-[10px] tracking-widest uppercase">[{statusLabel}]</span>
              <span className="font-semibold text-ivory text-sm truncate max-w-full">{work.title}</span>
            </div>
          </>
        )}

        {/* Status Indicator Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isActive && isYouTube ? 'bg-onair-red animate-pulse shadow-[0_0_8px_rgba(232,68,44,0.6)]' : 'bg-blue-accent/70'}`}></div>
          <span className={`text-[9px] font-mono tracking-widest transition-colors duration-300 ${isActive && isYouTube ? 'text-onair-red' : 'text-ivory/70'}`}>{statusLabel}</span>
        </div>

        <ScrubDeck
          isActive={isActive && isYouTube}
          progress={scrubProgress}
          onScrub={handleScrub}
          hasPreview={frames.length > 0 && isYouTube}
        />
      </div>

      {/* Metadata Area */}
      <div className="p-4 flex flex-col gap-2 relative z-10 bg-navy-deep flex-1 justify-between">
        <div className="flex flex-col gap-2">
          {/* Title + Output Badge row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-ivory text-sm md:text-base leading-tight group-hover:text-blue-accent transition-colors flex-1 min-w-0">
              {work.title}
            </h3>
            {work.output && (
              <span className="shrink-0 px-2 py-0.5 bg-blue-accent/10 border border-blue-accent/30 rounded-sm text-[9px] font-mono tracking-wider text-blue-accent uppercase whitespace-nowrap">
                {work.output}
              </span>
            )}
          </div>

          {/* Organization */}
          {work.organization && (
            <span className="font-mono text-[9px] text-muted/70 tracking-wide uppercase truncate block -mt-1">
              {work.organization}
            </span>
          )}

          {/* Description (truncated) */}
          {work.description && (
            <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
              {work.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex flex-col gap-1 font-mono text-[10px] text-muted tracking-wide uppercase">
            <div className="flex justify-between border-b border-divider/50 pb-1">
              <span>ROLE</span>
              <span className="text-ivory text-right">{work.role}</span>
            </div>
            {work.platform && (
              <div className="flex justify-between border-b border-divider/50 py-1">
                <span>PLATFORM</span>
                <span className="text-ivory">{work.platform}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span>DATE</span>
              <span className="text-ivory">{work.date}</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-divider/40 flex flex-wrap items-center justify-between gap-2">
            {isPlayable ? (
              <>
                <button
                  type="button"
                  onClick={handleWatchClick}
                  className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-onair-red/10 border border-onair-red/40 rounded-sm text-[10px] font-mono tracking-wider text-onair-red hover:bg-onair-red hover:text-ivory transition-all duration-300 uppercase font-semibold"
                  aria-label={`Tonton video ${work.title}`}
                >
                  <Play size={10} fill="currentColor" />
                  <span>WATCH</span>
                </button>

                <button
                  type="button"
                  onClick={handleInfoClick}
                  className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-navy-base border border-divider rounded-sm text-[10px] font-mono tracking-wider text-ivory/90 hover:border-blue-accent hover:text-blue-accent transition-all duration-300 uppercase font-semibold"
                  aria-label={`Lihat detail ${work.title}`}
                >
                  <Info size={10} />
                  <span>DETAILS</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleInfoClick}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-accent/10 border border-blue-accent/40 rounded-sm text-[10px] font-mono tracking-wider text-blue-accent hover:bg-blue-accent hover:text-navy-deep transition-all duration-300 uppercase font-semibold"
                aria-label={`Lihat detail ${work.title}`}
              >
                <Info size={10} />
                <span>DETAILS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
