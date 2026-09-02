import React, { useState } from 'react';
import { X, Save, AlertCircle, Layers } from 'lucide-react';

export default function CategoryEditorModal({ category = null, categoryType = 'work', onClose, onSave }) {
  const isEditing = Boolean(category);

  const [formData, setFormData] = useState({
    id: category?.id || '',
    label: category?.label || '',
    subtitle: category?.subtitle || '',
    order: category?.order || 1,
  });

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, val) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleLabelChange = (val) => {
    handleChange('label', val);
    if (!isEditing && !formData.id) {
      handleChange('id', generateSlug(val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.label.trim()) {
      setError('Label Kategori wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID / Slug Kategori wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        order: Number(formData.order) || 1,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  const titlePrefix = categoryType === 'work' ? 'Kategori Karya' : 'Kategori Pengalaman';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-base text-slate-900">
                {isEditing ? `Edit ${titlePrefix}: ${category.label}` : `Tambah ${titlePrefix} Baru`}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                KONFIGURASI HIERARKI PRODUKSI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-xs text-slate-700 mb-1">
              Label Kategori (Display) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="MAGANG / KAMPUS / POLIMEDIA TV"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-xs text-slate-700 mb-1">
              ID / Slug Unique <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={formData.id}
              onChange={(e) => handleChange('id', generateSlug(e.target.value))}
              placeholder="magang"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none disabled:opacity-60 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-xs text-slate-700 mb-1">Subtitle / Keterangan Kategori</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Pengalaman Profesional / Politeknik Negeri Media Kreatif"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-xs text-slate-700 mb-1">Urutan Tampilan (Order Index)</label>
            <input
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => handleChange('order', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-medium rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Kategori'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
