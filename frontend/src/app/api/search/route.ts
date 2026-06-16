import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Proxy the request to the FastAPI NLP Service
    const nlpUrl = process.env.NEXT_PUBLIC_NLP_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${nlpUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`NLP Service returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Search proxy error:', error);
    return NextResponse.json({ error: error.message || 'Error processing search' }, { status: 500 });
  }
}
