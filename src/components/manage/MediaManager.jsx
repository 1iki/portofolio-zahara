import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  ImageIcon, 
  AlertCircle,
  Upload,
  Loader2,
  Cloud
} from 'lucide-react';
import { MAX_MEDIA } from '../../lib/mediaUtils';
import { uploadMediaToCloudinary } from '../../lib/contentService';
import { cn } from '../../lib/utils';

export default function MediaManager({ mediaList = [], onChange }) {
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [newAspectRatio, setNewAspectRatio] = useState('4 / 5');
  const [newMediaType, setNewMediaType] = useState('image');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Normalize incoming list
  const media = mediaList.map((item, idx) => {
    if (typeof item === 'string') {
      return { src: item, alt: `Foto ${idx + 1}`, aspectRatio: '4 / 5', type: 'image' };
    }
    return {
      src: item.src || item.url || '',
      alt: item.alt || `Foto ${idx + 1}`,
      aspectRatio: item.aspectRatio || '4 / 5',
      type: item.type || 'image',
      videoEmbedUrl: item.videoEmbedUrl || item.videoUrl || null,
      publicId: item.publicId || null,
    };
  });

  const isMaxReached = media.length >= MAX_MEDIA;

  // Direct Cloudinary Upload Handler
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(null);
    if (isMaxReached) {
      setError(`Batas maksimum ${MAX_MEDIA} media telah tercapai.`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const base64Data = event.target.result;
        const uploaded = await uploadMediaToCloudinary(base64Data);

        const newItem = {
          src: uploaded.src,
          alt: selectedFile.name.replace(/\.[^/.]+$/, ''),
          aspectRatio: uploaded.aspectRatio || newAspectRatio,
          type: uploaded.type || 'image',
          publicId: uploaded.publicId,
        };

        const updated = [...media, newItem];
        onChange(updated);
      } catch (err) {
        setError(`Gagal upload ke Cloudinary: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleAddMedia = (e) => {
    e.preventDefault();
    setError(null);

    if (isMaxReached) {
      setError(`Batas maksimum ${MAX_MEDIA} media telah tercapai.`);
      return;
    }

    if (!newUrl.trim()) {
      setError('Masukkan URL gambar atau asset.');
      return;
    }

    const newItem = {
      src: newUrl.trim(),
      alt: newAlt.trim() || `Gambar ${media.length + 1}`,
      aspectRatio: newAspectRatio,
      type: newMediaType,
      ...(newMediaType === 'video' && newVideoUrl.trim() ? { videoEmbedUrl: newVideoUrl.trim() } : {})
    };

    const updated = [...media, newItem];
    onChange(updated);
    setNewUrl('');
    setNewAlt('');
    setNewVideoUrl('');
  };

  const handleRemoveMedia = (index) => {
    const updated = media.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const target = media[index];
    const rest = media.filter((_, idx) => idx !== index);
    const updated = [target, ...rest];
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    const updated = [...media];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header & Counter */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-blue-600" />
          <h3 className="font-sans text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Galeri Multi-Gambar ({media.length} / {MAX_MEDIA})
          </h3>
        </div>
        <span className={cn(
          "font-mono text-[10px] px-2.5 py-0.5 rounded-full border font-semibold",
          isMaxReached 
            ? "bg-red-50 text-red-600 border-red-200" 
            : "bg-blue-50 text-blue-600 border-blue-200"
        )}>
          {isMaxReached ? 'MAKSIMUM 55 MEDIA' : `${MAX_MEDIA - media.length} Slot Tersisa`}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Media Form & Cloudinary Uploader */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">
            + Tambah Media Baru
          </span>

          {/* Cloudinary Direct File Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isMaxReached || isUploading}
              className="hidden"
              id="cloudinary-upload-input"
            />
            <label
              htmlFor="cloudinary-upload-input"
              className={cn(
                "px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 font-medium text-xs rounded-xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 shadow-xs",
                (isMaxReached || isUploading) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Cloud size={14} />
                  <span>Upload File ke Cloudinary</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            placeholder="URL Gambar (Cloudinary / HTTPS)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            disabled={isMaxReached}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none font-sans"
          />
          <input
            type="text"
            placeholder="Keterangan / Alt text"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            disabled={isMaxReached}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={newAspectRatio}
              onChange={(e) => setNewAspectRatio(e.target.value)}
              disabled={isMaxReached}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-blue-600 outline-none font-medium"
            >
              <option value="4 / 5">Ratio 4:5 (Portrait Standard)</option>
              <option value="16 / 9">Ratio 16:9 (Landscape Video/Photo)</option>
              <option value="9 / 16">Ratio 9:16 (Reels / TikTok)</option>
              <option value="1 / 1">Ratio 1:1 (Square)</option>
            </select>

            <select
              value={newMediaType}
              onChange={(e) => setNewMediaType(e.target.value)}
              disabled={isMaxReached}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-blue-600 outline-none font-medium"
            >
              <option value="image">Tipe: Foto / Image</option>
              <option value="video">Tipe: Video Embed</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddMedia}
            disabled={isMaxReached || !newUrl.trim()}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah URL Gambar</span>
          </button>
        </div>
      </div>

      {/* Media Grid / List */}
      {media.length === 0 ? (
        <div className="py-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-mono text-xs">
          Belum ada gambar di dalam galeri ini. Media pertama akan menjadi thumbnail utama.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
          {media.map((item, idx) => {
            const isPrimary = idx === 0;

            return (
              <div
                key={idx}
                className={cn(
                  "relative group bg-white border rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-xs",
                  isPrimary
                    ? "border-blue-600 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                {/* Thumbnail Preview Stage */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x300/F1F5F9/64748B?text=Image+Error';
                    }}
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white font-mono text-[9px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                      <Star size={10} className="fill-current" />
                      PRIMARY
                    </span>
                  )}

                  {/* Index badge */}
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-900/70 text-white font-mono text-[9px] rounded font-semibold">
                    #{idx + 1}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="p-2 space-y-1 bg-white">
                  <p className="font-sans text-[11px] text-slate-800 font-medium truncate" title={item.alt}>
                    {item.alt || `Media #${idx + 1}`}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400">
                    Ratio: {item.aspectRatio}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Geser Kiri"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === media.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Geser Kanan"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 font-mono text-[9px] font-semibold rounded hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="Jadikan Primary Thumbnail"
                        >
                          Set Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded cursor-pointer"
                        title="Hapus Media"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
