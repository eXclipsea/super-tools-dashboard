import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const REDIRECT_URI = `${BASE_URL}/api/personasync/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${BASE_URL}/personasync?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/personasync?error=no_code`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${BASE_URL}/personasync?error=oauth_not_configured`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokens);
      return NextResponse.redirect(`${BASE_URL}/personasync?error=${encodeURIComponent(tokens.error_description || 'token_exchange_failed')}`);
    }

    // Store tokens in a secure httpOnly cookie
    const cookieValue = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });

    // Redirect back to PersonaSync with success
    const response = NextResponse.redirect(`${BASE_URL}/personasync?google_connected=true`);
    response.cookies.set('google_tokens', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(`${BASE_URL}/personasync?error=${encodeURIComponent(error.message)}`);
  }
}
