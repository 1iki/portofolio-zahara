import React, { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';
import { 
  Check, 
  ChevronDown, 
  Plus, 
  Search, 
  Loader2, 
  X
} from 'lucide-react';
import { getOptions, createOption } from '../../lib/contentService';
import { cn } from '../../lib/utils';

// A stable shared default prevents a new [] reference from retriggering the
// initial-options effect on every render for callers without local options.
const EMPTY_OPTIONS = [];

const normalizeOption = (opt) => {
  if (typeof opt === 'string') {
    return { label: opt, value: opt, normalizedValue: opt.toLowerCase().trim() };
  }
  const val = opt.value !== undefined ? String(opt.value) : (opt.label || '');
  const lbl = opt.label !== undefined ? String(opt.label) : val;
  const norm = opt.normalizedValue || val.toLowerCase().trim().replace(/\s+/g, ' ');
  return { label: lbl, value: val, normalizedValue: norm };
};

/**
 * ComboboxField — Professional Local-First & Debounced Combobox / Autocomplete Component
 * 
 * UX Standards:
 * - Supports both taxonomy-backed options (MongoDB) and static/local option arrays
 * - Accepts option objects `{ label, value }` or simple string arrays `['a', 'b']`
 * - Supports custom user input creation (Creatable Combobox)
 * - Accessible combobox semantics, full keyboard navigation (Up, Down, Enter, Esc, Tab)
 */
export default function ComboboxField({
  label,
  required = false,
  type, // MongoDB taxonomy key (optional), e.g. institution | script_category | production_category
  value = '',
  onChange,
  placeholder = 'Pilih atau cari...',
  defaultOptions = EMPTY_OPTIONS,
  creatable = true,
  allowCreate, // Alias for creatable
  createOnSelect = true,
  persistent = true,
  className = '',
  buttonClassName = '',
  compact = false,
}) {
  const isCreatableAllowed = allowCreate !== undefined ? allowCreate : creatable;
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [fetchError, setFetchError] = useState(null);
  const listboxId = useId();

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Serialize defaultOptions safely to prevent array reference instability from triggering re-fetches
  const defaultOptionsKey = useMemo(() => {
    if (!defaultOptions || !Array.isArray(defaultOptions)) return '';
    return defaultOptions.map((o) => (typeof o === 'string' ? o : `${o?.value}:${o?.label}`)).join('|');
  }, [defaultOptions]);

  // Normalize default options
  const normalizedDefaults = useMemo(() => {
    return (defaultOptions || []).map(normalizeOption);
    // eslint-disable-next-deps
  }, [defaultOptionsKey]);

  // Initial fetch of options on mount or type change
  const fetchInitialOptions = useCallback(async () => {
    if (!type) {
      setOptions(normalizedDefaults);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getOptions(type, '');
      const remoteNormalized = (data || []).map(normalizeOption);
      const merged = [...normalizedDefaults, ...remoteNormalized].reduce((acc, option) => {
        const key = option.normalizedValue || option.value?.trim().toLowerCase();
        if (key && !acc.some((item) => (item.normalizedValue || item.value?.trim().toLowerCase()) === key)) {
          acc.push(option);
        }
        return acc;
      }, []);
      setOptions(merged);
    } catch (err) {
      console.error('[ComboboxField] Initial fetch options error:', err);
      setFetchError('Gagal memuat opsi');
      setOptions(normalizedDefaults);
    } finally {
      setIsLoading(false);
    }
  }, [type, normalizedDefaults]);

  useEffect(() => {
    fetchInitialOptions();
  }, [fetchInitialOptions]);

  // Debounced Remote Search (350ms, Min length: 3 chars)
  const performRemoteSearch = useCallback(async (query, requestId) => {
    if (!type || !query || query.trim().length < 3 || requestId !== requestIdRef.current) return;

    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;

    setIsLoading(true);
    setFetchError(null);

    try {
      const data = await getOptions(type, query.trim(), controller.signal);

      if (requestId !== requestIdRef.current) return;
      if (data === null) return;

      const remoteNormalized = (data || []).map(normalizeOption);

      setOptions((prev) => {
        const merged = [...prev, ...remoteNormalized].reduce((acc, option) => {
          const key = option.normalizedValue || option.value?.trim().toLowerCase();
          if (key && !acc.some((item) => (item.normalizedValue || item.value?.trim().toLowerCase()) === key)) {
            acc.push(option);
          }
          return acc;
        }, []);
        return merged;
      });
    } catch (err) {
      if (err.name !== 'AbortError' && requestId === requestIdRef.current) {
        console.error('[ComboboxField] Remote search error:', err);
        setFetchError('Gagal menyinkronkan opsi');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [type]);

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
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    }
  }, [isOpen]);

  // Handle Search Input Change
  const handleSearchInputChange = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    const requestId = ++requestIdRef.current;

    const trimmed = text.trim();
    if (type && trimmed.length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        performRemoteSearch(trimmed, requestId);
      }, 350);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Local-First Instant Filtering
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.normalizedValue && opt.normalizedValue.includes(q))
    );
  }, [options, searchQuery]);

  // Check if exact match already exists
  const exactMatchExists = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const norm = searchQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    return options.some((opt) => (opt.normalizedValue || opt.value?.trim().toLowerCase() || opt.label?.trim().toLowerCase()) === norm);
  }, [options, searchQuery]);

  // Compute label for currently selected value
  const currentDisplayLabel = useMemo(() => {
    if (!value && value !== 0) return '';
    const valStr = String(value);
    const match = options.find((o) => o.value === valStr || o.value?.toLowerCase() === valStr.toLowerCase());
    return match ? match.label : valStr;
  }, [options, value]);

  // Selection Handler
  const handleSelectOption = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  // Option Creation Handler
  const handleCreateNewOption = async () => {
    if (isCreating || !isCreatableAllowed) return;

    const rawVal = searchQuery.trim();
    if (!rawVal) return;

    const newOptObj = normalizeOption(rawVal);

    if (!type || !createOnSelect) {
      setOptions((prev) => {
        const exists = prev.some(
          (o) => (o.normalizedValue || o.value?.trim().toLowerCase()) === newOptObj.normalizedValue
        );
        if (exists) return prev;
        return [...prev, newOptObj].sort((a, b) => a.label.localeCompare(b.label));
      });

      if (type && persistent) {
        createOption(type, rawVal).catch((err) => {
          console.warn('[ComboboxField] Asynchronous option creation warning:', err);
        });
      }

      onChange(rawVal);
      setIsOpen(false);
      return;
    }

    setIsCreating(true);
    setFetchError(null);

    try {
      const newOpt = await createOption(type, rawVal);
      const createdValue = newOpt?.value || rawVal;
      const createdOptObj = normalizeOption(newOpt || createdValue);

      setOptions((prev) => {
        const exists = prev.some((o) => (o.normalizedValue || o.value?.trim().toLowerCase()) === createdOptObj.normalizedValue);
        if (exists) return prev;
        return [...prev, createdOptObj].sort((a, b) => a.label.localeCompare(b.label));
      });

      onChange(createdValue);
      setIsOpen(false);
    } catch (err) {
      console.error('[ComboboxField] Create option error:', err);
      setFetchError(err.message || 'Gagal menyimpan opsi baru ke database');
    } finally {
      setIsCreating(false);
    }
  };

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalItems = filteredOptions.length + (isCreatableAllowed && !exactMatchExists ? 1 : 0);

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
      } else if (isCreatableAllowed && !exactMatchExists && searchQuery.trim()) {
        handleCreateNewOption();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Tab') {
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
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={label || placeholder}
        className={cn(
          "w-full bg-white border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none select-none",
          compact ? "px-2.5 py-1.5 rounded-xl font-medium" : "px-3 py-2 rounded-xl font-normal",
          isOpen && "border-blue-600 ring-2 ring-blue-600/10",
          buttonClassName
        )}
      >
        <span className={cn("truncate font-medium", value !== '' && value !== null ? "text-slate-900" : "text-slate-400")}>
          {currentDisplayLabel || placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {value !== '' && value !== null && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-slate-600 rounded transition-colors cursor-pointer"
              title="Bersihkan pilihan"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 min-w-[180px]">
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
                placeholder={isCreatableAllowed ? "Cari atau ketik baru..." : "Cari opsi..."}
                role="searchbox"
                aria-autocomplete="list"
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none font-sans"
              />
              {isLoading && (
                <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-blue-600" />
              )}
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 pt-1">
              <span>{isCreatableAllowed ? 'Pilih atau ketik baru' : 'Filter opsi (Select-only)'}</span>
              {fetchError ? (
                <span className="text-amber-600 font-semibold">{fetchError}</span>
              ) : null}
            </div>
          </div>

          {/* Options List */}
          <div
            id={listboxId}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50"
          >
            {filteredOptions.length === 0 && (exactMatchExists || !isCreatableAllowed) ? (
              <div className="py-6 text-center text-xs text-slate-400 font-mono">
                Tidak ada opsi ditemukan.
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(value).toLowerCase() === opt.value.toLowerCase();
                const isHighlighted = highlightedIndex === idx;

                return (
                  <div
                    key={opt.normalizedValue || `${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectOption(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                      isSelected && "bg-blue-50 text-blue-600 font-semibold",
                      isHighlighted && !isSelected && "bg-slate-100 text-slate-900",
                      !isSelected && !isHighlighted && "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                  </div>
                );
              })
            )}

            {/* Option Creation Action: + Tambah / Gunakan "<query>" */}
            {isCreatableAllowed && !exactMatchExists && searchQuery.trim() && (
              <div
                role="button"
                onClick={handleCreateNewOption}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer transition-all mt-1 border border-dashed border-blue-200",
                  highlightedIndex === filteredOptions.length && "bg-blue-600 text-white",
                  isCreating && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isCreating ? (
                    <Loader2 size={14} className="animate-spin shrink-0 text-blue-600" />
                  ) : (
                    <Plus size={14} className="shrink-0" />
                  )}
                  <span className="truncate">{isCreating ? 'Menyimpan ke DB...' : `Gunakan "${searchQuery.trim()}"`}</span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold shrink-0">
                  + Baru
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
