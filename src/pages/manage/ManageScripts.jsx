import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Edit, Trash2, Search, Filter, FileCheck, ArrowUpDown, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getScripts, deleteScript, subscribeToDataChanges } from '../../lib/contentService';
import ScriptEditorModal from '../../components/manage/ScriptEditorModal';
import DeleteConfirmModal from '../../components/manage/DeleteConfirmModal';
import Toast from '../../components/manage/Toast';
import ComboboxField from '../../components/manage/ComboboxField';

const SCRIPT_CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'comedy', label: 'Sitkom & Drama (comedy)' },
  { value: 'variety', label: 'Talkshow & Variety (variety)' },
  { value: 'news', label: 'Berita & Media (news)' },
];

const SORT_ORDER_OPTIONS = [
  { value: 'newest', label: 'Terbaru Pertama' },
  { value: 'oldest', label: 'Terlama Pertama' },
  { value: 'title', label: 'Judul (A-Z)' },
];

export default function ManageScripts({ openNewModalTrigger }) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'title'
  const [editingScript, setEditingScript] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingScript, setDeletingScript] = useState(null);
  const [toast, setToast] = useState(null);

  const loadScripts = async () => {
    setLoading(true);
    try {
      const data = await getScripts();
      setScripts(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memuat data naskah.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScripts();
    const unsubscribe = subscribeToDataChanges(() => {
      loadScripts();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (openNewModalTrigger > 0) {
      setEditingScript(null);
      setIsEditorOpen(true);
    }
  }, [openNewModalTrigger]);

  const handleDelete = async () => {
    if (!deletingScript) return;
    try {
      await deleteScript(deletingScript.id);
      setToast({ type: 'success', message: `Naskah "${deletingScript.title}" berhasil dihapus.` });
      setDeletingScript(null);
      loadScripts();
    } catch (err) {
      setToast({ type: 'error', message: `Gagal menghapus naskah: ${err.message}` });
    }
  };

  // Available unique formats for filtering
  const availableFormats = useMemo(() => {
    const formats = new Set();
    scripts.forEach((s) => {
      if (s.format) formats.add(s.format);
    });
    return Array.from(formats);
  }, [scripts]);

  const formatFilterOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Format' },
      ...availableFormats.map((fmt) => ({ value: fmt, label: fmt })),
    ];
  }, [availableFormats]);

  // Filtered & Sorted scripts computation
  const processedScripts = useMemo(() => {
    let result = scripts.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (s.title || '').toLowerCase().includes(q) ||
        (s.program || '').toLowerCase().includes(q) ||
        (s.role || '').toLowerCase().includes(q) ||
        (s.organization || '').toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
      const matchesFormat = formatFilter === 'all' || s.format === formatFilter;

      return matchesSearch && matchesCat && matchesFormat;
    });

    return result.sort((a, b) => {
      if (sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default date sort
      if (sortOrder === 'oldest') {
        return (a.date || '').localeCompare(b.date || '');
      }
      return (b.date || '').localeCompare(a.date || '');
    });
  }, [scripts, searchQuery, categoryFilter, formatFilter, sortOrder]);

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Naskah</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-semibold">
              {scripts.length} item
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan naskah, sitkom, talkshow, berita, dan dokumen PDF Cloudinary.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingScript(null);
            setIsEditorOpen(true);
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Naskah</span>
        </button>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, program, peran, instansi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-600 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <ComboboxField
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val || 'all')}
            defaultOptions={SCRIPT_CATEGORY_FILTER_OPTIONS}
            placeholder="Semua Kategori"
            creatable={false}
            compact
            className="w-48"
          />

          {/* Format Filter */}
          <ComboboxField
            value={formatFilter}
            onChange={(val) => setFormatFilter(val || 'all')}
            defaultOptions={formatFilterOptions}
            placeholder="Semua Format"
            creatable={false}
            compact
            className="w-44"
          />

          {/* Sorting */}
          <ComboboxField
            value={sortOrder}
            onChange={(val) => setSortOrder(val || 'newest')}
            defaultOptions={SORT_ORDER_OPTIONS}
            placeholder="Urutan..."
            creatable={false}
            compact
            className="w-40"
          />
        </div>
      </div>

      {/* Main Data View */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat data naskah...</div>
      ) : processedScripts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
          Tidak ada naskah ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600 font-sans border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 font-semibold">Naskah / Program</th>
                  <th className="py-3 px-4 font-semibold">Kategori & Format</th>
                  <th className="py-3 px-4 font-semibold">Peran & Instansi</th>
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Status PDF</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedScripts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title + Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                          <img
                            src={s.previewImageUrl || s.thumbnailUrl || '/naskah/salah-pintu-ep01.png'}
                            alt={s.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/naskah/salah-pintu-ep01.png'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-xs leading-snug truncate max-w-xs">{s.title}</h3>
                          {s.episode && <p className="text-[11px] text-amber-700 truncate max-w-xs">{s.episode}</p>}
                          {s.program && <p className="text-[10px] text-slate-400 truncate max-w-xs">{s.program}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Category & Format */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                          {s.category || 'comedy'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">{s.format}</span>
                      </div>
                    </td>

                    {/* Role & Org */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{s.role}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[160px]">{s.organization}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {s.date}
                    </td>

                    {/* PDF Status */}
                    <td className="py-3.5 px-4">
                      {s.pdfUrl ? (
                        <a
                          href={s.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-mono font-semibold hover:underline"
                        >
                          <FileCheck size={12} />
                          <span>PDF Ready</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-mono">
                          Tanpa PDF
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingScript(s);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit naskah"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingScript(s)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus naskah"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {processedScripts.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-mono text-[10px] font-semibold text-amber-700 uppercase tracking-wider px-2 py-0.5 bg-amber-50 rounded-md">
                        {s.category || 'comedy'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{s.format || 'Screenplay'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingScript(s);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit naskah"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingScript(s)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus naskah"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">{s.title}</h3>
                    {s.episode && <p className="text-xs font-medium text-amber-700 mt-0.5">{s.episode}</p>}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{s.role}</span>
                  {s.pdfUrl ? (
                    <a
                      href={s.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      PDF <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span>{s.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <ScriptEditorModal
          script={editingScript}
          onClose={() => setIsEditorOpen(false)}
          onSuccess={() => {
            loadScripts();
            setToast({
              type: 'success',
              message: editingScript ? 'Naskah berhasil diperbarui.' : 'Naskah baru berhasil ditambahkan.',
            });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingScript && (
        <DeleteConfirmModal
          title={`Hapus Naskah "${deletingScript.title}"?`}
          description="Naskah dan aset Cloudinary terkait akan dihapus secara permanen dari MongoDB. Tindakan ini tidak dapat dibatalkan."
          onClose={() => setDeletingScript(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
