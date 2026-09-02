import React, { useState } from 'react';
import { X, Save, AlertCircle, Filter } from 'lucide-react';
import ArrayFieldEditor from './ArrayFieldEditor';

export default function RoleFilterEditorModal({ filter = null, onClose, onSave }) {
  const isEditing = Boolean(filter);

  const [formData, setFormData] = useState({
    id: filter?.id || '',
    label: filter?.label || '',
    roles: Array.isArray(filter?.roles) ? filter.roles : (filter?.roles === null ? null : []),
    order: filter?.order || 1,
    isAllFilter: filter?.roles === null || filter?.id === 'all',
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
      setError('Label Filter wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID Filter wajib diisi.');
      return;
    }

    const rolesPayload = formData.isAllFilter
      ? null
      : (Array.isArray(formData.roles) ? formData.roles.filter((r) => r.trim()) : []);

    setIsSaving(true);
    try {
      await onSave({
        id: formData.id,
        label: formData.label,
        roles: rolesPayload,
        order: Number(formData.order) || 1,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan role filter.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-base text-slate-900">
                {isEditing ? `Edit Role Filter: ${filter.label}` : 'Tambah Role Filter Baru'}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                KONFIGURASI FILTER PERAN KARYA
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">
                Label Pill Filter (Display) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Produser / Penulis Naskah"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">
                ID Unique <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={formData.id}
                onChange={(e) => handleChange('id', generateSlug(e.target.value))}
                placeholder="producer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none disabled:opacity-60 font-mono"
              />
            </div>
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

          {/* Toggle for "Semua" filter */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="block font-semibold text-xs text-slate-800">Tampilkan Semua Karya (Null Matching)</span>
              <span className="text-[10px] text-slate-500">Gunakan opsi ini untuk filter "Semua" yang mencakup seluruh karya.</span>
            </div>
            <input
              type="checkbox"
              checked={formData.isAllFilter}
              onChange={(e) => handleChange('isAllFilter', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {!formData.isAllFilter && (
            <div className="pt-2">
              <ArrayFieldEditor
                label="Daftar String Role yang Cocok (Exact Role Match)"
                items={formData.roles || []}
                onChange={(updated) => handleChange('roles', updated)}
                placeholder="Produser / Asisten Produser / Produser & Host"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Karya dengan salah satu string `role` di atas akan muncul saat filter ini dipilih.
              </span>
            </div>
          )}

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
              className="px-5 py-2 text-xs font-medium rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Role Filter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
