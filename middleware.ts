import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/library/:path*', '/settings/:path*', '/admin/:path*'],
};
