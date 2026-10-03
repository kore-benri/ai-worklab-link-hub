import { NextRequest, NextResponse } from 'next/server';

const destinations: Record<string, string> = {
  'zenchord-x-001': 'https://r.8to.jp/kmGDcbmtBuVL',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = destinations[id];
  if (!destination) return NextResponse.redirect(new URL('/', request.url));

  // v0.1: redirect first. Next step: send this event to GA4 Measurement Protocol
  // so clicks are stored without running our own database.
  return NextResponse.redirect(destination, 302);
}
