import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3200) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white border-slate-800';
          let Icon = Info;
          let iconColor = 'text-sky-400';

          if (toast.type === 'success') {
            bg = 'bg-white text-slate-800 border-emerald-200 shadow-xl shadow-emerald-950/10';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'error') {
            bg = 'bg-white text-slate-800 border-rose-200 shadow-xl shadow-rose-950/10';
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-200 transition-all ${bg}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
