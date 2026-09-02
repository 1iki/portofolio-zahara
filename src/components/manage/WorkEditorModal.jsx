import React, { useState } from 'react';
import { X, Save, AlertCircle, FolderKanban } from 'lucide-react';
import MediaManager from './MediaManager';
import ComboboxField from './ComboboxField';
import { createWork, updateWork, createOption, getWorkCategories, createWorkCategory } from '../../lib/contentService';
import { normalizeMedia } from '../../lib/mediaUtils';

export default function WorkEditorModal({ work = null, onClose, onSuccess }) {
  const isEditing = Boolean(work);

  const [formData, setFormData] = useState({
    id: work?.id || '',
    title: work?.title || '',
    program: work?.program || '',
    category: work?.category || 'kampus',
    role: work?.role || '',
    date: work?.date || '',
    startDate: work?.startDate || '2025-01-01',
    endDate: work?.endDate || '2025-12-31',
    platform: work?.platform || 'YouTube',
    link: work?.link || '',
    mediaType: work?.mediaType || 'youtube',
    thumbnail: work?.thumbnail || '',
    thumbnailType: work?.thumbnailType || '',
    videoUrl: work?.videoUrl || '',
    externalUrl: work?.externalUrl || '',
    embedUrl: work?.embedUrl || '',
    aspectRatio: work?.aspectRatio || '',
    organization: work?.organization || 'Politeknik Negeri Media Kreatif',
    description: work?.description || '',
    output: work?.output || '',
    type: work?.type || '',
    featuredEpisode: work?.featuredEpisode || null,
    source: work?.source || 'CMS',
    media: work?.media || (work?.thumbnail ? [work.thumbnail] : []),
  });

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeaturedEpisodeChange = (subfield, value) => {
    setError(null);
    setFormData((prev) => {
      const current = prev.featuredEpisode || { title: '', link: '' };
      const updated = { ...current, [subfield]: value };
      if (!updated.title && !updated.link) return { ...prev, featuredEpisode: null };
      return { ...prev, featuredEpisode: updated };
    });
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
      handleChange('id', generateSlug(val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Judul Karya wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID / Slug Karya wajib diisi.');
      return;
    }
    if (!formData.role.trim()) {
      setError('Peran (Role) Zahara wajib diisi.');
      return;
    }

    // Ensure primary thumbnail is synced with media[0]
    const normalizedMedia = normalizeMedia(formData);
    const primaryThumb = normalizedMedia[0]?.src || formData.thumbnail || null;

    const payload = {
      ...formData,
      program: formData.program.trim() || null,
      link: formData.link.trim() || null,
      thumbnailType: formData.thumbnailType.trim() || null,
      embedUrl: formData.embedUrl.trim() || null,
      aspectRatio: formData.aspectRatio.trim() || null,
      thumbnail: primaryThumb,
      media: normalizedMedia,
    };

    setIsSaving(true);

    try {
      // 1. Upsert dynamic options to MongoDB on submit
      await Promise.all([
        ['production_category', payload.category],
        ['institution', payload.organization],
        ['distribution_platform', payload.platform],
      ].filter(([, value]) => value && value.trim()).map(([type, value]) => createOption(type, value).catch(() => {})));

      // 2. Ensure category is registered in work-categories MongoDB collection
      if (payload.category) {
        try {
          const existingCategories = await getWorkCategories();
          const exists = Array.isArray(existingCategories) && existingCategories.some((c) => c.id === payload.category);
          if (!exists) {
            await createWorkCategory({
              id: payload.category,
              label: payload.category.replace(/[-_]/g, ' ').toUpperCase(),
              subtitle: 'Kategori Produksi Karya',
              order: (existingCategories?.length || 0) + 1,
            });
          }
        } catch (catErr) {
          console.warn('[WorkEditorModal] Auto-upsert work-category error:', catErr);
        }
      }

      if (isEditing) {
        await updateWork(work.id, payload);
      } else {
        await createWork(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan karya ke database MongoDB.');
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
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FolderKanban size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900">
                {isEditing ? `Edit Karya: ${work.title}` : 'Tambah Karya Baru'}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                FORMULIR MANAGEMENT PORTOFOLIO
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
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 1. INFORMASI UTAMA ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">
                  Judul Karya <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Misal: Jejak Flona"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">
                  Program / Subjudul (Optional)
                </label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) => handleChange('program', e.target.value)}
                  placeholder="Misal: Ramadan Comedy Series"
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
                  placeholder="jejak-flona"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ComboboxField
                label="Kategori Produksi"
                required
                type="production_category"
                value={formData.category}
                onChange={(val) => handleChange('category', val)}
                placeholder="Pilih atau cari..."
              />

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">
                  Peran / Role Zahara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="Misal: Produser & Penulis Naskah"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                />
              </div>

              <ComboboxField
                label="Institusi / Instansi"
                type="institution"
                value={formData.organization}
                onChange={(val) => handleChange('organization', val)}
                placeholder="Pilih atau cari..."
              />
            </div>
          </div>

          {/* Section 2: Waktu & Distribusi */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 2. TANGGAL & MEDIA DISTRIBUSI ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Label Periode (Display)</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  placeholder="Agu 2025 – Jul 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Start Date (Sort)</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">End Date (Sort)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComboboxField
                label="Platform Distribusi"
                type="distribution_platform"
                value={formData.platform}
                onChange={(val) => handleChange('platform', val)}
                placeholder="Pilih atau cari..."
              />

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Tipe Media Playable</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => handleChange('mediaType', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                >
                  <option value="youtube">YouTube (Video Player)</option>
                  <option value="drive">Google Drive (Embed Viewer)</option>
                  <option value="instagram">Instagram</option>
                  <option value="image">Image Gallery Only</option>
                  <option value="social">Social Media Post</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Video Embed URL (YouTube/Drive)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleChange('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">TikTok / Social Embed URL</label>
                <input
                  type="url"
                  value={formData.embedUrl}
                  onChange={(e) => handleChange('embedUrl', e.target.value)}
                  placeholder="https://www.tiktok.com/embed/v2/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">External Link URL</label>
                <input
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => handleChange('externalUrl', e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Legacy Direct Link URL</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Tipe Thumbnail (Optional)</label>
                <input
                  type="text"
                  value={formData.thumbnailType}
                  onChange={(e) => handleChange('thumbnailType', e.target.value)}
                  placeholder="official / project_artwork"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Aspect Ratio Overrides (Optional)</label>
                <input
                  type="text"
                  value={formData.aspectRatio}
                  onChange={(e) => handleChange('aspectRatio', e.target.value)}
                  placeholder="portrait / 16 / 9 / 4 / 5"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Deskripsi Karya */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 3. DESKRIPSI & OUTPUT PRODUKSI ]
            </span>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">Deskripsi Karya</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tuliskan deskripsi mengenai karya, tantangan produksi, dan pencapaian..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Output / Jumlah Produksi</label>
                <input
                  type="text"
                  value={formData.output}
                  onChange={(e) => handleChange('output', e.target.value)}
                  placeholder="Misal: 10 Episode / 34 Konten Harian"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Sub-Tipe Konten</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  placeholder="variety / sitcom / news / talkshow"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Sumber (Source Provenance)</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  placeholder="LinkedIn / PDF / CMS"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>

            {/* Featured Episode Object Sub-Form */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                Episode Unggulan / Featured Episode (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Judul Episode Unggulan</label>
                  <input
                    type="text"
                    value={formData.featuredEpisode?.title || ''}
                    onChange={(e) => handleFeaturedEpisodeChange('title', e.target.value)}
                    placeholder="Misal: Misteri Telur Keong"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Link Episode Unggulan (URL)</label>
                  <input
                    type="url"
                    value={formData.featuredEpisode?.link || ''}
                    onChange={(e) => handleFeaturedEpisodeChange('link', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Image Manager */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 4. MANAJEMEN GALERI MULTI-GAMBAR ]
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
              className="px-5 py-2 text-xs font-medium rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Karya'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
