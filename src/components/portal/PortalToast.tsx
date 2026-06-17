import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';

type PortalToastContextValue = {
  showToast: (message: string) => void;
};

const PortalToastContext = createContext<PortalToastContextValue | null>(null);

export function PortalToastProvider({children}: {children: ReactNode}) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const value = useMemo(() => ({showToast}), [showToast]);

  return (
    <PortalToastContext.Provider value={value}>
      {children}
      {visible && message ? (
        <div
          className="fixed bottom-6 right-6 z-[100] rounded-2xl bg-[#5097A4] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_40px_rgba(30,45,61,0.18)]"
          role="status"
        >
          {message}
        </div>
      ) : null}
    </PortalToastContext.Provider>
  );
}

export function usePortalToast() {
  const context = useContext(PortalToastContext);
  if (!context) {
    throw new Error('usePortalToast must be used within PortalToastProvider.');
  }
  return context;
}
