import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', message = '' } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-up max-w-md font-sans text-xs font-medium",
        type === 'success' && "bg-white border-emerald-200 text-emerald-950 shadow-emerald-500/10",
        type === 'error' && "bg-white border-red-200 text-red-950 shadow-red-500/10",
        type === 'info' && "bg-white border-blue-200 text-blue-950 shadow-blue-500/10"
      )}
    >
      {type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
      {type === 'error' && <AlertCircle size={18} className="text-red-600 shrink-0" />}
      {type === 'info' && <Info size={18} className="text-blue-600 shrink-0" />}

      <span className="flex-1 leading-snug">{message}</span>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}
