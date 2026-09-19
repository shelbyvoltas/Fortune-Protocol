import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  txHash?: string;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, title?: string, txHash?: string) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, txHash?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, title, txHash };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5500);
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
                isSuccess
                  ? 'bg-[#0E1F16]/90 border-[#10B981]/40 text-[#E2F8EE]'
                  : isError
                  ? 'bg-[#260D10]/90 border-[#EF4444]/40 text-[#FEE2E2]'
                  : isWarning
                  ? 'bg-[#251A08]/90 border-[#F59E0B]/40 text-[#FEF3C7]'
                  : 'bg-[#121318]/90 border-[#FDB813]/30 text-[#E3E2E8]'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
                {isError && <XCircle className="w-5 h-5 text-[#EF4444]" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#FDB813]" />}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="font-semibold text-sm mb-0.5">{toast.title}</h4>}
                <p className="text-xs text-gray-300 leading-relaxed break-words">{toast.message}</p>
                {toast.txHash && (
                  <a
                    href={`https://bscscan.com/tx/${toast.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-mono text-[#FDB813] hover:underline"
                  >
                    View TX: {toast.txHash.slice(0, 8)}...{toast.txHash.slice(-6)} ↗
                  </a>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
