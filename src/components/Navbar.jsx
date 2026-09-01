import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isMuted, setIsMuted, playClick } = useSound();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'tentang', 'pengalaman', 'karya', 'naskah', 'dokumentasi', 'kontak'];
      let current = 'home';
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= el.offsetTop - 200) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (section) => {
    playClick();
    setMobileOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'pengalaman', label: 'Pengalaman' },
    { id: 'karya', label: 'Karya' },
    { id: 'naskah', label: 'Naskah' },
    { id: 'dokumentasi', label: 'Dokumentasi' },
    { id: 'kontak', label: 'Kontak' }
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b border-transparent",
        scrolled ? "bg-navy-base/95 backdrop-blur-xl border-divider py-3 shadow-lg shadow-navy-deep/50" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-onair-red shadow-[0_0_6px_rgba(232,68,44,0.6)] animate-pulse"></div>
          <span className="font-display font-semibold text-lg tracking-wide hidden sm:block group-hover:text-blue-accent transition-colors">ZAHARA</span>
          <span className="font-display font-semibold text-lg tracking-wide sm:hidden">Z</span>
        </button>

        {/* Nav Console (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "console-btn py-1.5 px-3 text-xs cursor-pointer relative",
                activeSection === item.id ? "console-btn-active" : "text-muted"
              )}
            >
              {activeSection === item.id && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-blue-accent rounded-full shadow-[0_0_6px_rgba(74,127,232,0.8)]"></span>
              )}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playClick(); setIsMuted(!isMuted); }}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-divider hover:border-blue-accent/50 text-muted hover:text-ivory transition-colors cursor-pointer"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-divider bg-navy-deep">
            <div className="w-2 h-2 rounded-full bg-divider"></div>
            <span className="text-[10px] font-mono tracking-widest text-muted">IDLE</span>
          </div>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => { playClick(); setMobileOpen(!mobileOpen); }}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full border border-divider hover:border-blue-accent/50 text-muted hover:text-ivory transition-colors cursor-pointer"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-divider bg-navy-base/98 backdrop-blur-xl animate-slide-down">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "console-btn py-3 px-4 text-sm w-full justify-start cursor-pointer",
                  activeSection === item.id ? "console-btn-active" : "text-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
