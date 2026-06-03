import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Map type to icons and styles
  const toastStyles = {
    success: {
      border: 'border-l-4 border-l-emerald-500',
      text: 'text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bg: 'bg-emerald-50/20'
    },
    error: {
      border: 'border-l-4 border-l-rose-500',
      text: 'text-rose-800',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
      bg: 'bg-rose-50/20'
    },
    warning: {
      border: 'border-l-4 border-l-brand-saffron',
      text: 'text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-brand-saffron',
      bg: 'bg-amber-50/20'
    },
    info: {
      border: 'border-l-4 border-l-brand-slate',
      text: 'text-slate-800',
      icon: Info,
      iconColor: 'text-brand-slate',
      bg: 'bg-slate-50/20'
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts container */}
      <div className="fixed bottom-5 right-5 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 flex gap-3 items-start justify-between transition-all duration-300 animate-slide-in ${style.border} ${style.bg}`}
            >
              <div className="flex gap-2.5 items-start">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
                <span className={`text-xs font-bold leading-relaxed ${style.text}`}>
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
};
