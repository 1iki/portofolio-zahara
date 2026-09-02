import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function ArrayFieldEditor({ label, items = [], onChange, placeholder = "Tambah item baru..." }) {
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index, value) => {
    const updated = [...safeItems];
    updated[index] = value;
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([...safeItems, '']);
  };

  const handleRemoveItem = (index) => {
    const updated = safeItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= safeItems.length) return;
    const updated = [...safeItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-2 font-sans">
      <div className="flex items-center justify-between">
        <label className="block font-medium text-xs text-slate-700">{label}</label>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} />
          <span>Tambah Item</span>
        </button>
      </div>

      {safeItems.length === 0 ? (
        <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
          Belum ada item. Klik "Tambah Item" di atas.
        </div>
      ) : (
        <div className="space-y-2">
          {safeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400 w-5 text-right font-semibold">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 outline-none"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  title="Geser ke atas"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === safeItems.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  title="Geser ke bawah"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer transition-colors"
                  title="Hapus item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
