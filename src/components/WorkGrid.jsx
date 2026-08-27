import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { works } from '../data/works';
import WorkCard from './WorkCard';
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

  const filteredWorks = works.filter((work) => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Creative') {
      return creativeRoles.some((cr) => work.role.includes(cr));
    }
    return work.role.includes(activeFilter);
  });

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

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredWorks.length > 0 ? (
            filteredWorks.map((work, idx) => (
              <WorkCard 
                key={`${work.id || work.title}-${idx}`} 
                work={work} 
                onSelectVideo={handleOpenVideo}
                onSelectInfo={handleOpenInfo}
              />
            ))
          ) : (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-divider rounded-sm"
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
      </motion.div>

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
