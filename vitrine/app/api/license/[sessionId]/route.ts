// app/api/license/[sessionId]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ sessionId?: string }> }
) {
    const { sessionId } = await params;
    if (!sessionId) {
        return NextResponse.json({ error: 'missing_session_id' }, { status: 400 });
    }

    const base = process.env.NEXT_API_URL;
    if (!base) {
        return NextResponse.json({ error: 'server_misconfig' }, { status: 500 });
    }

    const upstream = await fetch(`${base}/api/licenses/by-session/${encodeURIComponent(sessionId)}`, {
        headers: {
            Accept: 'application/json',
            'X-Internal-Token': process.env.INTERNAL_API_TOKEN ?? '',
        },
        cache: 'no-store',
    });

    let payload: any;
    try {
        payload = await upstream.json();
    } catch {
        payload = { error: 'upstream_non_json' };
    }

    return NextResponse.json(payload, { status: upstream.status });
}