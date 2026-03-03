import { NextRequest, NextResponse } from 'next/server';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const REDIRECT_URI = `${BASE_URL}/api/flowmeet/slack/callback`;

export async function GET(request: NextRequest) {
  try {
    if (!SLACK_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Slack OAuth not configured. Add SLACK_CLIENT_ID to env.' },
        { status: 500 }
      );
    }

    const scopes = ['chat:write', 'channels:read', 'users:read'].join(',');

    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', SLACK_CLIENT_ID);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error: any) {
    console.error('Slack auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
