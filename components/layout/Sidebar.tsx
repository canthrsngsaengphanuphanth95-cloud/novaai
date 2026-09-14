'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutDashboard, Library, Settings, Shield, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { kv } from '@/lib/storage';
import { getUser } from '@/lib/puter';

const NAV = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/chat', label: 'แชท', icon: MessageSquare },
  { href: '/library', label: 'Prompt Library', icon: Library },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const [recents, setRecents] = useState<{ id: string; title: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const user: any = await getUser();
      setIsAdmin(user?.username === 'admin' || user?.email?.startsWith('admin@'));
      const keys = await kv.list('conv:*');
      const items = await Promise.all(keys.slice(-8).map((k) => kv.get<{ id: string; title: string }>(k)));
      setRecents(items.filter(Boolean) as any);
    })();
  }, [path]);

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" className="text-lg font-bold">NovaAI</Link>
      </div>
      <div className="p-3">
        <Button asChild className="w-full"><Link href="/chat"><Plus className="h-4 w-4" /> แชทใหม่</Link></Button>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted', path.startsWith(href) && 'bg-muted font-medium')}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted', path.startsWith('/admin') && 'bg-muted font-medium')}>
            <Shield className="h-4 w-4" /> Admin
          </Link>
        )}
      </nav>
      <div className="mt-4 px-4 text-xs uppercase text-muted-foreground">ล่าสุด</div>
      <div className="mt-1 flex-1 overflow-y-auto px-3 pb-4">
        {recents.length === 0 && <p className="px-3 text-xs text-muted-foreground">ยังไม่มีแชท</p>}
        {recents.map((r) => (
          <Link key={r.id} href={`/chat/${r.id}`} className={cn('block truncate rounded-md px-3 py-2 text-sm hover:bg-muted', path === `/chat/${r.id}` && 'bg-muted')}>{r.title}</Link>
        ))}
      </div>
    </aside>
  );
}