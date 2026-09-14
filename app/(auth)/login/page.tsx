import { PuterSignIn } from '@/components/auth/PuterSignIn';
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">เข้าสู่ NovaAI</h1>
      <p className="text-muted-foreground">ใช้บัญชี Puter ของคุณ ไม่ต้องสมัครเชยใหม่</p>
      <PuterSignIn />
    </main>
  );
}