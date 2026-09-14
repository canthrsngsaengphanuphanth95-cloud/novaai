'use client';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { getUser, signOut } from '@/lib/puter';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  useEffect(() => { getUser().then(setUser); }, []);
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="text-sm text-muted-foreground">ยินดีต้อนรับ {user?.username ?? '...'}</div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={async () => { await signOut(); router.push('/'); }}>ออกจากระบบ</Button>
      </div>
    </header>
  );
}