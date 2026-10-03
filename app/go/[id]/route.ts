import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const destinations: Record<string, string> = {
  'zenchord-x-001': 'https://r.8to.jp/kmGDcbmtBuVL',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = destinations[id];
  if (!destination) return NextResponse.redirect(new URL('/', request.url));

  // Click counting must never block the affiliate redirect.
  try {
    const redis = Redis.fromEnv();
    await redis.incr(`clicks:${id}`);
  } catch (error) {
    console.error('click counter failed', error);
  }

  return NextResponse.redirect(destination, 302);
}
