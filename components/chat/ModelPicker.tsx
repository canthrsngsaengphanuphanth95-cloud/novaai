'use client';
import { useEffect, useState } from 'react';
import { listModels } from '@/lib/ai';

export function ModelPicker({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const [models, setModels] = useState<string[]>([]);
  useEffect(() => { listModels().then((m) => setModels(Array.isArray(m) ? m : [])).catch(() => {}); }, []);
  return (
    <select
      className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {!models.includes(value) && <option value={value}>{value}</option>}
      {models.map((m) => (<option key={m} value={m}>{m}</option>))}
    </select>
  );
}