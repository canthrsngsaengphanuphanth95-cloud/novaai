'use client';
import { useEffect, useState } from 'react';
import { chatStream, DEFAULT_MODEL, type ChatMessage } from '@/lib/ai';
import { kv } from '@/lib/storage';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';
import { ModelPicker } from './ModelPicker';
import { loadAllChunks, retrieve } from '@/lib/rag';
import { rateLimit } from '@/lib/rate-limit';
import { uid } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

type Conv = { id: string; title: string; model: string; messages: ChatMessage[] };

export function ChatWindow({ convId }: { convId?: string }) {
  const [conv, setConv] = useState<Conv>(() => ({
    id: convId ?? uid('conv'), title: 'แชทใหม่', model: DEFAULT_MODEL, messages: [],
  }));
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      if (convId) {
        const c = await kv.get<Conv>(`conv:${convId}`);
        if (c) setConv(c);
      } else {
        const s = await kv.get<any>('settings');
        if (s?.defaultModel) setConv((p) => ({ ...p, model: s.defaultModel }));
      }
    })();
  }, [convId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }); }, [conv.messages.length, streaming]);

  async function send(text: string) {
    if (!rateLimit(`chat:${conv.id}`, 30, 60_000).ok) return push({ title: 'ช้าลงหน่อย', variant: 'error' });

    const userMsg: ChatMessage = { role: 'user', content: text };
    const base = [...conv.messages, userMsg];
    setConv((p) => ({ ...p, title: p.messages.length === 0 ? text.slice(0, 40) : p.title, messages: base }));
    setBusy(true); setStreaming('');

    try {
      const chunks = await loadAllChunks();
      const ctx = chunks.length ? retrieve(text, chunks, 4) : [];
      const messages: ChatMessage[] = ctx.length
        ? [{ role: 'system', content: `Use the following context:\n\n${ctx.join('\n---\n')}` }, ...base]
        : base;

      let acc = '';
      for await (const delta of chatStream(messages, conv.model)) {
        acc += delta;
        setStreaming(acc);
      }
      const finalMsgs: ChatMessage[] = [...base, { role: 'assistant', content: acc }];
      const saved: Conv = { ...conv, title: conv.messages.length === 0 ? text.slice(0, 40) : conv.title, messages: finalMsgs };
      setConv(saved);
      await kv.set(`conv:${saved.id}`, saved);
    } catch (e: any) {
      push({ title: 'เกิดข้อผิดพลาด', description: e?.message ?? 'ลองใหม่อีกครั้ง', variant: 'error' });
    } finally {
      setBusy(false); setStreaming('');
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="text-sm font-medium">{conv.title}</div>
        <ModelPicker value={conv.model} onChange={(m) => setConv((p) => ({ ...p, model: m }))} />
      </div>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {conv.messages.length === 0 && !streaming && (
          <div className="mx-auto max-w-xl text-center text-muted-foreground">
            <p className="text-lg font-medium">เริ่มบทสนทนาใหม่</p>
            <p className="mt-1 text-sm">เลือกโมเดลด้านบน แล้วพิมพ์ข้อความ ระบบจะค้นหาเอกสาร RAG ให้อัตโนมัติ</p>
          </div>
        )}
        {conv.messages.map((m, i) => <MessageBubble key={i} role={m.role} content={m.content} />)}
        {streaming && <MessageBubble role="assistant" content={streaming} />}
      </div>
      <Composer onSend={send} disabled={busy} />
    </div>
  );
}