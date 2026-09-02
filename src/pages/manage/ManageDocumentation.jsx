import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Camera, 
  ImageIcon, 
  Video 
} from 'lucide-react';
import { getDocumentation, deleteDocumentation } from '../../lib/contentService';
import { normalizeMedia } from '../../lib/mediaUtils';
import DocEditorModal from '../../components/manage/DocEditorModal';
import DeleteConfirmModal from '../../components/manage/DeleteConfirmModal';
import Toast from '../../components/manage/Toast';
import { cn } from '../../lib/utils';

export default function ManageDocumentation({ openNewModalTrigger }) {
  const [docs, setDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [editingDoc, setEditingDoc] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    const data = await getDocumentation();
    setDocs(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (openNewModalTrigger) {
      setEditingDoc(null);
      setIsEditorOpen(true);
    }
  }, [openNewModalTrigger]);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.project && doc.project.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGroup = selectedGroup === 'all' || doc.group === selectedGroup;
      const matchesType = selectedType === 'all' || doc.type === selectedType;

      return matchesSearch && matchesGroup && matchesType;
    });
  }, [docs, searchQuery, selectedGroup, selectedType]);

  const handleDelete = async () => {
    if (deletingDoc) {
      try {
        await deleteDocumentation(deletingDoc.id);
        setToast({ type: 'success', message: `Dokumentasi "${deletingDoc.title}" berhasil dihapus.` });
        setDeletingDoc(null);
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

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Camera size={22} className="text-purple-600" />
            <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
              Manajemen Dokumentasi BTS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola foto galeri behind-the-scenes dan liputan video penyiaran ({docs.length} item tersimpan di MongoDB).
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDoc(null);
            setIsEditorOpen(true);
          }}
          className="px-4 py-2.5 bg-purple-600 text-white font-medium text-xs rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Tambah BTS Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari dokumentasi, proyek, atau tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all font-sans"
          />
        </div>

        {/* Group & Type Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:border-purple-600 outline-none transition-all font-medium"
          >
            <option value="all">Semua Group</option>
            <option value="kampus">Kampus</option>
            <option value="magang">Magang</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:border-purple-600 outline-none transition-all font-medium"
          >
            <option value="all">Semua Tipe</option>
            <option value="photo">Foto BTS</option>
            <option value="video">Video BTS</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {filteredDocs.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-2">
          <span className="font-mono text-xs text-slate-400 font-semibold uppercase">[ TIDAK ADA DOKUMENTASI DITEMUKAN ]</span>
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
                    <th className="py-3 px-4">Dokumentasi & Thumbnail</th>
                    <th className="py-3 px-4">Tipe & Group</th>
                    <th className="py-3 px-4">Proyek Terkait</th>
                    <th className="py-3 px-4">Lokasi & Tanggal</th>
                    <th className="py-3 px-4 text-center">Media (Max 55)</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => {
                    const mediaItems = normalizeMedia(doc);
                    const mediaCount = mediaItems.length;
                    const primaryThumb = mediaItems[0]?.src || doc.mediaUrl || doc.thumbnailUrl;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Title & Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <img
                              src={primaryThumb || 'https://placehold.co/100x100/F1F5F9/64748B?text=No+Thumb'}
                              alt={doc.title}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100/F1F5F9/64748B?text=Error';
                              }}
                            />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm text-slate-900 truncate">
                                {doc.title}
                              </h3>
                              <span className="font-mono text-[10px] text-slate-400 truncate block">
                                ID: {doc.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type & Group Badge */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 font-mono text-[9px] font-bold uppercase w-fit">
                              {doc.type === 'video' ? 'Video Liputan' : 'Foto BTS'}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {doc.group}
                            </span>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {doc.project || '-'}
                        </td>

                        {/* Location & Date */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <div>{doc.location || '-'}</div>
                          <div className="font-mono text-[10px] text-slate-400">{doc.date || '-'}</div>
                        </td>

                        {/* Media Count Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium",
                            mediaCount > 0
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          )}>
                            {mediaCount} foto
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingDoc(doc);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Edit Dokumentasi"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Dokumentasi"
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
            {filteredDocs.map((doc) => {
              const mediaItems = normalizeMedia(doc);
              const mediaCount = mediaItems.length;
              const primaryThumb = mediaItems[0]?.src || doc.mediaUrl || doc.thumbnailUrl;

              return (
                <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={primaryThumb || 'https://placehold.co/100x100/F1F5F9/64748B?text=No+Thumb'}
                      alt={doc.title}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 font-mono text-[9px] font-bold uppercase inline-block mb-1">
                        {doc.group}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{doc.project || 'BTS'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
                    <span>{mediaCount} Media</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingDoc(doc);
                          setIsEditorOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 text-slate-700 font-sans font-medium rounded-lg text-xs hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingDoc(doc)}
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

      {/* Doc Editor Modal */}
      {isEditorOpen && (
        <DocEditorModal
          doc={editingDoc}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingDoc(null);
          }}
          onSuccess={() => {
            setToast({ type: 'success', message: 'Dokumentasi berhasil disimpan ke database MongoDB.' });
            loadData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <DeleteConfirmModal
          title={deletingDoc.title}
          category={deletingDoc.group}
          mediaCount={normalizeMedia(deletingDoc).length}
          onConfirm={handleDelete}
          onClose={() => setDeletingDoc(null)}
        />
      )}
    </div>
  );
}
