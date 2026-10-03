'use client';

import { useEffect, useMemo, useState } from 'react';

type LinkItem = { id: string; product: string; channel: string; label: string; destination: string; clicks: number; createdAt: string };

const seed: LinkItem[] = [
  { id: 'zenchord-x-001', product: 'ZENCHORD 1', channel: 'X', label: '初回商品紹介', destination: 'https://r.8to.jp/kmGDcbmtBuVL', clicks: 0, createdAt: '2026-10-04' },
];

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>(seed);
  const [product, setProduct] = useState('ZENCHORD 1');
  const [channel, setChannel] = useState('X');
  const [label, setLabel] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('awl-links');
    const base: LinkItem[] = saved ? JSON.parse(saved) : seed;
    setLinks(base);

    fetch('/api/clicks', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setLinks(current => current.map(x => ({ ...x, clicks: Number(data.clicks?.[x.id] ?? x.clicks) }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (links.length) localStorage.setItem('awl-links', JSON.stringify(links));
  }, [links]);

  const total = useMemo(() => links.reduce((n, x) => n + x.clicks, 0), [links]);
  const ranked = useMemo(() => [...links].sort((a,b)=>b.clicks-a.clicks), [links]);

  function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !destination) return;
    const slug = `${product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${channel.toLowerCase()}-${String(links.length + 1).padStart(3, '0')}`;
    setLinks([{ id: slug, product, channel, label: label || '無題の訴求', destination, clicks: 0, createdAt: new Date().toISOString().slice(0, 10) }, ...links]);
    setLabel(''); setDestination('');
  }

  function copyPath(id: string) {
    navigator.clipboard.writeText(`${location.origin}/go/${id}`);
  }

  return <main>
    <header><div><span className="eyebrow">AI WorkLab</span><h1>Link Hub</h1><p>投稿するだけで、どの訴求がクリックされたかを育てていく。</p></div><div className="badge">v0.1 MVP</div></header>

    <section className="stats">
      <article><span>TRACKING LINKS</span><strong>{links.length}</strong></article>
      <article><span>TOTAL CLICKS</span><strong>{total}</strong></article>
      <article><span>TOP PRODUCT</span><strong className="small">{ranked[0]?.product ?? '—'}</strong></article>
    </section>

    <section className="panel">
      <div className="panelTitle"><div><span className="eyebrow">CREATE</span><h2>計測リンクを発行</h2></div></div>
      <form onSubmit={addLink}>
        <label>商品名<input value={product} onChange={e=>setProduct(e.target.value)} placeholder="PLAUD" /></label>
        <label>用途<select value={channel} onChange={e=>setChannel(e.target.value)}><option>X</option><option>記事</option><option>その他</option></select></label>
        <label>訴求メモ<input value={label} onChange={e=>setLabel(e.target.value)} placeholder="議事録が面倒 訴求" /></label>
        <label className="wide">A8 / 遷移先URL<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="https://..." type="url" /></label>
        <button>リンクを発行</button>
      </form>
    </section>

    <section className="panel">
      <div className="panelTitle"><div><span className="eyebrow">PERFORMANCE</span><h2>クリックランキング</h2></div><span className="muted">まずは「商品 × 訴求」だけを見る</span></div>
      <div className="table">
        {links.length === 0 && <div className="empty">まだリンクがありません。</div>}
        {ranked.map((x,i)=><div className="row" key={x.id}>
          <div className="rank">{String(i+1).padStart(2,'0')}</div>
          <div className="info"><strong>{x.product}</strong><span>{x.channel} · {x.label}</span><code>/go/{x.id}</code></div>
          <div className="clicks"><strong>{x.clicks}</strong><span>clicks</span></div>
          <button className="copy" onClick={()=>copyPath(x.id)}>URLコピー</button>
        </div>)}
      </div>
    </section>

    <footer>AI WorkLab Link Hub · 軽量カウンターで始めるGrowth Tracking</footer>
  </main>;
}
