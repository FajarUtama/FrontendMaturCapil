import React from 'react';
import { Loader2 } from 'lucide-react';

export const SubmitOverlay = ({ message = 'Memproses…' }) => (
  <div
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-sm px-6"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
    <p className="text-sm font-bold text-slate-800 text-center">{message}</p>
    <p className="text-[10px] text-slate-500 text-center max-w-xs">
      Mohon tunggu, jangan menutup halaman atau menekan tombol berulang kali.
    </p>
  </div>
);
