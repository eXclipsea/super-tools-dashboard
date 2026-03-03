import { NextRequest, NextResponse } from 'next/server';

const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/authorize';
const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';

export async function GET(request: NextRequest) {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/flowmeet/zoom/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Zoom not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'meeting:read:admin recording:read:admin user:read:admin',
  });

  return NextResponse.redirect(`${ZOOM_OAUTH_URL}?${params.toString()}`);
}
