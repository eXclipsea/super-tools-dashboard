import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('google_tokens')?.value;
    
    if (!cookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(cookie);
    
    // Check if token is expired
    if (tokens.expires_at < Date.now()) {
      // Token expired - in production we'd refresh here
      return NextResponse.json({ connected: false, expired: true });
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ connected: false });
    }

    const userInfo = await userResponse.json();

    return NextResponse.json({
      connected: true,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });
  } catch (error: any) {
    console.error('Google status error:', error);
    return NextResponse.json({ connected: false, error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('google_tokens')?.value;
    
    if (!cookie) {
      return NextResponse.json({ error: 'Not connected' }, { status: 401 });
    }

    const tokens = JSON.parse(cookie);
    const { action, fileId, query } = await request.json();

    switch (action) {
      case 'listFiles':
        const filesResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet'")}&pageSize=20&fields=files(id,name,modifiedTime,mimeType)`,
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const files = await filesResponse.json();
        return NextResponse.json(files);

      case 'getDoc':
        if (!fileId) return NextResponse.json({ error: 'No fileId' }, { status: 400 });
        
        // For Google Docs, export as text
        const docResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const text = await docResponse.text();
        return NextResponse.json({ text });

      case 'search':
        if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 });
        
        const searchResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name contains '${query}' and (mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet')`)}&pageSize=10&fields=files(id,name,modifiedTime,mimeType)`,
          { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );
        const searchResults = await searchResponse.json();
        return NextResponse.json(searchResults);

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Google Drive API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Disconnect Google
  const response = NextResponse.json({ disconnected: true });
  response.cookies.delete('google_tokens');
  return response;
}
