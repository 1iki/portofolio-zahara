import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function MetricsEditor({ metrics = [], onChange }) {
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  const handleFieldChange = (index, field, val) => {
    const updated = [...safeMetrics];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const handleAddMetric = () => {
    onChange([...safeMetrics, { value: '', label: '' }]);
  };

  const handleRemoveMetric = (index) => {
    const updated = safeMetrics.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : null);
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-medium text-xs text-slate-700">Metrics / Output Kuantitatif</label>
          <span className="text-[10px] text-slate-400">Contoh: Value "50", Label "BERITA DIGITAL"</span>
        </div>
        <button
          type="button"
          onClick={handleAddMetric}
          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} />
          <span>Tambah Metric</span>
        </button>
      </div>

      {safeMetrics.length === 0 ? (
        <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
          Tidak ada metrics kuantitatif. (Optional)
        </div>
      ) : (
        <div className="space-y-2">
          {safeMetrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="w-24">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-semibold">Value / Angka</label>
                <input
                  type="text"
                  value={m.value || ''}
                  onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                  placeholder="50"
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-semibold">Label Keterangan</label>
                <input
                  type="text"
                  value={m.label || ''}
                  onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                  placeholder="BERITA DIGITAL"
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMetric(idx)}
                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer transition-colors self-end mb-0.5"
                title="Hapus metric"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
