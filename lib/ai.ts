'use client';
import { puter } from '@/lib/puter';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export const DEFAULT_MODEL = 'gpt-5-nano';

export async function listModels() { return puter.ai.listModels(); }
export async function listProviders() { return puter.ai.listModelProviders(); }

export async function chatOnce(messages: ChatMessage[], model = DEFAULT_MODEL) {
  const res = await puter.ai.chat(messages as any, { model });
  return typeof res === 'string' ? res : (res as any)?.message?.content ?? '';
}

export async function* chatStream(messages: ChatMessage[], model = DEFAULT_MODEL) {
  const stream: any = await puter.ai.chat(messages as any, { model, stream: true });
  for await (const part of stream) {
    const delta = part?.text ?? part?.delta ?? '';
    if (delta) yield delta as string;
  }
}