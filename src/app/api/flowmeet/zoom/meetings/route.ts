import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 });
    }

    // Fetch upcoming meetings
    const meetingsRes = await fetch('https://api.zoom.us/v2/users/me/meetings?type=upcoming&page_size=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meetingsRes.ok) {
      const err = await meetingsRes.text();
      console.error('Zoom meetings error:', err);
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }

    const meetingsData = await meetingsRes.json();

    // Fetch recordings
    const recordingsRes = await fetch('https://api.zoom.us/v2/users/me/recordings?page_size=10', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let recordings = [];
    if (recordingsRes.ok) {
      const recData = await recordingsRes.json();
      recordings = recData.meetings || [];
    }

    return NextResponse.json({
      meetings: meetingsData.meetings || [],
      recordings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
