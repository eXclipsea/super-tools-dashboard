import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { examples } = await request.json();

    if (!examples) {
      return NextResponse.json({ error: 'No examples provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing writing style. Always return valid JSON.',
        },
        {
          role: 'user',
          content: `Analyze the writing style from these examples:\n\n${examples}\n\nReturn JSON: {"description": "1-2 sentence summary", "characteristics": ["trait1", "trait2", "trait3", "trait4", "trait5"]}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const profile = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ profile });
  } catch (error: any) {
    return openAIError(error);
  }
}
