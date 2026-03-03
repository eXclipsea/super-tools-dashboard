import { NextRequest, NextResponse } from 'next/server';

const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voicetask?tab=connect&zoom_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voicetask?tab=connect&zoom_error=no_code`);
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/flowmeet/zoom/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voicetask?tab=connect&zoom_error=not_configured`);
  }

  try {
    // Exchange code for tokens
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const res = await fetch(ZOOM_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Zoom token error:', err);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voicetask?tab=connect&zoom_error=token_failed`);
    }

    const data = await res.json();
    
    // Redirect back to app with token (will be stored in localStorage by frontend)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/voicetask?tab=connect&zoom_token=${data.access_token}&zoom_refresh=${data.refresh_token}`
    );
  } catch (err) {
    console.error('Zoom callback error:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voicetask?tab=connect&zoom_error=unknown`);
  }
}
