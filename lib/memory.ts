'use client';

import { kv } from '@/lib/storage';

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
  const facts = memory.facts.length ? memory.facts.join(', ') : 'ไม่มี';
  const preferences = Object.keys(memory.preferences).length
    ? JSON.stringify(memory.preferences)
    : 'ไม่มี';
  const history = memory.history.length ? memory.history.slice(-5).join('\n') : 'ไม่มี';

  return [
    'ข้อมูลเกี่ยวกับผู้ใช้ที่ควรใช้เป็นบริบท:',
    `- ข้อเท็จจริง: ${facts}`,
    `- ความชอบ: ${preferences}`,
    `- ประวัติล่าสุด: ${history}`,
  ].join('\n');
}
