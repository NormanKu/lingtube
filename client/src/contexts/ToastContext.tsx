import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type LucideIconType = typeof AlertCircle;
import { useTranslation } from 'react-i18next';

export type ToastTone = 'success' | 'warning' | 'info' | 'error';

export interface ToastOptions {
  id?: string;
  tone?: ToastTone;
  title?: string;
  message?: string;
  /** Duration in ms. 0 = persistent. Default 5000. */
  duration?: number;
}

interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  message: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext(null as ToastContextValue | null);
const DEFAULT_DURATION = 5000;

interface ToneStyles {
  shell: string;
  icon: LucideIconType;
  iconClass: string;
}

function getToneStyles(tone: ToastTone): ToneStyles {
  switch (tone) {
    case 'success':
      return {
        shell: 'border-green-200 bg-green-50 text-green-800',
        icon: CheckCircle2,
        iconClass: 'text-green-600',
      };
    case 'warning':
      return {
        shell: 'border-amber-200 bg-amber-50 text-amber-800',
        icon: AlertTriangle,
        iconClass: 'text-amber-600',
      };
    case 'info':
      return {
        shell: 'border-primary-200 bg-primary-50 text-primary-800',
        icon: Info,
        iconClass: 'text-primary-600',
      };
    case 'error':
    default:
      return {
        shell: 'border-red-200 bg-red-50 text-red-800',
        icon: AlertCircle,
        iconClass: 'text-red-600',
      };
  }
}

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  const { t } = useTranslation();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(100%-2rem,24rem)] flex-col gap-3">
      {toasts.map((toast) => {
        const styles = getToneStyles(toast.tone);
        const Icon = styles.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-sm ${styles.shell}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <Icon size={18} className={`mt-0.5 shrink-0 ${styles.iconClass}`} />
              <div className="min-w-0 flex-1">
                {toast.title && (
                  <p className="text-sm font-semibold">{toast.title}</p>
                )}
                {toast.message && (
                  <p className={`text-sm leading-relaxed ${toast.title ? 'mt-1' : ''}`}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-full p-1 text-current/60 transition-colors hover:bg-white/60 hover:text-current"
                aria-label={t('common.close')}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ToastProviderProps {
  children: any;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState([] as Toast[]);
  const timersRef = useRef(new Map() as Map<string, ReturnType<typeof setTimeout>>);

  const dismissToast = useCallback((id: string) => {
    setToasts((current: Toast[]) => current.filter((toast: Toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duration = options.duration ?? DEFAULT_DURATION;

    setToasts((current: Toast[]) => [
      ...current,
      {
        id,
        tone: options.tone || 'info',
        title: options.title || '',
        message: options.message || '',
      },
    ]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  useEffect(() => () => {
    timersRef.current.forEach((timer: ReturnType<typeof setTimeout>) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo(() => ({
    showToast,
    dismissToast,
  }) as ToastContextValue, [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext) as ToastContextValue | null;
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
