'use client';
import { puter } from '@/lib/puter';

export const kv = {
  async set<T>(key: string, value: T) { await puter.kv.set(key, value as any); },
  async get<T>(key: string): Promise<T | null> { return (await puter.kv.get(key)) as T | null; },
  async del(key: string) { await puter.kv.del(key); },
  async list(pattern?: string): Promise<string[]> {
    const r = await puter.kv.list(pattern ? { pattern } : (undefined as any));
    return Array.isArray(r) ? r : (r as any)?.keys ?? [];
  },
};

export const fs = {
  write: (p: string, c: any) => puter.fs.write(p, c),
  read: (p: string) => puter.fs.read(p),
  readdir: (p = '/') => puter.fs.readdir(p),
  del: (p: string) => puter.fs.delete(p),
  mkdir: (p: string) => puter.fs.mkdir(p),
};