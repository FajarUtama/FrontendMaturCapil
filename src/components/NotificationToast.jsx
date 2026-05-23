import React, { useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast = () => {
  const { notifications, removeNotification } = useAppData();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <ToastItem 
          key={notif.id} 
          notif={notif} 
          onClose={() => removeNotification(notif.id)} 
        />
      ))}
    </div>
  );
};

const ToastItem = ({ notif, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />
  };

  const borderColors = {
    success: 'border-emerald-100 bg-emerald-50/90',
    error: 'border-rose-100 bg-rose-50/90',
    info: 'border-sky-100 bg-sky-50/90'
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-down ${borderColors[notif.type] || borderColors.info}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[notif.type] || icons.info}
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold text-sm text-slate-800">{notif.title}</h4>
        <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
        <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
      </div>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-200/50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
