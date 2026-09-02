import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Check, 
  ChevronDown, 
  Plus, 
  Search, 
  Loader2, 
  X,
  Sparkles
} from 'lucide-react';
import { getOptions, createOption } from '../../lib/contentService';
import { cn } from '../../lib/utils';

export default function ComboboxField({
  label,
  required = false,
  type, // MongoDB taxonomy key, e.g. institution | script_category | script_format | script_role
  value = '',
  onChange,
  placeholder = 'Pilih atau cari...',
  defaultOptions = [],
  allowCreate = true,
  createOnSelect = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Initial fetch of options on mount or type change
  const fetchOptions = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await getOptions(type, query);
      const merged = [...defaultOptions, ...(data || [])].reduce((acc, option) => {
        const key = option.normalizedValue || option.value?.trim().toLowerCase();
        if (key && !acc.some((item) => (item.normalizedValue || item.value?.trim().toLowerCase()) === key)) acc.push(option);
        return acc;
      }, []);
      setOptions(merged);
    } catch (err) {
      console.error('[ComboboxField] Fetch options error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [type, defaultOptions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // MANDATORY 7000ms DEBOUNCE FOR REMOTE SEARCH
  const handleSearchInputChange = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
    setHighlightedIndex(-1);

    // Reset 7000ms timer every time user types
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Remote database search triggers ONLY after 7000ms of typing inactivity
    debounceTimerRef.current = setTimeout(() => {
      fetchOptions(text);
    }, 7000);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Filter options locally for instant UI responsiveness
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.value.toLowerCase().includes(q) ||
        (opt.normalizedValue && opt.normalizedValue.includes(q))
    );
  }, [options, searchQuery]);

  // Check if current search query already exists as an option
  const exactMatchExists = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const norm = searchQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    return options.some((opt) => opt.normalizedValue === norm);
  }, [options, searchQuery]);

  // Instant selection handler (0s delay)
  const handleSelectOption = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  // New values are form-scoped by default. They are persisted by the parent
  // editor only after its own save action succeeds.
  const handleCreateNewOption = async () => {
    const rawVal = searchQuery.trim();
    if (!rawVal) return;

    if (!createOnSelect) {
      onChange(rawVal);
      setIsOpen(false);
      return;
    }

    setIsCreating(true);
    try {
      const newOpt = await createOption(type, rawVal);
      const createdValue = newOpt?.value || rawVal;

      // Update options list locally immediately
      setOptions((prev) => {
        const exists = prev.some((o) => o.normalizedValue === newOpt.normalizedValue);
        if (exists) return prev;
        return [...prev, newOpt].sort((a, b) => a.value.localeCompare(b.value));
      });

      // Instantly set as selected value
      onChange(createdValue);
      setIsOpen(false);
    } catch (err) {
      console.error('[ComboboxField] Create option error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalItems = filteredOptions.length + (allowCreate && !exactMatchExists ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < totalItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[highlightedIndex].value);
      } else if (allowCreate && !exactMatchExists && searchQuery.trim()) {
        handleCreateNewOption();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative space-y-1 font-sans", className)} ref={containerRef}>
      {label && (
        <label className="block font-medium text-xs text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Trigger Input Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none select-none",
          isOpen && "border-blue-600 ring-2 ring-blue-600/10"
        )}
      >
        <span className={cn("truncate font-medium", value ? "text-slate-900" : "text-slate-400")}>
          {value || placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-slate-600 rounded transition-colors"
              title="Clear selection"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search options... (remote query in 7s)"
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none font-sans"
              />
              {isLoading && (
                <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-blue-600" />
              )}
            </div>
            <span className="text-[9px] font-mono text-slate-400 px-1 pt-1 block">
              7s Remote Sync Active • Direct local filter
            </span>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 && exactMatchExists ? (
              <div className="py-6 text-center text-xs text-slate-400 font-mono">
                Tidak ada option ditemukan.
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = value.toLowerCase() === opt.value.toLowerCase();
                const isHighlighted = highlightedIndex === idx;

                return (
                  <div
                    key={opt.normalizedValue || idx}
                    onClick={() => handleSelectOption(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                      isSelected && "bg-blue-50 text-blue-600 font-semibold",
                      isHighlighted && !isSelected && "bg-slate-100 text-slate-900",
                      !isSelected && !isHighlighted && "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate">{opt.value}</span>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                  </div>
                );
              })
            )}

            {/* Option Creation Action: + Tambah "<query>" */}
            {allowCreate && !exactMatchExists && searchQuery.trim() && (
              <div
                onClick={handleCreateNewOption}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer transition-all mt-1 border border-dashed border-blue-200",
                  highlightedIndex === filteredOptions.length && "bg-blue-600 text-white"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isCreating ? (
                    <Loader2 size={14} className="animate-spin shrink-0" />
                  ) : (
                    <Plus size={14} className="shrink-0" />
                  )}
                  <span className="truncate">Tambah "{searchQuery.trim()}"</span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold shrink-0">
                  {createOnSelect ? 'Save to MongoDB' : 'Di-upsert saat Simpan'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
