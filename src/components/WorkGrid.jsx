import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Filter } from 'lucide-react';
import { works } from '../data/works';
import { roleFilters, matchesRoleFilter } from '../data/roleFilters';
import WorkCard from './WorkCard';
import WorkSection from './WorkSection';
import WorkHighlight from './WorkHighlight';
import VideoModal from './VideoModal';
import ProjectInfoModal from './ProjectInfoModal';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export default function WorkGrid() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const { playClick } = useSound();

  // Close mobile filter popover on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find active filter object from configuration
  const currentFilterObj = useMemo(() => {
    return roleFilters.find((f) => f.label === activeFilter) || roleFilters[0];
  }, [activeFilter]);

  // ── Step 1: Filter by role using taxonomy configuration ──────────
  const filteredWorks = useMemo(() => {
    return works.filter((work) => matchesRoleFilter(work, currentFilterObj));
  }, [currentFilterObj]);

  // ── Step 2: Group by category, calculate latest date, sort ─────
  const groupedCategories = useMemo(() => {
    const grouped = filteredWorks.reduce((acc, work) => {
      const category = work.category;

      // Defensive: skip works with missing/unknown category
      if (!category) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Work "${work.title}" has no category`);
        }
        return acc;
      }

      if (!acc[category]) {
        acc[category] = {
          category,
          works: [],
          latestDate: null,
        };
      }

      acc[category].works.push(work);

      // Calculate latest endDate for this category
      if (work.endDate) {
        const workDate = new Date(work.endDate);
        if (!isNaN(workDate.getTime())) {
          if (!acc[category].latestDate || workDate > acc[category].latestDate) {
            acc[category].latestDate = workDate;
          }
        }
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn(`Work "${work.title}" has no endDate`);
      }

      return acc;
    }, {});

    // Convert to array and sort by latest date (newest category first)
    return Object.values(grouped).sort((a, b) => {
      const dateA = a.latestDate ? a.latestDate.getTime() : 0;
      const dateB = b.latestDate ? b.latestDate.getTime() : 0;
      return dateB - dateA;
    });
  }, [filteredWorks]);

  // ── Step 3: Determine latest work for highlight ────────────────
  const latestWork = useMemo(() => {
    return [...filteredWorks]
      .filter((work) => work.endDate)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0] || null;
  }, [filteredWorks]);

  const handleFilterClick = (filter) => {
    playClick();
    setActiveFilter(filter);
  };

  const handleOpenVideo = (videoWork) => {
    setSelectedInfo(null);
    setSelectedVideo(videoWork);
  };

  const handleOpenInfo = (infoWork) => {
    setSelectedVideo(null);
    setSelectedInfo(infoWork);
  };

  const hasResults = filteredWorks.length > 0;

  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="karya">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">Karya &<br/>Portofolio</h2>
        </div>

        {/* Channel Dial Filter - Desktop/Tablet */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          {roleFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.label)}
              aria-pressed={activeFilter === filter.label}
              className={cn(
                "px-4 py-2 rounded-full border text-xs font-mono tracking-wide transition-all duration-300",
                activeFilter === filter.label 
                  ? "border-blue-accent bg-blue-accent/10 text-blue-accent shadow-[0_0_10px_rgba(74,127,232,0.2)]" 
                  : "border-divider bg-transparent text-muted hover:border-blue-accent/50 hover:text-ivory"
              )}
            >
              <span className="flex items-center gap-2">
                {activeFilter === filter.label && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                {filter.label}
              </span>
            </button>
          ))}
        </div>

        {/* Channel Dial Filter - Mobile Compact Popover */}
        <div className="block md:hidden relative w-full sm:w-auto">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            aria-expanded={isMobileFilterOpen}
            aria-haspopup="listbox"
            aria-label="Pilih kategori filter"
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-full border border-blue-accent/50 bg-navy-deep text-ivory text-xs font-mono tracking-wide shadow-md"
          >
            <span className="flex items-center gap-2">
              <Filter size={14} className="text-blue-accent" />
              <span>FILTER: <strong className="text-blue-accent uppercase">{activeFilter}</strong></span>
            </span>
            <ChevronDown size={14} className={cn("transition-transform duration-200 text-muted", isMobileFilterOpen && "rotate-180")} />
          </button>

          {isMobileFilterOpen && (
            <>
              {/* Invisible backdrop overlay to catch taps outside */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsMobileFilterOpen(false)} 
              />
              
              {/* Floating Compact Filter Panel */}
              <div 
                role="listbox" 
                aria-label="Daftar filter role"
                className="absolute right-0 left-0 sm:left-auto top-full mt-2 sm:w-64 bg-navy-deep border border-divider rounded-xl shadow-2xl p-2 z-40 flex flex-col gap-1 max-h-[60vh] overflow-y-auto"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted border-b border-divider/50 mb-1 flex items-center justify-between">
                  <span>FILTER ROLE</span>
                  <span className="text-[9px] text-blue-accent">8 CATEGORIES</span>
                </div>
                {roleFilters.map((filter) => (
                  <button
                    key={filter.id}
                    role="option"
                    aria-selected={activeFilter === filter.label}
                    onClick={() => {
                      handleFilterClick(filter.label);
                      setIsMobileFilterOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between",
                      activeFilter === filter.label
                        ? "bg-blue-accent/20 text-blue-accent font-semibold"
                        : "text-ivory/80 hover:bg-navy-base hover:text-ivory"
                    )}
                  >
                    <span>{filter.label}</span>
                    {activeFilter === filter.label && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-accent shadow-[0_0_6px_rgba(74,127,232,0.8)]"></span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content: Highlight + Grouped Sections */}
      <AnimatePresence mode="wait">
        {hasResults ? (
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Latest Signal Highlight */}
            {latestWork && (
              <WorkHighlight
                work={latestWork}
                onSelectVideo={handleOpenVideo}
                onSelectInfo={handleOpenInfo}
              />
            )}

            {/* Category Sections — dynamically sorted */}
            {groupedCategories.map((group, index) => (
              <WorkSection
                key={group.category}
                number={String(index + 1).padStart(2, '0')}
                category={group.category}
              >
                {group.works.map((work, idx) => (
                  <WorkCard
                    key={`${work.id || work.title}-${idx}`}
                    work={work}
                    onSelectVideo={handleOpenVideo}
                    onSelectInfo={handleOpenInfo}
                  />
                ))}
              </WorkSection>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-divider rounded-sm"
          >
            <span className="font-mono text-xs tracking-widest text-muted mb-2">[CHANNEL NOT FOUND]</span>
            <p className="text-ivory">Tidak ada karya yang sesuai dengan filter ini.</p>
            <button 
              onClick={() => handleFilterClick('Semua')}
              className="mt-4 console-btn text-xs text-blue-accent border-blue-accent"
            >
              RESET CHANNEL
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal 
          work={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}

      {/* Information Modal */}
      {selectedInfo && (
        <ProjectInfoModal 
          work={selectedInfo} 
          onClose={() => setSelectedInfo(null)}
          onWatchVideo={handleOpenVideo}
        />
      )}

    </section>
  );
}
