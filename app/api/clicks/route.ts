import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const ids = ['zenchord-x-001'];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = Redis.fromEnv();
    const values = await redis.mget<number[]>(...ids.map(id => `clicks:${id}`));
    const clicks = Object.fromEntries(ids.map((id, index) => [id, Number(values[index] ?? 0)]));
    return NextResponse.json({ clicks }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('click counter read failed', error);
    return NextResponse.json({ clicks: {}, configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
