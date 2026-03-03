import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a master of literary styles. Transform text while keeping core meaning intact. Return ONLY the transformed text, no explanations or quotation marks.`,
        },
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
      max_tokens: 400,
      temperature: 0.8,
    });

    const transformedText = response.choices[0].message.content?.trim() || '';
    return NextResponse.json({ transformedText });
  } catch (error: any) {
    return openAIError(error);
  }
}
