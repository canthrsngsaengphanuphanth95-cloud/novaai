import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST() {
  return NextResponse.json({ ok: false, message: 'ใช้ client-side ingestFile แทนได้เลย' }, { status: 501 });
}