import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">500+ models · ฟรี · ไม่ต้องใช้ API key</span>
      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">NovaAI — คุยกับ AI ทุกค่ายในที่เดียว</h1>
      <p className="max-w-2xl text-lg text-muted-foreground">รวม GPT, Claude, Gemini, DeepSeek, Llama และอีกมากมาย ผ่าน Puter.js ใช้งานฟรี แบบ User-Pays</p>
      <div className="flex gap-3">
        <Button asChild size="lg"><Link href="/chat">เริ่มแชทเลย</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/dashboard">แดชบอร์ด</Link></Button>
      </div>
      <section className="mt-12 grid w-full gap-4 md:grid-cols-3">
        {[
          { t: '500+ โมเดล', d: 'สลับโมเดลได้ทันที ไม่ผูกขาดค่ายเดียว' },
          { t: 'RAG ในตัว', d: 'อัปโหลดไฟลแล้วถามได้เลย เก็บใน Puter FS' },
          { t: 'ไม่มี backend', d: 'Auth, DB, Storage ผ่าน Puter ทั้งหมด' },
        ].map((f) => (
          <div key={f.t} className="rounded-lg border border-border bg-card p-6 text-left">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}