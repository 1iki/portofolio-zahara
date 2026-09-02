import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Camera, 
  ImageIcon, 
  Video, 
  Plus, 
  ArrowUpRight,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Info,
  CheckCircle2,
  Server,
  Cloud
} from 'lucide-react';
import { 
  getWorks, 
  getDocumentation, 
  checkHealth, 
  exportCMSBackup, 
  resetToDefaults, 
  subscribeToDataChanges 
} from '../../lib/contentService';
import { normalizeMedia } from '../../lib/mediaUtils';
import ImportBackupModal from '../../components/manage/ImportBackupModal';
import Toast from '../../components/manage/Toast';

export default function ManageDashboard({ onNavigate, onOpenNewWork, onOpenNewDoc }) {
  const [works, setWorks] = useState([]);
  const [docs, setDocs] = useState([]);
  const [dbHealth, setDbHealth] = useState({ connected: false, dbName: 'PortoZeze' });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    const [w, d, health] = await Promise.all([
      getWorks(),
      getDocumentation(),
      checkHealth(),
    ]);
    setWorks(w || []);
    setDocs(d || []);
    setDbHealth(health || { connected: false });
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const handleResetData = async () => {
    try {
      await resetToDefaults();
      setIsResetConfirmOpen(false);
      setToast({ type: 'success', message: 'Database MongoDB PortoZeze berhasil di-reseed dari dataset awal.' });
    } catch (err) {
      setToast({ type: 'error', message: `Gagal reset database: ${err.message}` });
    }
  };

  // Calculate statistics
  const totalWorks = works.length;
  const totalDocs = docs.length;

  const totalWorkMedia = works.reduce((acc, w) => acc + normalizeMedia(w).length, 0);
  const totalDocMedia = docs.reduce((acc, d) => acc + normalizeMedia(d).length, 0);
  const grandTotalMedia = totalWorkMedia + totalDocMedia;

  const totalVideos = works.filter((w) => w.videoUrl || w.mediaType === 'youtube').length +
                     docs.filter((d) => d.videoEmbedUrl || d.type === 'video').length;

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola seluruh karya portofolio, galeri dokumentasi BTS, naskah, dan pengalaman penyiaran secara langsung di database MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewWork}
            className="px-4 py-2 bg-blue-600 text-white font-medium text-xs rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Karya</span>
          </button>
          <button
            onClick={onOpenNewDoc}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah BTS</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Karya */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-medium">TOTAL KARYA</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-bold text-3xl text-slate-900">{totalWorks}</span>
            <span className="font-mono text-xs text-slate-400">Proyek</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Kampus & Magang</span>
            <button onClick={() => onNavigate('works')} className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer">
              <span>Kelola</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Card 2: Total BTS */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-medium">DOKUMENTASI BTS</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Camera size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-bold text-3xl text-slate-900">{totalDocs}</span>
            <span className="font-mono text-xs text-slate-400">Item BTS</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Foto & Liputan Video</span>
            <button onClick={() => onNavigate('documentation')} className="text-purple-600 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer">
              <span>Kelola</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Card 3: Total Media */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-medium">TOTAL MEDIA</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-bold text-3xl text-slate-900">{grandTotalMedia}</span>
            <span className="font-mono text-xs text-slate-400">Gambar</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs font-mono text-slate-400">
            Maks. 55 media / item
          </div>
        </div>

        {/* Card 4: Video Content */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-medium">VIDEO & EMBED</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Video size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-bold text-3xl text-slate-900">{totalVideos}</span>
            <span className="font-mono text-xs text-slate-400">Konten Stream</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs font-mono text-slate-400">
            YouTube & Drive Embed
          </div>
        </div>
      </div>

      {/* ── Database & Cloudinary Status Panel ─────────────────────── */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base text-slate-900">
                  Data Persistence & Cloud Storage
                </h2>
                {dbHealth.connected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    MONGODB CONNECTED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 font-mono text-[10px] text-red-700 font-bold uppercase">
                    DATABASE OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Database Target: <code className="text-emerald-700 font-mono font-semibold">PortoZeze</code> • Media Storage: <code className="text-blue-600 font-mono font-semibold">Cloudinary</code>
              </p>
            </div>
          </div>

          {/* Backup Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportCMSBackup}
              className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Unduh cadangan data MongoDB dalam format JSON"
            >
              <Download size={14} />
              <span>Export Database JSON</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Impor file JSON cadangan ke MongoDB"
            >
              <Upload size={14} />
              <span>Import Backup</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 font-medium text-xs rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reseed database MongoDB dari static seed files"
            >
              <RotateCcw size={14} />
              <span>Reseed MongoDB</span>
            </button>
          </div>
        </div>

        {/* Database Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase block font-semibold">Database Primary</span>
            <span className="text-slate-900 font-semibold block">MongoDB Atlas ({dbHealth.dbName})</span>
            <span className="text-[10px] text-emerald-600 font-medium">Single Source of Truth</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase block font-semibold">Total Record MongoDB</span>
            <span className="text-slate-900 font-semibold block">{totalWorks} Karya • {totalDocs} BTS</span>
            <span className="text-[10px] text-blue-600 font-medium">{grandTotalMedia} Gambar Terdaftar</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase block font-semibold">Media Cloud Storage</span>
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <Cloud size={14} className="text-blue-600" />
              <span>Cloudinary Storage Active</span>
            </div>
            <span className="text-[10px] text-slate-400">Secure Direct Upload Enabled</span>
          </div>
        </div>
      </div>

      {/* ── Recent Content Lists ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Works */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
              <FolderKanban size={18} className="text-blue-600" />
              <span>Karya Terbaru (MongoDB)</span>
            </h3>
            <button
              onClick={() => onNavigate('works')}
              className="font-medium text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {works.slice(0, 4).map((work) => {
              const mediaCount = normalizeMedia(work).length;
              return (
                <div
                  key={work.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={work.thumbnail || 'https://placehold.co/100x100/F1F5F9/64748B?text=Work'}
                      alt={work.title}
                      className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-medium text-xs text-slate-900 truncate">{work.title}</h4>
                      <p className="font-mono text-[10px] text-slate-500 truncate">{work.role} • {work.category?.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-semibold shrink-0">
                    {mediaCount} Media
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Documentation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
              <Camera size={18} className="text-purple-600" />
              <span>Dokumentasi BTS Terbaru (MongoDB)</span>
            </h3>
            <button
              onClick={() => onNavigate('documentation')}
              className="font-medium text-xs text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {docs.slice(0, 4).map((doc) => {
              const mediaCount = normalizeMedia(doc).length;
              return (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={doc.mediaUrl || doc.thumbnailUrl || 'https://placehold.co/100x100/F1F5F9/64748B?text=BTS'}
                      alt={doc.title}
                      className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-medium text-xs text-slate-900 truncate">{doc.title}</h4>
                      <p className="font-mono text-[10px] text-slate-500 truncate">{doc.project || 'BTS'} • {doc.group?.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 font-semibold shrink-0">
                    {mediaCount} Media
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Import Backup Modal */}
      {isImportModalOpen && (
        <ImportBackupModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={(counts) => {
            setToast({ type: 'success', message: `Berhasil mengimpor ${counts?.works || 0} Karya dan ${counts?.docs || 0} BTS ke MongoDB.` });
            loadData();
          }}
        />
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
              <ShieldAlert size={18} />
              <span>Reseed Database MongoDB PortoZeze?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mengosongkan collection pada database MongoDB dan mere-seed data dari file source <code className="text-blue-600">src/data/*.js</code>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Ya, Reseed MongoDB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
