import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

type StoredLink={id:string;destination:string};
const seed:StoredLink={id:'zenchord-x-001',destination:'https://r.8to.jp/kmGDcbmtBuVL'};
function redisClient(){return new Redis({url:process.env.KV_REST_API_URL!,token:process.env.KV_REST_API_TOKEN!});}
function tokyoDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  try{
    const redis=redisClient();
    const links=(await redis.get<StoredLink[]>('tracking:links'))??[seed];
    const destination=links.find(x=>x.id===id)?.destination;
    if(!destination)return NextResponse.redirect(new URL('/',request.url));
    const dayKey=`clicks:${id}:day:${tokyoDate()}`;
    await Promise.all([redis.incr(`clicks:${id}`),redis.incr(dayKey),redis.expire(dayKey,60*60*24*45)]);
    return NextResponse.redirect(destination,302);
  }catch(error){console.error('tracking redirect failed',error);return NextResponse.redirect(new URL('/',request.url));}
}
