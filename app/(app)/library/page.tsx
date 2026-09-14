'use client';
import { useEffect, useState } from 'react';
import { kv } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { uid } from '@/lib/utils';

type Prompt = { id: string; title: string; body: string; tags: string };

export default function LibraryPage() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [q, setQ] = useState('');
  const { push } = useToast();

  async function load() {
    const keys = await kv.list('prompt:*');
    const list = (await Promise.all(keys.map((k) => kv.get<Prompt>(k)))).filter(Boolean) as Prompt[];
    setItems(list);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!title || !body) return push({ title: 'กรอกให้ครบ ', variant: 'error' });
    const id = uid('prompt');
    await kv.set(id, { id, title, body, tags });
    setTitle(''); setBody(''); setTags('');
    push({ title: 'บันทึก Prompt แล้ว' });
    load();
  }
  async function del(id: string) { await kv.del(id); load(); }

  const filtered = items.filter((p) => (p.title + p.body + p.tags).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Prompt Library</h1>
      <Card className="mt-4">
        <CardHeader><CardTitle>เพิ่ม Prompt ใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="ชื่อ" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="แท็ก คั่นด้วย ," value={tags} onChange={(e) => setTags(e.target.value)} />
          <Textarea placeholder="u0e40u0e19u0e37u0e49u0e2au0e32 prompt" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          <Button onClick={add}>บันทึก</Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Input placeholder="u0e04u0e49u0e19u0e2bu0e32..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((p) => (
          <Card key={p.id}>
            <CardHeader><CardTitle className="text-base">{p.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">{p.body}</p>
              {p.tags && <p className="mt-2 text-xs text-muted-foreground">#{p.tags.split(',').map((t) => t.trim()).join(' #')}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(p.body)}>คัดลอก</Button>
                <Button size="sm" variant="destructive" onClick={() => del(p.id)}>ลบ</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}