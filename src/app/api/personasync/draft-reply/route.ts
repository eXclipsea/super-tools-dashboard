import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const { styleProfile, inputMessage } = await request.json();

    if (!styleProfile || !inputMessage) {
      return NextResponse.json({ error: 'Missing style profile or input message' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant. Mirror this style exactly: ${styleProfile.description}. Characteristics: ${styleProfile.characteristics.join(', ')}. Always return valid JSON.`,
        },
        {
          role: 'user',
          content: `Reply to this message:\n\n${inputMessage}\n\nReturn JSON: {"summary": "• bullet points of key items", "draft": "the reply text"}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
