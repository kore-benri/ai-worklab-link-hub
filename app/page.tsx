'use client';

import { useEffect, useMemo, useState } from 'react';

type LinkItem = { id:string; product:string; channel:string; label:string; destination:string; clicks:number; createdAt:string };
type Metric = { total:number; today:number; last7:number; last30:number; daily:{date:string;clicks:number}[] };
const seed: LinkItem[] = [{ id:'zenchord-x-001', product:'ZENCHORD 1', channel:'X', label:'初回商品紹介', destination:'https://r.8to.jp/kmGDcbmtBuVL', clicks:0, createdAt:'2026-10-04' }];

export default function Home() {
  const [links,setLinks]=useState<LinkItem[]>(seed);
  const [metrics,setMetrics]=useState<Record<string,Metric>>({});
  const [product,setProduct]=useState('ZENCHORD 1'); const [channel,setChannel]=useState('X'); const [label,setLabel]=useState(''); const [destination,setDestination]=useState('');

  useEffect(()=>{ const saved=localStorage.getItem('awl-links'); if(saved) setLinks(JSON.parse(saved)); fetch('/api/clicks',{cache:'no-store'}).then(r=>r.json()).then(d=>setMetrics(d.metrics??{})).catch(()=>{}); },[]);
  useEffect(()=>{ if(links.length) localStorage.setItem('awl-links',JSON.stringify(links)); },[links]);

  const metricFor=(id:string):Metric=>metrics[id]??{total:0,today:0,last7:0,last30:0,daily:[]};
  const totals=useMemo(()=>links.reduce((a,x)=>{const m=metricFor(x.id);return {today:a.today+m.today,last7:a.last7+m.last7,last30:a.last30+m.last30,total:a.total+m.total};},{today:0,last7:0,last30:0,total:0}),[links,metrics]);
  const ranked=useMemo(()=>[...links].sort((a,b)=>metricFor(b.id).total-metricFor(a.id).total),[links,metrics]);

  function addLink(e:React.FormEvent){e.preventDefault();if(!product||!destination)return;const slug=`${product.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${channel.toLowerCase()}-${String(links.length+1).padStart(3,'0')}`;setLinks([{id:slug,product,channel,label:label||'無題の訴求',destination,clicks:0,createdAt:new Date().toISOString().slice(0,10)},...links]);setLabel('');setDestination('');}
  function copyPath(id:string){navigator.clipboard.writeText(`${location.origin}/go/${id}`);}

  return <main>
    <header><div><span className="eyebrow">AI WorkLab</span><h1>Link Hub</h1><p>投稿するだけで、どの訴求がクリックされたかを育てていく。</p></div><div className="badge">v0.2</div></header>
    <section className="stats">
      <article><span>TODAY</span><strong>{totals.today}</strong></article><article><span>LAST 7 DAYS</span><strong>{totals.last7}</strong></article><article><span>LAST 30 DAYS</span><strong>{totals.last30}</strong></article><article><span>ALL TIME</span><strong>{totals.total}</strong></article>
    </section>
    <section className="panel"><div className="panelTitle"><div><span className="eyebrow">CREATE</span><h2>計測リンクを発行</h2></div></div><form onSubmit={addLink}>
      <label>商品名<input value={product} onChange={e=>setProduct(e.target.value)}/></label><label>用途<select value={channel} onChange={e=>setChannel(e.target.value)}><option>X</option><option>記事</option><option>その他</option></select></label><label>訴求メモ<input value={label} onChange={e=>setLabel(e.target.value)} placeholder="議事録が面倒 訴求"/></label><label className="wide">A8 / 遷移先URL<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="https://..." type="url"/></label><button>リンクを発行</button>
    </form></section>
    <section className="panel"><div className="panelTitle"><div><span className="eyebrow">PERFORMANCE</span><h2>クリックランキング</h2></div><span className="muted">今日 / 7日 / 30日 / 累計</span></div><div className="table">
      {ranked.map((x,i)=>{const m=metricFor(x.id);return <div className="row" key={x.id}><div className="rank">{String(i+1).padStart(2,'0')}</div><div className="info"><strong>{x.product}</strong><span>{x.channel} · {x.label}</span><code>/go/{x.id}</code></div><div className="clicks"><strong>{m.total}</strong><span>累計 · 今日 {m.today} / 7日 {m.last7} / 30日 {m.last30}</span></div><button className="copy" onClick={()=>copyPath(x.id)}>URLコピー</button></div>})}
    </div></section>
    <footer>AI WorkLab Link Hub · 30-day Growth Tracking</footer>
  </main>;
}
