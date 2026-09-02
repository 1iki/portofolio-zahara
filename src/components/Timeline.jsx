import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getExperience, getExperienceCategories, subscribeToDataChanges } from '../lib/contentService';
import ExperienceSection from './ExperienceSection';
import ExperienceItem from './ExperienceItem';
import { useSound } from '../context/SoundContext';
import { cn } from '../lib/utils';

export default function Timeline() {
  const [experienceList, setExperienceList] = useState([]);
  const [expCategoriesMap, setExpCategoriesMap] = useState({});
  const [activeFilter, setActiveFilter] = useState('Semua');
  const { playClick } = useSound();

  const loadData = async () => {
    try {
      const [expData, catData] = await Promise.all([
        getExperience(),
        getExperienceCategories(),
      ]);
      setExperienceList(Array.isArray(expData) ? expData : []);

      if (Array.isArray(catData)) {
        const catMap = {};
        catData.forEach((c) => {
          catMap[c.id] = { label: c.label, subtitle: c.subtitle };
        });
        setExpCategoriesMap(catMap);
      }
    } catch (err) {
      console.error('[Timeline] Failed to load timeline data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const filterOptions = [
    { id: 'Semua', label: 'SEMUA' },
    { id: 'magang', label: 'MAGANG' },
    { id: 'organisasi', label: 'ORGANISASI' },
  ];

  // ── Step 1: Filter by category ──────────────────────────────────
  const filteredExperiences = useMemo(() => {
    return experienceList.filter((item) => {
      if (activeFilter === 'Semua') return true;
      return item.type === activeFilter;
    });
  }, [experienceList, activeFilter]);

  // ── Step 2: Group by type, compute latest endDate per group, & sort
  const groupedCategories = useMemo(() => {
    const grouped = filteredExperiences.reduce((acc, item) => {
      const type = item.type;

      if (!type) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Experience item "${item.position}" has no type`);
        }
        return acc;
      }

      if (!acc[type]) {
        acc[type] = {
          type,
          items: [],
          latestDate: null,
        };
      }

      acc[type].items.push(item);

      if (item.endDate) {
        const itemDate = new Date(item.endDate);
        if (!isNaN(itemDate.getTime())) {
          if (!acc[type].latestDate || itemDate > acc[type].latestDate) {
            acc[type].latestDate = itemDate;
          }
        }
      }

      return acc;
    }, {});

    // Sort experience items within each group by endDate descending
    Object.values(grouped).forEach((group) => {
      group.items.sort((a, b) => {
        const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
        const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
        return dateB - dateA;
      });
    });

    // Convert to array and sort groups by newest category latestDate
    return Object.values(grouped).sort((a, b) => {
      const dateA = a.latestDate ? a.latestDate.getTime() : 0;
      const dateB = b.latestDate ? b.latestDate.getTime() : 0;
      return dateB - dateA;
    });
  }, [filteredExperiences]);

  const handleFilterClick = (filterId) => {
    playClick();
    setActiveFilter(filterId);
  };

  const hasResults = filteredExperiences.length > 0;

  return (
    <section className="py-24 border-t border-divider bg-navy-base" id="pengalaman">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">
              Pengalaman &<br />Organisasi
            </h2>
          </div>

          {/* Category Filter Dial */}
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleFilterClick(opt.id)}
                className={cn(
                  "px-4 py-2 rounded-full border text-xs font-mono tracking-wide transition-all duration-300 cursor-pointer",
                  activeFilter === opt.id
                    ? "border-blue-accent bg-blue-accent/10 text-blue-accent shadow-[0_0_10px_rgba(74,127,232,0.2)]"
                    : "border-divider bg-transparent text-muted hover:border-blue-accent/50 hover:text-ivory"
                )}
              >
                <span className="flex items-center gap-2">
                  {activeFilter === opt.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  )}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area: Grouped Categories */}
        <AnimatePresence mode="wait">
          {hasResults ? (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {groupedCategories.map((group, index) => (
                <ExperienceSection
                  key={group.type}
                  number={String(index + 1).padStart(2, '0')}
                  type={group.type}
                  categoryConfig={expCategoriesMap[group.type]}
                >
                  {group.items.map((item, idx) => (
                    <ExperienceItem
                      key={item.id}
                      item={item}
                      isLast={idx === group.items.length - 1}
                    />
                  ))}
                </ExperienceSection>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-divider rounded-sm"
            >
              <span className="font-mono text-xs tracking-widest text-muted mb-2">
                [NO EXPERIENCE DOSSIER FOUND]
              </span>
              <p className="text-ivory text-sm">
                Tidak ada pengalaman yang sesuai dengan filter ini.
              </p>
              <button
                type="button"
                onClick={() => handleFilterClick('Semua')}
                className="mt-4 console-btn text-xs text-blue-accent border-blue-accent"
              >
                RESET FILTER
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
