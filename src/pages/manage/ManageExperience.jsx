import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Edit, Trash2, Search } from 'lucide-react';
import { getExperience, deleteExperience, subscribeToDataChanges } from '../../lib/contentService';
import ExperienceEditorModal from '../../components/manage/ExperienceEditorModal';
import DeleteConfirmModal from '../../components/manage/DeleteConfirmModal';
import Toast from '../../components/manage/Toast';
import ComboboxField from '../../components/manage/ComboboxField';

const EXP_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'magang', label: 'Magang / Profesional' },
  { value: 'organisasi', label: 'Organisasi' },
];

export default function ManageExperience({ openNewModalTrigger }) {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingExperience, setEditingExperience] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState(null);
  const [toast, setToast] = useState(null);

  const loadExperience = async () => {
    setLoading(true);
    try {
      const data = await getExperience();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memuat data pengalaman.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperience();
    const unsubscribe = subscribeToDataChanges(() => {
      loadExperience();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (openNewModalTrigger > 0) {
      setEditingExperience(null);
      setIsEditorOpen(true);
    }
  }, [openNewModalTrigger]);

  const handleDelete = async () => {
    if (!deletingExperience) return;
    try {
      await deleteExperience(deletingExperience.id);
      setToast({ type: 'success', message: `Pengalaman "${deletingExperience.position}" berhasil dihapus.` });
      setDeletingExperience(null);
    } catch (err) {
      setToast({ type: 'error', message: `Gagal menghapus pengalaman: ${err.message}` });
    }
  };

  const filtered = experiences.filter((e) => {
    const matchesSearch =
      (e.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Pengalaman & Organisasi</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola riwayat magang, pengalaman kerja profesional, dan kepemimpinan organisasi.</p>
        </div>

        <button
          onClick={() => {
            setEditingExperience(null);
            setIsEditorOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>Tambah Pengalaman</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari posisi, organisasi, atau kota..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
          />
        </div>

        <ComboboxField
          value={typeFilter}
          onChange={(val) => setTypeFilter(val || 'all')}
          defaultOptions={EXP_TYPE_FILTER_OPTIONS}
          placeholder="Semua Tipe"
          creatable={false}
          compact
          className="w-44"
        />
      </div>

      {/* Data List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat data pengalaman...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
          Tidak ada pengalaman ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((exp) => (
            <div
              key={exp.id}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-mono text-[10px] font-semibold text-emerald-700 uppercase tracking-wider px-2 py-0.5 bg-emerald-50 rounded-md">
                      {exp.type || 'magang'}
                    </span>
                    {exp.location && <span className="font-mono text-[10px] text-slate-400">{exp.location}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingExperience(exp);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit pengalaman"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingExperience(exp)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus pengalaman"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{exp.position}</h3>
                  <p className="text-xs font-medium text-emerald-800 mt-0.5">{exp.organization}</p>
                </div>

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                    {exp.responsibilities.slice(0, 2).map((r, i) => (
                      <li key={i} className="line-clamp-1">{r}</li>
                    ))}
                    {exp.responsibilities.length > 2 && (
                      <li className="text-[10px] text-slate-400 list-none font-mono">
                        +{exp.responsibilities.length - 2} tugas lainnya
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{exp.dateLabel}</span>
                {exp.metrics && (
                  <span className="text-emerald-600 font-semibold">{exp.metrics.length} metrics</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <ExperienceEditorModal
          experience={editingExperience}
          onClose={() => setIsEditorOpen(false)}
          onSuccess={() => {
            loadExperience();
            setToast({
              type: 'success',
              message: editingExperience ? 'Pengalaman berhasil diperbarui.' : 'Pengalaman baru berhasil ditambahkan.',
            });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingExperience && (
        <DeleteConfirmModal
          title={`Hapus Pengalaman "${deletingExperience.position}"?`}
          description="Pengalaman ini akan dihapus secara permanen dari MongoDB. Tindakan ini tidak dapat dibatalkan."
          onClose={() => setDeletingExperience(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
