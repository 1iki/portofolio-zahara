import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Eye, Info, Lock } from 'lucide-react';
import { scripts, scriptCategories, scriptGroupConfig } from '../data/scripts';
import ScriptModal from './ScriptModal';
import { TiledScriptWatermark } from './WatermarkOverlay';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export default function ScriptPreviewSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedScript, setSelectedScript] = useState(null);
  const { playClick } = useSound();

  const filteredScripts = useMemo(() => {
    if (activeFilter === 'all') return scripts;
    return scripts.filter((s) => s.category === activeFilter);
  }, [activeFilter]);

  // Group filtered scripts by category (same pattern as WorkGrid groupedCategories)
  const groupedScripts = useMemo(() => {
    const grouped = filteredScripts.reduce((acc, script) => {
      const cat = script.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(script);
      return acc;
    }, {});
    // Return in config order
    return Object.entries(scriptGroupConfig)
      .filter(([key]) => grouped[key])
      .map(([key, config]) => ({ key, config, items: grouped[key] }));
  }, [filteredScripts]);

  const handleFilterClick = (catId) => {
    playClick();
    setActiveFilter(catId);
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="naskah">

      {/* Section Header — identical pattern to Karya */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">Naskah &<br/>Cuplikan Penulisan</h2>
        </div>

        {/* Filter Chips — identical pill style to Karya */}
        <div className="flex flex-wrap items-center gap-2">
          {scriptCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleFilterClick(cat.id)}
              aria-pressed={activeFilter === cat.id}
              className={cn(
                "px-4 py-2 rounded-full border text-xs font-mono tracking-wide transition-all duration-300",
                activeFilter === cat.id
                  ? "border-blue-accent bg-blue-accent/10 text-blue-accent shadow-[0_0_10px_rgba(74,127,232,0.2)]"
                  : "border-divider bg-transparent text-muted hover:border-blue-accent/50 hover:text-ivory"
              )}
            >
              <span className="flex items-center gap-2">
                {activeFilter === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Sections — identical pattern to WorkSection */}
      {groupedScripts.map((group, groupIdx) => (
        <motion.section
          key={group.key}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 last:mb-0"
        >
          {/* Section Header — same markup as WorkSection */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mono text-sm md:text-base text-blue-accent tracking-wider font-medium">
                {String(groupIdx + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] text-muted/50 tracking-wide">/</span>
              <h3 className="font-display text-lg md:text-xl text-ivory tracking-wide">
                {group.config.label}
              </h3>
            </div>
            <p className="font-mono text-[11px] text-muted tracking-wider uppercase">
              {group.config.subtitle}
            </p>
            <div className="mt-3 h-[1px] bg-gradient-to-r from-divider via-divider/50 to-transparent" />
          </div>

          {/* Card Grid — identical breakpoints to Karya */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((script) => (
              <motion.div
                key={script.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative flex flex-col group bg-navy-deep border border-divider rounded-sm overflow-hidden cursor-pointer hover:border-blue-accent/50 transition-colors"
                onClick={() => { playClick(); setSelectedScript(script); }}
              >
                {/* Thumbnail — aspect-video at top, identical to WorkCard */}
                <div
                  className="aspect-video relative bg-ink overflow-hidden border-b border-divider select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <TiledScriptWatermark opacity={0.18} />
                  <img
                    src={script.thumbnailUrl}
                    alt={`Preview naskah ${script.title}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none select-none"
                    draggable={false}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent pointer-events-none" />

                  {/* Status Badge — top-right dot+label, identical to WorkCard */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-accent/70" />
                    <span className="text-[9px] font-mono tracking-widest text-ivory/70">WATERMARKED</span>
                  </div>

                  {/* Excerpt badge — bottom of thumbnail */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-sm bg-navy-base/90 border border-divider text-[9px] font-mono tracking-wider text-ivory/80 backdrop-blur-sm flex items-center gap-1">
                      <Lock size={9} className="text-amber-400" />
                      {script.previewPageCount}
                    </span>
                  </div>
                </div>

                {/* Metadata Area — p-4, identical structure to WorkCard */}
                <div className="p-4 flex flex-col gap-2 relative z-10 bg-navy-deep flex-1 justify-between">
                  <div className="flex flex-col gap-2">
                    {/* Title + Format badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-ivory text-sm md:text-base leading-tight group-hover:text-blue-accent transition-colors flex-1 min-w-0">
                        {script.title}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 bg-blue-accent/10 border border-blue-accent/30 rounded-sm text-[9px] font-mono tracking-wider text-blue-accent uppercase whitespace-nowrap">
                        {script.format}
                      </span>
                    </div>

                    {/* Organization */}
                    <span className="font-mono text-[9px] text-muted/70 tracking-wide uppercase truncate block -mt-1">
                      {script.organization}
                    </span>

                    {/* Description */}
                    <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                      {script.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {/* Metadata table — identical pattern to WorkCard */}
                    <div className="flex flex-col gap-1 font-mono text-[10px] text-muted tracking-wide uppercase">
                      <div className="flex justify-between border-b border-divider/50 pb-1">
                        <span>ROLE</span>
                        <span className="text-ivory text-right">{script.role}</span>
                      </div>
                      <div className="flex justify-between border-b border-divider/50 py-1">
                        <span>PROGRAM</span>
                        <span className="text-ivory">{script.program}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>DATE</span>
                        <span className="text-ivory">{script.date}</span>
                      </div>
                    </div>

                    {/* Tags row — supplemental, below metadata */}
                    <div className="flex flex-wrap gap-1">
                      {script.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-mono text-muted/60 bg-navy-base px-1.5 py-0.5 rounded-sm border border-divider/30">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons — identical pattern to WorkCard */}
                    <div className="mt-2 pt-2 border-t border-divider/40 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); playClick(); setSelectedScript(script); }}
                        className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-accent/10 border border-blue-accent/40 rounded-sm text-[10px] font-mono tracking-wider text-blue-accent hover:bg-blue-accent hover:text-navy-deep transition-all duration-300 uppercase font-semibold"
                        aria-label={`Lihat cuplikan naskah ${script.title}`}
                      >
                        <Eye size={10} />
                        <span>PREVIEW</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); playClick(); setSelectedScript(script); }}
                        className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-navy-base border border-divider rounded-sm text-[10px] font-mono tracking-wider text-ivory/90 hover:border-blue-accent hover:text-blue-accent transition-all duration-300 uppercase font-semibold"
                        aria-label={`Lihat detail ${script.title}`}
                      >
                        <Info size={10} />
                        <span>DETAILS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}

      {/* Script Viewer Modal */}
      {selectedScript && (
        <ScriptModal
          script={selectedScript}
          onClose={() => setSelectedScript(null)}
        />
      )}
    </section>
  );
}
