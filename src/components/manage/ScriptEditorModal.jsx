import React, { useState, useRef } from 'react';
import { X, Save, AlertCircle, FileText, Upload, CheckCircle2, FileCheck, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import ComboboxField from './ComboboxField';
import ArrayFieldEditor from './ArrayFieldEditor';
import { createScript, updateScript, uploadScriptPdf, cleanupUploadedScriptPdf, createOption } from '../../lib/contentService';

const SCRIPT_CATEGORY_OPTIONS = [
  { value: 'comedy', normalizedValue: 'comedy' },
  { value: 'variety', normalizedValue: 'variety' },
  { value: 'news', normalizedValue: 'news' },
];

export default function ScriptEditorModal({ script = null, onClose, onSuccess }) {
  const isEditing = Boolean(script);

  const [formData, setFormData] = useState({
    id: script?.id || '',
    title: script?.title || '',
    program: script?.program || '',
    episode: script?.episode || '',
    category: script?.category || 'comedy',
    role: script?.role || '',
    date: script?.date || '',
    organization: script?.organization || '',
    previewPercentage: script?.previewPercentage ?? 100,
    previewPageCount: script?.previewPageCount || '',
    description: script?.description || '',
    thumbnailUrl: script?.thumbnailUrl || '/naskah/salah-pintu-ep01.png',
    previewImageUrl: script?.previewImageUrl || '/naskah/salah-pintu-ep01.png',
    format: script?.format || 'Screenplay / Format Sitkom',
    tags: Array.isArray(script?.tags) ? script.tags : [],
    externalUrl: script?.externalUrl || '',
    pdfUrl: script?.pdfUrl || '',
    pdfPublicId: script?.pdfPublicId || '',
    previewImagePublicId: script?.previewImagePublicId || '',
    pdfFileName: script?.pdfFileName || script?.originalFilename || '',
    originalFilename: script?.originalFilename || script?.pdfFileName || '', // legacy alias
    pageCount: script?.pageCount || null,
  });

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [documentState, setDocumentState] = useState(script?.pdfUrl ? 'SAVED' : 'IDLE');

  const fileInputRef = useRef(null);

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
      handleChange('id', generateSlug(val));
    }
  };

  // PDF File Selection & Cloudinary Upload Handler
  const handlePdfUpload = async (file) => {
    setError(null);
    setUploadSuccess(false);

    if (!file) return;

    // File validation
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('File harus berformat PDF (.pdf).');
      return;
    }

    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file PDF melebihi batas ${maxSizeMB}MB.`);
      return;
    }

    setDocumentState('SELECTED');
    setIsUploading(true);
    setDocumentState('UPLOADING');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          // Each upload gets a new immutable public ID. This prevents a replacement
          // from overwriting the currently published PDF before MongoDB commits.
          const customId = formData.id ? `script-${formData.id}-${Date.now()}` : null;
          const uploaded = await uploadScriptPdf(base64Data, customId);

          setFormData((prev) => ({
            ...prev,
            pdfUrl: uploaded.pdfUrl,
            pdfPublicId: uploaded.pdfPublicId,
            previewImageUrl: uploaded.previewImageUrl || prev.previewImageUrl,
            thumbnailUrl: uploaded.previewImageUrl || prev.thumbnailUrl,
            previewImagePublicId: uploaded.previewImagePublicId || '',
            pdfFileName: uploaded.pdfFileName || uploaded.originalFilename || file.name,
            originalFilename: uploaded.pdfFileName || uploaded.originalFilename || file.name,
            pageCount: uploaded.pageCount || prev.pageCount,
          }));

          setUploadSuccess(true);
          setDocumentState('UPLOADED');
        } catch (uploadErr) {
          setDocumentState('ERROR');
          setError(uploadErr.message || 'Gagal mengunggah PDF ke Cloudinary.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Gagal membaca file lokal.');
        setDocumentState('ERROR');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Gagal memproses file PDF.');
      setDocumentState('ERROR');
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Judul Naskah wajib diisi.');
      return;
    }
    if (!formData.id.trim()) {
      setError('ID / Slug Naskah wajib diisi.');
      return;
    }

    const pct = Number(formData.previewPercentage);
    const safePct = (!Number.isFinite(pct) || pct < 1 || pct > 100) ? 100 : Math.round(pct);

    // Auto-compute previewPageCount label from percentage + pageCount
    let computedLabel = `${safePct}% Cuplikan`;
    if (formData.pageCount && Number.isInteger(formData.pageCount) && formData.pageCount > 0) {
      const previewPages = Math.max(1, Math.round(formData.pageCount * safePct / 100));
      computedLabel = `Halaman 1\u2013${previewPages} dari ${formData.pageCount} Halaman (${safePct}% Cuplikan)`;
    }

    const payload = {
      ...formData,
      previewPercentage: safePct,
      previewPageCount: computedLabel,
      tags: Array.isArray(formData.tags) ? formData.tags.filter((t) => t.trim()) : [],
      program: formData.program.trim() || null,
      episode: formData.episode.trim() || null,
      externalUrl: formData.externalUrl.trim() || null,
      pdfUrl: formData.pdfUrl.trim() || null,
      pdfPublicId: formData.pdfPublicId.trim() || null,
      previewImagePublicId: formData.previewImagePublicId.trim() || null,
      pdfFileName: formData.pdfFileName.trim() || formData.originalFilename.trim() || null,
      originalFilename: formData.pdfFileName.trim() || formData.originalFilename.trim() || null,
    };

    setIsSaving(true);
    setDocumentState('SAVING');

    try {
      // Naskah taxonomy values are only written after the editor is submitted.
      await Promise.all([
        ['script_category', payload.category],
        ['institution', payload.organization],
        ['script_format', payload.format],
        ['script_role', payload.role],
      ].filter(([, value]) => value && value.trim()).map(([type, value]) => createOption(type, value).catch(() => {})));

      if (isEditing) {
        await updateScript(script.id, payload);
      } else {
        await createScript(payload);
      }
      setDocumentState('SAVED');
      onSuccess();
      onClose();
    } catch (err) {
      setDocumentState('ERROR');
      setError(err.message || 'Gagal menyimpan naskah ke database MongoDB.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async () => {
    // Upload is intentionally cleaned up when it has not been committed to MongoDB.
    if (formData.pdfPublicId && formData.pdfPublicId !== script?.pdfPublicId && documentState !== 'SAVED') {
      try { await cleanupUploadedScriptPdf(formData.pdfPublicId); } catch { /* save error is already visible; do not block closing */ }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900">
                {isEditing ? `Edit Naskah: ${script.title}` : 'Tambah Naskah Baru'}
              </h2>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                WORKFLOW PENGELOLAAN NASKAH & DOKUMEN PDF
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
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

          {/* Section 1: Informasi Utama Naskah */}
          <div className="space-y-4">
            <span className="font-mono text-[11px] text-amber-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 1. INFORMASI NASKAH ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">
                  Judul Naskah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="RRI Bogor — Salah Pintu"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Nama Program</label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) => handleChange('program', e.target.value)}
                  placeholder="Ramadan Comedy Series"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none"
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
                  placeholder="rri-salah-pintu-ep01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none disabled:opacity-60 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Episode / Sub-Judul</label>
                <input
                  type="text"
                  value={formData.episode}
                  onChange={(e) => handleChange('episode', e.target.value)}
                  placeholder="Episode 01: Dikejar Debt Collector"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none"
                />
              </div>

              <ComboboxField
                label="Kategori Naskah"
                type="script_category"
                value={formData.category}
                onChange={(value) => handleChange('category', value)}
                placeholder="Pilih atau cari kategori..."
                defaultOptions={SCRIPT_CATEGORY_OPTIONS}
                createOnSelect={false}
              />

              <ComboboxField
                label="Peran Penulis"
                type="script_role"
                value={formData.role}
                onChange={(value) => handleChange('role', value)}
                placeholder="Pilih atau cari peran..."
                createOnSelect={false}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Tanggal Produksi</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  placeholder="Januari 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none font-mono"
                />
              </div>

              <ComboboxField
                label="Institusi / Instansi"
                type="institution"
                value={formData.organization}
                onChange={(val) => handleChange('organization', val)}
                placeholder="Pilih atau cari..."
                createOnSelect={false}
              />

              <ComboboxField
                label="Format Naskah"
                type="script_format"
                value={formData.format}
                onChange={(value) => handleChange('format', value)}
                placeholder="Pilih atau cari format..."
                createOnSelect={false}
              />
            </div>

            {/* Tags Array Editor */}
            <div>
              <ArrayFieldEditor
                label="Tags & Sub-Kategori"
                items={formData.tags}
                onChange={(updated) => handleChange('tags', updated)}
                placeholder="Sitkom / Comedy / Scriptwriter"
              />
            </div>
          </div>

          {/* Section 2: Deskripsi & Cuplikan */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-amber-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 2. DESKRIPSI & CUPLIKAN ]
            </span>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">Deskripsi Ringkasan Naskah</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Naskah situasi komedi episode perdana KMB RRI Bogor..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Persentase Preview Naskah</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={formData.previewPercentage}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { handleChange('previewPercentage', ''); return; }
                      const num = parseInt(raw, 10);
                      if (!isNaN(num)) handleChange('previewPercentage', Math.max(1, Math.min(100, num)));
                    }}
                    onBlur={() => {
                      const num = Number(formData.previewPercentage);
                      if (!Number.isFinite(num) || num < 1 || num > 100) handleChange('previewPercentage', 100);
                    }}
                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none font-mono text-center"
                  />
                  <span className="text-xs text-slate-500 font-medium">%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleChange('previewPercentage', pct)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono transition-all cursor-pointer border ${
                        Number(formData.previewPercentage) === pct
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                {formData.pageCount && Number(formData.pageCount) > 0 && (
                  <p className="mt-2 text-[10px] font-mono text-slate-400">
                    Preview: Halaman 1\u2013{Math.max(1, Math.round(Number(formData.pageCount) * (Number(formData.previewPercentage) || 100) / 100))} dari {formData.pageCount} halaman
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">External Link / Drive URL (Optional)</label>
                <input
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => handleChange('externalUrl', e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status Dokumen PDF & Preview */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-amber-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 3. STATUS DOKUMEN PDF & PREVIEW ]
            </span>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <FileCheck size={16} className={formData.pdfUrl ? "text-emerald-600" : "text-amber-600"} />
                  Status Dokumen PDF:
                </span>
                {formData.pdfUrl ? (
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    PDF CLOUDINARY READY
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-mono font-semibold">
                    BELUM ADA FILE PDF
                  </span>
                )}
              </div>

              {formData.pdfUrl && (
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs font-mono text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Nama File Original:</span>
                    <span className="text-slate-900 font-medium truncate max-w-xs">{formData.pdfFileName || 'naskah.pdf'}</span>
                  </div>
                  {formData.pageCount && (
                    <div className="flex justify-between items-center">
                      <span>Total Halaman PDF:</span>
                      <span className="text-slate-900 font-semibold">{formData.pageCount} Halaman</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span>URL PDF Cloudinary:</span>
                    <a
                      href={formData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 font-semibold hover:underline flex items-center gap-1 truncate max-w-xs"
                    >
                      Buka PDF <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Preview Image URL Controls */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Preview Image URL</label>
                  <input
                    type="text"
                    value={formData.previewImageUrl}
                    onChange={(e) => handleChange('previewImageUrl', e.target.value)}
                    placeholder="/naskah/salah-pintu-ep01.png"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Thumbnail Asset URL</label>
                  <input
                    type="text"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                    placeholder="/naskah/salah-pintu-ep01.png"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Upload PDF Dropzone */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-amber-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 4. UPLOAD DOKUMEN PDF KE CLOUDINARY ]
            </span>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-3 cursor-pointer transition-all ${
                dragActive
                  ? 'border-amber-500 bg-amber-50/80 scale-[0.99]'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-amber-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => e.target.files && handlePdfUpload(e.target.files[0])}
                className="hidden"
              />

              {isUploading ? (
                <div className="py-4 space-y-2">
                  <Loader2 size={32} className="mx-auto text-amber-600 animate-spin" />
                  <p className="font-semibold text-xs text-amber-700">Mengunggah PDF ke Cloudinary & Menggenerasi Preview...</p>
                  <span className="text-[10px] font-mono text-slate-400">Harap tunggu sebentar...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                    <Upload size={22} />
                  </div>

                  <div>
                    <p className="font-semibold text-xs text-slate-800">
                      Tarik & Taruh file PDF di sini, atau <span className="text-amber-600 underline">Pilih File</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Format: PDF (.pdf) • Maksimal: 20MB • Cloudinary Storage
                    </p>
                  </div>

                  {uploadSuccess && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      <CheckCircle2 size={14} />
                      <span>PDF Berhasil Diunggah & Di-link!</span>
                    </div>
                  )}
                  <p className="text-[10px] font-mono text-slate-500">STATE: {documentState}</p>
                </>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-5 py-2 text-xs rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Naskah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
