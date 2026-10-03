import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const ids = ['zenchord-x-001'];
export const dynamic = 'force-dynamic';

function redisClient() {
  return new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });
}

function dateKey(daysAgo: number) {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export async function GET() {
  try {
    const redis = redisClient();
    const dates = Array.from({ length: 30 }, (_, i) => dateKey(29 - i));
    const result: Record<string, { total:number; today:number; last7:number; last30:number; daily:{date:string;clicks:number}[] }> = {};

    await Promise.all(ids.map(async id => {
      const [total, ...dailyValues] = await redis.mget<number[]>(`clicks:${id}`, ...dates.map(d => `clicks:${id}:day:${d}`));
      const daily = dates.map((date, i) => ({ date, clicks: Number(dailyValues[i] ?? 0) }));
      result[id] = {
        total: Number(total ?? 0),
        today: daily.at(-1)?.clicks ?? 0,
        last7: daily.slice(-7).reduce((n, x) => n + x.clicks, 0),
        last30: daily.reduce((n, x) => n + x.clicks, 0),
        daily,
      };
    }));

    return NextResponse.json({ metrics: result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('click analytics read failed', error);
    return NextResponse.json({ metrics: {}, configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
