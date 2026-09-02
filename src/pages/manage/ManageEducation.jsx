import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, Edit, Trash2 } from 'lucide-react';
import { getEducation, deleteEducation, subscribeToDataChanges } from '../../lib/contentService';
import EducationEditorModal from '../../components/manage/EducationEditorModal';
import DeleteConfirmModal from '../../components/manage/DeleteConfirmModal';
import Toast from '../../components/manage/Toast';

export default function ManageEducation({ openNewModalTrigger }) {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEducation, setEditingEducation] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingEducation, setDeletingEducation] = useState(null);
  const [toast, setToast] = useState(null);

  const loadEducation = async () => {
    setLoading(true);
    try {
      const data = await getEducation();
      setEducationList(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memuat data pendidikan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEducation();
    const unsubscribe = subscribeToDataChanges(() => {
      loadEducation();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (openNewModalTrigger > 0) {
      setEditingEducation(null);
      setIsEditorOpen(true);
    }
  }, [openNewModalTrigger]);

  const handleDelete = async () => {
    if (!deletingEducation) return;
    try {
      await deleteEducation(deletingEducation.id);
      setToast({ type: 'success', message: `Pendidikan "${deletingEducation.institution}" berhasil dihapus.` });
      setDeletingEducation(null);
    } catch (err) {
      setToast({ type: 'error', message: `Gagal menghapus pendidikan: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Pendidikan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola riwayat pendidikan formal dan akademik.</p>
        </div>

        <button
          onClick={() => {
            setEditingEducation(null);
            setIsEditorOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>Tambah Pendidikan</span>
        </button>
      </div>

      {/* Data List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat data pendidikan...</div>
      ) : educationList.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
          Tidak ada riwayat pendidikan.
        </div>
      ) : (
        <div className="space-y-4">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <GraduationCap size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{edu.institution}</h3>
                    {edu.status && (
                      <span className="font-mono text-[10px] font-semibold text-indigo-600 uppercase tracking-wider px-2 py-0.5 bg-indigo-50 rounded-md">
                        {edu.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{edu.program}</p>
                  <p className="text-xs font-mono text-slate-400">{edu.date}</p>
                  {edu.gpa && (
                    <p className="text-xs font-mono text-indigo-600 font-medium">
                      {edu.gpaLabel || 'IPK'}: {edu.gpa}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    setEditingEducation(edu);
                    setIsEditorOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingEducation(edu)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <EducationEditorModal
          education={editingEducation}
          onClose={() => setIsEditorOpen(false)}
          onSuccess={() => {
            loadEducation();
            setToast({
              type: 'success',
              message: editingEducation ? 'Pendidikan berhasil diperbarui.' : 'Pendidikan baru berhasil ditambahkan.',
            });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEducation && (
        <DeleteConfirmModal
          title={`Hapus Pendidikan "${deletingEducation.institution}"?`}
          description="Riwayat pendidikan ini akan dihapus secara permanen dari MongoDB."
          onClose={() => setDeletingEducation(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
