'use client';
import { useEffect, useState } from 'react';
import { kv } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { DEFAULT_MODEL } from '@/lib/ai';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const { push } = useToast();
  useEffect(() => {
    (async () => {
      const s = await kv.get<any>('settings');
      if (s) { setName(s.displayName ?? ''); setModel(s.defaultModel ?? DEFAULT_MODEL); }
    })();
  }, []);
  async function save() {
    await kv.set('settings', { displayName: name, defaultModel: model });
    push({ title: 'บันทึกแล้ว', description: 'เก็บใน Puter KV' });
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">ชื่ที่แสดง</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อของคุณ" />
        </div>
        <div>
          <label className="text-sm font-medium">โมเดลเริ่มต้น</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder={DEFAULT_MODEL} />
        </div>
        <Button onClick={save}>บันทึก</Button>
      </div>
    </div>
  );
}