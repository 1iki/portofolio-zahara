import React, { useState, useEffect } from 'react';
import { Save, AtSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { getContact, updateContact, subscribeToDataChanges } from '../../lib/contentService';
import Toast from '../../components/manage/Toast';

export default function ManageContact() {
  const [formData, setFormData] = useState({
    whatsapp: '',
    whatsappDisplay: '',
    linkedin: '',
    linkedinDisplay: '',
    instagram: '',
    instagramDisplay: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const loadContact = async () => {
    setLoading(true);
    try {
      const data = await getContact();
      if (data) {
        setFormData({
          whatsapp: data.whatsapp || '',
          whatsappDisplay: data.whatsappDisplay || '',
          linkedin: data.linkedin || '',
          linkedinDisplay: data.linkedinDisplay || '',
          instagram: data.instagram || '',
          instagramDisplay: data.instagramDisplay || '',
          email: data.email || '',
        });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal memuat data kontak.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContact();
    const unsubscribe = subscribeToDataChanges(() => {
      loadContact();
    });
    return unsubscribe;
  }, []);

  const handleChange = (field, val) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Email kontak wajib diisi.');
      return;
    }

    setIsSaving(true);

    try {
      await updateContact(formData);
      setToast({ type: 'success', message: 'Informasi kontak berhasil diperbarui di MongoDB.' });
    } catch (err) {
      setError(err.message || 'Gagal memperbarui kontak.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Manajemen Informasi Kontak</h1>
        <p className="text-xs text-slate-500 mt-0.5">Kelola tautan WhatsApp, LinkedIn, Instagram, dan Email yang ditampilkan di website publik.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono">Memuat data kontak...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Email */}
          <div className="space-y-4">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 1. ALAMAT EMAIL ]
            </span>

            <div>
              <label className="block font-medium text-xs text-slate-700 mb-1">
                Alamat Email Kontak <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="zaharaelhusnab@gmail.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 2: LinkedIn */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 2. LINKEDIN ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">URL Profil LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Teks Tampilan LinkedIn (Display)</label>
                <input
                  type="text"
                  value={formData.linkedinDisplay}
                  onChange={(e) => handleChange('linkedinDisplay', e.target.value)}
                  placeholder="@zahara-elhusna-barok"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Instagram */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 3. INSTAGRAM ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">URL Profil Instagram</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Teks Tampilan Instagram (Display)</label>
                <input
                  type="text"
                  value={formData.instagramDisplay}
                  onChange={(e) => handleChange('instagramDisplay', e.target.value)}
                  placeholder="@zhr.elhusna"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: WhatsApp */}
          <div className="space-y-4 pt-2">
            <span className="font-mono text-[11px] text-blue-600 uppercase tracking-widest block font-semibold border-b border-slate-200 pb-1">
              [ 4. WHATSAPP ]
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">URL Direct WhatsApp</label>
                <input
                  type="url"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="https://wa.me/62..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-xs text-slate-700 mb-1">Teks Tampilan Nomor WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsappDisplay}
                  onChange={(e) => handleChange('whatsappDisplay', e.target.value)}
                  placeholder="+62 852-1137-2894"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Kontak'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
