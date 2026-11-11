import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles = {
    success: 'bg-white border-primary/30 text-primary-dark',
    error: 'bg-white border-red-300 text-red-700',
    info: 'bg-white border-line text-ink',
  };
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
  const iconColor = toast.type === 'success' ? 'text-primary' : toast.type === 'error' ? 'text-red-500' : 'text-ink-muted';
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border shadow-cardhover px-4 py-3 animate-scaleIn ${styles[toast.type]}`}
    >
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button onClick={onClose} className="text-ink-muted hover:text-ink transition shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


