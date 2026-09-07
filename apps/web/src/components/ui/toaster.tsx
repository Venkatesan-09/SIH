import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

export function toast(t: Omit<Toast, 'id'>) {
  const newToast: Toast = { ...t, id: Math.random().toString(36).slice(2) };
  toasts = [...toasts, newToast];
  toastListeners.forEach(l => l([...toasts]));
  setTimeout(() => {
    toasts = toasts.filter(item => item.id !== newToast.id);
    toastListeners.forEach(l => l([...toasts]));
  }, 5000);
}

export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setList([...newToasts]);
    toastListeners.push(listener);
    // Initial sync
    setList([...toasts]);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {list.map(t => (
        <div
          key={t.id}
          className={`card p-4 shadow-modal flex items-start gap-3 animate-fade-in ${
            t.variant === 'destructive' ? 'border-critical bg-critical-light' :
            t.variant === 'success' ? 'border-accent-teal bg-accent-teal-light' : ''
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-sm ${
              t.variant === 'destructive' ? 'text-critical' :
              t.variant === 'success' ? 'text-accent-teal' : 'text-text-primary'
            }`}>{t.title}</div>
            {t.description && <div className="text-xs text-text-secondary mt-0.5">{t.description}</div>}
          </div>
          <button onClick={() => { toasts = toasts.filter(x => x.id !== t.id); setList([...toasts]); }} className="text-text-secondary hover:text-text-primary flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
