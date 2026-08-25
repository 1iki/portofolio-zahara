import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { usePointerType } from '../hooks/usePointerType';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../context/SoundContext';
import ScrubDeck from './ScrubDeck';

export default function WorkCard({ work }) {
  const cardRef = useRef(null);
  const { playPulse } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isCoarse = usePointerType();

  const isActive = isHovered || isFocused;

  const handleMouseMove = (e) => {
    if (isCoarse || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = cardRef.current.offsetWidth;
    setScrubProgress(Math.min(Math.max((x / width) * 100, 0), 100));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!prefersReducedMotion) playPulse();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScrubProgress(0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!prefersReducedMotion) playPulse();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isHovered) {
      setScrubProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (!isActive) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setScrubProgress((p) => Math.min(p + 5, 100));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setScrubProgress((p) => Math.max(p - 5, 0));
    }
  };

  const handleScrub = (progress) => {
    // In a real app with video, you'd throttle this and update a hidden <video> currentTime.
    // For this prototype, we visually update the slider in ScrubDeck.
  };

  return (
    <motion.a
      href={work.link || '#'}
      target={work.link ? "_blank" : undefined}
      rel={work.link ? "noopener noreferrer" : undefined}
      ref={cardRef}
      layout
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col group bg-navy-deep border border-divider rounded-sm overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-cursor="play"
      aria-label={`${work.title} - ${work.role}`}
      onClick={(e) => {
        if (!work.link) e.preventDefault();
      }}
    >
      {/* Thumbnail Area */}
      <div className="aspect-video relative bg-ink overflow-hidden border-b border-divider">
        {/* Placeholder for thumbnail */}
        <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 243, 236, 0.1) 10px, rgba(245, 243, 236, 0.1) 20px)' }}></div>
        <div className="absolute inset-0 flex items-center justify-center text-muted font-mono text-xs opacity-50">
           {work.title}
        </div>
        
        {/* ON AIR Indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isActive ? 'bg-onair-red animate-pulse shadow-[0_0_8px_rgba(232,68,44,0.6)]' : 'bg-muted/50'}`}></div>
          <span className={`text-[9px] font-mono tracking-widest transition-colors duration-300 ${isActive ? 'text-onair-red' : 'text-muted/50'}`}>ON AIR</span>
        </div>

        <ScrubDeck isActive={isActive} progress={scrubProgress} onScrub={handleScrub} />
      </div>

      {/* Metadata Area */}
      <div className="p-4 flex flex-col gap-2 relative z-10 bg-navy-deep">
        <h3 className="font-semibold text-ivory text-sm md:text-base leading-tight group-hover:text-blue-accent transition-colors">
          {work.title}
        </h3>
        
        <div className="flex flex-col gap-1 mt-1 font-mono text-[10px] text-muted tracking-wide uppercase">
          <div className="flex justify-between border-b border-divider/50 pb-1">
            <span>ROLE</span>
            <span className="text-ivory text-right">{work.role}</span>
          </div>
          <div className="flex justify-between border-b border-divider/50 py-1">
            <span>PLATFORM</span>
            <span className="text-ivory">{work.platform}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>DATE</span>
            <span className="text-ivory">{work.date}</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
