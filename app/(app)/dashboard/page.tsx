'use client';
import { useEffect, useState } from 'react';
import { kv } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/puter';

export default function DashboardPage() {
  const [stats, setStats] = useState({ chats: 0, prompts: 0, docs: 0 });
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    (async () => {
      setUser(await getUser());
      const [c, p, d] = await Promise.all([kv.list('conv:*'), kv.list('prompt:*'), kv.list('doc:*')]);
      setStats({ chats: c.length, prompts: p.length, docs: d.length });
    })();
  }, []);
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">สวัสดี {user?.username ?? ''}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>แชท</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{stats.chats}</CardContent></Card>
        <Card><CardHeader><CardTitle>Prompt</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{stats.prompts}</CardContent></Card>
        <Card><CardHeader><CardTitle>เอกสาร (RAG)</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{stats.docs}</CardContent></Card>
      </div>
    </div>
  );
}