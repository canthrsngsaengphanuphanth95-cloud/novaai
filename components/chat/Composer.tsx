'use client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Upload } from 'lucide-react';
import { ingestFile } from '@/lib/rag';
import { useToast } from '@/components/ui/toast';

export function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('');
  const { push } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const { chunks } = await ingestFile(f, 'me');
      push({ title: 'อัปโหลดแล้ว', description: `${f.name} · ${chunks} chunks` });
    } catch (err: any) {
      push({ title: 'อัปโหลดไม่สำเร็จ', description: err?.message, variant: 'error' });
    }
  }

  function send() {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText('');
  }

  return (
    <div className="border-t border-border bg-card p-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <label className="cursor-pointer rounded-md border border-border p-2 hover:bg-muted">
          <Upload className="h-4 w-4" />
          <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFile} />
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัด)"
          rows={1}
          className="flex-1 resize-none"
        />
        <Button onClick={send} disabled={disabled} size="icon" aria-label="send"><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}