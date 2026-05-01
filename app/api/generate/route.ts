import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${process.env.API_URL}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(280000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API error:', response.status, text.slice(0, 200));
      return NextResponse.json(
        { error: `API error ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let seed: number | undefined;
    try {
      const info = JSON.parse(data.info);
      seed = info.seed;
    } catch {
      seed = undefined;
    }
    return NextResponse.json({ image: data.images[0], seed });
  } catch (e) {
    console.error('Route error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
