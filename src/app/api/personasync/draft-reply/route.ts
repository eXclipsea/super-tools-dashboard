import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { styleProfile, inputMessage } = await request.json();

    if (!styleProfile || !inputMessage) {
      return NextResponse.json({ error: 'Missing style profile or input message' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant. The user has this writing style: ${styleProfile.description}. Key characteristics: ${styleProfile.characteristics.join(', ')}. Mirror this style exactly when drafting replies. Always return valid JSON.`,
        },
        {
          role: 'user',
          content: `Here is a message I need to reply to:\n\n${inputMessage}\n\nFirst summarize the key points as bullet points (TL;DR), then draft a reply that matches my writing style. Return JSON: {"summary": "• point1\\n• point2\\n• point3", "draft": "the reply text"}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PersonaSync draft-reply error:', error);
    return NextResponse.json({ error: 'Failed to draft reply' }, { status: 500 });
  }
}
