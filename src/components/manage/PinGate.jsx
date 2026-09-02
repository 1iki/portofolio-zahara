import React, { useState, useRef, useEffect } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { verifyPin } from '../../lib/authService';

export default function PinGate({ onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    setError(null);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (pinString) => {
    const code = pinString || digits.join('');
    if (code.length !== 6) {
      setError('Masukkan 6 digit PIN numerik.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyPin(code);
      if (isValid) {
        onSuccess();
      } else {
        setError('PIN salah. Akses ditolak.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Terjadi kesalahan verifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2">
            <Lock size={22} />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
            PORTFOLIO MANAGEMENT SYSTEM
          </span>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">
            Akses CMS Zahara
          </h1>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Masukkan 6 digit PIN numerik untuk mengelola data portofolio.
          </p>
        </div>

        {/* 6-Digit PIN Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`Digit ke-${idx + 1}`}
                className="w-11 h-14 text-center font-mono text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-blue-50/50 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none text-blue-600"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5 text-red-700 text-xs font-medium animate-shake">
              <ShieldAlert size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || digits.join('').length !== 6}
            className="w-full py-3 px-4 bg-blue-600 text-white font-sans text-xs tracking-wide font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Buka Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center font-mono text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <KeyRound size={12} className="text-blue-600" />
          <span>Server-Side Authenticated Session</span>
        </div>
      </div>
    </div>
  );
}
