import { NextRequest, NextResponse } from 'next/server';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const REDIRECT_URI = `${BASE_URL}/api/flowmeet/slack/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${BASE_URL}/voicetask?slack_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/voicetask?slack_error=no_code`);
    }

    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      return NextResponse.redirect(`${BASE_URL}/voicetask?slack_error=oauth_not_configured`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenResponse.json();

    if (!data.ok) {
      console.error('Slack token exchange error:', data);
      return NextResponse.redirect(`${BASE_URL}/voicetask?slack_error=${encodeURIComponent(data.error || 'token_exchange_failed')}`);
    }

    // Pass token back via URL params (client stores in localStorage)
    const params = new URLSearchParams({
      slack_token: data.access_token,
      slack_team: data.team?.name || '',
    });

    return NextResponse.redirect(`${BASE_URL}/voicetask?${params.toString()}`);
  } catch (error: any) {
    console.error('Slack callback error:', error);
    return NextResponse.redirect(`${BASE_URL}/voicetask?slack_error=${encodeURIComponent(error.message)}`);
  }
}
