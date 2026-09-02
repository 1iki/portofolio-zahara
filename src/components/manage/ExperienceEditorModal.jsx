import React, { useState } from 'react';
import { X, Save, AlertCircle, Briefcase } from 'lucide-react';
import ComboboxField from './ComboboxField';
import ArrayFieldEditor from './ArrayFieldEditor';
import MetricsEditor from './MetricsEditor';
import { createExperience, updateExperience, createOption, getExperienceCategories, createExperienceCategory } from '../../lib/contentService';

export default function ExperienceEditorModal({ experience = null, onClose, onSuccess }) {
  const isEditing = Boolean(experience);

  const [formData, setFormData] = useState({
    id: experience?.id || '',
    type: experience?.type || 'magang',
    position: experience?.position || '',
    organization: experience?.organization || '',
    location: experience?.location || '',
    startDate: experience?.startDate || '2026-01-01',
    endDate: experience?.endDate || '2026-04-30',
    dateLabel: experience?.dateLabel || 'Jan 2026 – Apr 2026',
    responsibilities: Array.isArray(experience?.responsibilities) ? experience.responsibilities : [],
    metrics: Array.isArray(experience?.metrics) ? experience.metrics : null,
  });

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handlePositionChange = (val) => {
    handleChange('position', val);
    if (!isEditing && !formData.id && formData.organization) {
      handleChange('id', generateSlug(`${formData.organization}-${val}`));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.position.trim()) {
      setError('Posisi / Jabatan wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID / Slug Pengalaman wajib diisi.');
      return;
    }

    const payload = {
      ...formData,
      responsibilities: Array.isArray(formData.responsibilities)
        ? formData.responsibilities.filter((r) => r.trim())
        : [],
      metrics: Array.isArray(formData.metrics) && formData.metrics.length > 0
        ? formData.metrics.filter((m) => m.value || m.label)
        : null,
    };

    setIsSaving(true);

    try {
      if (payload.organization?.trim()) {
        await createOption('institution', payload.organization).catch(() => {});
      }
      if (payload.type?.trim()) {
        try {
          const existingCats = await getExperienceCategories();
          const exists = Array.isArray(existingCats) && existingCats.some((c) => c.id === payload.type);
          if (!exists) {
            await createExperienceCategory({
              id: payload.type,
              label: payload.type.replace(/[-_]/g, ' ').toUpperCase(),
              subtitle: 'Pengalaman & Rekam Jejak',
              order: (existingCats?.length || 0) + 1,
            });
          }
        } catch (catErr) {
          console.warn('[ExperienceEditorModal] Auto-upsert exp-category error:', catErr);
        }
      }

      if (isEditing) {
        await updateExperience(experience.id, payload);
      } else {
        await createExperience(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengalaman ke database MongoDB.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900">
                {isEditing ? `Edit Pengalaman: ${experience.position}` : 'Tambah Pengalaman Baru'}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                FORMULIR MANAGEMENT PENGALAMAN & ORGANISASI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Informasi Utama */}
          <div className="space-y-4">
            <span className="font-mono text-[11px] text-emerald-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 1. INFORMASI UTAMA ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">
                  Posisi / Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  placeholder="Content Creator & Reporter"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              <ComboboxField
                label="Institusi / Organisasi"
                type="institution"
                value={formData.organization}
                onChange={(val) => handleChange('organization', val)}
                placeholder="Pilih atau cari..."
              />

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
                  placeholder="rri-bogor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Tipe Pengalaman</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                >
                  <option value="magang">Magang / Pengalaman Profesional</option>
                  <option value="organisasi">Organisasi / Kepemimpinan</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Lokasi / Kota</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Jakarta / Bogor"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Waktu / Periode */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-emerald-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 2. PERIODE PENGALAMAN ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Label Periode (Display)</label>
                <input
                  type="text"
                  value={formData.dateLabel}
                  onChange={(e) => handleChange('dateLabel', e.target.value)}
                  placeholder="Jan 2026 – Apr 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Start Date (ISO Sort)</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">End Date (ISO Sort)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Responsibilities Array Editor */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-emerald-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 3. TUGAS & KONTRIBUSI ]
            </span>
            <ArrayFieldEditor
              label="Daftar Tanggung Jawab / Bullet Points"
              items={formData.responsibilities}
              onChange={(updated) => handleChange('responsibilities', updated)}
              placeholder="Memproduksi 50 berita digital..."
            />
          </div>

          {/* Section 4: Metrics Object Array Editor */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-emerald-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 4. METRICS / OUTPUT KUANTITATIF ]
            </span>
            <MetricsEditor
              metrics={formData.metrics}
              onChange={(updated) => handleChange('metrics', updated)}
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
              className="px-5 py-2 text-xs font-medium rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengalaman'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
