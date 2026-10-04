import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

type StoredLink={id:string;destination:string};
const seed:StoredLink={id:'zenchord-x-001',destination:'https://r.8to.jp/kmGDcbmtBuVL'};
const BOT_RE=/(bot|crawler|spider|preview|slurp|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|googlebot|bingbot|yandex|baiduspider|duckduckbot|headless|curl|wget|python-requests|axios|vercel-screenshot)/i;
function redisClient(){return new Redis({url:process.env.KV_REST_API_URL!,token:process.env.KV_REST_API_TOKEN!});}
function tokyoDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function visitorKey(request:NextRequest,id:string){const forwarded=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';const ua=request.headers.get('user-agent')||'unknown';return createHash('sha256').update(`${id}|${forwarded}|${ua}`).digest('hex').slice(0,32);}

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 try{
  const redis=redisClient(); const links=(await redis.get<StoredLink[]>('tracking:links'))??[seed]; const destination=links.find(x=>x.id===id)?.destination;
  if(!destination)return NextResponse.redirect(new URL('/',request.url));
  const ua=request.headers.get('user-agent')||'';
  if(!BOT_RE.test(ua)){
   const dedupe=`dedupe:${visitorKey(request,id)}`;
   const first=await redis.set(dedupe,'1',{nx:true,ex:60*30});
   if(first){const dayKey=`clicks:${id}:day:${tokyoDate()}`;await Promise.all([redis.incr(`clicks:${id}`),redis.incr(dayKey),redis.expire(dayKey,60*60*24*45)]);}
  }
  return NextResponse.redirect(destination,302);
 }catch(error){console.error('tracking redirect failed',error);return NextResponse.redirect(new URL('/',request.url));}
}
