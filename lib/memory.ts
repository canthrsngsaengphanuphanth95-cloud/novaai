'use client';

import { kv } from '@/lib/storage';
import { puter } from '@/lib/puter';

export type Memory = {
  facts: string[];
  preferences: Record<string, string>;
  history: string[];
};

const emptyMemory = (): Memory => ({ facts: [], preferences: {}, history: [] });

export async function loadMemory(userId: string): Promise<Memory> {
  if (!userId) return emptyMemory();
  const memory = await kv.get<Memory>(`memory:${userId}`);
  return memory ?? emptyMemory();
}

export async function saveMemory(userId: string, memory: Memory): Promise<void> {
  if (!userId) return;
  await kv.set(`memory:${userId}`, memory);
}

export async function clearMemory(userId: string): Promise<void> {
  if (!userId) return;
  await kv.del(`memory:${userId}`);
}

export function buildMemoryContext(memory: Memory): string {
  const facts = memory.facts.slice(-10);
  const preferences = memory.preferences;
  const history = memory.history.slice(-3);

  return [
    'ข้อมูลเกี่ยวกับผู้ใช้ที่ควรใช้เป็นบริบท:',
    `- ข้อเท็จจริงล่าสุด: ${facts.length ? facts.join(', ') : 'ไม่มี'}`,
    `- ความชอบ: ${Object.keys(preferences).length ? JSON.stringify(preferences) : 'ไม่มี'}`,
    `- ประวัติล่าสุด: ${history.length ? history.join('\n') : 'ไม่มี'}`,
  ].join('\n');
}

export async function extractFacts(userMsg: string, aiMsg: string): Promise<string[]> {
  if (!userMsg.trim()) return [];

  const prompt = `สกัดเฉพาะข้อเท็จจริงใหม่ที่ผู้ใช้เปิดเผยเกี่ยวกับตัวเองจากบทสนทนานี้\nผู้ใช้: ${userMsg}\nAI: ${aiMsg}\n\nตอบเป็น JSON array เท่านั้น เช่น ["ชอบกาแฟดำ"] และถ้าไม่มีข้อมูลใหม่ให้ตอบ [] ห้ามสรุปหรือเดา`;

  try {
    const result: any = await puter.ai.chat(prompt, { model: 'gpt-5-nano' });
    const text = typeof result === 'string' ? result : result?.message?.content ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function mergeMemory(memory: Memory, facts: string[]): Memory {
  const existing = new Set(memory.facts.map((x) => x.trim()).filter(Boolean));
  const merged = [...memory.facts];
  for (const fact of facts) {
    const clean = fact.trim();
    if (clean && !existing.has(clean)) {
      existing.add(clean);
      merged.push(clean);
    }
  }
  return { ...memory, facts: merged.slice(-50) };
}
