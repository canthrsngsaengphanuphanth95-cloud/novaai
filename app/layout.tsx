import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: { default: 'NovaAI', template: '%s | NovaAI' },
  description: 'AI แชท 500+ โมเดล ผ่าน Puter.js ฟรี ไม่ต้องใช้ API key',
  keywords: ['AI', 'chat', 'GPT', 'Claude', 'Gemini', 'Puter'],
  openGraph: { title: 'NovaAI', description: 'AI แชท 500+ โมเดล ฟรี', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}