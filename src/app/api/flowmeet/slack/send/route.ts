import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, channel, text } = await request.json();

    if (!token || !channel || !text) {
      return NextResponse.json({ error: 'Missing token, channel, or text' }, { status: 400 });
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, text }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.error || 'Failed to send message' }, { status: 400 });
    }

    return NextResponse.json({ success: true, ts: data.ts });
  } catch (error: any) {
    console.error('Slack send error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
