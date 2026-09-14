'use client';
import { useEffect, useState } from 'react';
import { kv } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/puter';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  useEffect(() => {
    (async () => {
      setUser(await getUser());
      const [c, p, d] = await Promise.all([kv.list('conv:*'), kv.list('prompt:*'), kv.list('doc:*')]);
      setStats({ conv: c.length, prompt: p.length, doc: d.length });
    })();
  }, []);
  if (!user) return <div className="p-6">กำลังโหลด...</div>;
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">ผู้ใช้: {user.username} ({user.email ?? '-'})</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Conversations</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.conv ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Prompts</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.prompt ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Documents</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.doc ?? 0}</CardContent></Card>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">หมายเหตุ: Puter KV แยกตามผู้ใช้ admin เห็นเฉพาะข้อมูลของผู้ใช้ที่ล็อกอินอยู่</p>
    </div>
  );
}