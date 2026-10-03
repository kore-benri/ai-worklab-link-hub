import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const destinations: Record<string, string> = {
  'zenchord-x-001': 'https://r.8to.jp/kmGDcbmtBuVL',
};

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Upstash KV environment variables are not configured');
  return new Redis({ url, token });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = destinations[id];
  if (!destination) return NextResponse.redirect(new URL('/', request.url));

  // Click counting must never block the affiliate redirect.
  try {
    await getRedis().incr(`clicks:${id}`);
  } catch (error) {
    console.error('click counter failed', error);
  }

  return NextResponse.redirect(destination, 302);
}
