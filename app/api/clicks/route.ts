import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const ids = ['zenchord-x-001'];

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Upstash KV environment variables are not configured');
  return new Redis({ url, token });
}

export async function GET() {
  try {
    const values = await getRedis().mget<number[]>(...ids.map(id => `clicks:${id}`));
    const clicks = Object.fromEntries(ids.map((id, index) => [id, Number(values[index] ?? 0)]));
    return NextResponse.json({ clicks, configured: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('click counter read failed', error);
    return NextResponse.json({ clicks: {}, configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
