import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Store active tunnels
const activeTunnels: Record<number, { url: string; process: any }> = {};

export async function POST(request: NextRequest) {
  try {
    const { port } = await request.json();
    
    if (!port) {
      return NextResponse.json({ error: 'Port required' }, { status: 400 });
    }

    // Check if tunnel already exists
    if (activeTunnels[port]) {
      return NextResponse.json({ url: activeTunnels[port].url });
    }

    // Try cloudflared first, then fall back to ngrok
    let tunnelUrl: string | null = null;
    
    try {
      // Try cloudflared (free, no auth needed)
      const { stdout } = await execAsync(
        `cloudflared tunnel --url http://localhost:${port} --no-autoupdate`,
        { timeout: 15000 }
      );
      
      // Extract URL from output
      const match = stdout.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        tunnelUrl = match[0];
      }
    } catch (e) {
      console.log('Cloudflared failed, trying ngrok...');
    }

    if (!tunnelUrl) {
      // Fall back to ngrok
      try {
        const { stdout } = await execAsync(
          `ngrok http ${port} --log stdout`,
          { timeout: 15000 }
        );
        
        const match = stdout.match(/https:\/\/[a-z0-9]+\.ngrok\.io/);
        if (match) {
          tunnelUrl = match[0];
        }
      } catch (e) {
        console.log('Ngrok also failed');
      }
    }

    if (tunnelUrl) {
      activeTunnels[port] = { url: tunnelUrl, process: null };
      return NextResponse.json({ url: tunnelUrl });
    } else {
      return NextResponse.json(
        { error: 'Failed to create tunnel. Install cloudflared or ngrok.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Tunnel error:', error);
    return NextResponse.json({ error: 'Failed to create tunnel' }, { status: 500 });
  }
}
