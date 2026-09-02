import React, { useState } from 'react';
import { X, Save, AlertCircle, Camera } from 'lucide-react';
import MediaManager from './MediaManager';
import { createDocumentation, updateDocumentation } from '../../lib/contentService';
import { normalizeMedia } from '../../lib/mediaUtils';

export default function DocEditorModal({ doc = null, onClose, onSuccess }) {
  const isEditing = Boolean(doc);

  const [formData, setFormData] = useState({
    id: doc?.id || '',
    type: doc?.type || 'photo',
    group: doc?.group || 'kampus',
    title: doc?.title || '',
    project: doc?.project || '',
    role: doc?.role || '',
    location: doc?.location || '',
    date: doc?.date || '',
    mediaUrl: doc?.mediaUrl || '',
    thumbnailUrl: doc?.thumbnailUrl || '',
    media: doc?.media || (doc?.mediaUrl ? [doc.mediaUrl] : []),
    description: doc?.description || '',
    tags: Array.isArray(doc?.tags) ? doc.tags.join(', ') : doc?.tags || '',
    aspectRatio: doc?.aspectRatio || '4 / 5',
    videoEmbedUrl: doc?.videoEmbedUrl || '',
    externalUrl: doc?.externalUrl || '',
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

  const handleTitleChange = (val) => {
    handleChange('title', val);
    if (!isEditing && !formData.id) {
      handleChange('id', `bts-${generateSlug(val)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Judul Dokumentasi wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID / Slug Dokumentasi wajib diisi.');
      return;
    }

    // Parse tags array
    const tagArray = typeof formData.tags === 'string'
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags;

    // Normalize media array
    const normalizedMedia = normalizeMedia(formData);
    const primaryThumb = normalizedMedia[0]?.src || formData.mediaUrl || formData.thumbnailUrl || null;

    const payload = {
      ...formData,
      tags: tagArray,
      mediaUrl: primaryThumb,
      thumbnailUrl: primaryThumb,
      media: normalizedMedia,
    };

    setIsSaving(true);

    try {
      if (isEditing) {
        await updateDocumentation(doc.id, payload);
      } else {
        await createDocumentation(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan dokumentasi ke MongoDB.');
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
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900">
                {isEditing ? `Edit Dokumentasi: ${doc.title}` : 'Tambah Dokumentasi BTS Baru'}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                FORMULIR MANAGEMENT DOKUMENTASI & BTS
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

          {/* Section 1: Detail Utama */}
          <div className="space-y-4">
            <span className="font-mono text-[11px] text-purple-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 1. INFORMASI UTAMA ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">
                  Judul Dokumentasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Misal: Proses Shooting Jejak Flona"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
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
                  placeholder="bts-jejak-flona"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Tipe Content</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none transition-all"
                >
                  <option value="photo">Foto BTS</option>
                  <option value="video">Video BTS & Liputan</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Kelompok Group</label>
                <select
                  value={formData.group}
                  onChange={(e) => handleChange('group', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none transition-all"
                >
                  <option value="kampus">KAMPUS (Polimedia)</option>
                  <option value="magang">MAGANG (RRI / Industri)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Proyek Terkait</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => handleChange('project', e.target.value)}
                  placeholder="Jejak Flona"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Metadata */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-purple-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 2. PERAN & LOKASI ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Peran / Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="Produser & Penulis Naskah"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Studio 2 Polimedia Jakarta"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Waktu / Tanggal</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  placeholder="September 2025"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">YouTube Video Embed URL (jika video)</label>
                <input
                  type="url"
                  value={formData.videoEmbedUrl}
                  onChange={(e) => handleChange('videoEmbedUrl', e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">External Video Link</label>
                <input
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => handleChange('externalUrl', e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">Tags (Pisahkan dengan koma)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="BTS Shooting, Variety Show, Polimedia"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">Deskripsi Dokumentasi</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tuliskan keterangan dokumentasi di balik layar ini..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          {/* Section 3: Multi-Image Manager */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-purple-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 3. MANAJEMEN GALERI FOTO BTS ]
            </span>
            <MediaManager
              mediaList={formData.media}
              onChange={(updatedMedia) => handleChange('media', updatedMedia)}
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
              className="px-5 py-2 text-xs font-medium rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Dokumentasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
