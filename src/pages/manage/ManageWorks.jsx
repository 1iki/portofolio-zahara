import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FolderKanban, 
  ImageIcon, 
  Video, 
  ExternalLink,
  Star
} from 'lucide-react';
import { getWorks, deleteWork } from '../../lib/contentService';
import { normalizeMedia } from '../../lib/mediaUtils';
import WorkEditorModal from '../../components/manage/WorkEditorModal';
import DeleteConfirmModal from '../../components/manage/DeleteConfirmModal';
import Toast from '../../components/manage/Toast';
import { cn } from '../../lib/utils';

export default function ManageWorks({ openNewModalTrigger }) {
  const [works, setWorks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingWork, setEditingWork] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingWork, setDeletingWork] = useState(null);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    const data = await getWorks();
    setWorks(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (openNewModalTrigger) {
      setEditingWork(null);
      setIsEditorOpen(true);
    }
  }, [openNewModalTrigger]);

  const categoryFilterOptions = useMemo(() => {
    const set = new Set();
    works.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    const dynamicCats = Array.from(set).map((catId) => ({
      id: catId,
      label: catId.replace(/[-_]/g, ' ').toUpperCase(),
    }));

    return [{ id: 'all', label: 'Semua' }, ...dynamicCats];
  }, [works]);

  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (work.role && work.role.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || work.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [works, searchQuery, selectedCategory]);

  const handleDelete = async () => {
    if (deletingWork) {
      try {
        await deleteWork(deletingWork.id);
        setToast({ type: 'success', message: `Karya "${deletingWork.title}" berhasil dihapus dari MongoDB.` });
        setDeletingWork(null);
        await loadData();
      } catch (err) {
        setToast({ type: 'error', message: `Gagal menghapus: ${err.message}` });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban size={22} className="text-blue-600" />
            <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
              Manajemen Karya & Portofolio
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola seluruh project karya penyiaran, video, sitkom, dan liputan berita ({works.length} item tersimpan di MongoDB).
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWork(null);
            setIsEditorOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white font-medium text-xs rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Karya Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, slug, atau role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-sans"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categoryFilterOptions.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-blue-50 border border-blue-200 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 border border-transparent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data View: Desktop Table & Mobile Cards */}
      {filteredWorks.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-2">
          <span className="font-mono text-xs text-slate-400 font-semibold uppercase">[ TIDAK ADA KARYA DITEMUKAN ]</span>
          <p className="text-xs text-slate-600">Tidak ada item yang sesuai dengan kata kunci atau filter ini.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item & Thumbnail</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4 text-center">Media (Max 55)</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorks.map((work) => {
                    const mediaItems = normalizeMedia(work);
                    const mediaCount = mediaItems.length;
                    const primaryThumb = mediaItems[0]?.src || work.thumbnail;

                    return (
                      <tr key={work.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Title & Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <img
                              src={primaryThumb || 'https://placehold.co/100x100/F1F5F9/64748B?text=No+Thumb'}
                              alt={work.title}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100/F1F5F9/64748B?text=Error';
                              }}
                            />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm text-slate-900 truncate">
                                {work.title}
                              </h3>
                              <span className="font-mono text-[10px] text-slate-400 truncate block">
                                ID: {work.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-semibold uppercase text-[10px] font-mono">
                            {work.category}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {work.role}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {work.date || work.endDate || '-'}
                        </td>

                        {/* Media Count Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium",
                            mediaCount > 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          )}>
                            {mediaCount} foto
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingWork(work);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Karya"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingWork(work)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Karya"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredWorks.map((work) => {
              const mediaItems = normalizeMedia(work);
              const mediaCount = mediaItems.length;
              const primaryThumb = mediaItems[0]?.src || work.thumbnail;

              return (
                <div key={work.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={primaryThumb || 'https://placehold.co/100x100/F1F5F9/64748B?text=No+Thumb'}
                      alt={work.title}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 font-mono text-[9px] font-bold uppercase inline-block mb-1">
                        {work.category}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {work.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{work.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
                    <span>{mediaCount} Media</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingWork(work);
                          setIsEditorOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 text-slate-700 font-sans font-medium rounded-lg text-xs hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingWork(work)}
                        className="px-3 py-1 bg-red-50 text-red-600 font-sans font-medium rounded-lg text-xs hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Work Editor Modal */}
      {isEditorOpen && (
        <WorkEditorModal
          work={editingWork}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingWork(null);
          }}
          onSuccess={() => {
            setToast({ type: 'success', message: 'Karya berhasil disimpan ke database MongoDB.' });
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingWork && (
        <DeleteConfirmModal
          title={deletingWork.title}
          category={deletingWork.category}
          mediaCount={normalizeMedia(deletingWork).length}
          onConfirm={handleDelete}
          onClose={() => setDeletingWork(null)}
        />
      )}
    </div>
  );
}
