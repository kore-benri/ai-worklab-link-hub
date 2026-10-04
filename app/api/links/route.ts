import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';
export type StoredLink = { id:string; product:string; channel:string; label:string; destination:string; createdAt:string };
const seed: StoredLink = { id:'zenchord-x-001', product:'ZENCHORD 1', channel:'X', label:'初回商品紹介', destination:'https://r.8to.jp/kmGDcbmtBuVL', createdAt:'2026-10-04' };

function redis(){ return new Redis({ url:process.env.KV_REST_API_URL!, token:process.env.KV_REST_API_TOKEN! }); }

export async function GET(){
  const r=redis();
  let links=await r.get<StoredLink[]>('tracking:links');
  if(!links){ links=[seed]; await r.set('tracking:links',links); }
  return NextResponse.json({links},{headers:{'Cache-Control':'no-store'}});
}

export async function POST(req:NextRequest){
  const body=await req.json() as Partial<StoredLink>;
  if(!body.product||!body.channel||!body.destination) return NextResponse.json({error:'required fields missing'},{status:400});
  try { new URL(body.destination); } catch { return NextResponse.json({error:'invalid destination'},{status:400}); }
  const r=redis();
  const links=(await r.get<StoredLink[]>('tracking:links'))??[seed];
  const base=body.product.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'link';
  const channel=body.channel.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'other';
  let n=links.length+1; let id=`${base}-${channel}-${String(n).padStart(3,'0')}`;
  while(links.some(x=>x.id===id)){n++;id=`${base}-${channel}-${String(n).padStart(3,'0')}`;}
  const item:StoredLink={id,product:body.product,channel:body.channel,label:body.label||'無題の訴求',destination:body.destination,createdAt:new Date().toISOString().slice(0,10)};
  links.unshift(item); await r.set('tracking:links',links);
  return NextResponse.json({link:item},{status:201});
}
