import React, { useState } from 'react';
import { X, Save, AlertCircle, GraduationCap } from 'lucide-react';
import ComboboxField from './ComboboxField';
import { createEducation, updateEducation, createOption } from '../../lib/contentService';

export default function EducationEditorModal({ education = null, onClose, onSuccess }) {
  const isEditing = Boolean(education);

  const [formData, setFormData] = useState({
    id: education?.id || '',
    institution: education?.institution || '',
    program: education?.program || '',
    date: education?.date || '',
    status: education?.status || '',
    graduationDate: education?.graduationDate || '',
    gpa: education?.gpa || '',
    gpaLabel: education?.gpaLabel || 'IPK',
    gpaNote: education?.gpaNote || '',
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

  const handleInstitutionChange = (val) => {
    handleChange('institution', val);
    if (!isEditing && !formData.id) {
      handleChange('id', `edu-${generateSlug(val)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.institution.trim()) {
      setError('Nama Institusi wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID / Slug Pendidikan wajib diisi.');
      return;
    }

    const payload = {
      ...formData,
      status: formData.status.trim() || null,
      graduationDate: formData.graduationDate.trim() || null,
      gpaNote: formData.gpaNote.trim() || null,
    };

    setIsSaving(true);

    try {
      await createOption('institution', payload.institution);

      if (isEditing) {
        await updateEducation(education.id, payload);
      } else {
        await createEducation(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pendidikan ke database MongoDB.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900">
                {isEditing ? `Edit Pendidikan: ${education.institution}` : 'Tambah Pendidikan Baru'}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                FORMULIR MANAGEMENT RIWAYAT PENDIDIKAN
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
            <span className="font-mono text-[11px] text-indigo-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 1. INFORMASI INSTITUSI ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComboboxField
                label="Nama Institusi / Sekolah"
                required
                type="institution"
                value={formData.institution}
                onChange={(val) => handleInstitutionChange(val)}
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
                  placeholder="edu-polimedia"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">Program Studi / Jurusan</label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => handleChange('program', e.target.value)}
                placeholder="Program Studi Penyiaran – Jurusan Ilmu Komunikasi"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">Label Tanggal & Lokasi (Display)</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                placeholder="Jakarta, Agustus 2023 – Agustus 2026"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 2: Status & IPK */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-indigo-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 2. STATUS & IPK / NILAI ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Status Kelulusan</label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  placeholder="Lulus / Yudisium"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Tanggal Kelulusan</label>
                <input
                  type="text"
                  value={formData.graduationDate}
                  onChange={(e) => handleChange('graduationDate', e.target.value)}
                  placeholder="19 Agustus 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Nilai / IPK</label>
                <input
                  type="text"
                  value={formData.gpa}
                  onChange={(e) => handleChange('gpa', e.target.value)}
                  placeholder="3.74"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Label Nilai</label>
                <input
                  type="text"
                  value={formData.gpaLabel}
                  onChange={(e) => handleChange('gpaLabel', e.target.value)}
                  placeholder="IPK / Nilai Rata-Rata"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Catatan Nilai (Optional)</label>
                <input
                  type="text"
                  value={formData.gpaNote}
                  onChange={(e) => handleChange('gpaNote', e.target.value)}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
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
              className="px-5 py-2 text-xs font-medium rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pendidikan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
