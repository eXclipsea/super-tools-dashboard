import { NextRequest, NextResponse } from 'next/server';
import { getGroq, openAIError } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const groq = getGroq();
    const { styleProfile, inputMessage } = await request.json();

    if (!styleProfile || !inputMessage) {
      return NextResponse.json({ error: 'Missing style profile or input message' }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are ${styleProfile.description || 'the user'}. Write exactly as they would.

Style rules:
${styleProfile.characteristics?.slice(0, 6).map((c: string) => `- ${c}`).join('\n') || '- Write naturally'}

Common phrases: ${styleProfile.commonPhrases?.slice(0, 8).join(', ') || 'none'}

Mimic their tone perfectly. Be concise (1-3 sentences).`,
        },
        {
          role: 'user',
          content: `Reply to: "${inputMessage.substring(0, 500)}"

Return JSON: {"summary": "brief bullet points", "draft": "your reply in their exact style"}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(result);
  } catch (error: any) {
    return openAIError(error);
  }
}
