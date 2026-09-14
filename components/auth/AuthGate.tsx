'use client';
import { useEffect, useState } from 'react';
import { ensureSignedIn, getUser } from '@/lib/puter';
import { PuterSignIn } from './PuterSignIn';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    (async () => {
      const ok = await ensureSignedIn();
      setAuthed(ok); setReady(true);
      if (ok) await getUser();
    })();
  }, []);
  if (!ready) return <div className="p-8 text-muted-foreground">กำลังโหลด...</div>;
  if (!authed)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">กรุณาเข้าสู่ระบบ</h1>
        <PuterSignIn />
      </div>
    );
  return <>{children}</>;
}