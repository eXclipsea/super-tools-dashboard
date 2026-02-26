import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { examples } = await request.json();

    if (!examples) {
      return NextResponse.json({ error: 'No examples provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing writing style and communication patterns. Always return valid JSON.',
        },
        {
          role: 'user',
          content: `Analyze the writing style from these message examples:\n\n${examples}\n\nIdentify the key characteristics of this writing style. Return JSON: {"description": "A 1-2 sentence summary of the overall style", "characteristics": ["trait1", "trait2", "trait3", "trait4", "trait5"]}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const profile = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('PersonaSync analyze-style error:', error);
    return NextResponse.json({ error: 'Failed to analyze style' }, { status: 500 });
  }
}
