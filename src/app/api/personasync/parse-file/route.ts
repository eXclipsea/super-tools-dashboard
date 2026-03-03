import { NextRequest, NextResponse } from 'next/server';
import { openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For now, we'll extract text from the file using basic methods
    // PDF and DOCX parsing would ideally use specialized libraries
    // For this implementation, we'll use a simple approach

    let text = '';
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      text = await file.text();
    } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      const html = await file.text();
      // Strip HTML tags
      text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // For PDF/DOCX, we would need specialized libraries
      // For now, return an error with instructions
      return NextResponse.json({ 
        error: 'PDF and DOCX parsing requires additional setup. Please convert to text or HTML first, or paste the text directly.' 
      }, { status: 400 });
    } else {
      // Try to read as text
      text = await file.text();
    }

    // Clean up the text
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedText.length < 50) {
      return NextResponse.json({ 
        error: 'File appears to be empty or contains very little text' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      text: cleanedText,
      length: cleanedText.length
    });

  } catch (error: any) {
    console.error('Parse file error:', error);
    return openAIError(error);
  }
}
