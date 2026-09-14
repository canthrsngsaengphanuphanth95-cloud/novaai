'use client';
import { useState } from 'react';
import { signIn } from '@/lib/puter';
import { Button } from '@/components/ui/button';

export function PuterSignIn({ onSignedIn }: { onSignedIn?: () => void }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      await signIn();
      onSignedIn?.();
      window.location.href = '/dashboard';
    } finally { setLoading(false); }
  }
  return (
    <Button onClick={handle} disabled={loading} size="lg">
      {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Puter'}
    </Button>
  );
}