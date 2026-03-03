import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (use Redis/Database in production)
const userDataStore: Record<string, Record<string, any>> = {};

export async function POST(request: NextRequest) {
  try {
    const { appId, data } = await request.json();
    
    if (!appId) {
      return NextResponse.json({ error: 'App ID required' }, { status: 400 });
    }
    
    // Get user from session (in a real app, validate the session)
    // For now, we'll use a simple user identifier from headers or body
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    if (!userDataStore[userId]) {
      userDataStore[userId] = {};
    }
    
    userDataStore[userId][appId] = data;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    
    if (!appId) {
      return NextResponse.json({ error: 'App ID required' }, { status: 400 });
    }
    
    // Get user from session
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    const data = userDataStore[userId]?.[appId] || null;
    
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
