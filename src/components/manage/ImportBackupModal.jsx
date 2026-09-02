import React, { useState } from 'react';
import { Upload, X, AlertCircle, FileJson, CheckCircle2, ShieldAlert } from 'lucide-react';
import { importCMSBackup } from '../../lib/contentService';

export default function ImportBackupModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e) => {
    setError(null);
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      setError('File harus berformat JSON (.json)');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.works || !json.documentation) {
          setError('File JSON tidak memiliki struktur backup CMS (works / documentation).');
          setParsedData(null);
          return;
        }
        setParsedData(json);
      } catch (err) {
        setError('Gagal membaca JSON: File terdistorsi atau format salah.');
        setParsedData(null);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsImporting(true);

    try {
      const result = await importCMSBackup(parsedData);
      if (result.success) {
        onSuccess(result.counts);
        onClose();
      } else {
        setError(result.error || 'Gagal mengimpor data.');
        setIsImporting(false);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengimpor data.');
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileJson size={20} className="text-blue-600" />
            <h3 className="font-semibold text-lg text-slate-900">
              Import Backup CMS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Pilih file cadangan JSON (`zahara-mongodb-backup-*.json`) untuk memulihkan data ke MongoDB.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-medium">
            <ShieldAlert size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* File Input */}
        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
          <Upload size={24} className="mx-auto text-blue-600/70" />
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            id="backup-file-input"
          />
          <label
            htmlFor="backup-file-input"
            className="inline-block px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 font-medium text-xs rounded-xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-xs"
          >
            Pilih File Backup JSON
          </label>
          {file && (
            <p className="font-mono text-[11px] text-slate-700 truncate pt-1">
              File: {file.name}
            </p>
          )}
        </div>

        {/* Parsed Preview */}
        {parsedData && (
          <div className="p-3.5 bg-slate-50 border border-blue-200 rounded-xl text-xs space-y-1 font-mono max-h-48 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold mb-1">
              <CheckCircle2 size={14} />
              <span>File Backup Valid</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Karya:</span>
              <span className="text-slate-900 font-semibold">{parsedData.works?.length || 0} item</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Dokumentasi BTS:</span>
              <span className="text-slate-900 font-semibold">{parsedData.documentation?.length || 0} item</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Naskah:</span>
              <span className="text-slate-900 font-semibold">{parsedData.scripts?.length || 0} item</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pengalaman:</span>
              <span className="text-slate-900 font-semibold">{parsedData.experience?.length || 0} item</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pendidikan:</span>
              <span className="text-slate-900 font-semibold">{parsedData.education?.length || 0} item</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Kontak:</span>
              <span className="text-slate-900 font-semibold">{parsedData.contact ? 'Ada (Singleton)' : 'Tidak ada'}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Kategori & Filters:</span>
              <span className="text-slate-900 font-semibold">
                {(parsedData.work_categories?.length || 0) + (parsedData.experience_categories?.length || 0) + (parsedData.role_filters?.length || 0)} item
              </span>
            </div>
            {parsedData.exportedAt && (
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Tanggal Backup:</span>
                <span className="text-slate-900 font-medium">{new Date(parsedData.exportedAt).toLocaleDateString('id-ID')}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={!parsedData || isImporting}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload size={14} />
            <span>{isImporting ? 'Mengimpor...' : 'Impor Data Backup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
