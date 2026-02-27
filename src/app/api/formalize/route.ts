import { NextRequest, NextResponse } from 'next/server';
import { getClaude, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const anthropic = getClaude();
    const { text, style } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const stylePrompts: Record<string, string> = {
      shakespeare: 'Shakespearean English with thee/thou/thy, ornate language, poetic flourishes.',
      formal: 'Highly formal professional language suitable for business or academic writing.',
      presidential: 'Presidential speech style with inspiring language and rhetorical devices.',
      philosopher: 'Profound philosophical style like Nietzsche or Socrates.',
      poet: 'Beautiful poetic language with metaphors and lyrical flow.',
      medieval: 'Medieval chivalric language with archaic words.',
      gangster: '1920s gangster slang with phrases like "see?", "fella", "dame".',
    };

    const selectedPrompt = stylePrompts[style] || stylePrompts.formal;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Transform this text into ${style} style.

Style: ${selectedPrompt}

Rules:
- Keep the core meaning intact
- Transform tone and vocabulary to match the style
- Be creative and authentic
- Return ONLY the transformed text, no explanations

Text to transform: "${text.substring(0, 500)}"`,
        },
      ],
    });

    const transformedText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    return NextResponse.json({ transformedText });
  } catch (error: any) {
    return openAIError(error);
  }
}
