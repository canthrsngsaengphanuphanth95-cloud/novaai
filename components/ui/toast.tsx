'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
type Toast = { id: string; title: string; description?: string; variant?: 'default' | 'error' };
const Ctx = React.createContext<{ push: (t: Omit<Toast, 'id'>) => void }>({ push: () => {} });
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setItems((p) => [...p, { ...t, id }]);
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className={cn('rounded-md border p-3 text-sm shadow-lg', t.variant === 'error' ? 'border-red-500 bg-red-950 text-red-100' : 'border-border bg-card')}>
            <div className="font-medium">{t.title}</div>
            {t.description && <div className="text-muted-foreground text-xs">{t.description}</div>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => React.useContext(Ctx);