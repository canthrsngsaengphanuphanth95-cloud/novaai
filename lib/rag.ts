'use client';
import { fs, kv } from '@/lib/storage';

export function chunkText(text: string, size = 800, overlap = 100): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) { out.push(text.slice(i, i + size)); i += size - overlap; }
  return out.filter((c) => c.trim().length > 20);
}

export function retrieve(query: string, chunks: string[], topK = 4): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return chunks
    .map((c) => {
      const lc = c.toLowerCase();
      const score = terms.reduce((s, t) => s + (lc.includes(t) ? 1 : 0), 0) / (terms.length || 1);
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.c);
}

export async function ingestFile(file: File, userId: string) {
  const text = await file.text();
  const chunks = chunkText(text);
  const id = `doc:${userId}:${Date.now()}`;
  await fs.write(`novaai/docs/${id.replace(/[:/]/g, '_')}.txt`, text);
  await kv.set(id, { id, name: file.name, mime: file.type, size: file.size, chunks, createdAt: Date.now() });
  return { id, chunks: chunks.length };
}

export async function loadAllChunks(): Promise<string[]> {
  const keys = await kv.list('doc:*');
  const docs = await Promise.all(keys.map((k) => kv.get<{ chunks: string[] }>(k)));
  return docs.flatMap((d) => d?.chunks ?? []);
}