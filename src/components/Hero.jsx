import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSound } from '../context/SoundContext';
import { ChevronDown, RefreshCw, Radio, Tv, Mic2, PenTool } from 'lucide-react';

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { playClick } = useSound();
  
  const taglines = [
    { text: "Produser", icon: Tv },
    { text: "Penulis Naskah", icon: PenTool },
    { text: "Social Media Specialist", icon: Radio }
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Auto-rotate taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  const handleKnobClick = () => {
    playClick();
    setTaglineIndex((prev) => (prev + 1) % taglines.length);
  };

  const handleScrollToKarya = () => {
    playClick();
    document.getElementById('karya')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const CurrentIcon = taglines[taglineIndex].icon;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-base">
      
      {/* ===== BACKGROUND LAYERS ===== */}
      
      {/* Radial gradient glow behind content */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(74,127,232,0.15) 0%, rgba(11,29,58,0) 70%)',
          }}
        ></div>
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(245, 243, 236, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 243, 236, 1) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      ></div>

      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(74,127,232,0.4) 0%, transparent 70%)' }}
        animate={prefersReducedMotion ? {} : { 
          x: [0, 30, -20, 0], 
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(232,68,44,0.3) 0%, transparent 70%)' }}
        animate={prefersReducedMotion ? {} : { 
          x: [0, -20, 30, 0], 
          y: [0, 30, -20, 0],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl w-full mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-28 pb-24 lg:pt-32 lg:pb-32">
        
        {/* ===== LEFT SIDE: Console Panel ===== */}
        <motion.div 
          className="lg:col-span-7 flex flex-col gap-8"
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate="visible"
        >
          {/* Power-On Status Bar */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            {/* Indicator Lights */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${
                    i === 1 ? 'bg-onair-red shadow-[0_0_8px_rgba(232,68,44,0.8)]' : 
                    i <= 3 ? 'bg-blue-accent shadow-[0_0_6px_rgba(74,127,232,0.5)]' : 
                    'bg-muted/40'
                  }`}
                ></div>
              ))}
            </div>
            <div className="h-[1px] flex-1 bg-divider"></div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-muted uppercase">SYS ONLINE</span>
          </motion.div>

          {/* Broadcast Portfolio Label */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-navy-deep border border-divider rounded-sm">
              <Radio size={14} className="text-blue-accent" />
              <span className="font-mono text-xs tracking-[0.2em] text-blue-accent uppercase">Broadcast Portfolio</span>
              <div className="w-1.5 h-1.5 rounded-full bg-onair-red animate-pulse"></div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div variants={itemVariants} className="flex flex-col gap-1">
            <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight text-flicker">
              <span className="block">Zahara</span>
              <span className="block">Elhusna</span>
              <span className="block italic text-muted/70">Barok<span className="text-blue-accent">.</span></span>
            </h1>
          </motion.div>

          {/* Interactive Tagline Knob */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-4 bg-navy-deep/80 backdrop-blur-sm p-4 rounded-sm border border-divider w-fit group">
              <button 
                onClick={handleKnobClick}
                className="w-12 h-12 rounded-full bg-navy-base border-2 border-divider flex items-center justify-center hover:border-blue-accent transition-all duration-300 group/knob cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep relative overflow-hidden"
                aria-label="Ganti Role"
              >
                <div className="absolute inset-0 bg-blue-accent/5 opacity-0 group-hover/knob:opacity-100 transition-opacity"></div>
                <motion.div
                  animate={{ rotate: taglineIndex * 120 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <RefreshCw size={16} className="text-muted group-hover/knob:text-blue-accent transition-colors duration-300" />
                </motion.div>
              </button>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-2">
                  CH-0{taglineIndex + 1} ROLE
                  <span className="w-1 h-1 rounded-full bg-blue-accent hero-glow"></span>
                </span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={taglineIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="font-semibold text-ivory text-lg flex items-center gap-2"
                  >
                    <CurrentIcon size={16} className="text-blue-accent" />
                    {taglines[taglineIndex].text}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* CTA + Contact Pills */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start gap-4 mt-2">
            <button 
              onClick={handleScrollToKarya}
              className="relative console-btn text-sm px-8 py-4 border-blue-accent bg-blue-accent/15 text-blue-accent hover:bg-blue-accent hover:text-navy-deep transition-all duration-300 group/cta overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 border-trace opacity-0 group-hover/cta:opacity-30 h-[1px] top-auto bottom-0"></div>
              <span className="w-2 h-2 rounded-full bg-onair-red animate-pulse"></span>
              MULAI SIARAN
              <ChevronDown size={14} className="opacity-50" />
            </button>

            <div className="flex items-center gap-3">
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-full border border-divider text-xs font-mono tracking-wide text-muted hover:text-ivory hover:border-ivory/30 transition-colors">
                WA
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-full border border-divider text-xs font-mono tracking-wide text-muted hover:text-ivory hover:border-ivory/30 transition-colors">
                IG
              </a>
              <a href="mailto:zahara@example.com" className="px-4 py-2.5 rounded-full border border-divider text-xs font-mono tracking-wide text-muted hover:text-ivory hover:border-ivory/30 transition-colors">
                EMAIL
              </a>
            </div>
          </motion.div>

          {/* Quick Stats Strip */}
          <motion.div variants={itemVariants} className="flex items-center gap-6 mt-4 pt-6 border-t border-divider">
            {[
              { num: "13+", label: "Projects" },
              { num: "3.74", label: "IPK" },
              { num: "2K+", label: "Views" }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="font-display text-2xl text-ivory">{stat.num}</span>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ===== RIGHT SIDE: Profile Monitor ===== */}
        <motion.div 
          className="lg:col-span-5 relative"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glow behind monitor */}
          <div className="absolute -inset-8 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(74,127,232,0.3) 0%, transparent 70%)' }}
          ></div>

          <div className="aspect-[3/4] relative bg-navy-deep rounded-sm border border-divider/50 p-2 shadow-2xl overflow-hidden group">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ boxShadow: '0 0 30px rgba(74,127,232,0.15), inset 0 0 30px rgba(74,127,232,0.05)' }}
            ></div>
            
            {/* Monitor corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-accent/30 rounded-tl-sm"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-accent/30 rounded-tr-sm"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-accent/30 rounded-bl-sm"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-accent/30 rounded-br-sm"></div>
            
            <div className="w-full h-full relative bg-ink rounded-sm overflow-hidden flex items-center justify-center border border-divider/30">
               {/* Diagonal pattern fallback */}
               <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 243, 236, 0.05) 10px, rgba(245, 243, 236, 0.05) 20px)' }}></div>
               
               <img 
                 src="/profile-zahara.png" 
                 alt="Zahara Elhusna Barok" 
                 className="object-cover w-full h-full object-top opacity-90 group-hover:opacity-100 transition-all duration-700"
                 onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                 }}
               />
               {/* Displayed if image fails to load */}
               <div className="hidden absolute inset-0 flex-col items-center justify-center text-muted gap-2">
                 <Tv size={32} className="opacity-30" />
                 <span className="font-mono text-xs tracking-widest">[NO SIGNAL]</span>
                 <span className="text-[10px] font-mono">Insert profile photo</span>
               </div>

               {/* Cinematic gradient overlay on image */}
               <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-navy-deep/30 pointer-events-none"></div>
               
               {/* REC indicator */}
               <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                  <div className="w-2 h-2 rounded-full bg-onair-red animate-pulse shadow-[0_0_6px_rgba(232,68,44,0.8)]"></div>
                  <span className="text-[10px] font-mono text-onair-red font-medium tracking-widest">REC</span>
               </div>

               {/* Timecode overlay */}
               <div className="absolute top-4 left-4 z-10">
                 <span className="text-[10px] font-mono text-ivory/60 tracking-wider">00:00:01:12</span>
               </div>

               {/* Bottom info bar overlay */}
               <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-navy-deep/90 to-transparent">
                 <div className="flex items-center justify-between">
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Output</span>
                     <span className="text-xs font-semibold text-ivory">MONITOR 01</span>
                   </div>
                   <div className="flex items-center gap-1">
                     {/* Signal strength bars */}
                     {[1, 2, 3, 4].map((i) => (
                       <motion.div 
                         key={i} 
                         className="w-1 bg-blue-accent rounded-full origin-bottom"
                         style={{ height: `${i * 4 + 4}px` }}
                         animate={prefersReducedMotion ? {} : { 
                           scaleY: [1, 0.5, 1],
                         }}
                         transition={{ 
                           duration: 1.5, 
                           delay: i * 0.15, 
                           repeat: Infinity,
                           ease: "easeInOut"
                         }}
                       />
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div 
            className="absolute -bottom-4 -left-4 lg:-left-8 bg-navy-deep border border-divider rounded-sm px-4 py-3 shadow-xl z-20"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-accent/20 flex items-center justify-center">
                <Mic2 size={14} className="text-blue-accent" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Status</span>
                <span className="text-sm font-semibold text-ivory">Open to Work</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
      
      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>

    </section>
  );
}
