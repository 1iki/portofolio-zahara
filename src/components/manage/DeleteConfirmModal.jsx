import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ title, category, mediaCount, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 font-sans">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle size={20} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-slate-900">
            Konfirmasi Penghapusan
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Apakah Anda yakin ingin menghapus item ini dari database MongoDB? Tindakan ini bersifat permanen.
          </p>
        </div>

        {/* Item Summary Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Judul:</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{title}</span>
          </div>
          {category && (
            <div className="flex justify-between">
              <span className="text-slate-400">Kategori:</span>
              <span className="text-blue-600 font-semibold uppercase">{category}</span>
            </div>
          )}
          {typeof mediaCount === 'number' && (
            <div className="flex justify-between">
              <span className="text-slate-400">Jumlah Media:</span>
              <span className="text-slate-900 font-medium">{mediaCount} media</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 size={14} />
            <span>Ya, Hapus Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
