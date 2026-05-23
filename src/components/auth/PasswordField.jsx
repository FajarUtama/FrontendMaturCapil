import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const PasswordField = ({
  value,
  onChange,
  placeholder = '••••••••',
  variant = 'light',
  id,
  autoComplete = 'current-password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isDark = variant === 'dark';

  return (
    <div className="relative">
      <Lock
        className={`absolute left-3 top-3 w-4.5 h-4.5 pointer-events-none ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}
      />
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border border-slate-700/80 focus:border-brand-500 focus:bg-slate-950 text-slate-200 placeholder-slate-550'
            : 'bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-brand-500/10'
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className={`absolute right-3 top-2.5 p-0.5 rounded-md transition-colors ${
          isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
      </button>
    </div>
  );
};
