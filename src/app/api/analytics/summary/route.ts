import { NextResponse } from 'next/server';

const DJANGO_API = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';

    const res = await fetch(
      `${DJANGO_API}/analytics/summary/?start=${start}&end=${end}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ totals: {}, daily: [] }, { status: 500 });
  }
}
