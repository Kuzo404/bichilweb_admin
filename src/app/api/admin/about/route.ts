import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/about`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Backend request failed');
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching about data:', error);
        return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
    }
}
