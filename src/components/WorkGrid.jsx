import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { works } from '../data/works';
import WorkCard from './WorkCard';
import WorkSection from './WorkSection';
import WorkHighlight from './WorkHighlight';
import VideoModal from './VideoModal';
import ProjectInfoModal from './ProjectInfoModal';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export default function WorkGrid() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const { playClick } = useSound();

  const filters = ['Semua', 'Produser', 'Penulis Naskah', 'Reporter', 'Host', 'Creative'];

  // Roles that fall under the "Creative" umbrella filter
  const creativeRoles = ['Creative Support', 'Clipper', 'Script Continuity', 'Talent Coordinator', 'Asisten Script', 'Asisten Produser', 'Sutradara', 'Content Creator'];

  // ── Step 1: Filter by role ──────────────────────────────────────
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      if (activeFilter === 'Semua') return true;
      if (activeFilter === 'Creative') {
        return creativeRoles.some((cr) => work.role.includes(cr));
      }
      return work.role.includes(activeFilter);
    });
  }, [activeFilter]);

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

        {/* Channel Dial Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={cn(
                "px-4 py-2 rounded-full border text-xs font-mono tracking-wide transition-all duration-300",
                activeFilter === filter 
                  ? "border-blue-accent bg-blue-accent/10 text-blue-accent shadow-[0_0_10px_rgba(74,127,232,0.2)]" 
                  : "border-divider bg-transparent text-muted hover:border-blue-accent/50 hover:text-ivory"
              )}
            >
              <span className="flex items-center gap-2">
                {activeFilter === filter && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                {filter}
              </span>
            </button>
          ))}
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
