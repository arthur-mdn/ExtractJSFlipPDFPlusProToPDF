import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const base = process.env.NEXT_API_URL;

    console.log('[checkout route] proxy to backend:', base);

    const backendRes = await fetch(`${base}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    console.log('[checkout route] backend response status:', backendRes.status, backendRes.statusText);

    const data = await backendRes.json();
    if (!backendRes.ok) {
        return NextResponse.json({ error: data }, { status: backendRes.status });
    }

    return NextResponse.json(data);
}
