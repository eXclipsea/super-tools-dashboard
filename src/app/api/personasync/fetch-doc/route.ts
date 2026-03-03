import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Validate Google Docs URL
    if (!url.includes('docs.google.com/document')) {
      return NextResponse.json({ error: 'Invalid Google Doc URL' }, { status: 400 });
    }

    // Convert to export URL (export as plain text)
    // Google Docs export format: https://docs.google.com/document/d/{ID}/export?format=txt
    let exportUrl = url;
    
    // Extract doc ID and create export URL
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const docId = match[1];
      exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    } else {
      // Try to handle docs.google.com/document/u/0/... format
      const altMatch = url.match(/([a-zA-Z0-9-_]{25,})/);
      if (altMatch) {
        const docId = altMatch[1];
        exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      }
    }

    // Fetch the document
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch document. Make sure the doc is publicly viewable (Share → Anyone with the link can view)' 
      }, { status: 400 });
    }

    const text = await response.text();

    // Clean up the text
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedText.length < 50) {
      return NextResponse.json({ 
        error: 'Document appears to be empty or contains very little text' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      text: cleanedText,
      length: cleanedText.length
    });

  } catch (error: any) {
    console.error('Fetch doc error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch document' 
    }, { status: 500 });
  }
}
